import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Plus, Users, Calendar, Clock, TrendingUp, Target,
  ArrowUpRight, Timer, Bug, Gauge, PlayCircle, LogIn, LogOut,
  SquareKanban, Footprints, UsersRound, FolderOpen, Ticket,
  ListChecks, GitBranch, Trophy, BarChart2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, CartesianGrid, BarChart, Bar, LabelList,
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from "recharts";
import { useEffect, useState } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import dashboardService from "@/services/dashboard";
import taskService from "@/services/task";
import ticketService from "@/services/ticket";
import projectService from "@/services/project";
import leaderBoardService from "@/services/leaderboard";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/services/useRole";

const actions = [
  { key: "team",    label: "Teams",    icon: UsersRound },
  { key: "task",    label: "Tasks",    icon: Bug },
  { key: "project", label: "Projects", icon: SquareKanban },
  { key: "sprint",  label: "Sprints",  icon: Footprints },
];

const PRIORITY_COLORS = {
  high: "destructive", medium: "secondary", low: "outline",
  High: "destructive", Medium: "secondary", Low: "outline",
};

function StatSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-3 w-24" /><Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" /><Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  );
}

function getStatusDot(s) {
  if (!s) return "bg-gray-400";
  const str = String(s).toLowerCase();
  if (str === "closed" || str === "3" || str === "completed") return "bg-green-500";
  if (str === "inprogress" || str === "2" || str === "in progress") return "bg-blue-500";
  return "bg-amber-400";
}

function getProjectStatus(p) {
  const due = p.dueDate ?? p.endDate;
  if (!due) return "active";
  const daysLeft = (new Date(due) - new Date()) / (1000 * 60 * 60 * 24);
  if (daysLeft < 0) return "overdue";
  if (daysLeft < 7) return "at-risk";
  return "active";
}

