import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import projectService from '@/services/project';
import sprintService from '@/services/sprint';
import teamService from '@/services/team';
import {
  ArrowLeft, BarChart3, Calendar, CheckCircle, ChevronDown,
  ChevronRight, FileText, TrendingUp, UserCheck, Folder,
  Ticket, ListChecks, ExternalLink, Zap,
} from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip, Cell,
} from 'recharts';

// ── helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr || dateStr === '0001-01-01T00:00:00') return '—';
  const d = new Date(dateStr);
  if (Math.abs(d.getFullYear() - new Date().getFullYear()) > 20) return '—';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getStatusDot(status) {
  const s = String(status ?? '').toLowerCase();
  if (s === 'closed' || s === '3' || s === 'completed') return 'bg-green-500';
  if (s === 'inprogress' || s === '2' || s === 'in progress') return 'bg-blue-500';
  return 'bg-gray-400';
}

function getPriorityClass(priority) {
  switch (priority) {
    case 'High':   return 'text-red-600 bg-red-50 border-red-200';
    case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Low':    return 'text-green-600 bg-green-50 border-green-200';
    default:       return 'text-muted-foreground bg-muted';
  }
}

// Derive a velocity/completion data-set from sprints + their tickets
function buildSprintChartData(sprints, allTasks) {
  return sprints.map((sprint) => {
    const sprintId = sprint.sprintGuid ?? sprint.id;
    const sprintTickets = allTasks.filter(t => t.sprintGuid === sprintId);
    const done = sprintTickets.filter(t => {
      const s = String(t.ticketStatus ?? t.status ?? '').toLowerCase();
      return s === 'closed' || s === '3' || s === 'completed';
    }).length;
    const points = sprintTickets.reduce((acc, t) => acc + (t.points ?? 0), 0);
    const name = (sprint.sprintName ?? sprint.name ?? 'Sprint').replace(/^sprint\s+/i, 'S');
    return { name, total: sprintTickets.length, done, points };
  });
}

