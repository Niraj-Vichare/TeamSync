import { Badge }                  from '@/components/ui/badge';
import { Button }                 from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress }               from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import projectService             from '@/services/project';
import sprintService              from '@/services/sprint';
import {
  ArrowLeft, BarChart3, Calendar, ChevronDown, ChevronRight,
  FileText, TrendingUp, UserCheck, Folder, Ticket, ListChecks,
  ExternalLink, Zap, Users, User, Mail, Shield,
  CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams }  from 'react-router-dom';
import { toast }                   from 'sonner';
import { useAuth }                 from '@/context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip, Cell, PieChart, Pie, Legend,
} from 'recharts';

// ─── helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr || dateStr === '0001-01-01T00:00:00') return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  if (Math.abs(d.getFullYear() - new Date().getFullYear()) > 20) return '—';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function normaliseStatus(raw) {
  const s = String(raw ?? '').toLowerCase().replace(/\s/g, '');
  if (s === 'closed' || s === '3' || s === 'completed') return 'closed';
  if (s === 'inprogress' || s === '2')                   return 'inprogress';
  if (s === 'open'       || s === '1')                   return 'open';
  return 'open';
}

function getStatusDot(raw) {
  const s = normaliseStatus(raw);
  if (s === 'closed')     return 'bg-green-500';
  if (s === 'inprogress') return 'bg-blue-500';
  return 'bg-gray-400';
}

function getStatusLabel(raw) {
  const s = normaliseStatus(raw);
  if (s === 'closed')     return 'Closed';
  if (s === 'inprogress') return 'In Progress';
  return 'Open';
}

