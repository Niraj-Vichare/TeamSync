import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  AlertTriangle,
  Target,
  ArrowUpRight,
  Zap,
  Timer,
  GitBranch,
  Bug,
  Shield,
  Gauge,
  TrendingDown,
  AlertCircle,
  PlayCircle,
  LogIn,
  LogOut,
  SquareKanban,
  Footprints,
  UsersRound
} from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie, LabelList } from 'recharts';
import { useEffect, useState } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import dashboardService from "@/services/dashboard";
import taskService from "@/services/task";
import ticketService from "@/services/ticket";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
// Mock Data
const userRole = "employee"; // or "admin"
//const userRole = "admin"; // or "admin"


const projects = [
  {
    id: 1,
    name: "Design System",
    progress: 75,
    tasksTotal: 24,
    tasksCompleted: 18,
    dueDate: "Dec 15",
    team: 4,
    status: "on-track"
  },
  {
    id: 2,
    name: "Marketing Launch",
    progress: 45,
    tasksTotal: 32,
    tasksCompleted: 14,
    dueDate: "Jan 20",
    team: 6,
    status: "at-risk"
  },
  {
    id: 3,
    name: "Web Platform",
    progress: 90,
    tasksTotal: 18,
    tasksCompleted: 16,
    dueDate: "Nov 30",
    team: 5,
    status: "on-track"
  },
  {
    id: 4,
    name: "Mobile App",
    progress: 20,
    tasksTotal: 28,
    tasksCompleted: 6,
    dueDate: "Feb 10",
    team: 3,
    status: "behind"
  },
];

const activityData = [
  { id: 1, user: "John Doe", action: "completed task", item: "User Authentication", time: "2 min ago", avatar: "JD" },
  { id: 2, user: "Sarah Miller", action: "created sprint", item: "Sprint 2.1", time: "15 min ago", avatar: "SM" },
  { id: 3, user: "Alex Brown", action: "updated project", item: "Design System", time: "1 hour ago", avatar: "AB" },
  { id: 4, user: "Mike Johnson", action: "commented on", item: "API Documentation", time: "2 hours ago", avatar: "MJ" },
  { id: 5, user: "Emma Wilson", action: "assigned ticket", item: "Bug Fix #123", time: "3 hours ago", avatar: "EW" },
];


const sprintData = [
  {
    id: 1,
    name: "Sprint 2.3",
    startDate: "Nov 1",
    endDate: "Nov 15",
    status: "active",
    velocity: 45,
    completed: 32,
    remaining: 18,
    burndownData: [
      { day: 1, ideal: 50, actual: 50 },
      { day: 3, ideal: 42, actual: 46 },
      { day: 5, ideal: 35, actual: 38 },
      { day: 7, ideal: 28, actual: 32 },
      { day: 9, ideal: 21, actual: 25 },
      { day: 11, ideal: 14, actual: 18 },
      { day: 13, ideal: 7, actual: 12 }
    ]
  }
];

const velocityData = [
  { sprint: 'Sprint 2.0', planned: 40, completed: 38, velocity: 38 },
  { sprint: 'Sprint 2.1', planned: 45, completed: 42, velocity: 42 },
  { sprint: 'Sprint 2.2', planned: 42, completed: 45, velocity: 45 },
  { sprint: 'Sprint 2.3', planned: 50, completed: 32, velocity: 32 }
];

const actions = [
  { key: "team", label: "Teams", icon: UsersRound },
  { key: "tasks", label: "Task", icon: Bug },
  { key: "projects", label: "Projects", icon: SquareKanban },
  { key: "sprints", label: "Sprints", icon: Footprints },
];




const teamPerformance = [
  { member: 'John Doe', tasksCompleted: 12, velocity: 42, efficiency: 95 },
  { member: 'Sarah Miller', tasksCompleted: 15, velocity: 38, efficiency: 88 },
  { member: 'Alex Brown', tasksCompleted: 9, velocity: 35, efficiency: 92 },
  { member: 'Mike Johnson', tasksCompleted: 11, velocity: 40, efficiency: 85 }
];

