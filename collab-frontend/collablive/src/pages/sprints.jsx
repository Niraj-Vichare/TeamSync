
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BugIcon, CalendarIcon, CheckCircle, CircuitBoardIcon, Clock, Clock3, Clock3Icon, DatabaseIcon, FileText, GiftIcon, ListIcon, Pause, PauseIcon, Pencil, PencilIcon, PenIcon, Plus, PlusIcon, Search, SquareKanbanIcon, Tag, Target, Trash, Trash2Icon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import SprintCard from '@/components/sprintComponents/sprintCard';
import BugCard from '@/components/sprintComponents/bugCard';
import sprintService from '@/services/sprint';
import projectService from "@/services/project";
import teamService from "@/services/team";
import UserStoryCard from '@/components/sprintComponents/userStoryCard';
import { IconBrandStorybook } from '@tabler/icons-react';
import { globalSprint, projectWithName, teamWithName } from '@/data/general';
import { toast } from 'sonner';
import TicketDialog from '@/components/sprintComponents/TicketDialog';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';



function Sprints() {


  const [loading,setLoading] = useState(false);
  const [errors, setErrors] = useState({});
    
  // Get today's date for date inputs
  const today = new Date().toISOString().split('T')[0];


  const [bugs, setBugs] = useState(
    [
      {
        sprintId: null,
        title: "Login page crashes on special characters",
        description: "The login page crashes when a user enters special characters in the username field. No error message is displayed.",
        reportedBy: "Alice Johnson",
        assignedTo: "Bob Smith",
        status: "open",
        priority: "High",
        reportedOn: "2025-09-18",
        steps: [
          "Go to the login page",
          "Enter special characters in the username field",
          "Click the login button",
          "Observe the page crash"
        ],
        images: [
          "https://via.placeholder.com/150",
          "https://via.placeholder.com/150/ff0000"
        ]
      },
      {
        sprintId: "SPR-102",
        title: "Dashboard metrics not updating",
        description: "After syncing data, some metrics on the dashboard do not update, causing inconsistency in the displayed values.",
        reportedBy: "Clara Lee",
        assignedTo: "David Kim",
        status: "progress",
        priority: "Medium",
        reportedOn: "2025-09-19",
        steps: [
          "Open the dashboard",
          "Perform a data sync",
          "Check metrics values",
          "Observe which metrics do not update"
        ],
        images: [
          "https://via.placeholder.com/150/00ff00",
          "https://via.placeholder.com/150/0000ff"
        ]
      },
      {
        sprintId: "SPR-103",
        title: "Report generation throws error 500",
        description: "Generating reports sometimes results in a server error (500) due to timeout issues with large datasets.",
        reportedBy: "Bob Smith",
        assignedTo: "Alice Johnson",
        status: "closed",
        priority: "High",
        reportedOn: "2025-09-20",
        steps: [
          "Go to the reports section",
          "Select a large date range",
          "Click generate report",
          "Observe server error 500"
        ],
        images: [
          "https://via.placeholder.com/150/ff00ff"
        ]
      },
      {
        sprintId: "SPR-104",
        title: "Profile picture upload fails for large files",
        description: "Users cannot upload profile pictures larger than 2MB. No error message is shown; the image simply doesn't upload.",
        reportedBy: "David Kim",
        assignedTo: "Clara Lee",
        status: "open",
        priority: "Low",
        reportedOn: "2025-09-21",
        steps: [
          "Go to user profile page",
          "Attempt to upload a picture larger than 2MB",
          "Click save",
          "Observe the upload fails silently"
        ],
        images: [
          "https://via.placeholder.com/150/ffff00"
        ]
      }]);

  const [userStories, setUserStories] = useState([
    {
      storyId: "US-101",
      title: "User can reset password",
      description: "As a user, I want to reset my password so that I can regain access if I forget it.Hellow heiwevhkwevgwwuevgnwo wvwvogwivyowvv wgiwgvwwe",
      project: "Authentication Module",
      sprint: "5",
      status: "In Progress",
      priority: "High",
      storyPoints: 5,
      tags: ["Frontend", "Security"]
    },
    {
      storyId: "US-102",
      title: "Dashboard shows user activity",
      description: "Display a summary of the user’s activities including logins, purchases, and messages.",
      project: "Dashboard Module",
      sprint: "5",
      status: "Open",
      priority: "Medium",
      storyPoints: 3,
      tags: ["Frontend", "Backend", "API"]
    },
    {
      storyId: "US-103",
      title: "Profile picture upload",
      description: "Allow users to upload a profile picture and crop it to a square format.",
      project: "User Profile",
      sprint: null, // Backlog story
      status: "Open",
      priority: "Low",
      storyPoints: 2,
      tags: ["Frontend", "UI/UX"]
    },
    {
      storyId: "US-104",
      title: "Email notifications for comments",
      description: "Send email notifications to users when someone comments on their post.",
      project: "Notification System",
      sprint: null, // Backlog story
      status: "Open",
      priority: "Medium",
      storyPoints: 3,
      tags: ["Backend", "API"]
    },
    {
      storyId: "US-105",
      title: "Search functionality",
      description: "Implement search to allow users to search posts by keywords and hashtags.",
      project: "Search Module",
      sprint: "6",
      status: "In Progress",
      priority: "High",
      storyPoints: 8,
      tags: ["Backend", "Frontend", "Performance"]
    },
    {
      storyId: "US-106",
      title: "Dark mode toggle",
      description: "Allow users to toggle between light and dark mode in the settings.",
      project: "UI Enhancements",
      sprint: null, // Wishlist story
      status: "Open",
      priority: "Low",
      storyPoints: 1,
      tags: ["Frontend", "UI/UX"]
    },
    {
      storyId: "US-107",
      title: "Export data as CSV",
      description: "Users should be able to export their account data in CSV format for offline analysis.",
      project: "Reporting Module",
      sprint: "6",
      status: "Completed",
      priority: "High",
      storyPoints: 5,
      tags: ["Backend", "API"]
    }
  ]);


  const [tabs, setTabs] = useState("sprints");
  const { getCurrentWorkspaceId } = useAuth();

  
  // User Story's States
  const [storyOpen,setStoriesOpen] = useState(false);
  const [storyLoading,setStoryLoading] = useState(false);
  const [story,setStory] = useState({
    "title":'',
    "description":'',
    "priority":'',
    "status":'',
    "tags":'',
    "projectId":'',
    "reportBy":"",
    "points":"",
    "ticketType":""

  });


  // Bug's States
  const [bugOpen,setBugOpen] = useState(false);
  const [bugLoading,setBugLoading] = useState(false);
  const [bugFormData,setBugFormData] = useState({
    "title":'',
    "description":'',
    "priority":'',
    "status":'',
    "tags":'',
    "projectId":'',
    "reportBy":"",
    "points":"",
    "ticketType":""
  });


  // Sprint's States
  const [sprints, setSprints] = useState([]);
  const [sprintOpen, setSprintOpen] = useState(false);
  const [sprintLoading, setSprintLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [sprintPage,setPage] = useState(1);
  const [sprintPageSize,setSprintPageSize] = useState(9);
  const [sprintTotalCount, setSprintTotalCount] = useState(0);
  const [sprintTotalPages, setSprintTotalPages] = useState(0);
  const [sprintSearchTerm, setSprintSearchTerm] = useState('');
  const [sprintStatusFilter, setSprintStatusFilter] = useState('');
  const [sprintProjectFilter, setProjectStatusFilter] = useState('');


  const [sprintFormData, setSprintFormData] = useState({
    title: "",
    goal: "",
    tagline: "",
    startDate: "",
    endDate: "",
    status: "",
    projectId: "",
    tags: "",
    teamId: "",
  });
  const [project,setProjects] = useState([]);
  const workspaceGuid = getCurrentWorkspaceId();

  const handleInputChange = (key, value) => {
    setSprintFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" })); // clear error on change
  };

  // 🔹 Validation
   // ✅ Client-side validation
  const validateForm = () => {
    let newErrors = {};
    if (!sprintFormData.title.trim())
      newErrors.title = "Sprint title is required";
    if (!sprintFormData.goal.trim())
      newErrors.goal = "Sprint goal (description) is required";
    if (!sprintFormData.tagline.trim())
      newErrors.tagline = "Sprint tagline is required";
    if (!sprintFormData.tags.trim())
      newErrors.tags = "At least one tag is required";
    if (!sprintFormData.projectId)
      newErrors.projectId = "Project selection is required";
    if (!sprintFormData.startDate)
      newErrors.startDate = "Start date is required";
    if (!sprintFormData.endDate)
      newErrors.endDate = "End date is required";
    if (
      sprintFormData.startDate &&
      sprintFormData.endDate &&
      sprintFormData.endDate < sprintFormData.startDate
    ) {
      newErrors.endDate = "End date cannot be earlier than start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchSprints = async () => {
    if (!workspaceGuid) return;

    try {
      setSprintLoading(true);
      const response = await sprintService.getAllSprints(
        workspaceGuid,
        sprintSearchTerm,
        sprintStatusFilter,
        sprintProjectFilter,
        sprintPage,
        sprintPageSize
      );

      // Assuming backend returns: { success, message, data: { items, totalCount, pageNumber, pageSize } }
      if (response.success && response.data) {
        const { data, totalCount, pageSize } = response.data;
        setSprints(data);
        setSprintTotalCount(totalCount);
        setSprintTotalPages(Math.ceil(totalCount / pageSize));
      } else {
        console.warn("Failed to fetch sprints:", response.message);
      }
    } catch (error) {
      console.error("Error fetching sprints:", error);
    } finally {
      setSprintLoading(false);
    }
  };

  const createTicket=()=>{

  }
  
  // ✅ Create Sprint
  const createSprint = async () => {
    if (!validateForm()) return;
    setSprintLoading(true);

    try {
      const sprintData = {
        title: sprintFormData.title,
        goal: sprintFormData.goal,
        tagline: sprintFormData.tagline,
        startDate: new Date(sprintFormData.startDate).toISOString(),
        endDate: new Date(sprintFormData.endDate).toISOString(),
        updateDate: new Date().toISOString(),
        status: parseInt(sprintFormData.status), // ⚡ 0 = NotStarted, 1 = InProgress, etc.
        projectId: parseInt(sprintFormData.projectId),
        sprintGuid:"",
        teamModel: {
          teamId: parseInt(sprintFormData.teamId),
          teamName: teams.find((t) => t.teamId.toString() === sprintFormData.teamId)?.teamName || ""
        },
        tags: sprintFormData.tags
      };
      const response = await sprintService.createSprint(workspaceGuid, sprintData);
      resetForm();
      
      toast("Sprint Created 🎉",{description: `${sprintFormData.title} has been added successfully.`});

      setSprintOpen(false);
      setSprintFormData({
        title: "",
        goal: "",
        tagline: "",
        startDate: "",
        endDate: "",
        status: "",
        projectId: "",
        tags: "",
        teamId: "",
      });
      fetchSprints();
    } catch (err) {
      console.error("Failed to create sprint:", err);
      setErrors({}); // reset previous
      console.log(err);

      // 🧩 Handle ASP.NET validation (400)
      if (err.response?.status === 400 && err.response.data?.errors) {
        const serverErrors = err.response.data.errors;
        const fieldErrors = {};
        for (const [key, messages] of Object.entries(serverErrors)) {
          const cleanKey = key.replace(/^\$\./, "").replace(/^sprintDto\./, "");
          fieldErrors[cleanKey.toLowerCase()] = messages.join(", ");
        }
        setErrors(fieldErrors);
        return;
      }
      toast.error("Something went wrong while creating sprint.");
    } finally {
      
      setSprintLoading(false);
    }
  };


  const fetchUserStories = async ()=>{

  }

  const fetchTicket = async ()=>{

  }

  const handleDialogChange = (isOpen) => {
    setSprintOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };
  // 🧠 Helper: Reset all form fields and errors
  const resetForm = () => {
    setSprintFormData({
      title: "",
      goal: "",
      tagline: "",
      startDate: "",
      endDate: "",
      status: "",
      projectId: "",
      tags: "",
      teamId: "",
    });
    setErrors({});
  };

    
  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      if (tabs === "sprints") {
        await fetchSprints();
      } else if (tabs === "bugs") {
        await fetchTicket();
      } else if (tabs === "user-story") {
        await fetchUserStories();
      }

    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [tabs, workspaceGuid, sprintPage, sprintSearchTerm, sprintStatusFilter, sprintProjectFilter]);


  const fetchProjects=async()=>{
    
    const response = await projectService.getProjectDropdown(workspaceGuid);
    if(response == null){
      return null;
    }
    console.log("Project Data",response);
    setProjects(response);

  }

  const fetchTeams=async()=>{
    const response = await teamService.getTeamDropdown(workspaceGuid);
    setTeams(response);

    console.log("Team Data",response);

  }

  useEffect(()=>{
    fetchProjects();
    fetchTeams();
  },[])
  

  return (
    <div className='p-3'>
      <div className='flex justify-between items-center mb-3'>
        <div>
          <h1 className='text-2xl font-bold'>Sprints</h1>
          <p className='text-sm text-muted-foreground'>Organize work into time-boxed iterations to enhance focus and deliver value incrementally.</p>
        </div>

      </div>
      <Tabs value={tabs} onValueChange={setTabs} className='w-full'>
        <TabsList className={'flex overflow-x-auto gap-2 w-full'}>
          <TabsTrigger value="sprints" className="flex items-center gap-2 whitespace-nowrap">
            <SquareKanbanIcon className='w-4 h-4' />
            <span className='text-sm'>Sprints</span>
          </TabsTrigger>
          <TabsTrigger value="bugs" className={"flex items-center gap-2 whitespace-nowrap"}>
            <BugIcon className='w-4 h-4' />
            <span className='text-sm'>Bugs</span>
          </TabsTrigger>
          <TabsTrigger value="user-story" className={"flex items-center gap-2 whitespace-nowrap"}>
            <IconBrandStorybook className='w-4 h-4' />
            <span className='text-sm'>User Stories</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sprints" className="mt-3">
          {/* Toolbar Row */}
          <div className="flex items-center justify-between pb-2">
            {/* Left: Add Button */}
            <Dialog open={sprintOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button className="text-white">
                  <PlusIcon className="w-3 h-3 mr-2" />
                  Add New Sprint
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader className="px-2 border-b-2 py-2">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                    Create Sprint
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh]">
                  <div className="space-y-5 p-4 px-4">

                    {/* Sprint Title */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Sprint Title *
                      </Label>
                      <Input
                        value={sprintFormData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Enter the sprint title"
                        className={errors.title ? "border-red-500" : ""}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500">{errors.title}</p>
                      )}
                    </div>

                    {/* Sprint Tagline */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Sprint Tagline *
                      </Label>
                      <Input
                        value={sprintFormData.tagline}
                        onChange={(e) => handleInputChange("tagline", e.target.value)}
                        placeholder="Enter the sprint tagline"
                        className={errors.tagline ? "border-red-500" : ""}
                      />
                      {errors.tagline && (
                        <p className="text-sm text-red-500">{errors.tagline}</p>
                      )}
                    </div>

                    {/* Sprint Goal / Description */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Sprint Goal *
                      </Label>
                      <Textarea
                        value={sprintFormData.goal}
                        onChange={(e) => handleInputChange("goal", e.target.value)}
                        placeholder="Describe your sprint goal"
                        rows={4}
                        className={errors.goal ? "border-red-500" : ""}
                      />
                      {errors.goal && (
                        <p className="text-sm text-red-500">{errors.goal}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Target className="w-4 h-4" /> Sprint Status
                      </Label>
                      <Select
                        value={sprintFormData.status}
                        onValueChange={(value) => handleInputChange("status", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Active</SelectItem>
                          <SelectItem value="2">Completed</SelectItem>
                          <SelectItem value="3">Paused</SelectItem>
                          <SelectItem value="4">Upcoming</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.status && (
                        <p className="text-sm text-red-500">{errors.status}</p>
                      )}
                    </div>

                    {/* Project Selector */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Target className="w-4 h-4" /> Select Project
                      </Label>
                      <Select
                        value={sprintFormData.projectId}
                        onValueChange={(value) => handleInputChange("projectId", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Project" />
                        </SelectTrigger>
                        <SelectContent>
                          {project && project?.map((project) => (
                            <SelectItem
                              key={project.projectId}
                              value={project.projectId.toString()}
                            >
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.projectId && (
                        <p className="text-sm text-red-500">{errors.projectId}</p>
                      )}
                    </div>

                    {/* Team Selector */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Target className="w-4 h-4" /> Select Team
                      </Label>
                      <Select
                        value={sprintFormData.teamId}
                        onValueChange={(value) => handleInputChange("teamId", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams && teams?.map((team) => (
                            <SelectItem key={team.teamId} value={team.teamId.toString()}>
                              {team.teamName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.teamId && (
                        <p className="text-sm text-red-500">{errors.teamId}</p>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" /> Start Date
                        </Label>
                        <Input
                          type="date"
                          value={sprintFormData.startDate}
                          onChange={(e) =>
                            handleInputChange("startDate", e.target.value)
                          }
                          min={today}
                          className={errors.startDate ? "border-red-500" : ""}
                        />
                        {errors.startDate && (
                          <p className="text-sm text-red-500">{errors.startDate}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" /> End Date
                        </Label>
                        <Input
                          type="date"
                          value={sprintFormData.endDate}
                          onChange={(e) => handleInputChange("endDate", e.target.value)}
                          min={sprintFormData.startDate || today}
                          className={errors.endDate ? "border-red-500" : ""}
                        />
                        {errors.endDate && (
                          <p className="text-sm text-red-500">{errors.endDate}</p>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Sprint Tags *
                      </Label>
                      <Input
                        value={sprintFormData.tags}
                        onChange={(e) => handleInputChange("tags", e.target.value)}
                        placeholder="Enter tags separated by commas"
                        className={errors.tags ? "border-red-500" : ""}
                      />
                      {errors.tags && (
                        <p className="text-sm text-red-500">{errors.tags}</p>
                      )}
                    </div>
                  </div>
                </ScrollArea>

                <DialogFooter className="px-6 py-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setSprintOpen(false)}
                    disabled={sprintLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="text-white"
                    onClick={createSprint}
                    disabled={sprintLoading}
                  >
                    {sprintLoading ? "Saving..." : "Save Sprint"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Right: Search & Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search sprints..."
                  value={(e)=>setSprintSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-2 border rounded-md text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
              </div>
              <Select value={sprintStatusFilter}
                        onValueChange={(value) => setSprintStatusFilter(value)}>
                <SelectTrigger className="w-32 border rou nded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="2">Completed</SelectItem>
                  <SelectItem value="3">Paused</SelectItem>
                  <SelectItem value="4">Upcoming</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sprintProjectFilter}
                        onValueChange={(value) => setProjectStatusFilter(value)}>
                <SelectTrigger className="w-32 border rou nded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Project Filter" />
                </SelectTrigger>
                <SelectContent>
                  {project && project?.map((project) => (
                    <SelectItem
                      key={project.projectId}
                      value={project.projectId.toString()}
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
            </div>
          </div>

          {/* Sprint Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 p-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 border rounded-lg shadow-sm bg-card flex flex-col gap-3"
                >
                  <Skeleton className="h-5 w-3/4" /> {/* title */}
                  <Skeleton className="h-4 w-1/2" /> {/* subtitle */}
                  <Skeleton className="h-3 w-full" /> {/* description line */}
                  <Skeleton className="h-3 w-5/6" /> {/* description line */}
                  <Skeleton className="h-8 w-full rounded-md" /> {/* button / footer */}
                </div>
              ))
            ) : sprints.length > 0 ? (
              sprints?.map((sprint) => (
                <SprintCard key={sprint.sprintId} sprint={sprint} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-center py-10">
                <p className="text-lg font-medium text-muted-foreground">
                  No sprints found
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try creating a new sprint or adjusting your filters.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="user-story" className='mt-6'>
          {/* Toolbar Row */}
          <div className="flex items-center justify-between pb-2">
            {/* Left: Add Button */}
            <Button className={'text-white'} onClick={()=>setStoriesOpen(true)}>
              <PlusIcon className="w-3 h-3" />
              Add New Story
            </Button>
            <TicketDialog
              open={storyOpen}
              setOpen={setStoriesOpen}
              loading={storyLoading}
              setLoading={setStoryLoading}
              projects={projectWithName}
              formData={story}
              setFormData={setUserStories}
              errors={errors}
              onSubmit={createTicket}   // your bugService call
              type="User Story"
            />

            
            {/* Right: Search & Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search story..."
                  className="pl-8 pr-3 py-2 border rounded-md text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
              </div>
              <Select>
                <SelectTrigger className="w-30 border rou nded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="close">Close</SelectItem>
                  <SelectItem value="progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6'>
            {userStories.map((story, index) => (
              <UserStoryCard key={index} story={story} onViewDetails={(story) => {
                // Open dialog to view details  
                console.log("View details for story:", story);
              }} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="bugs" className='mt-6'>
           {/* Toolbar Row */}
          <div className="flex items-center justify-between pb-2">
            {/* Left: Add Button */}
            <Button
              className="text-white"
              onClick={() => setBugOpen(true)}
            >
              <PlusIcon className="w-3 h-3" />
              Add New Bug
            </Button>

            <TicketDialog
              open={bugOpen}
              setOpen={setBugOpen}
              loading={bugLoading}
              setLoading={setBugLoading}
              projects={projectWithName}
              formData={bugFormData}
              setFormData={setBugFormData}
              errors={errors}
              onSubmit={createTicket}   // your bugService call
              type="Bug"
            />


            {/* Right: Search & Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search bugs..."
                  className="pl-8 pr-3 py-2 border rounded-md text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
              </div>
              <Select>
                <SelectTrigger className="w-30 border rou nded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className='grid md:grid-cols-2 lg:grid-cols-2 gap-6 p-6'>
            {bugs.map((bug, index) => (
              <BugCard key={index} bug={bug} onViewClick={(bug) => {
                // Open dialog to view / generate steps
                console.log("View / Generate Steps for bug:", bug);
              }} />
            ))}
          </div>
        </TabsContent>


      </Tabs>
      <div>

      </div>
    </div>
  )
}

export default Sprints