function getPriorityClass(priority) {
  switch (priority) {
    case 'High':   return 'text-red-600 bg-red-50 border-red-200';
    case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Low':    return 'text-green-600 bg-green-50 border-green-200';
    default:       return 'text-muted-foreground bg-muted border-border';
  }
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ─── chart helpers ────────────────────────────────────────────────────────────
function buildSprintChartData(sprints, allTasks) {
  return sprints.map((sprint) => {
    const key    = sprint.sprintGuid ?? String(sprint.sprintId ?? '');
    const tasks  = allTasks.filter(t => t._sprintKey === key);
    const closed = tasks.filter(t => normaliseStatus(t.statusInString ?? t.status) === 'closed').length;
    const inProg = tasks.filter(t => normaliseStatus(t.statusInString ?? t.status) === 'inprogress').length;
    const open   = tasks.filter(t => normaliseStatus(t.statusInString ?? t.status) === 'open').length;
    const points = tasks.reduce((acc, t) => acc + (t.points ?? 0), 0);
    const name   = (sprint.sprintName ?? sprint.title ?? 'Sprint').replace(/^sprint\s+/i, 'S');
    return { name, total: tasks.length, closed, inProg, open, points };
  });
}

function buildPriorityData(allTasks) {
  const counts = { High: 0, Medium: 0, Low: 0, None: 0 };
  allTasks.forEach(t => {
    const p = t.priorityInString ?? 'None';
    counts[p in counts ? p : 'None']++;
  });
  return [
    { name: 'High',   value: counts.High,   color: '#ef4444' },
    { name: 'Medium', value: counts.Medium, color: '#f59e0b' },
    { name: 'Low',    value: counts.Low,    color: '#22c55e' },
    { name: 'None',   value: counts.None,   color: '#94a3b8' },
  ].filter(d => d.value > 0);
}

function buildStatusData(allTasks) {
  const counts = { closed: 0, inprogress: 0, open: 0 };
  allTasks.forEach(t => { counts[normaliseStatus(t.statusInString ?? t.status)]++; });
  return [
    { name: 'Closed',      value: counts.closed,     color: '#22c55e' },
    { name: 'In Progress', value: counts.inprogress,  color: '#3b82f6' },
    { name: 'Open',        value: counts.open,        color: '#94a3b8' },
  ].filter(d => d.value > 0);
}

// ─── sub-components ───────────────────────────────────────────────────────────

/** Metric card skeleton */
function MetricSkeleton() {
  return <div className="h-28 bg-muted rounded-lg animate-pulse" />;
}

/** Single stat card */
function StatCard({ title, icon: Icon, value, sub, progress, completed }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-2xl font-semibold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        {progress != null && <Progress value={progress} className="mt-2 h-1.5" />}
        {completed && (
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
            {completed}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/** Team-member dialog */
function TeamMemberDialog({ team, open, onClose }) {
  if (!team) return null;
  const members = team.members ?? team.teamMembers ?? [];
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {team.teamName ?? team.name ?? 'Team'} — Members
          </DialogTitle>
        </DialogHeader>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No members in this team.</p>
        ) : (
          <div className="space-y-2 mt-2 max-h-96 overflow-y-auto pr-1">
            {members.map((m) => (
              <div
                key={m.profileGuid ?? m.guid ?? m.id ?? m.email}
                className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-medium">
                  {getInitials(m.displayName ?? m.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{m.displayName ?? m.name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {m.email ?? '—'}
                  </p>
                </div>
                {m.roleName && (
                  <Badge variant="outline" className="text-xs flex-shrink-0 flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" /> {m.roleName}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
function Project() {
  const navigate                          = useNavigate();
  const { projectId: projectGuid }        = useParams();
  const { getCurrentWorkspaceId }         = useAuth();

  const [activeModule,    setActiveModule]    = useState('overview');
  const [project,         setProject]         = useState(null);
  const [overview,        setOverview]        = useState(null);   // ProjectDashboardCard
  const [sprints,         setSprints]         = useState([]);
  const [allTasks,        setAllTasks]        = useState([]);
  const [teams,           setTeams]           = useState([]);
  const [expandedSprints, setExpandedSprints] = useState({});
  const [selectedTeam,    setSelectedTeam]    = useState(null);
  const [teamDialogOpen,  setTeamDialogOpen]  = useState(false);
  const [loading,         setLoading]         = useState(true);

  // ─── derived ──────────────────────────────────────────────────────────
  const closedTickets  = allTasks.filter(t => normaliseStatus(t.statusInString ?? t.status) === 'closed').length;
  const totalPoints    = allTasks.reduce((acc, t) => acc + (t.points ?? 0), 0);
  const sprintChartData = buildSprintChartData(sprints, allTasks);
  const priorityData    = buildPriorityData(allTasks);
  const statusData      = buildStatusData(allTasks);
  const avgVelocity     = sprintChartData.length
    ? Math.round(sprintChartData.reduce((a, s) => a + s.points, 0) / sprintChartData.length)
    : 0;

  // completedSprints: the backend SprintDto has a status field (int enum)
  const completedSprints = sprints.filter(s => {
    const st = String(s.status ?? s.sprintStatus ?? '').toLowerCase();
    return st === 'completed' || st === '2';
  }).length;

  // ─── stable workspace guid (primitive — never changes after mount) ────
  // Calling getCurrentWorkspaceId() once here and storing the string prevents
  // the function reference from becoming a useEffect dependency.
  const workspaceGuid = useRef(getCurrentWorkspaceId()).current;

  // ─── single load effect ────────────────────────────────────────────────
  // Dependencies are the two primitive route/workspace strings only.
  // An AbortController lets us cancel in-flight requests and skip setState
  // if the component unmounts before they finish (prevents the memory leak).
  useEffect(() => {
    if (!projectGuid || !workspaceGuid) return;

    const controller = new AbortController();
    let alive = true; // guard for the rare case axios ignores abort

    const load = async () => {
      setLoading(true);

      // ── 1. project + overview + teams can run in parallel ──────────────
      const [projectRes, overviewRes, teamsRes] = await Promise.allSettled([
        projectService.getProjectById(workspaceGuid, projectGuid),
        projectService.getProjectOverview(projectGuid),
        projectService.getProjectTeams(projectGuid),
      ]);

      if (!alive) return; // component unmounted while fetching

      // project (critical)
      if (projectRes.status === 'fulfilled') {
        const { data, success, statusCode } = projectRes.value.data;
        if (statusCode === 200 && success) setProject(data);
        else toast.error('Failed to load project.');
      } else {
        toast.error('Failed to load project.');
      }

      // overview (non-critical — just enriches the metric cards)
      if (overviewRes.status === 'fulfilled') {
        const { data, success, statusCode } = overviewRes.value.data;
        if (statusCode === 200 && success) setOverview(data);
      }

      // teams (non-critical)
      if (teamsRes.status === 'fulfilled') {
        const { data, success, statusCode } = teamsRes.value.data;
        if (statusCode === 200 && success) {
          setTeams(Array.isArray(data) ? data : []);
        }
      }

      // ── 2. sprints, then their tickets ─────────────────────────────────
      // GET /projects/{guid}/sprints  →  ApiResponseModel<List<SprintDto>>
      try {
        const sprintsRes = await projectService.getProjectSprints(projectGuid);
        if (!alive) return;

        const { data: sprintData, success, statusCode } = sprintsRes.data;
        const sprintList = (statusCode === 200 && success && Array.isArray(sprintData))
          ? sprintData
          : [];

        setSprints(sprintList);

        if (sprintList.length === 0) {
          setAllTasks([]);
        } else {
          // Fetch all sprint tickets in parallel
          const ticketResults = await Promise.all(
            sprintList.map(sprint => {
              const key = sprint.sprintGuid ?? String(sprint.sprintId ?? sprint.id ?? '');
              return sprintService.getSprintTickets(key)
                .then(r => {
                  const items = Array.isArray(r?.data) ? r.data : [];
                  return items.map(t => ({
                    ...t,
                    _sprintKey:  key,
                    _sprintName: sprint.sprintName ?? sprint.title ?? 'Sprint',
                  }));
                })
                .catch(() => []);
            })
          );

          if (!alive) return;
          setAllTasks(ticketResults.flat());
        }
      } catch (err) {
        if (alive) console.error('Sprints fetch failed:', err);
      }

      if (alive) setLoading(false);
    };

    load();

    // cleanup: mark dead so no setState fires after unmount
    return () => {
      alive = false;
      controller.abort();
    };
  }, [projectGuid, workspaceGuid]); // ← only stable primitives, never changes

  const toggleSprint      = (id) => setExpandedSprints(prev => ({ ...prev, [id]: !prev[id] }));
  const getTasksForSprint = (key) => allTasks.filter(t => t._sprintKey === key);
  const openTeamDialog    = (team) => { setSelectedTeam(team); setTeamDialogOpen(true); };

  // ─── loading / not found ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <MetricSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center">
        <Folder className="w-12 h-12 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Project not found.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  // ─── render ───────────────────────────────────────────────────────────
  return (
    <div className="w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 pb-10">

      {/* Team dialog */}
      <TeamMemberDialog
        team={selectedTeam}
        open={teamDialogOpen}
        onClose={() => setTeamDialogOpen(false)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 py-5 border-b border-border mb-6">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold truncate">{project.projectTitle}</h1>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
            {project.projectTagline || project.projectDescription}
          </p>
        </div>
        <Button
          variant="outline" size="sm"
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 self-start sm:self-center h-9 flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {/* Metric cards — 4 cards using /projects/{guid}/overview
           sprintStats : { activeSprint, completedSprint, totalSprints }
           ticketStats : { closeTickets, activeTickets, totalStoryPoints,
                           completedStoryPoints, totalTickets } */}
      {(() => {
        const ss = overview?.sprintStats ?? {};
        const ts = overview?.ticketStats ?? {};
        const totalSprints     = ss.totalSprints        ?? sprints.length;
        const completedSprint  = ss.completedSprint      ?? completedSprints;
        const activeSprint     = ss.activeSprint         ?? 0;
        const totalTickets     = ts.totalTickets         ?? allTasks.length;
        const closeTickets     = ts.closeTickets         ?? closedTickets;
        const activeTickets    = ts.activeTickets        ?? 0;
        const totalStoryPoints = ts.totalStoryPoints     ?? totalPoints;
        const completedPoints  = ts.completedStoryPoints ?? 0;
        const sprintPct  = totalSprints     ? Math.round((completedSprint / totalSprints)     * 100) : 0;
        const ticketPct  = totalTickets     ? Math.round((closeTickets    / totalTickets)     * 100) : 0;
        const pointsPct  = totalStoryPoints ? Math.round((completedPoints / totalStoryPoints) * 100) : 0;
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <StatCard
              title="Sprints"
              icon={Calendar}
              value={`${activeSprint} active`}
              sub={`of ${totalSprints} total`}
              completed={`${completedSprint} completed`}
              progress={sprintPct}
            />
            <StatCard
              title="Tickets"
              icon={Ticket}
              value={`${activeTickets} active`}
              sub={`of ${totalTickets} total`}
              completed={`${closeTickets} closed`}
              progress={ticketPct}
            />
            <StatCard
              title="Story points"
              icon={Zap}
              value={`${completedPoints} done`}
              sub={`of ${totalStoryPoints} total pts`}
              completed={`${pointsPct}% delivered`}
              progress={pointsPct}
            />
            <StatCard
              title="Timeline"
              icon={Calendar}
              value={formatDate(project.startDate)}
              sub={project.dueDate ? `Due ${formatDate(project.dueDate)}` : 'No due date'}
            />
          </div>
        );
      })()}

      {/* Tabs */}
      <Tabs value={activeModule} onValueChange={setActiveModule} className="w-full">
        <TabsList className="flex overflow-x-auto w-full justify-start h-auto p-1 gap-1">
          {[
            { value: 'overview',  icon: BarChart3,   label: 'Overview'  },
            { value: 'sprints',   icon: Calendar,    label: 'Sprints'   },
            { value: 'analysis',  icon: TrendingUp,  label: 'Analysis'  },
            { value: 'reports',   icon: FileText,    label: 'Report'    },
            { value: 'team',      icon: UserCheck,   label: 'Team'      },
          ].map(({ value, icon: Icon, label }) => (
            <TabsTrigger key={value} value={value}
              className="flex items-center gap-1.5 text-sm whitespace-nowrap">
              <Icon className="w-3.5 h-3.5" /> {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Overview ─────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="mt-5 space-y-5">
          {sprintChartData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Ticket completion per sprint
                </CardTitle>
                <CardDescription>Closed vs in-progress vs open tickets in each sprint</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sprintChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="closed" stackId="a" fill="#22c55e"  radius={[0,0,0,0]} name="Closed" />
                    <Bar dataKey="inProg" stackId="a" fill="#3b82f6"  radius={[0,0,0,0]} name="In Progress" />
                    <Bar dataKey="open"   stackId="a" fill="#e2e8f0"  radius={[3,3,0,0]} name="Open" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Closed</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> In Progress</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-200 inline-block" /> Open</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Sprint overview
                  </CardTitle>
                  <CardDescription>Progress across all sprints</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => navigate('/sprints')}>
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Sprints
                  </Button>
                  <Button variant="outline" size="sm" className="h-8" onClick={() => setActiveModule('sprints')}>
                    All sprints
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sprints.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No sprints yet.</p>
              ) : (
                <div className="space-y-3">
                  {sprints.map((sprint) => {
                    const key         = sprint.sprintGuid ?? String(sprint.sprintId ?? '');
                    const sprintTasks = getTasksForSprint(key);
                    const done        = sprintTasks.filter(t => normaliseStatus(t.statusInString ?? t.status) === 'closed').length;
                    const expanded    = expandedSprints[key];
                    const name        = sprint.sprintName ?? sprint.title ?? 'Sprint';

                    return (
                      <div key={key} className="border border-border rounded-lg overflow-hidden">
                        <div
                          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
                          onClick={() => toggleSprint(key)}
                        >
                          <div className="flex items-center gap-2.5">
                            {expanded
                              ? <ChevronDown  className="h-4 w-4 text-muted-foreground" />
                              : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            <span className="text-sm font-medium">{name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{done}/{sprintTasks.length} closed</span>
                        </div>

                        {expanded && (
                          <div className="border-t border-border px-4 py-3">
                            {sprintTasks.length === 0 ? (
                              <p className="text-xs text-muted-foreground py-2">No tickets in this sprint.</p>
                            ) : (
                              <div className="space-y-1">
                                {sprintTasks.slice(0, 6).map((task) => (
                                  <div
                                    key={task.ticketGuid ?? task.ticketId}
                                    className="flex items-center justify-between py-1.5 border-b border-border last:border-b-0"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDot(task.statusInString ?? task.status)}`} />
                                      <span className="text-sm truncate">{task.title}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      {task.priorityInString && (
                                        <span className={`text-xs px-1.5 py-0.5 rounded border ${getPriorityClass(task.priorityInString)}`}>
                                          {task.priorityInString}
                                        </span>
                                      )}
                                      <Badge variant="outline" className="text-xs">
                                        {getStatusLabel(task.statusInString ?? task.status)}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                                {sprintTasks.length > 6 && (
                                  <Button
                                    variant="ghost" size="sm"
                                    className="mt-1 text-blue-600 h-8 text-xs"
                                    onClick={(e) => { e.stopPropagation(); navigate('/sprints'); }}
                                  >
                                    View all {sprintTasks.length} tickets →
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Sprints ──────────────────────────────────────────────────── */}
        <TabsContent value="sprints" className="mt-5">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Sprints
                  </CardTitle>
                  <CardDescription>
                    {sprints.length} sprint{sprints.length !== 1 ? 's' : ''} in this project
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8" onClick={() => navigate('/sprints')}>
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Tickets
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sprints.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No sprints created yet.</p>
              ) : (
                <div className="space-y-3">
                  {sprints.map((sprint) => {
                    const key         = sprint.sprintGuid ?? String(sprint.sprintId ?? '');
                    const sprintTasks = getTasksForSprint(key);
                    const done        = sprintTasks.filter(t => normaliseStatus(t.statusInString ?? t.status) === 'closed').length;
                    const inProg      = sprintTasks.filter(t => normaliseStatus(t.statusInString ?? t.status) === 'inprogress').length;
                    const points      = sprintTasks.reduce((acc, t) => acc + (t.points ?? 0), 0);
                    const name        = sprint.sprintName ?? sprint.title ?? 'Sprint';
                    const pct         = sprintTasks.length ? Math.round((done / sprintTasks.length) * 100) : 0;

                    // SprintDto status int: 1=Open,2=Completed,0=NotStarted
                    const st          = String(sprint.status ?? sprint.sprintStatus ?? '').toLowerCase();
                    const isCompleted = st === 'completed' || st === '2';

                    return (
                      <div key={key} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium">{name}</p>
                              {isCompleted && (
                                <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Completed</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {points > 0 && <Badge variant="outline" className="text-xs">{points} pts</Badge>}
                          </div>
                        </div>

                        {/* ticket status breakdown */}
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {done} closed
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-blue-500" /> {inProg} in progress
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-gray-400" /> {sprintTasks.length - done - inProg} open
                          </span>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{done}/{sprintTasks.length} tickets closed</span>
                            <span>{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </div>

                        <Button
                          variant="ghost" size="sm"
                          className="h-7 text-xs text-blue-600 px-2 mt-2"
                          onClick={() => navigate('/sprints')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> View tickets →
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Analysis ─────────────────────────────────────────────────── */}
        <TabsContent value="analysis" className="mt-5 space-y-5">

          {/* Sprint velocity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Sprint velocity
              </CardTitle>
              <CardDescription>
                Story points delivered per sprint · avg {avgVelocity} pts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sprintChartData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No sprint data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sprintChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip formatter={(v) => [v, 'Story points']} contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="points" radius={[4,4,0,0]}>
                      {sprintChartData.map((_, i) => (
                        <Cell key={i} fill={`hsl(${220 + i * 18}, 75%, ${52 - i * 2}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Ticket completion rate */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ListChecks className="h-4 w-4" /> Ticket completion rate
              </CardTitle>
              <CardDescription>Percentage of tickets closed in each sprint</CardDescription>
            </CardHeader>
            <CardContent>
              {sprintChartData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data.</p>
              ) : (
                <div className="space-y-3">
                  {sprintChartData.map((sprint) => {
                    const rate = sprint.total > 0 ? Math.round((sprint.closed / sprint.total) * 100) : 0;
                    return (
                      <div key={sprint.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{sprint.name}</span>
                          <span className="text-muted-foreground">
                            {sprint.closed}/{sprint.total} closed — {rate}%
                          </span>
                        </div>
                        <Progress value={rate} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Priority + Status distribution side by side */}
          {allTasks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" /> Priority breakdown
                  </CardTitle>
                  <CardDescription>Distribution of tickets by priority</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%" cy="50%"
                        innerRadius={45}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {priorityData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Status breakdown
                  </CardTitle>
                  <CardDescription>Overall ticket status across all sprints</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%" cy="50%"
                        innerRadius={45}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ── Reports ──────────────────────────────────────────────────── */}
        <TabsContent value="reports" className="mt-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Reports coming soon</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Export and summary endpoints are not yet implemented.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Team ─────────────────────────────────────────────────────── */}
        <TabsContent value="team" className="mt-5">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserCheck className="h-4 w-4" /> Project teams
                  </CardTitle>
                  <CardDescription>
                    {teams.length} team{teams.length !== 1 ? 's' : ''} assigned to this project
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8" onClick={() => navigate('/team')}>
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Manage Team
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No teams assigned to this project.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {teams.map((team) => {
                    const tid     = team.teamGuid ?? team.guid ?? team.id ?? team.teamId;
                    const name    = team.teamName ?? team.name ?? 'Team';
                    const members = team.members ?? team.teamMembers ?? [];
                    return (
                      <div
                        key={tid}
                        className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => openTeamDialog(team)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                              <Users className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{name}</p>
                              <p className="text-xs text-muted-foreground">
                                {members.length} member{members.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        </div>

                        {/* avatar stack */}
                        {members.length > 0 && (
                          <div className="flex items-center mt-3">
                            <div className="flex -space-x-2">
                              {members.slice(0, 5).map((m, i) => (
                                <div
                                  key={m.profileGuid ?? m.guid ?? i}
                                  className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium border-2 border-background"
                                  title={m.displayName ?? m.name}
                                >
                                  {getInitials(m.displayName ?? m.name)}
                                </div>
                              ))}
                              {members.length > 5 && (
                                <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium border-2 border-background">
                                  +{members.length - 5}
                                </div>
                              )}
                            </div>
                            <span className="ml-2.5 text-xs text-muted-foreground">
                              Click to view all
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Project;