const riskMetrics = [
  { project: 'Design System', riskScore: 2, blockers: 1, overdue: 0 },
  { project: 'Marketing Launch', riskScore: 7, blockers: 3, overdue: 2 },
  { project: 'Web Platform', riskScore: 3, blockers: 0, overdue: 1 },
  { project: 'Mobile App', riskScore: 8, blockers: 2, overdue: 4 }
];





function Dashboard() {
  
  const WORK_DAY_SECONDS = 8 * 60 * 60; // 8 hours
  const [greeting, setGreeting] = useState("");

  const [loadingTickets, setLoadingTicket] = useState(false);
  const [barLoading, setBarLoading] = useState(false);
  const [ongoingTaskLoading, setOngoingTaskLoading] = useState(false);
  const [rankingLoading, setRankingLoading] = useState(false);  

  const [dashboardCards, setDashboardCards] = useState({
    totalTasks: 0,
    myPoints: 0,
    totalHours: 0,
    efficiency: 0
  });

  const [userRankingHistory, setUserRankingHistory] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [weeklyLogging, setWeeklyLogging] = useState(null);
  const [userongoingTasks, setOngoingTasks] = useState([]);
  const [userProjectWork, setUserProjectWork] = useState([]);
  const [isLoadingUserWork, setIsLoadingUserWork] = useState(false);
  
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [clockInTime, setClockInTime] = useState(null);
  const [isValidDay, setIsValidDay] = useState(true);
  const [overtime, setOvertime] = useState(0);
  
  const progressValue = Math.min((elapsed / WORK_DAY_SECONDS) * 100, 100);
  const { getCurrentWorkspaceId,currentUser } = useAuth();
  const workspaceGuid = getCurrentWorkspaceId();

  // Helper: format seconds to HH:MM:SS
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Sync clock-in status on load
  const checkClockInStatus = async () => {
    try {
      const result = await dashboardService.isUserClockIn(workspaceGuid);
      if (result?.data?.isClockedIn) {
        setClockInTime(new Date(result.data.checkInTime));
        setElapsed(result.data.elapsedSeconds ?? 0);
        setIsClockedIn(true);
        setIsValidDay(result.data.isValidDay);
        setOvertime(
          Math.max((result.data.elapsedSeconds ?? 0) - WORK_DAY_SECONDS, 0)
        );
      } else {
        setClockInTime(null);
        setElapsed(0);
        setIsClockedIn(false);
        setOvertime(0);
      }

    } catch (error) {
      console.error("Failed to check clock-in status:", error);
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  
  const fetchDashboardCards = async () => {
    try {
      const result = await dashboardService.getDashboardCard(workspaceGuid);
      console.log(result);
      setDashboardCards(result);
    } catch (error) {
      console.error("Failed to fetch dashboard cards:", error);
    }
  };

  const fetchUserOngoingTask = async () => {
    try {
      const result = await taskService.getOnGoingTasks(workspaceGuid);
      setOngoingTasks(result.data);

    } catch (error) {
      console.error("Failed to fetch user ongoing tasks:", error);
    }
  }

  const fetchUserAssignedTickets = async () => {
    try {
      setLoadingTicket(true);
      const result = await ticketService.getUserAssignedTickets(workspaceGuid);
      console.log("User Assigned Tickets", result);
      if (result && result.success) {
        console.log("User Assigned Tickets Data", result.data);
        setUserTickets(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch user assigned tickets:", error);
    } finally {
      setLoadingTicket(false);
    }
  }


  const fetchWeeklyLogging = async () => {
    try {
      setBarLoading(true);
      const result = await dashboardService.getWeeklyLogging(workspaceGuid);

      if (result && result.statusCode === 200) {
        const raw = result.data;
        const formatted = Object.keys(raw).map((day) => ({
          day,
          Hours: raw[day]
        }));
        setWeeklyLogging(formatted);
      }
    } catch (error) {
      console.error("Failed to fetch weekly logging:", error);
    } finally {
      setBarLoading(false);
    }
  };

  const fetchUserRankingHistory = async () => {
    try{
      setRankingLoading(true);
      const result =  await dashboardService.getUserRankingHistory(workspaceGuid);
      if(result && result.success === true){
        setUserRankingHistory(result.data);
        console.log("User Ranking History:", result);
      }

    }catch(error){
      console.error("Failed to fetch user ranking history:", error);
    }finally{
      setRankingLoading(false);

    }
  }

const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track': return 'bg-green-500';
      case 'at-risk': return 'bg-yellow-500';
      case 'behind': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };


  const getUserWork = async () => {
    if (!workspaceGuid) return;

    setIsLoadingUserWork(true);

    try {
      const result = await dashboardService.getUserWork(workspaceGuid);
      console.log("User Work:", result);
      setUserProjectWork(result?.data || []);
      console.log("User Project Work Set:",userProjectWork);
    } catch (error) {
      console.error("Error while getting user work", error);
    } finally {
      setIsLoadingUserWork(false);
    }
  };

  const navigate = useNavigate();
  const handleRedirect=(map)=>{
    console.log("Redirecting to:",map); 
    if(map == "task"){
      navigate("/tasks");

    }else if(map == "team"){
      navigate("/team");

    }else if(map == "ticket"){
      navigate("/tickets");

    }else if(map == "project"){
      navigate("/projects");

    }else if(map == "sprint"){
      navigate("/sprints");
    }
  }



  // Auto increment elapsed when clocked in
  useEffect(() => {
    if (!isClockedIn) return;

    const interval = setInterval(() => {
      setElapsed((prev) => {
        const newElapsed = prev + 1;
        setOvertime(Math.max(newElapsed - WORK_DAY_SECONDS, 0));
        return newElapsed;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isClockedIn]);

  const handleClockIn = async () => {
    try {
      const data = await dashboardService.clockIn(workspaceGuid);
      console.log("Clocked in:", data); 
      setClockInTime(new Date(data?.data.checkInTime));
      setElapsed(data?.data.ElapsedSeconds || 0);
      setIsClockedIn(true);
      setIsValidDay(data?.data.IsValidDay);
    } catch (error) {
      console.error("Failed to clock in:", error);
    }
  };

  const handleClockOut = async () => {
    try {
      const data = await dashboardService.clockOut(workspaceGuid);
      setIsClockedIn(false);
      setElapsed(0);
      setClockInTime(null);
      setOvertime(0);
      checkClockInStatus();
    } catch (error) {
      console.error("Failed to clock out:", error);
    }
  };


  // Fetch initial data on load
  useEffect(() => {
    fetchDashboardCards();
    fetchUserRankingHistory();
    fetchWeeklyLogging();
    checkClockInStatus();
    fetchUserAssignedTickets();
    fetchUserOngoingTask();
    getUserWork();
  }, []);



  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{currentDate}</span>
            <Clock className="w-4 h-4 ml-4" />
            <span>{currentTime}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            {greeting}, {currentUser?.displayName}
          </h1>
          <p className="text-muted-foreground">
            {userRole === 'admin' ? "Admin Dashboard - Manage your organization" : "Your personal workspace overview"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`grid gap-4 ${userRole === 'admin' ? 'grid-cols-2 md:grid-cols-6' : 'grid-cols-2 md:grid-cols-4'}`}
        >
          {userRole === 'admin' ? (
            // Admin Stats
            <>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Sprint Velocity
                  </CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
                    +7% from last sprint
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Cycle Time
                  </CardTitle>
                  <Timer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3.2d</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingDown className="w-3 h-3 mr-1 text-green-500" />
                    -0.5d improvement
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Code Quality
                  </CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">A+</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
                    95% coverage
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Blockers
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">6</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <AlertCircle className="w-3 h-3 mr-1 text-orange-500" />
                    Need attention
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Bug Ratio
                  </CardTitle>
                  <Bug className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.3%</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingDown className="w-3 h-3 mr-1 text-green-500" />
                    Below target 5%
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Team Health
                  </CardTitle>
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">94%</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
                    Excellent
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            // Employee Stats
            <>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    My Points
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardCards.myPoints??0}</div>
                  {/* <div className="flex items-center text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                    3 completed today
                  </div> */}
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Hours
                  </CardTitle>
                  <Timer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardCards.totalHours??0}</div>
                  {/* <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1 text-blue-500" />
                    1.5h remaining
                  </div> */}
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ticket Completed
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardCards.ticketCompleted??0}</div>
                  {/* <div className="flex items-center text-xs text-muted-foreground">
                    <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
                    Tasks completed
                  </div> */}
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Efficiency
                  </CardTitle>
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{dashboardCards.efficiency??0}</div>
                  {/* <div className="flex items-center text-xs text-muted-foreground">
                    <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
                    Above average
                  </div> */}
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>

        <div className={`grid gap-6 ${userRole === 'admin' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-5'}`}>

          <div className={`space-y-6 ${userRole === 'admin' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  {loadingTickets ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-xl">
                            {userRole === "admin" ? "Team Tickets Overview" : "My Tickets"}
                          </CardTitle>
                          <Badge variant="secondary">{userTickets.length}</Badge>
                        </div>

                        {/* Tagline */}
                        {userTickets?.[0]?.tagline && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {userTickets[0].tagline}
                          </p>
                        )}
                      </div>

                      {/* View More */}
                      <button
                        onClick={() => navigate('/sprints')}
                        className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                      >
                        View More →
                      </button>
                    </div>
                  )}
                </CardHeader>

                <CardContent>
                  {/* ----------------------------------------- */}
                  {/* LOADING STATE — SKELETHON */}
                  {/* ----------------------------------------- */}
                  {loadingTickets ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg border flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-2 w-2 rounded-full" />

                            <div className="space-y-2">
                              <Skeleton className="h-3 w-48" />
                              <div className="flex gap-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-3 w-20" />
                              </div>
                            </div>
                          </div>

                          <Skeleton className="h-3 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* ----------------------------------------- */
                    /* TICKET LIST */
                    /* ----------------------------------------- */
                    <div className="space-y-3">
                      {userTickets.slice(0, 4).map((ticket, index) => (
                        <motion.div
                          key={ticket.ticketId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.08 * index }}
                          onClick={() => navigate(`/sprints`)}
                          className="
                    flex items-center justify-between 
                    p-3 rounded-lg border cursor-pointer 
                    hover:bg-muted/50 transition 
                    hover:scale-[1.01]
                  "
                        >
                          <div className="flex items-center space-x-3">
                            {/* Status Dot */}
                            <div
                              className={`w-2 h-2 rounded-full ${ticket.statusInString === "Closed"
                                ? "bg-green-500"
                                : ticket.statusInString === "InProgress"
                                  ? "bg-blue-500"
                                  : "bg-red-400"
                                }`}
                            />

                            <div className="space-y-1">
                              <p className="font-medium text-sm">{ticket.title}</p>

                              {/* Ticket-level tagline */}
                              {ticket.description && (
                                <p className="text-xs text-muted-foreground">{ticket.description}</p>
                              )}

                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={getPriorityColor(ticket.priorityInString)} className="text-xs">
                                  {ticket.priorityInString}
                                </Badge>

                                <Badge variant="outline" className="text-xs">
                                  {ticket.statusInString}
                                </Badge>

                                {ticket.projectName && (
                                  <Badge variant="outline" className="text-xs">
                                    {ticket.projectName}
                                  </Badge>
                                )}

                                {ticket.sprintName && (
                                  <Badge variant="outline" className="text-xs">
                                    {ticket.sprintName}
                                  </Badge>
                                )}
                                {ticket.typeName && (
                                  <Badge variant="outline" className="text-xs">
                                    {ticket.typeName}
                                  </Badge>
                                )}

                                {userRole === "employee" && (
                                  <Badge variant="secondary" className="text-xs">
                                    {ticket.points} pts
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Dates & Avatar */}
                          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                            {userRole === "admin" && (
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">{ticket.assignedByName}</AvatarFallback>
                              </Avatar>
                            )}
                            <span>
                              {ticket.startDateInString} → {ticket.endDateInString}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>


            {userRole === 'employee' ? (
              // Employee-specific sections
              <>
              {/* Line Chart for User Ranking History */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    {rankingLoading ? (
                      <div className="p-6 space-y-4">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-60" />
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : !userRankingHistory || userRankingHistory.length === 0 ? (
                      <div className="p-6 flex flex-col items-center justify-center text-center">
                        <p className="text-muted-foreground">No ranking data available.</p>
                      </div>
                    ) : (
                      <>
                        <CardHeader>
                          <CardTitle>User Ranking Trend</CardTitle>
                          <CardDescription>Last 6 months</CardDescription>
                        </CardHeader>

                        <CardContent>
                          <ChartContainer
                            config={{
                              score: {
                                label: "Score",
                                color: "var(--chart-1)",
                              },
                              rank: {
                                label: "Rank",
                                color: "var(--chart-2)",
                              },
                            }}
                          >
                            <LineChart
                              accessibilityLayer
                              data={userRankingHistory}
                              margin={{ top: 20, left: 12, right: 12 }}
                            >
                              <CartesianGrid vertical={false} />

                              <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => (value ? value.slice(0, 3) : "")}
                              />

                              <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" />}
                              />

                              <Line
                                dataKey="score"
                                type="natural"
                                stroke="var(--chart-1)"
                                strokeWidth={2}
                                dot={{ fill: "var(--chart-1)" }}
                                activeDot={{ r: 6 }}
                              >
                                <LabelList
                                  position="top"
                                  offset={12}
                                  className="fill-foreground"
                                  fontSize={12}
                                />
                              </Line>

                              <Line
                                dataKey="rank"
                                type="natural"
                                stroke="var(--chart-2)"
                                strokeWidth={2}
                                dot={{ fill: "var(--chart-2)" }}
                                activeDot={{ r: 6 }}
                              >
                                <LabelList
                                  position="top"
                                  offset={12}
                                  className="fill-foreground"
                                  fontSize={12}
                                />
                              </Line>
                            </LineChart>
                          </ChartContainer>
                        </CardContent>

                        <CardFooter className="flex-col items-start gap-2 text-sm">
                          <div className="flex gap-2 leading-none font-medium">
                            Ranking activity updated <TrendingUp className="h-4 w-4" />
                          </div>
                          <div className="text-muted-foreground leading-none">
                            Showing your performance across the last 6 months
                          </div>
                        </CardFooter>
                      </>
                    )}
                  </Card>
                </motion.div>


                {/* Bar chart for weekly logging */}
                <motion.div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Bar Chart</CardTitle>
                      <CardDescription>Last 7 Days</CardDescription>
                    </CardHeader>

                    <CardContent>
                      {barLoading ? (
                        // --------------------------------
                        // SKELETON BAR CHART PLACEHOLDER
                        // --------------------------------
                        <div className="space-y-4 w-full">
                          <Skeleton className="h-6 w-24" />

                          <div className="flex items-end justify-between h-48 gap-2">
                            {Array.from({ length: 7 }).map((_, i) => (
                              <Skeleton
                                key={i}
                                className="w-10 rounded-md"
                                style={{ height: `${30 + i * 10}px` }}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        // -----------------------------
                        // REAL CHART
                        // -----------------------------
                        <ChartContainer config={{ label: "Hours" }}>
                          <BarChart accessibilityLayer data={weeklyLogging}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                              dataKey="day"
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                              tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar
                              dataKey="Hours"
                              fill="var(--color-desktop)"
                              radius={8}
                            />
                          </BarChart>
                        </ChartContainer>
                      )}
                    </CardContent>

                    <CardFooter className="flex-col items-start gap-2 text-sm">
                      <div className="flex gap-2 leading-none font-medium">
                        Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="text-muted-foreground leading-none">
                        Showing weekly logging for the last 7 days
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
                <motion.div>
                  <span></span>
                </motion.div>
              </>
            ) : (
              // Admin-specific sections
              <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Projects Overview</CardTitle>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          New Project
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {projects.map((project, index) => (
                          <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`} />
                                <h3 className="font-semibold">{project.name}</h3>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>{project.team}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>{project.tasksCompleted}/{project.tasksTotal} tasks</span>
                                <span className="text-muted-foreground">Due {project.dueDate}</span>
                              </div>
                              <Progress value={project.progress} className="h-2" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center">
                          <GitBranch className="w-5 h-5 mr-2" />
                          Sprint Burndown
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span className="text-xs text-muted-foreground">Actual</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                            <span className="text-xs text-muted-foreground">Ideal</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={sprintData[0].burndownData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="day" className="text-muted-foreground" />
                          <YAxis className="text-muted-foreground" />
                          <Line type="monotone" dataKey="ideal" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" />
                          <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span>Remaining: {sprintData[0].remaining} points</span>
                        <span>Days left: 4</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Zap className="w-5 h-5 mr-2" />
                        Team Velocity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={velocityData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="sprint" className="text-muted-foreground" />
                          <YAxis className="text-muted-foreground" />
                          <Bar dataKey="planned" fill="hsl(var(--muted))" />
                          <Bar dataKey="completed" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </div>

          <div className={`space-y-6 ${userRole === 'admin' ? '' : 'lg:col-span-2'}`}>
            {userRole === 'employee' ? (
              // Employee Right Sidebar
              <>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                 <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Target className="w-5 h-5 mr-2" />
                        Today’s Focus
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        
                        {/* Ongoing Tasks */}
                        <div className="space-y-3">
                          {userongoingTasks?.length > 0 ? (
                            userongoingTasks.slice(0, 3).map((task) => (
                              <div
                                key={task.taskGuid}
                                className="flex gap-3 p-3 rounded-md border bg-white hover:shadow-sm transition border-l-4 border-l-blue-500"
                              >
                                {/* Left: Core Info */}
                                <div className="flex-1 space-y-1">
                                  {/* Title + Priority */}
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold truncate">
                                      {task.title}
                                    </p>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded border
              ${task.priorityInString === 'High' && 'bg-red-50 text-red-700 border-red-200'}
              ${task.priorityInString === 'Medium' && 'bg-yellow-50 text-yellow-700 border-yellow-200'}
              ${task.priorityInString === 'Low' && 'bg-green-50 text-green-700 border-green-200'}
            `}
                                    >
                                      {task.priorityInString}
                                    </span>
                                  </div>

                                  {/* Description */}
                                  <p className="text-xs text-gray-600 line-clamp-1">
                                    {task.description}
                                  </p>

                                  {/* Metadata Row */}
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span className="px-2 py-0.5 rounded bg-muted">
                                      {task.project?.projectTitle}
                                    </span>

                                    {task.sprint && (
                                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                        Sprint: {task.sprint.title}
                                      </span>
                                    )}

                                    <span
                                      className={`px-2 py-0.5 rounded
              ${task.statusInString === 'Complete'
                                          ? 'bg-green-50 text-green-700'
                                          : 'bg-gray-100 text-gray-700'}
            `}
                                    >
                                      {task.statusInString}
                                    </span>
                                  </div>
                                </div>

                                {/* Right: Timeline */}
                                <div className="text-right text-xs text-gray-500 whitespace-nowrap">
                                  <p className="font-medium">End Date</p>
                                  <p>{task.endDateInString}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-sm text-muted-foreground text-center border rounded bg-muted/30">
                              No tasks found. Capacity is underutilized.
                            </div>
                          )}

                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                        <Clock className="w-5 h-5 text-blue-500" />
                        Work Timer
                      </CardTitle>
                      {isClockedIn ? (
                        <Button variant="destructive" size="sm" onClick={handleClockOut}>
                          <LogOut className="w-4 h-4 mr-1" /> Clock Out
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={handleClockIn}>
                          <LogIn className="w-4 h-4 mr-1" /> Clock In
                        </Button>
                      )}
                    </CardHeader>

                    <CardContent className="text-center space-y-4">
                      <div>
                        <p className="text-4xl font-bold tracking-tight text-gray-800">{formatTime(elapsed)}</p>
                        <p className="text-sm text-gray-500">{isClockedIn ? "Currently Clocked In" : "Not Clocked In"}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Daily Goal Progress</span>
                          <span>{progressValue.toFixed(0)}%</span>
                        </div>
                        <Progress value={progressValue} className="h-2 bg-gray-200" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-4">
                        <div>
                          <p className="font-bold">{formatTime(elapsed)}</p>
                          <p className="text-gray-500">Worked Today</p>
                        </div>
                        <div>
                          {overtime > 0 ? (
                            <>
                              <p className="font-bold text-green-600">+{formatTime(overtime)}</p>
                              <p className="text-gray-500">Overtime</p>
                            </>
                          ) : (
                            <>
                              <p className="font-bold">{formatTime(WORK_DAY_SECONDS - elapsed)}</p>
                              <p className="text-gray-500">Remaining</p>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                

                {/* Card for Quick Action */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {actions.map(({ key, label, icon: Icon }) => (
                          <Button
                            key={key}
                            variant="outline"
                            onClick={() => handleRedirect(key)}
                            className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-primary/5"
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs">{label}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Project Contribution By User */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">My Projects</CardTitle>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        {isLoadingUserWork ? (
                          // Loading Skeleton
                          <>
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="p-4 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                  <Skeleton className="h-5 w-32" />
                                  <Skeleton className="h-5 w-12" />
                                </div>
                                <Skeleton className="h-2 w-full mb-3" />
                                <div className="grid grid-cols-3 gap-3">
                                  <div>
                                    <Skeleton className="h-4 w-12 mb-1" />
                                    <Skeleton className="h-3 w-16" />
                                  </div>
                                  <div>
                                    <Skeleton className="h-4 w-12 mb-1" />
                                    <Skeleton className="h-3 w-16" />
                                  </div>
                                  <div>
                                    <Skeleton className="h-4 w-12 mb-1" />
                                    <Skeleton className="h-3 w-16" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : userProjectWork?.length > 0 ? (
                          userProjectWork.slice(0, 3).map((project) => (
                            console.log("Project Contribution", project),
                            <div
                              key={project.projectId}
                              className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-base">
                                  {project.projectName}
                                </h3>
                                <span className="text-sm font-medium text-primary">
                                  {project.contribution.toFixed(1)}%
                                </span>
                              </div>

                              <Progress value={project.contribution} className="h-2 mb-3" />

                              <div className="grid grid-cols-3 gap-3 text-sm text-muted-foreground">
                                <div>
                                  <div className="font-medium text-foreground">
                                    {project.numberOfSprintIncluded}/{project.totalNumberSprints}
                                  </div>
                                  <div>Sprints</div>
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">
                                    {project.numberOfTicketsCompleted}/{project.numberOfTickets}
                                  </div>
                                  <div>Tickets</div>
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">
                                    {project.totalTicketPoints}/{project.totalProjectPoints}
                                  </div>
                                  <div>Points</div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No projects found</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

              </>
            ) : (
              // Admin Right Sidebar
              <>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center">
                          <PlayCircle className="w-5 h-5 mr-2" />
                          Current Sprint
                        </CardTitle>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{sprintData[0].name}</span>
                          <span className="text-sm text-muted-foreground">
                            {sprintData[0].startDate} - {sprintData[0].endDate}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Sprint Progress</span>
                            <span>{Math.round((sprintData[0].completed / (sprintData[0].completed + sprintData[0].remaining)) * 100)}%</span>
                          </div>
                          <Progress value={Math.round((sprintData[0].completed / (sprintData[0].completed + sprintData[0].remaining)) * 100)} className="h-2" />
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-xl font-bold text-green-600">{sprintData[0].completed}</p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold text-blue-600">{sprintData[0].remaining}</p>
                            <p className="text-xs text-muted-foreground">Remaining</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold">{sprintData[0].velocity}</p>
                            <p className="text-xs text-muted-foreground">Velocity</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center">
                          <Activity className="w-5 h-5 mr-2" />
                          Team Activity
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-muted-foreground">Live</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activityData.slice(0, 5).map((activity, index) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">{activity.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1 flex-1">
                              <p className="text-sm leading-tight">
                                <span className="font-medium">{activity.user}</span>
                                {' '}{activity.action}{' '}
                                <span className="font-medium text-primary">{activity.item}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Team Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {teamPerformance.slice(0, 4).map((member, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {member.member.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{member.member.split(' ')[0]}</span>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm">{member.efficiency}%</p>
                                <p className="text-xs text-muted-foreground">efficiency</p>
                              </div>
                            </div>
                            <Progress value={member.efficiency} className="h-1" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Risk Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {riskMetrics.filter(p => p.riskScore > 5).map((project, index) => (
                          <div key={index} className="p-3 rounded-lg border border-orange-200 bg-orange-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <AlertTriangle className="w-4 h-4 text-orange-600" />
                                <span className="font-medium text-sm">{project.project}</span>
                              </div>
                              <Badge variant="destructive" className="text-xs">
                                Risk: {project.riskScore}/10
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {project.blockers} blockers, {project.overdue} overdue tasks
                            </p>
                          </div>
                        ))}
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