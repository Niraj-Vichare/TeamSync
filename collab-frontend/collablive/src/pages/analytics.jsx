
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  TrendingUp, 
  Award, 
  BarChart3, 
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Bell,
  Settings,
  User,
  ChevronDown,
  Play,
  Pause,
  MoreHorizontal,
  FileText,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  PieChart,
  Moon,
  Sun,
  Ticket,
  FolderOpen,
  Eye,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [activeTab, setActiveTab] = useState('analysis');
  const [currentPage, setCurrentPage] = useState(1);
  const [reportFilters, setReportFilters] = useState({
    dateRange: 'month',
    reportType: 'all',
    status: 'all',
    format: 'pdf'
  });

  const itemsPerPage = 5;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Enhanced line chart data with more comprehensive metrics
  const performanceTrendData = [
    { name: 'Jan', tasks: 45, projects: 8, sprints: 3, velocity: 42, burndown: 38 },
    { name: 'Feb', tasks: 52, projects: 10, sprints: 4, velocity: 48, burndown: 44 },
    { name: 'Mar', tasks: 48, projects: 9, sprints: 3, velocity: 45, burndown: 41 },
    { name: 'Apr', tasks: 61, projects: 12, sprints: 5, velocity: 55, burndown: 52 },
    { name: 'May', tasks: 58, projects: 11, sprints: 4, velocity: 52, burndown: 49 },
    { name: 'Jun', tasks: 65, projects: 13, sprints: 5, velocity: 58, burndown: 55 },
    { name: 'Jul', tasks: 71, projects: 15, sprints: 6, velocity: 65, burndown: 62 },
    { name: 'Aug', tasks: 68, projects: 14, sprints: 5, velocity: 61, burndown: 58 },
  ];

  // Project status data for pie chart
  const projectStatusData = [
    { name: 'Completed', value: 32, color: 'hsl(224.3 76.3% 48%)' },
    { name: 'In Progress', value: 28, color: 'hsl(221.2 83.2% 53.3%)' },
    { name: 'On Hold', value: 8, color: 'hsl(217.2 91.2% 59.8%)' },
    { name: 'Planning', value: 12, color: 'hsl(213.1 93.9% 67.8%)' }
  ];

  // Sprint velocity data for bar chart
  const sprintVelocityData = [
    { name: 'Sprint 1', planned: 25, completed: 23, velocity: 92 },
    { name: 'Sprint 2', planned: 30, completed: 28, velocity: 93 },
    { name: 'Sprint 3', planned: 28, completed: 25, velocity: 89 },
    { name: 'Sprint 4', planned: 32, completed: 30, velocity: 94 },
    { name: 'Sprint 5', planned: 27, completed: 26, velocity: 96 },
    { name: 'Sprint 6', planned: 35, completed: 32, velocity: 91 },
  ];

  const projectCards = [
    {
      id: 1,
      name: 'E-commerce Platform',
      status: 'In Progress',
      progress: 75,
      team: ['John', 'Sarah', 'Mike'],
      deadline: '2025-10-15',
      priority: 'high',
      tasks: { total: 24, completed: 18 }
    },
    {
      id: 2,
      name: 'Mobile App Redesign',
      status: 'Review',
      progress: 90,
      team: ['Anna', 'Tom'],
      deadline: '2025-09-30',
      priority: 'medium',
      tasks: { total: 16, completed: 14 }
    },
    {
      id: 3,
      name: 'Analytics Dashboard',
      status: 'Planning',
      progress: 25,
      team: ['Sarah', 'Chris', 'Alex'],
      deadline: '2025-11-20',
      priority: 'low',
      tasks: { total: 32, completed: 8 }
    }
  ];

  const rankingData = [
    { rank: 1, name: 'Alex Johnson (You)', avatar: 'AJ', score: 2485, tasksCompleted: 47, efficiency: 94, change: 5, trend: 'up' },
    { rank: 2, name: 'Sarah Chen', avatar: 'SC', score: 2431, tasksCompleted: 43, efficiency: 91, change: -1, trend: 'down' },
    { rank: 3, name: 'Mike Rodriguez', avatar: 'MR', score: 2398, tasksCompleted: 41, efficiency: 89, change: 2, trend: 'up' },
    { rank: 4, name: 'Anna Davis', avatar: 'AD', score: 2367, tasksCompleted: 39, efficiency: 87, change: 0, trend: 'same' },
    { rank: 5, name: 'Tom Wilson', avatar: 'TW', score: 2312, tasksCompleted: 38, efficiency: 85, change: 3, trend: 'up' },
    { rank: 6, name: 'Emma Brown', avatar: 'EB', score: 2289, tasksCompleted: 36, efficiency: 83, change: -2, trend: 'down' },
    { rank: 7, name: 'James Lee', avatar: 'JL', score: 2245, tasksCompleted: 34, efficiency: 81, change: 1, trend: 'up' },
    { rank: 8, name: 'Lisa Wang', avatar: 'LW', score: 2198, tasksCompleted: 32, efficiency: 79, change: -1, trend: 'down' },
  ];

  const allReports = [
    { 
      id: 1, 
      name: 'Project Performance Report', 
      description: 'Comprehensive analysis of all active projects',
      type: 'Project',
      status: 'Downloaded',
      lastGenerated: '2025-09-27',
      size: '2.4 MB',
      downloadCount: 12,
      canDownload: true
    },
    { 
      id: 2, 
      name: 'Sprint Analytics Dashboard', 
      description: 'Detailed sprint progress and velocity metrics',
      type: 'Sprint',
      status: 'Available',
      lastGenerated: '2025-09-26',
      size: '1.8 MB',
      downloadCount: 8,
      canDownload: true
    },
    { 
      id: 3, 
      name: 'Team Productivity Overview', 
      description: 'Individual and team productivity insights',
      type: 'Team',
      status: 'Processing',
      lastGenerated: '2025-09-25',
      size: '3.1 MB',
      downloadCount: 15,
      canDownload: false
    },
    { 
      id: 4, 
      name: 'Quality Metrics Analysis', 
      description: 'Code quality and bug tracking analysis',
      type: 'Quality',
      status: 'Available',
      lastGenerated: '2025-09-24',
      size: '1.2 MB',
      downloadCount: 6,
      canDownload: true
    },
    { 
      id: 5, 
      name: 'Monthly Performance Summary', 
      description: 'Monthly team and project performance summary',
      type: 'Summary',
      status: 'Downloaded',
      lastGenerated: '2025-09-23',
      size: '2.8 MB',
      downloadCount: 22,
      canDownload: true
    },
    { 
      id: 6, 
      name: 'Risk Assessment Report', 
      description: 'Project risks and mitigation strategies',
      type: 'Risk',
      status: 'Available',
      lastGenerated: '2025-09-22',
      size: '1.5 MB',
      downloadCount: 4,
      canDownload: true
    },
    { 
      id: 7, 
      name: 'Resource Utilization Report', 
      description: 'Team resource allocation and utilization',
      type: 'Resource',
      status: 'Processing',
      lastGenerated: '2025-09-21',
      size: '2.1 MB',
      downloadCount: 9,
      canDownload: false
    },
    { 
      id: 8, 
      name: 'Client Feedback Analysis', 
      description: 'Analysis of client feedback and satisfaction',
      type: 'Feedback',
      status: 'Available',
      lastGenerated: '2025-09-20',
      size: '1.9 MB',
      downloadCount: 11,
      canDownload: true
    },
  ];

  // Filter reports based on current filters
  const filteredReports = allReports.filter(report => {
    if (reportFilters.reportType !== 'all' && report.type.toLowerCase() !== reportFilters.reportType.toLowerCase()) return false;
    if (reportFilters.status !== 'all' && report.status.toLowerCase() !== reportFilters.status.toLowerCase()) return false;
    return true;
  });

  // Paginate reports
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'down': return <ArrowDown className="h-3 w-3 text-red-500" />;
      default: return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'available':
        return <Badge variant="default">Available</Badge>;
      case 'downloaded':
        return <Badge variant="secondary">Downloaded</Badge>;
      case 'processing':
        return <Badge variant="outline">Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleReportDownload = (reportId) => {
    console.log('Downloading report:', reportId);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className={`min-h-screen transition-colors`}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-background border-b sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Project Management Hub</h1>
                <p className="text-sm text-muted-foreground">Dashboard overview and analytics</p>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Hero Section - 4 Cards */}
            <motion.div variants={cardVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: FolderOpen, label: 'Active Projects', value: '28', subtext: 'projects running' },
                { icon: Target, label: 'Active Sprints', value: '8', subtext: 'sprints in progress' },
                { icon: Ticket, label: 'Open Tickets', value: '156', subtext: 'pending resolution' },
                { icon: CheckCircle2, label: 'Tasks Completed', value: '847', subtext: 'this month' }
              ].map((stat, index) => (
                <Card key={index} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <stat.icon className="h-6 w-6 text-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Main Content Tabs */}
            <motion.div variants={cardVariants}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                {/* Analysis Tab Content */}
                <TabsContent value="analysis" className="space-y-8 mt-8">
                  {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Project Status Pie Chart */}
                    {/* <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="h-5 w-5" />
                          Project Status Distribution
                        </CardTitle>
                        <CardDescription>Current status of all projects</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsPieChart>
                            <Pie
                              data={projectStatusData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {projectStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card> */}

                    {/* Sprint Progress Bar Chart */}
                    {/* <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Sprint Progress Comparison
                        </CardTitle>
                        <CardDescription>Tasks planned vs completed per sprint</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={sprintVelocityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                            <YAxis stroke="hsl(var(--muted-foreground))" />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="remaining" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card> */}

                    
                  </div>
                {/* Two Column Charts */}
                <motion.div variants={cardVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Project Status Distribution
                      </CardTitle>
                      <CardDescription>Current status breakdown of all projects</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <RechartsPieChart>
                          <Pie
                            data={projectStatusData}
                            cx="50%"
                            cy="50%"
                            // outerRadius={100}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {projectStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                              //  
                              border: '1px solid var(--border)',
                              borderRadius: '8px'
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Bar Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Sprint Velocity Analysis
                      </CardTitle>
                      <CardDescription>Sprint planning vs completion performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={sprintVelocityData}>
                          <CartesianGrid strokeDasharray="10 10" stroke="var(--border)" />
                          <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                          <YAxis stroke="var(--muted-foreground)" />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'var(--background)',
                              border: '1px solid hsl(271.5 81.3% 55.9%)',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar 
                            dataKey="planned" 
                            fill="hsl(217.2 91.2% 59.8%)" 
                            radius={[4, 4, 0, 0]} 
                            name="Planned"
                          />
                          <Bar 
                            dataKey="completed" 
                            fill="hsl(224.3 76.3% 48%)" 
                            radius={[4, 4, 0, 0]} 
                            name="Completed"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                  {/* Task Trend Line Chart - Full Width */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Task Completion Trends
                          </CardTitle>
                          <CardDescription>Weekly task creation vs completion analysis</CardDescription>
                        </div>
                        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="week">6 Weeks</SelectItem>
                            <SelectItem value="month">3 Months</SelectItem>
                            <SelectItem value="quarter">6 Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={performanceTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                          <YAxis stroke="var(--muted-foreground)" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--background)",
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Area type="monotone" dataKey="tasks" stroke="hsl(198.4 93.2% 59.6%)" fill="hsl(198.4 93.2% 59.6%)" fillOpacity={0.2} />
                          <Area type="monotone" dataKey="velocity" stroke="hsl(238.7 83.5% 66.7%)" fill="hsl(238.7 83.5% 66.7%)" fillOpacity={0.2} />
                          <Area type="monotone" dataKey="burndown" stroke="hsl(221.2 83.2% 53.3%)" fill="hsl(221.2 83.2% 53.3%)" fillOpacity={0.1} />

                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Project Cards */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Active Projects Overview</CardTitle>
                          <CardDescription>Current project status and progress</CardDescription>
                        </div>
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          New Project
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projectCards.map((project, index) => (
                          <motion.div 
                            key={project.id}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.15 }}
                            whileHover={{ y: -5 }}
                            className="border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline">{project.priority} priority</Badge>
                                <div className="flex -space-x-2">
                                  {project.team.slice(0, 3).map((member, i) => (
                                    <div key={i} className="w-6 h-6 bg-muted border-2 border-background rounded-full flex items-center justify-center">
                                      <span className="text-xs font-medium">{member[0]}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium">{project.progress}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress}%` }}
                                    transition={{ duration: 1, delay: index * 0.3 }}
                                    className="bg-foreground h-2 rounded-full"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>{project.tasks.completed}/{project.tasks.total} tasks</span>
                                <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Reports Tab Content */}
                <TabsContent value="reports" className="space-y-8 mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Report Management
                      </CardTitle>
                      <CardDescription>Generate, download, and manage analytics reports</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Filters Row */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="space-y-2">
                          <Label htmlFor="dateRange">Date Range</Label>
                          <Select
                            value={reportFilters.dateRange}
                            onValueChange={(value) => setReportFilters(prev => ({ ...prev, dateRange: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="week">Last Week</SelectItem>
                              <SelectItem value="month">Last Month</SelectItem>
                              <SelectItem value="quarter">Last Quarter</SelectItem>
                              <SelectItem value="year">Last Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reportType">Report Type</Label>
                          <Select
                            value={reportFilters.reportType}
                            onValueChange={(value) => {
                              setReportFilters(prev => ({ ...prev, reportType: value }));
                              setCurrentPage(1);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="project">Project</SelectItem>
                              <SelectItem value="sprint">Sprint</SelectItem>
                              <SelectItem value="team">Team</SelectItem>
                              <SelectItem value="quality">Quality</SelectItem>
                              <SelectItem value="summary">Summary</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={reportFilters.status}
                            onValueChange={(value) => {
                              setReportFilters(prev => ({ ...prev, status: value }));
                              setCurrentPage(1);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="downloaded">Downloaded</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="format">Format</Label>
                          <Select
                            value={reportFilters.format}
                            onValueChange={(value) => setReportFilters(prev => ({ ...prev, format: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="excel">Excel</SelectItem>
                              <SelectItem value="csv">CSV</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Reports List */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Available Reports ({filteredReports.length})</h3>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Eye className="h-4 w-4" />
                              View All
                            </Button>
                            <Button className="gap-2">
                              <Plus className="h-4 w-4" />
                              Generate Report
                            </Button>
                          </div>
                        </div>

                        {/* Reports Table */}
                        <div className="border rounded-lg">
                          <div className="grid grid-cols-12 gap-4 p-4 bg-muted/30 text-sm font-medium border-b">
                            <div className="col-span-4">Report Name</div>
                            <div className="col-span-2">Type</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2">Generated</div>
                            <div className="col-span-1">Size</div>
                            <div className="col-span-1">Actions</div>
                          </div>

                          {paginatedReports.map((report, index) => (
                            <motion.div
                              key={report.id}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                            >
                              <div className="col-span-4">
                                <div>
                                  <p className="font-medium text-foreground">{report.name}</p>
                                  <p className="text-sm text-muted-foreground">{report.description}</p>
                                </div>
                              </div>

                              <div className="col-span-2">
                                <Badge variant="outline">{report.type}</Badge>
                              </div>

                              <div className="col-span-2">
                                {getStatusBadge(report.status)}
                              </div>

                              <div className="col-span-2">
                                <p className="text-sm text-foreground">{report.lastGenerated}</p>
                              </div>

                              <div className="col-span-1">
                                <p className="text-sm text-muted-foreground">{report.size}</p>
                              </div>

                              <div className="col-span-1">
                                <div className="flex items-center gap-1">
                                  {report.canDownload && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleReportDownload(report.id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length} reports
                            </p>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="gap-1"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                              </Button>

                              <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, index) => (
                                  <Button
                                    key={index + 1}
                                    variant={currentPage === index + 1 ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(index + 1)}
                                    className="w-8 h-8 p-0"
                                  >
                                    {index + 1}
                                  </Button>
                                ))}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="gap-1"
                              >
                                Next
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
            
              </Tabs>
            </motion.div>

            {/* Performance Leaderboard - Always Visible */}
            <motion.div variants={cardVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Performance Leaderboard
                      </CardTitle>
                      <CardDescription>Team member performance rankings</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-3 mb-4">
                      <div className="col-span-1">Rank</div>
                      <div className="col-span-4">Team Member</div>
                      <div className="col-span-2">Score</div>
                      <div className="col-span-2">Tasks</div>
                      <div className="col-span-2">Efficiency</div>
                      <div className="col-span-1">Trend</div>
                    </div>
                    
                    <div className="space-y-3">
                      {rankingData.map((member, index) => (
                        <motion.div 
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className={`grid grid-cols-12 gap-4 items-center py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors ${
                            member.name.includes('You') ? 'bg-muted/50 border' : ''
                          }`}
                        >
                          <div className="col-span-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                              index === 0 ? 'bg-background border-foreground' :
                              index === 1 ? 'bg-muted border-muted-foreground' :
                              index === 2 ? 'bg-muted border-muted-foreground' :
                              'bg-background border-muted-foreground'
                            }`}>
                              {member.rank}
                            </div>
                          </div>
                          
                          <div className="col-span-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-foreground font-semibold">
                                {member.avatar}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{member.name}</p>
                                <p className="text-sm text-muted-foreground">Software Engineer</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-span-2">
                            <p className="font-bold text-foreground">{member.score.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                          
                          <div className="col-span-2">
                            <p className="font-semibold text-foreground">{member.tasksCompleted}</p>
                            <p className="text-xs text-muted-foreground">completed</p>
                          </div>
                          
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-foreground h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${member.efficiency}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{member.efficiency}%</span>
                            </div>
                          </div>
                          
                          <div className="col-span-1">
                            <div className="flex items-center gap-1">
                              {getTrendIcon(member.trend)}
                              <span className={`text-xs ${
                                member.trend === 'up' ? 'text-green-500' : 
                                member.trend === 'down' ? 'text-red-500' : 
                                'text-muted-foreground'
                              }`}>
                                {member.change > 0 ? '+' : ''}{member.change}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;