// ── component ─────────────────────────────────────────────────────────────────
function Project() {
  const navigate = useNavigate();
  const { projectId: projectGuid } = useParams();
  const { getCurrentWorkspaceId } = useAuth();

  const [activeModule, setActiveModule] = useState('overview');
  const [project,      setProject]      = useState(null);
  const [sprints,      setSprints]      = useState([]);
  const [allTasks,     setAllTasks]     = useState([]);
  const [teamMembers,  setTeamMembers]  = useState([]);
  const [expandedSprints, setExpandedSprints] = useState({});
  const [loading, setLoading] = useState(true);

  // ── derived ────────────────────────────────────────────────────────────────
  const completedSprints = sprints.filter(s => {
    const st = String(s.sprintStatus ?? s.status ?? '').toLowerCase();
    return st === 'completed' || st === '2';
  }).length;

  const closedTickets = allTasks.filter(t => {
    const s = String(t.ticketStatus ?? t.status ?? '').toLowerCase();
    return s === 'closed' || s === '3' || s === 'completed';
  }).length;

  const totalPoints = allTasks.reduce((acc, t) => acc + (t.points ?? 0), 0);

  const sprintChartData = buildSprintChartData(sprints, allTasks);

  // ── fetchers ───────────────────────────────────────────────────────────────
  const fetchProject = useCallback(async () => {
    try {
      const workspaceGuid = getCurrentWorkspaceId();
      const response = await projectService.getProjectById(workspaceGuid, projectGuid);
      const { data, success, statusCode } = response.data;
      if (statusCode === 200 && success) setProject(data);
      else toast.error('Failed to load project.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to load project.');
    }
  }, [projectGuid, getCurrentWorkspaceId]);

  const fetchSprintsAndTasks = useCallback(async () => {
    try {
      const sprintResponse = await sprintService.getSprintsByProject(projectGuid);
      const sprintList = Array.isArray(sprintResponse?.data?.items)
        ? sprintResponse.data.items
        : Array.isArray(sprintResponse?.data)
          ? sprintResponse.data
          : [];
      setSprints(sprintList);

      const taskResults = await Promise.all(
        sprintList.map(sprint =>
          sprintService.getSprintTickets(sprint.sprintGuid ?? sprint.id)
            .then(r => {
              const items = r.data?.data?.items ?? r.data?.data ?? [];
              return (Array.isArray(items) ? items : []).map(t => ({
                ...t,
                sprintName: sprint.sprintName ?? sprint.name,
                sprintGuid: sprint.sprintGuid ?? sprint.id,
              }));
            })
            .catch(() => [])
        )
      );
      setAllTasks(taskResults.flat());
    } catch (err) {
      console.error(err);
    }
  }, [projectGuid]);

  const fetchTeam = useCallback(async () => {
    try {
      const workspaceGuid = getCurrentWorkspaceId();
      const response = await teamService.getTeamMembers(workspaceGuid, '', '', 1, 50);
      const { data, success, statusCode } = response.data;
      if (statusCode === 200 && success) {
        setTeamMembers(Array.isArray(data) ? data : (data?.items ?? []));
      }
    } catch (err) {
      console.error(err);
    }
  }, [getCurrentWorkspaceId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchProject(), fetchSprintsAndTasks(), fetchTeam()]);
      setLoading(false);
    };
    load();
  }, [fetchProject, fetchSprintsAndTasks, fetchTeam]);

  const toggleSprint = (id) => setExpandedSprints(prev => ({ ...prev, [id]: !prev[id] }));
  const getTasksForSprint = (id) => allTasks.filter(t => t.sprintGuid === id);

  // ── loading / not-found states ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-lg animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center">
        <Folder className="w-12 h-12 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Project not found.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/projects')}>Back to Projects</Button>
      </div>
    );
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 py-5 border-b border-border mb-6">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold truncate">{project.projectTitle}</h1>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{project.projectTagline || project.projectDescription}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/projects')} className="flex items-center gap-2 self-start sm:self-center h-9 flex-shrink-0">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {/* Metric cards — replaced "Hours logged" with ticket counts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Sprints</CardTitle>
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-semibold">{completedSprints}/{sprints.length}</div>
            <Progress value={sprints.length ? (completedSprints / sprints.length) * 100 : 0} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Tickets closed</CardTitle>
            <Ticket className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-semibold">{closedTickets}/{allTasks.length}</div>
            <Progress value={allTasks.length ? (closedTickets / allTasks.length) * 100 : 0} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Story points</CardTitle>
            <Zap className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-semibold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {allTasks.length} tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Timeline</CardTitle>
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-sm font-medium">{formatDate(project.startDate)}</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {project.dueDate ? `Due ${formatDate(project.dueDate)}` : 'No due date'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeModule} onValueChange={setActiveModule} className="w-full">
        <TabsList className="flex overflow-x-auto w-full justify-start h-auto p-1 gap-1">
          {[
            { value: 'overview',  icon: BarChart3,    label: 'Overview' },
            { value: 'tasks',     icon: CheckCircle,  label: 'Tickets' },
            { value: 'sprints',   icon: Calendar,     label: 'Sprints' },
            { value: 'analysis',  icon: TrendingUp,   label: 'Analysis' },
            { value: 'reports',   icon: FileText,     label: 'Report' },
            { value: 'team',      icon: UserCheck,    label: 'Team' },
          ].map(({ value, icon: Icon, label }) => (
            <TabsTrigger key={value} value={value} className="flex items-center gap-1.5 text-sm whitespace-nowrap">
              <Icon className="w-3.5 h-3.5" /> {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="mt-5 space-y-5">
          {/* Sprint chart */}
          {sprintChartData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Ticket completion per sprint
                </CardTitle>
                <CardDescription>Closed vs total tickets in each sprint</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sprintChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      formatter={(v, n) => [v, n === 'done' ? 'Closed' : 'Total']}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Bar dataKey="total" fill="hsl(var(--muted))" radius={[3, 3, 0, 0]} name="total" />
                    <Bar dataKey="done"  fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="done" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-muted" /> Total tickets</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-primary" /> Closed tickets</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sprint list overview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" /> Sprint overview</CardTitle>
                  <CardDescription className="text-sm mt-0.5">Progress across all sprints</CardDescription>
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
                    const sprintId = sprint.sprintGuid ?? sprint.id;
                    const sprintTasks = getTasksForSprint(sprintId);
                    const done = sprintTasks.filter(t => {
                      const s = String(t.ticketStatus ?? t.status ?? '').toLowerCase();
                      return s === 'closed' || s === '3' || s === 'completed';
                    }).length;
                    const expanded = expandedSprints[sprintId];
                    return (
                      <div key={sprintId} className="border border-border rounded-lg overflow-hidden">
                        <div
                          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
                          onClick={() => toggleSprint(sprintId)}>
                          <div className="flex items-center gap-2.5">
                            {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            <span className="text-sm font-medium">{sprint.sprintName ?? sprint.name}</span>
                            <Badge variant="secondary" className="text-xs">{sprint.sprintStatus ?? sprint.status ?? 'Active'}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{done}/{sprintTasks.length} closed</span>
                        </div>
                        {expanded && (
                          <div className="border-t border-border px-4 py-3">
                            {sprintTasks.length === 0 ? (
                              <p className="text-xs text-muted-foreground py-2">No tickets in this sprint.</p>
                            ) : (
                              <div className="space-y-1">
                                {sprintTasks.slice(0, 5).map((task) => (
                                  <div key={task.ticketGuid ?? task.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-b-0">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDot(task.ticketStatus ?? task.status)}`} />
                                      <span className="text-sm truncate">{task.ticketTitle ?? task.title}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      {task.priority && (
                                        <span className={`text-xs px-1.5 py-0.5 rounded border ${getPriorityClass(task.priority)}`}>{task.priority}</span>
                                      )}
                                      <Badge variant="outline" className="text-xs">{task.ticketStatus ?? task.status ?? 'Open'}</Badge>
                                    </div>
                                  </div>
                                ))}
                                {sprintTasks.length > 5 && (
                                  <Button variant="ghost" size="sm" className="mt-1 text-blue-600 h-8 text-xs"
                                    onClick={(e) => { e.stopPropagation(); setActiveModule('tasks'); }}>
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

        {/* ── Tickets tab ── */}
        <TabsContent value="tasks" className="mt-5">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><Ticket className="h-4 w-4" /> All tickets</CardTitle>
                  <CardDescription>{allTasks.length} tickets across {sprints.length} sprints</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8" onClick={() => navigate('/sprints')}>
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View in Sprints
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {allTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No tickets found.</p>
              ) : (
                <div className="space-y-1">
                  {allTasks.map((task) => (
                    <div key={task.ticketGuid ?? task.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDot(task.ticketStatus ?? task.status)}`} />
                        <div className="min-w-0">
                          <p className="text-sm truncate">{task.ticketTitle ?? task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.sprintName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {task.priority && (
                          <span className={`text-xs px-1.5 py-0.5 rounded border ${getPriorityClass(task.priority)}`}>{task.priority}</span>
                        )}
                        <Badge variant="outline" className="text-xs">{task.ticketStatus ?? task.status ?? 'Open'}</Badge>
                        {task.points != null && <Badge variant="secondary" className="text-xs">{task.points}pts</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Sprints tab ── */}
        <TabsContent value="sprints" className="mt-5">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" /> Sprints</CardTitle>
                  <CardDescription>{sprints.length} sprint{sprints.length !== 1 ? 's' : ''} in this project</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8" onClick={() => navigate('/sprints')}>
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Tasks
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sprints.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No sprints created yet.</p>
              ) : (
                <div className="space-y-3">
                  {sprints.map((sprint) => {
                    const sprintId = sprint.sprintGuid ?? sprint.id;
                    const sprintTasks = getTasksForSprint(sprintId);
                    const done = sprintTasks.filter(t => {
                      const s = String(t.ticketStatus ?? t.status ?? '').toLowerCase();
                      return s === 'closed' || s === '3' || s === 'completed';
                    }).length;
                    const points = sprintTasks.reduce((acc, t) => acc + (t.points ?? 0), 0);
                    return (
                      <div key={sprintId} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">{sprint.sprintName ?? sprint.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="secondary" className="text-xs">{sprint.sprintStatus ?? sprint.status ?? 'Active'}</Badge>
                            {points > 0 && <Badge variant="outline" className="text-xs">{points} pts</Badge>}
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{done}/{sprintTasks.length} tickets closed</span>
                            <span>{sprintTasks.length ? Math.round((done / sprintTasks.length) * 100) : 0}%</span>
                          </div>
                          <Progress value={sprintTasks.length ? (done / sprintTasks.length) * 100 : 0} className="h-1.5" />
                        </div>
                        <div className="mt-3">
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600 px-2" onClick={() => navigate('/sprints')}>
                            <ExternalLink className="w-3 h-3 mr-1" /> View tickets →
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Analysis tab — computed from available data ── */}
        <TabsContent value="analysis" className="mt-5 space-y-5">
          {/* Velocity chart (story points per sprint) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Sprint velocity</CardTitle>
              <CardDescription>Story points delivered per sprint</CardDescription>
            </CardHeader>
            <CardContent>
              {sprintChartData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No sprint data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={sprintChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip formatter={(v) => [v, 'Story points']} contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="points" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                      {sprintChartData.map((_, i) => <Cell key={i} fill={`hsl(${220 + i * 20}, 80%, ${55 - i * 3}%)`} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Ticket completion rate per sprint */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><ListChecks className="h-4 w-4" /> Ticket completion rate</CardTitle>
              <CardDescription>Percentage of tickets closed in each sprint</CardDescription>
            </CardHeader>
            <CardContent>
              {sprintChartData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data.</p>
              ) : (
                <div className="space-y-3">
                  {sprintChartData.map((sprint) => {
                    const rate = sprint.total > 0 ? Math.round((sprint.done / sprint.total) * 100) : 0;
                    return (
                      <div key={sprint.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{sprint.name}</span>
                          <span className="text-muted-foreground">{sprint.done}/{sprint.total} closed — {rate}%</span>
                        </div>
                        <Progress value={rate} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Reports — out of scope ── */}
        <TabsContent value="reports" className="mt-5">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Reports</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Reports coming soon</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">Export and summary endpoints are not yet implemented.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Team tab ── */}
        <TabsContent value="team" className="mt-5">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><UserCheck className="h-4 w-4" /> Team</CardTitle>
                  <CardDescription>{teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''} in this workspace</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8" onClick={() => navigate('/team')}>
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Manage Team
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No team members found.</p>
              ) : (
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.profileGuid ?? member.id} className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-muted/40 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-medium">
                        {(member.displayName ?? member.name ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{member.displayName ?? member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                      {member.roleName && <Badge variant="outline" className="ml-auto text-xs flex-shrink-0">{member.roleName}</Badge>}
                    </div>
                  ))}
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