function statusColor(s) {
  return s === "active" ? "bg-green-500" : s === "at-risk" ? "bg-yellow-500" : s === "overdue" ? "bg-red-500" : "bg-gray-400";
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Dashboard() {
  const WORK_DAY_SECONDS = 8 * 60 * 60;
  const [greeting, setGreeting] = useState("");
  const { role } = useRole();
  const userRole = role > 3 ? "employee" : "admin";

  // shared state
  const [dashboardCards, setDashboardCards]   = useState({ myPoints: 0, totalHours: 0, ticketCompleted: 0, efficiency: 0 });
  const [userRankingHistory, setUserRankingHistory] = useState([]);
  const [userTickets, setUserTickets]         = useState([]);
  const [weeklyLogging, setWeeklyLogging]     = useState(null);
  const [userongoingTasks, setOngoingTasks]   = useState([]);
  const [userProjectWork, setUserProjectWork] = useState([]);

  // admin state
  const [orgMetrics, setOrgMetrics]         = useState(null);
  const [adminProjects, setAdminProjects]   = useState([]);
  const [topPlayers, setTopPlayers]         = useState([]);

  // loading flags
  const [loadingCards,         setLoadingCards]         = useState(true);
  const [loadingTickets,       setLoadingTickets]       = useState(false);
  const [barLoading,           setBarLoading]           = useState(false);
  const [rankingLoading,       setRankingLoading]       = useState(false);
  const [isLoadingUserWork,    setIsLoadingUserWork]    = useState(false);
  const [loadingOrgMetrics,    setLoadingOrgMetrics]    = useState(true);
  const [loadingAdminProjects, setLoadingAdminProjects] = useState(true);
  const [loadingTopPlayers,    setLoadingTopPlayers]    = useState(true);

  // clock state
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [elapsed,     setElapsed]     = useState(0);
  const [overtime,    setOvertime]    = useState(0);

  const progressValue = Math.min((elapsed / WORK_DAY_SECONDS) * 100, 100);
  const { getCurrentWorkspaceId, currentUser } = useAuth();
  const workspaceGuid = getCurrentWorkspaceId();
  const navigate = useNavigate();

  const formatTime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const currentDate = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const currentTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  // ── fetch helpers ───────────────────────────────────────────────────────
  const checkClockInStatus = async () => {
    try {
      const r = await dashboardService.isUserClockIn(workspaceGuid);
      if (r?.data?.isClockedIn) {
        setElapsed(r.data.elapsedSeconds ?? 0);
        setIsClockedIn(true);
        setOvertime(Math.max((r.data.elapsedSeconds ?? 0) - WORK_DAY_SECONDS, 0));
      }
    } catch (e) { console.error(e); }
  };

  const fetchDashboardCards = async () => {
    try {
      setLoadingCards(true);
      const r = await dashboardService.getDashboardCard(workspaceGuid);
      if (r) setDashboardCards(r);
    } catch (e) { console.error(e); }
    finally { setLoadingCards(false); }
  };

  const fetchUserOngoingTask = async () => {
    try { const r = await taskService.getOnGoingTasks(workspaceGuid); setOngoingTasks(r.data); } catch (e) { console.error(e); }
  };

  const fetchUserAssignedTickets = async () => {
    try {
      setLoadingTickets(true);
      const r = await ticketService.getUserAssignedTickets(workspaceGuid);
      if (r?.success) setUserTickets(r.data);
    } catch (e) { console.error(e); }
    finally { setLoadingTickets(false); }
  };

  const fetchWeeklyLogging = async () => {
    try {
      setBarLoading(true);
      const r = await dashboardService.getWeeklyLogging(workspaceGuid);
      if (r?.statusCode === 200) setWeeklyLogging(Object.keys(r.data).map((d) => ({ day: d, Hours: r.data[d] })));
    } catch (e) { console.error(e); }
    finally { setBarLoading(false); }
  };

  const fetchUserRankingHistory = async () => {
    try {
      setRankingLoading(true);
      const r = await dashboardService.getUserRankingHistory(workspaceGuid);
      if (r?.success) setUserRankingHistory(r.data);
    } catch (e) { console.error(e); }
    finally { setRankingLoading(false); }
  };

  const getUserWork = async () => {
    try {
      setIsLoadingUserWork(true);
      const r = await dashboardService.getUserWork(workspaceGuid);
      setUserProjectWork(r?.data || []);
    } catch (e) { console.error(e); }
    finally { setIsLoadingUserWork(false); }
  };

  const fetchOrgMetrics = async () => {
    try {
      setLoadingOrgMetrics(true);
      const r = await dashboardService.getOrgMetrics(workspaceGuid);
      if (r?.success) setOrgMetrics(r.data);
    } catch (e) { console.error(e); }
    finally { setLoadingOrgMetrics(false); }
  };

  const fetchAdminProjects = async () => {
    try {
      setLoadingAdminProjects(true);
      const r = await projectService.getUserProjects({ workspaceGuid, pageNumber: 1, pageSize: 6 });
      const items = r?.data?.data?.items ?? r?.data?.data ?? [];
      setAdminProjects(Array.isArray(items) ? items : []);
    } catch (e) { console.error(e); }
    finally { setLoadingAdminProjects(false); }
  };

  const fetchTopPlayers = async () => {
    try {
      setLoadingTopPlayers(true);
      const r = await leaderBoardService.getTopPlayers({ workspaceId: workspaceGuid, pageNumber: 1, pageSize: 5 });
      const items = r?.data?.items ?? r?.data ?? [];
      setTopPlayers(Array.isArray(items) ? items : []);
    } catch (e) { console.error(e); }
    finally { setLoadingTopPlayers(false); }
  };

  useEffect(() => {
    if (!isClockedIn) return;
    const interval = setInterval(() => {
      setElapsed((prev) => { const n = prev + 1; setOvertime(Math.max(n - WORK_DAY_SECONDS, 0)); return n; });
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn]);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening");
  }, []);

  useEffect(() => {
    fetchDashboardCards();
    fetchUserRankingHistory();
    fetchWeeklyLogging();
    checkClockInStatus();
    fetchUserAssignedTickets();
    fetchUserOngoingTask();
    getUserWork();
    if (userRole === "admin") { fetchOrgMetrics(); fetchAdminProjects(); fetchTopPlayers(); }
  }, []);

  const handleClockIn = async () => {
    try {
      const d = await dashboardService.clockIn(workspaceGuid);
      setElapsed(d?.data?.ElapsedSeconds || 0);
      setIsClockedIn(true);
    } catch (e) { console.error(e); }
  };

  const handleClockOut = async () => {
    try {
      await dashboardService.clockOut(workspaceGuid);
      setIsClockedIn(false); setElapsed(0); setOvertime(0);
    } catch (e) { console.error(e); }
  };

  const handleRedirect = (map) => {
    const routes = { task: "/tasks", team: "/team", ticket: "/tickets", project: "/projects", sprint: "/sprints" };
    if (routes[map]) navigate(routes[map]);
  };

  const orgChartData = orgMetrics ? [
    { name: "Projects", value: orgMetrics.activeProject  ?? 0, color: "#6366f1" },
    { name: "Tickets",  value: orgMetrics.activeTickets  ?? 0, color: "#f59e0b" },
    { name: "Sprints",  value: orgMetrics.activeSprints  ?? 0, color: "#10b981" },
    { name: "Tasks",    value: orgMetrics.activeTask     ?? 0, color: "#3b82f6" },
  ] : [];

  // ── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" /><span>{currentDate}</span>
            <Clock className="w-4 h-4 ml-4" /><span>{currentTime}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{greeting}, {currentUser?.displayName}</h1>
          <p className="text-muted-foreground">
            {userRole === "admin" ? "Admin Dashboard — Organisation overview" : "Your personal workspace overview"}
          </p>
        </motion.div>

        {/* Stat cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {userRole === "admin" ? (
            <>
              {loadingOrgMetrics ? <StatSkeleton /> : (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{orgMetrics?.activeProject ?? 0}</div>
                    <button onClick={() => navigate("/projects")} className="text-xs text-primary hover:underline mt-0.5 flex items-center gap-1">
                      View all <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </CardContent>
                </Card>
              )}
              {loadingOrgMetrics ? <StatSkeleton /> : (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Open Tickets</CardTitle>
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-500">{orgMetrics?.activeTickets ?? 0}</div>
                    <button onClick={() => navigate("/sprints")} className="text-xs text-primary hover:underline mt-0.5 flex items-center gap-1">
                      View tickets <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </CardContent>
                </Card>
              )}
              {loadingOrgMetrics ? <StatSkeleton /> : (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Sprints</CardTitle>
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-500">{orgMetrics?.activeSprints ?? 0}</div>
                    <button onClick={() => navigate("/sprints")} className="text-xs text-primary hover:underline mt-0.5 flex items-center gap-1">
                      View sprints <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </CardContent>
                </Card>
              )}
              {loadingOrgMetrics ? <StatSkeleton /> : (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Open Tasks</CardTitle>
                    <ListChecks className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">{orgMetrics?.activeTask ?? 0}</div>
                    <button onClick={() => navigate("/tasks")} className="text-xs text-primary hover:underline mt-0.5 flex items-center gap-1">
                      View tasks <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <>
              {loadingCards ? <StatSkeleton /> : (
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">My Points</CardTitle><Target className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{dashboardCards.myPoints ?? 0}</div></CardContent></Card>
              )}
              {loadingCards ? <StatSkeleton /> : (
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle><Timer className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{dashboardCards.totalHours ?? 0}</div></CardContent></Card>
              )}
              {loadingCards ? <StatSkeleton /> : (
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Tickets Completed</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{dashboardCards.ticketCompleted ?? 0}</div></CardContent></Card>
              )}
              {loadingCards ? <StatSkeleton /> : (
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Efficiency</CardTitle><Gauge className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold text-green-500">{dashboardCards.efficiency ?? 0}</div></CardContent></Card>
              )}
            </>
          )}
        </motion.div>

        {/* Main layout */}
        <div className={`grid gap-6 ${userRole === "admin" ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-5"}`}>

          {/* Left column */}
          <div className={`space-y-6 ${userRole === "admin" ? "lg:col-span-2" : "lg:col-span-3"}`}>

            {/* Tickets — shared */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  {loadingTickets
                    ? <div className="space-y-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-3 w-24" /></div>
                    : <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{userRole === "admin" ? "Team Tickets" : "My Tickets"}</CardTitle>
                          <Badge variant="secondary">{userTickets.length}</Badge>
                        </div>
                        <button onClick={() => navigate("/sprints")} className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">View More →</button>
                      </div>
                  }
                </CardHeader>
                <CardContent>
                  {loadingTickets ? (
                    <div className="space-y-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="p-3 rounded-lg border flex items-center justify-between">
                          <div className="flex items-center space-x-3"><Skeleton className="h-2 w-2 rounded-full" /><div className="space-y-2"><Skeleton className="h-3 w-48" /><div className="flex gap-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-16" /></div></div></div>
                          <Skeleton className="h-3 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : userTickets.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No tickets assigned.</p>
                  ) : (
                    <div className="space-y-3">
                      {userTickets.slice(0, 4).map((ticket, index) => (
                        <motion.div key={ticket.ticketId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * index }}
                          onClick={() => navigate("/sprints")}
                          className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition hover:scale-[1.01]">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${getStatusDot(ticket.statusInString)}`} />
                            <div className="space-y-1">
                              <p className="font-medium text-sm">{ticket.title}</p>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={PRIORITY_COLORS[ticket.priorityInString] ?? "outline"} className="text-xs">{ticket.priorityInString}</Badge>
                                <Badge variant="outline" className="text-xs">{ticket.statusInString}</Badge>
                                {ticket.projectName && <Badge variant="outline" className="text-xs">{ticket.projectName}</Badge>}
                                {ticket.sprintName  && <Badge variant="outline" className="text-xs">{ticket.sprintName}</Badge>}
                                {userRole === "employee" && ticket.points != null && <Badge variant="secondary" className="text-xs">{ticket.points} pts</Badge>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                            {userRole === "admin" && <Avatar className="w-6 h-6"><AvatarFallback className="text-xs">{ticket.assignedByName?.slice(0, 2)}</AvatarFallback></Avatar>}
                            <span>{ticket.startDateInString} → {ticket.endDateInString}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {userRole === "employee" ? (
              <>
                {/* Ranking chart */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <Card>
                    {rankingLoading ? (
                      <div className="p-6 space-y-4"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-60" /><Skeleton className="h-64 w-full" /></div>
                    ) : !userRankingHistory?.length ? (
                      <div className="p-6 text-center text-muted-foreground">No ranking data available yet.</div>
                    ) : (
                      <>
                        <CardHeader><CardTitle>Ranking Trend</CardTitle><CardDescription>Score &amp; rank over the last 6 months</CardDescription></CardHeader>
                        <CardContent>
                          <ChartContainer config={{ score: { label: "Score", color: "var(--chart-1)" }, rank: { label: "Rank", color: "var(--chart-2)" } }}>
                            <LineChart accessibilityLayer data={userRankingHistory} margin={{ top: 20, left: 12, right: 12 }}>
                              <CartesianGrid vertical={false} />
                              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => v?.slice(0, 3)} />
                              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                              <Line dataKey="score" type="natural" stroke="var(--chart-1)" strokeWidth={2} dot={{ fill: "var(--chart-1)" }} activeDot={{ r: 6 }}>
                                <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                              </Line>
                              <Line dataKey="rank" type="natural" stroke="var(--chart-2)" strokeWidth={2} dot={{ fill: "var(--chart-2)" }} activeDot={{ r: 6 }}>
                                <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                              </Line>
                            </LineChart>
                          </ChartContainer>
                        </CardContent>
                        <CardFooter className="text-sm text-muted-foreground">Showing performance across the last 6 months</CardFooter>
                      </>
                    )}
                  </Card>
                </motion.div>

                {/* Weekly hours bar */}
                <motion.div>
                  <Card>
                    <CardHeader><CardTitle>Weekly Hours</CardTitle><CardDescription>Last 7 days</CardDescription></CardHeader>
                    <CardContent>
                      {barLoading ? (
                        <div className="flex items-end justify-between h-48 gap-2">
                          {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="w-10 rounded-md" style={{ height: `${30 + i * 10}px` }} />)}
                        </div>
                      ) : (
                        <ChartContainer config={{ Hours: { label: "Hours", color: "var(--chart-1)" } }}>
                          <BarChart accessibilityLayer data={weeklyLogging}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(v) => v.slice(0, 3)} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Bar dataKey="Hours" fill="var(--chart-1)" radius={8} />
                          </BarChart>
                        </ChartContainer>
                      )}
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground">Daily hours logged this week</CardFooter>
                  </Card>
                </motion.div>
              </>
            ) : (
              <>
                {/* Admin: Projects overview — real data */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Projects Overview</CardTitle>
                        <Button size="sm" onClick={() => navigate("/projects")}><Plus className="w-4 h-4 mr-1" /> New Project</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loadingAdminProjects ? (
                        <div className="space-y-3">
                          {[1,2,3].map(i => (
                            <div key={i} className="p-4 rounded-lg border space-y-2">
                              <div className="flex justify-between"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-10" /></div>
                              <Skeleton className="h-2 w-full" />
                            </div>
                          ))}
                        </div>
                      ) : adminProjects.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No projects yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {adminProjects.map((project, index) => {
                            const st = getProjectStatus(project);
                            const total = project.totalTickets ?? 0;
                            const closed = project.closedTickets ?? project.completedTickets ?? 0;
                            const pct = total > 0 ? Math.round((closed / total) * 100) : 0;
                            return (
                              <motion.div key={project.projectGuid ?? project.id}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}
                                className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => navigate(`/projects/${project.projectGuid}`)}>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${statusColor(st)}`} />
                                    <h3 className="font-semibold">{project.projectTitle ?? project.projectName}</h3>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs capitalize">{st}</Badge>
                                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1"><Ticket className="w-3 h-3" />{closed}/{total} tickets closed</span>
                                    <span>{project.dueDate ? `Due ${formatDate(project.dueDate)}` : "No deadline"}</span>
                                  </div>
                                  <Progress value={pct} className="h-2" />
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                      {!loadingAdminProjects && adminProjects.length > 0 && (
                        <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground" onClick={() => navigate("/projects")}>View all projects →</Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Admin: org metrics donut */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2"><BarChart2 className="w-5 h-5" /> Workspace Activity</CardTitle>
                      <CardDescription>Live counts across the organisation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingOrgMetrics ? (
                        <div className="flex items-center justify-center h-48"><Skeleton className="h-48 w-48 rounded-full" /></div>
                      ) : (
                        <div className="flex items-center gap-6">
                          <ResponsiveContainer width={180} height={180}>
                            <PieChart>
                              <Pie data={orgChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                {orgChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                              </Pie>
                              <Tooltip formatter={(v, n) => [v, n]} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex flex-col gap-3 flex-1">
                            {orgChartData.map((item) => (
                              <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                                  <span className="text-sm text-muted-foreground">{item.name}</span>
                                </div>
                                <span className="font-semibold text-sm">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </div>

          {/* Right sidebar */}
          <div className={`space-y-6 ${userRole === "admin" ? "" : "lg:col-span-2"}`}>

            {userRole === "employee" ? (
              <>
                {/* Today's focus */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <Card>
                    <CardHeader><CardTitle className="text-lg flex items-center"><Target className="w-5 h-5 mr-2" />Today's Focus</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {userongoingTasks?.length > 0 ? userongoingTasks.slice(0, 3).map((task) => (
                          <div key={task.taskGuid} className="flex gap-3 p-3 rounded-md border bg-white hover:shadow-sm transition border-l-4 border-l-blue-500">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold truncate">{task.title}</p>
                                <span className={`text-xs px-2 py-0.5 rounded border
                                  ${task.priorityInString === "High"   ? "bg-red-50 text-red-700 border-red-200" : ""}
                                  ${task.priorityInString === "Medium" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : ""}
                                  ${task.priorityInString === "Low"    ? "bg-green-50 text-green-700 border-green-200" : ""}
                                `}>{task.priorityInString}</span>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-1">{task.description}</p>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="px-2 py-0.5 rounded bg-muted">{task.project?.projectTitle}</span>
                                {task.sprint && <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">Sprint: {task.sprint.title}</span>}
                                <span className={`px-2 py-0.5 rounded ${task.statusInString === "Complete" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"}`}>{task.statusInString}</span>
                              </div>
                            </div>
                            <div className="text-right text-xs text-gray-500 whitespace-nowrap">
                              <p className="font-medium">End Date</p><p>{task.endDateInString}</p>
                            </div>
                          </div>
                        )) : (
                          <div className="p-4 text-sm text-muted-foreground text-center border rounded bg-muted/30">No active tasks. Great time to get ahead!</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Work timer */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold"><Clock className="w-5 h-5 text-blue-500" /> Work Timer</CardTitle>
                      {isClockedIn
                        ? <Button variant="destructive" size="sm" onClick={handleClockOut}><LogOut className="w-4 h-4 mr-1" /> Clock Out</Button>
                        : <Button variant="outline" size="sm" onClick={handleClockIn}><LogIn className="w-4 h-4 mr-1" /> Clock In</Button>}
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                      <div>
                        <p className="text-4xl font-bold tracking-tight">{formatTime(elapsed)}</p>
                        <p className="text-sm text-muted-foreground">{isClockedIn ? "Currently Clocked In" : "Not Clocked In"}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground"><span>Daily Goal Progress</span><span>{progressValue.toFixed(0)}%</span></div>
                        <Progress value={progressValue} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-4">
                        <div><p className="font-bold">{formatTime(elapsed)}</p><p className="text-gray-500">Worked Today</p></div>
                        <div>
                          {overtime > 0
                            ? <><p className="font-bold text-green-600">+{formatTime(overtime)}</p><p className="text-gray-500">Overtime</p></>
                            : <><p className="font-bold">{formatTime(WORK_DAY_SECONDS - elapsed)}</p><p className="text-gray-500">Remaining</p></>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Quick actions */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {actions.map(({ key, label, icon: Icon }) => (
                          <Button key={key} variant="outline" onClick={() => handleRedirect(key)} className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-primary/5">
                            <Icon className="w-5 h-5" /><span className="text-xs">{label}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* My Projects */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <Card>
                    <CardHeader><CardTitle className="text-xl">My Projects</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {isLoadingUserWork ? (
                          [1,2,3].map(i => (
                            <div key={i} className="p-4 rounded-lg border">
                              <div className="flex items-center justify-between mb-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-5 w-12" /></div>
                              <Skeleton className="h-2 w-full mb-3" />
                              <div className="grid grid-cols-3 gap-3">{[1,2,3].map(j => <div key={j}><Skeleton className="h-4 w-12 mb-1" /><Skeleton className="h-3 w-16" /></div>)}</div>
                            </div>
                          ))
                        ) : userProjectWork?.length > 0 ? userProjectWork.slice(0, 3).map((project) => (
                          <div key={project.projectId} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-base">{project.projectName}</h3>
                              <span className="text-sm font-medium text-primary">{project.contribution.toFixed(1)}%</span>
                            </div>
                            <Progress value={project.contribution} className="h-2 mb-3" />
                            <div className="grid grid-cols-3 gap-3 text-sm text-muted-foreground">
                              <div><div className="font-medium text-foreground">{project.numberOfSprintIncluded}/{project.totalNumberSprints}</div><div>Sprints</div></div>
                              <div><div className="font-medium text-foreground">{project.numberOfTicketsCompleted}/{project.numberOfTickets}</div><div>Tickets</div></div>
                              <div><div className="font-medium text-foreground">{project.totalTicketPoints}/{project.totalProjectPoints}</div><div>Points</div></div>
                            </div>
                          </div>
                        )) : <div className="text-center py-8 text-muted-foreground"><p>No projects found</p></div>}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            ) : (
              /* Admin right sidebar */
              <>
                {/* Quick Actions */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "New Project",  icon: FolderOpen, path: "/projects" },
                          { label: "View Sprints", icon: GitBranch,  path: "/sprints" },
                          { label: "View Team",    icon: Users,      path: "/team" },
                          { label: "Leaderboard",  icon: Trophy,     path: "/leaderboard" },
                        ].map(({ label, icon: Icon, path }) => (
                          <Button key={label} variant="outline" onClick={() => navigate(path)} className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-primary/5">
                            <Icon className="w-5 h-5" /><span className="text-xs">{label}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Top Performers — real leaderboard data */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> Top Performers</CardTitle>
                        <button onClick={() => navigate("/leaderboard")} className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Full board →</button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loadingTopPlayers ? (
                        <div className="space-y-4">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className="flex items-center gap-3">
                              <Skeleton className="h-8 w-8 rounded-full" />
                              <div className="flex-1 space-y-1"><Skeleton className="h-3 w-28" /><Skeleton className="h-2 w-full" /></div>
                              <Skeleton className="h-4 w-10" />
                            </div>
                          ))}
                        </div>
                      ) : topPlayers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No leaderboard data yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {topPlayers.map((player, index) => {
                            const eff = player.efficiency ?? player.score ?? 0;
                            const maxEff = Math.max(...topPlayers.map(p => p.efficiency ?? p.score ?? 0), 1);
                            return (
                              <div key={player.profileId ?? index} className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                                  ${index === 0 ? "bg-amber-100 text-amber-700" : index === 1 ? "bg-gray-100 text-gray-700" : index === 2 ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`}>
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium truncate">{player.displayName ?? player.name}</p>
                                    <p className="text-xs font-bold ml-2">{typeof eff === "number" ? eff.toFixed(1) : eff}%</p>
                                  </div>
                                  <Progress value={(eff / maxEff) * 100} className="h-1.5" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Admin work timer */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <Card>
                    <CardHeader className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold"><Clock className="w-5 h-5 text-blue-500" /> My Timer</CardTitle>
                      {isClockedIn
                        ? <Button variant="destructive" size="sm" onClick={handleClockOut}><LogOut className="w-4 h-4 mr-1" /> Clock Out</Button>
                        : <Button variant="outline" size="sm" onClick={handleClockIn}><LogIn className="w-4 h-4 mr-1" /> Clock In</Button>}
                    </CardHeader>
                    <CardContent className="text-center space-y-3">
                      <p className="text-3xl font-bold tracking-tight">{formatTime(elapsed)}</p>
                      <p className="text-sm text-muted-foreground">{isClockedIn ? "Clocked In" : "Not Clocked In"}</p>
                      <Progress value={progressValue} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground pt-1">
                        <span>{formatTime(elapsed)} worked</span>
                        <span>{progressValue.toFixed(0)}% of 8h</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;