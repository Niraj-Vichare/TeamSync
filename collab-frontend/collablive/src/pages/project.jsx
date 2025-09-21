import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import projectService from '@/services/project';
import { ArrowLeft, BarChart3, Calendar, Calendar1Icon, CalendarIcon, CheckCircle, ChevronDown, ChevronRight, Clock, DollarSign, FileText, TrendingUp, UserCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

function Project() {
  const navigate = useNavigate();

  const sprintData = [
    {
      id: 1,
      name: "Sprint 1 - Foundation",
      status: "Completed",
      startDate: "2024-07-01",
      endDate: "2024-07-14",
      tasks: [
        {
          id: 1,
          title: "Set up project structure",
          status: "Completed",
          assignee: "John Doe",
          assigneeId: "JD",
          priority: "High",
          dueDate: "2024-07-05",
          timeSpent: "8h",
          estimatedTime: "6h",
          description: "Initialize the project with proper folder structure, configuration files, and development environment setup.",
          section: "Completed"
        },
        {
          id: 2,
          title: "Database schema design",
          status: "Completed",
          assignee: "Jane Smith",
          assigneeId: "JS",
          priority: "High",
          dueDate: "2024-07-07",
          timeSpent: "12h",
          estimatedTime: "10h",
          description: "Design and implement the database schema for user management, product catalog, and order processing.",
          section: "Completed"
        },
        {
          id: 3,
          title: "API endpoint planning",
          status: "Completed",
          assignee: "Mike Johnson",
          assigneeId: "MJ",
          priority: "Medium",
          dueDate: "2024-07-10",
          timeSpent: "6h",
          estimatedTime: "8h",
          description: "Plan and document all required API endpoints for the application including authentication, CRUD operations, and business logic.",
          section: "Completed"
        },
        {
          id: 4,
          title: "UI/UX wireframes",
          status: "Completed",
          assignee: "John Doe",
          assigneeId: "JD",
          priority: "Medium",
          dueDate: "2024-07-12",
          timeSpent: "10h",
          estimatedTime: "12h",
          description: "Create detailed wireframes and user flow diagrams for all major application screens and user interactions.",
          section: "Completed"
        },
        {
          id: 5,
          title: "Authentication setup",
          status: "Completed",
          assignee: "Jane Smith",
          assigneeId: "JS",
          priority: "High",
          dueDate: "2024-07-14",
          timeSpent: "15h",
          estimatedTime: "12h",
          description: "Implement secure user authentication system with JWT tokens, password hashing, and session management.",
          section: "Completed"
        }
      ]
    },
    {
      id: 2,
      name: "Sprint 2 - Core Features",
      status: "Completed",
      startDate: "2024-07-15",
      endDate: "2024-07-28",
      tasks: [
        {
          id: 6,
          title: "Product catalog implementation",
          status: "Completed",
          assignee: "Mike Johnson",
          assigneeId: "MJ",
          priority: "High",
          dueDate: "2024-07-22",
          timeSpent: "20h",
          estimatedTime: "18h",
          description: "Build the product catalog with search, filtering, and categorization features.",
          section: "Completed"
        },
        {
          id: 7,
          title: "Shopping cart functionality",
          status: "Completed",
          assignee: "John Doe",
          assigneeId: "JD",
          priority: "High",
          dueDate: "2024-07-25",
          timeSpent: "16h",
          estimatedTime: "14h",
          description: "Implement shopping cart with add/remove items, quantity management, and persistent storage.",
          section: "Completed"
        },
        {
          id: 8,
          title: "User authentication UI",
          status: "Completed",
          assignee: "Jane Smith",
          assigneeId: "JS",
          priority: "Medium",
          dueDate: "2024-07-20",
          timeSpent: "8h",
          estimatedTime: "10h",
          description: "Create user-friendly login, registration, and profile management interfaces.",
          section: "Completed"
        },
        {
          id: 9,
          title: "Payment gateway setup",
          status: "Completed",
          assignee: "Mike Johnson",
          assigneeId: "MJ",
          priority: "High",
          dueDate: "2024-07-28",
          timeSpent: "18h",
          estimatedTime: "16h",
          description: "Integrate secure payment processing with multiple payment methods and fraud protection.",
          section: "Completed"
        }
      ]
    },
    {
      id: 3,
      name: "Sprint 3 - Advanced Features",
      status: "In Progress",
      startDate: "2024-07-29",
      endDate: "2024-08-11",
      tasks: [
        {
          id: 10,
          title: "Order management system",
          status: "Completed",
          assignee: "John Doe",
          assigneeId: "JD",
          priority: "High",
          dueDate: "2024-08-05",
          timeSpent: "14h",
          estimatedTime: "12h",
          description: "Build comprehensive order management with tracking, status updates, and customer notifications.",
          section: "Completed"
        },
        {
          id: 11,
          title: "Email notifications",
          status: "In Progress",
          assignee: "Jane Smith",
          assigneeId: "JS",
          priority: "Medium",
          dueDate: "2024-08-08",
          timeSpent: "6h",
          estimatedTime: "10h",
          description: "Implement automated email notifications for order confirmations, shipping updates, and promotional content.",
          section: "In Progress"
        },
        {
          id: 12,
          title: "Analytics integration",
          status: "To Do",
          assignee: "Mike Johnson",
          assigneeId: "MJ",
          priority: "Low",
          dueDate: "2024-08-10",
          timeSpent: "0h",
          estimatedTime: "8h",
          description: "Integrate Google Analytics and custom event tracking for user behavior analysis.",
          section: "To Do"
        },
        {
          id: 13,
          title: "Mobile responsiveness",
          status: "In Progress",
          assignee: "John Doe",
          assigneeId: "JD",
          priority: "High",
          dueDate: "2024-08-11",
          timeSpent: "8h",
          estimatedTime: "16h",
          description: "Ensure full mobile responsiveness across all devices with touch-friendly interactions.",
          section: "In Progress"
        }
      ]
    }
  ];

  const getProjectById=async()=>{
    try{
      const {id} = useParams();
      const response = await projectService.getProjectById(id);
      if(response!=null){
        const {data,success,statusCode,message} = response.data;
        if(statusCode==200 || success){
          setProject()
        }
      }

    }catch(error){
      console.error("");
    }
  }

  useEffect(()=>{
    getProjectById();

  },[])
    const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Planning': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Service': return 'bg-purple-100 text-purple-800';
      case 'Product': return 'bg-blue-100 text-blue-800';
      case 'Sold': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };
  const handleBack=()=>{
    navigate("/projects");
    
  }

  const getAllTasks = () => {
    return sprintData.flatMap(sprint => 
      sprint.tasks.map(task => ({ ...task, sprintName: sprint.name, sprintId: sprint.id }))
    );
  };

  const getTasksBySection = () => {
    const allTasks = getAllTasks();
    return taskSections.reduce((acc, section) => {
      acc[section] = allTasks.filter(task => task.section === section);
      return acc;
    }, {});
  };

  const toggleSprint = (sprintId) => {
    setExpandedSprints(prev => ({
      ...prev,
      [sprintId]: !prev[sprintId]
    }));
  };
  const [activeModule, setActiveModule] = useState('overview');
  const [sprints, setSprints] = useState(sprintData);
  const [expandedSprints, setExpandedSprints] = useState({});
  const [project, setProject] = useState({});

  const getProject = () => {
    try {
      // api call for the project details

    } catch (error) {
      toast.error("");
    }
  }

  useEffect(() => {
    getProject();
  }, [])
  return (
    <div className="w-full overflow-x-hidden px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Project Name</h1>
          <p className="text-gray-500">Project Description</p>
        </div>
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center gap-2 self-start sm:self-center"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>
      </div>

      {/* Metrics in a grid (no min-width, no overflow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sprints Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.completedSprints}/{project.sprints}</div>
            <Progress value={(project.completedSprints / project.sprints) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.completedTasks}/{project.totalTasks}</div>
            <Progress value={(project.completedTasks / project.totalTasks) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.hoursWorked}h</div>
            <p className="text-xs text-muted-foreground mt-1">Across all team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Budget vs Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${project.revenue?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Spent: ${project.budgetSpent?.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeModule} onValueChange={setActiveModule} className="w-full">
        <TabsList className="flex overflow-x-auto gap-2 pb-2 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2 whitespace-nowrap">
            <BarChart3 className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2 whitespace-nowrap">
            <CheckCircle className="w-4 h-4" /> Task
          </TabsTrigger>
          <TabsTrigger value="sprints" className="flex items-center gap-2 whitespace-nowrap">
            <Calendar className="w-4 h-4" /> Sprints
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2 whitespace-nowrap">
            <TrendingUp className="w-4 h-4" /> Analysis
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2 whitespace-nowrap">
            <FileText className="w-4 h-4" /> Report
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2 whitespace-nowrap">
            <UserCheck className="w-4 h-4" /> Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Sprint Overview
                  </CardTitle>
                  <CardDescription>Track progress across all sprints</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveModule("sprints")}>
                  View All Sprints
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                      {sprintData.map((sprint) => (
                        <div key={sprint.id} className="border rounded-lg p-4">
                          <div 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSprint(sprint.id)}
                          >
                            <div className="flex items-center gap-3">
                              {expandedSprints[sprint.id] ? 
                                <ChevronDown className="h-4 w-4" /> : 
                                <ChevronRight className="h-4 w-4" />
                              }
                              <h3 className="font-semibold">{sprint.name}</h3>
                              <Badge variant={sprint.status === 'Completed' ? 'default' : 'secondary'}>
                                {sprint.status}
                              </Badge>
                            </div>
                            <span className="text-sm text-gray-500">
                              {sprint.tasks.filter(t => t.status === 'Completed').length}/{sprint.tasks.length} tasks
                            </span>
                          </div>
                          
                          {expandedSprints[sprint.id] && (
                            <div className="mt-4 pl-7">
                              <div className="space-y-2">
                                {sprint.tasks.slice(0, 5).map((task) => (
                                  <div key={task.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-2 h-2 rounded-full ${
                                        task.status === 'Completed' ? 'bg-green-500' :
                                        task.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-300'
                                      }`} />
                                      <span className="text-sm">{task.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {task.assignee}
                                      </Badge>
                                      <Badge variant={
                                        task.status === 'Completed' ? 'default' :
                                        task.status === 'In Progress' ? 'secondary' : 'outline'
                                      } className="text-xs">
                                        {task.status}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {sprint.tasks.length > 5 && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="mt-2 text-blue-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveModule('tasks');
                                  }}
                                >
                                  View all {sprint.tasks.length} tasks →
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

  )
}

export default Project