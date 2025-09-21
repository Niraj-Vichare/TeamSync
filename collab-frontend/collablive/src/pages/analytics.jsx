import React, { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, Download, Filter } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Mock data (replace with real API data)
const kpiData = {
  totalProjects: 12,
  activeSprints: 5,
  openTickets: 128,
  tasksCompletedThisSprint: 342,
};

const trendData = [
  { day: "Mon", completed: 30, opened: 20 },
  { day: "Tue", completed: 45, opened: 30 },
  { day: "Wed", completed: 60, opened: 40 },
  { day: "Thu", completed: 55, opened: 35 },
  { day: "Fri", completed: 80, opened: 25 },
  { day: "Sat", completed: 20, opened: 10 },
  { day: "Sun", completed: 12, opened: 6 },
];

const ticketDistribution = [
  { name: "Bugs", value: 68 },
  { name: "Features", value: 120 },
  { name: "Chores", value: 40 },
];

const COLORS = ["#60A5FA", "#34D399", "#FBBF24"];

const teamPerformance = [
  { name: "Anita", closed: 34, open: 6, velocity: 8 },
  { name: "Rahul", closed: 28, open: 10, velocity: 7 },
  { name: "Sneha", closed: 40, open: 4, velocity: 10 },
  { name: "Vikram", closed: 12, open: 9, velocity: 3 },
];

export default function Analytics() {
  // filters
  const [org, setOrg] = useState("Acme Corp");
  const [project, setProject] = useState("Website Redesign");
  const [sprint, setSprint] = useState("Sprint 12");
  const [query, setQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  // memoized values (simulate selecting filtered data)
  const filteredTrend = useMemo(() => trendData, [org, project, sprint]);
  const filteredDistribution = useMemo(() => ticketDistribution, [org, project, sprint]);
  const filteredTeam = useMemo(() => teamPerformance.filter((t) => (selectedMember ? t.name === selectedMember : true)), [selectedMember]);

  // helpers
  const openDetail = (row) => {
    setDetailItem(row);
    setShowDetails(true);
  };

  const exportCSV = () => {
    // small client-side CSV generator
    const headers = ["Name", "Closed", "Open", "Velocity"];
    const rows = teamPerformance.map((r) => [r.name, r.closed, r.open, r.velocity]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.replace(/\s+/g,'_')}_team_performance.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Top filters & actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* <div className="flex gap-3 w-full md:w-auto items-center">
          <Select onValueChange={(v) => setOrg(v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={org} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Acme Corp">Acme Corp</SelectItem>
              <SelectItem value="Blue Labs">Blue Labs</SelectItem>
              <SelectItem value="Ignite">Ignite</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => setProject(v)}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder={project} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Website Redesign">Website Redesign</SelectItem>
              <SelectItem value="Mobile App">Mobile App</SelectItem>
              <SelectItem value="Marketing Site">Marketing Site</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => setSprint(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={sprint} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sprint 12">Sprint 12</SelectItem>
              <SelectItem value="Sprint 11">Sprint 11</SelectItem>
              <SelectItem value="Backlog">Backlog</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input placeholder="Search tickets, tasks..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div> */}

        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button>
            <Filter className="mr-2 h-4 w-4" /> Advanced Filters
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{kpiData.totalProjects}</div>
            <div className="text-xs text-muted-foreground mt-1">Total projects in organization</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Sprints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{kpiData.activeSprints}</div>
            <div className="text-xs text-muted-foreground mt-1">Sprints currently in-progress</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{kpiData.openTickets}</div>
            <div className="text-xs text-muted-foreground mt-1">Tickets yet to be resolved</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Completed (this sprint)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{kpiData.tasksCompletedThisSprint}</div>
            <div className="text-xs text-muted-foreground mt-1">Tasks completed in current sprint</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Sprint Daily Progress</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" /> Last 7 days
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={filteredTrend}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ReTooltip />
                  <Line type="monotone" dataKey="completed" stroke="#60A5FA" strokeWidth={3} />
                  <Line type="monotone" dataKey="opened" stroke="#FB923C" strokeWidth={2} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>

          <CardFooter>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-400 inline-block"/> Completed</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block"/> Opened</div>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={filteredDistribution} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} label>
                    {filteredDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Tickets, Tasks, Team */}
      <Tabs defaultValue="team" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Tickets Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4].map((i) => (
                    <TableRow key={i} className="cursor-pointer" onClick={() => openDetail({ id: i, title: `Ticket #${i}`, type: i % 2 === 0 ? 'Bug' : 'Feature', assignee: 'Anita', priority: i % 3 === 0 ? 'High' : 'Medium', status: 'Open' })}>
                      <TableCell>Ticket #{i} — Unexpected crash</TableCell>
                      <TableCell>{i % 2 === 0 ? 'Bug' : 'Feature'}</TableCell>
                      <TableCell>Anita</TableCell>
                      <TableCell><Badge variant="secondary">{i % 3 === 0 ? 'High' : 'Medium'}</Badge></TableCell>
                      <TableCell><Badge>Open</Badge></TableCell>
                      <TableCell><Button size="sm" variant="ghost">View</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Tasks Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Top blocked tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal ml-4 space-y-2 text-sm">
                      <li>Integrate payment gateway — Blocked by API key</li>
                      <li>Responsive header — Waiting on design review</li>
                      <li>Data migration script — DB access required</li>
                    </ol>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Velocity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">{Math.round(kpiData.tasksCompletedThisSprint / 2)}</div>
                    <div className="text-xs text-muted-foreground">Average story points / sprint</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>Team Performance</CardTitle>
                <div className="flex items-center gap-2">
                  {/* <Select onValueChange={(v) => setSelectedMember(v)}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Filter member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      {teamPerformance.map((m) => (
                        <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select> */}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Closed</TableHead>
                    <TableHead>Open</TableHead>
                    <TableHead>Velocity</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeam.map((m) => (
                    <TableRow key={m.name} className="hover:bg-muted/50">
                      <TableCell>{m.name}</TableCell>
                      <TableCell>{m.closed}</TableCell>
                      <TableCell>{m.open}</TableCell>
                      <TableCell>{m.velocity}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog open={showDetails} onOpenChange={setShowDetails}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost">Details</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{detailItem ? detailItem.title : 'Detail'}</DialogTitle>
                              </DialogHeader>
                              <div className="py-2">
                                <p className="text-sm">Type: {detailItem?.type}</p>
                                <p className="text-sm">Assignee: {detailItem?.assignee}</p>
                                <p className="text-sm">Priority: {detailItem?.priority}</p>
                                <p className="text-sm">Status: {detailItem?.status}</p>
                              </div>
                              <div className="flex justify-end mt-4">
                                <Button onClick={() => setShowDetails(false)}>Close</Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button size="sm" variant="ghost" onClick={() => alert(`Ping ${m.name}`)}>Ping</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer quick notes */}
      {/* <div className="text-sm text-muted-foreground">
        Tip: Use the filters above to narrow the report to an organization, project or sprint. Hook these UI values to your analytics endpoints to load real-time numbers.
      </div> */}
    </div>
  );
}
