
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BugIcon, CalendarIcon, CheckCircle, CircuitBoardIcon, Clock, Clock3, Clock3Icon, DatabaseIcon, File, FileText, GiftIcon, ListIcon, Pause, PauseIcon, Pencil, PencilIcon, PenIcon, Plus, PlusIcon, Search, SquareKanbanIcon, Tag, Target, Trash, Trash2Icon } from 'lucide-react'
import React, { act, useEffect, useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, set } from 'date-fns';
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
import { useRole } from '@/services/useRole';
import { Skeleton } from '@/components/ui/skeleton';
import ticketService from '@/services/ticket';
import { AnimatePresence,motion } from 'framer-motion';
import workspaceService from '@/services/workspace';
import { useNavigate } from 'react-router-dom';



function Sprints() {


  const [loading,setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [teams, setTeams] = useState([]);
  const [project,setProjects] = useState([]);
  const [users,setUsers] = useState([]);
    
  // Get today's date for date inputs
  const today = new Date().toISOString().split('T')[0];

  const [tabs, setTabs] = useState("sprints");
  const { getCurrentWorkspaceId } = useAuth();
  const { canManageSprints, canManageTasks,roleId,canManageTickets,isAdmin,isManager } = useRole();
  {console.log("User Role ID in Sprints Page:", roleId, "Can Manage Sprints:", canManageSprints, "Can Manage Tasks:", canManageTasks)}
  const navigate = useNavigate();

  // Generic States
  const [tickets,setTickets]  = useState([]);
  const [ticketOpen,setTicketOpen] = useState(false);
  const [ticketLoading,setTicketLoading] = useState(false);
  const [ticketPage,setTicketPage] = useState(1);
  const [ticketPageSize,setTicketPageSize] = useState(9);
  const [ticketTotalCount,setTicketTotalCount] = useState(0);
  const [ticketTotalPages,setTicketTotalPages]= useState(0);
  const [ticketSearchTerm,setTicketSearchTerm] = useState('');
  const [ticketStatusFilter,setTicketStatusFilter] = useState('');
  const [ticketPriority,setTicketPriority] = useState('');
  const [ticketsFormData,setTicketsFormData] = useState({
    "title":'',
    "description":'',
    "tags":'',
    "priority":'',
    "status":'',
    "projectId":'',
    "sprintId":'',
    "reportedBy":'',
    "steps":''.split(","),
    "points":'',
    "ticketType":'',
    "startDate":'',
    "endDate":'',
    "assignedTo":'',
  });
  const [updateTicketGuid,setSelectedTicketGuid] = useState(null);

  // User Story & Bug States
  const [displaySteps,setDisplaySteps] = useState(false);
  const [stepLoading,setStepLoading] = useState(false);
  const [ticketStepId,setTicketStepId] = useState(null);
  const [stepSaving,setStepSaving] = useState(false);
  const [stepData,setStepData] = useState([]);
  const [actionType,setActionType] = useState("create"); // create or update

  const [sprintDialogOpen,setSprintDialogOpen] = useState(false); 
  const [sprintDialogLoading,setSprintDialogLoading] = useState(false);
  const [selectedSprintId,setSelectedSprintId] = useState(null);
  const [includeTicketGuid,setIncludeTicketGuid] = useState(null);
  const [includeProjectId,setIncludeProjectId] = useState(null);

  const [sprintMembers,setSprintMembers] = useState([]);
  const [sprintSelectedMember,setSprintSelectedMember] = useState(null);


  // Sprint's States
  const [sprints, setSprints] = useState([]);
  const [sprintOpen, setSprintOpen] = useState(false);
  const [sprintLoading, setSprintLoading] = useState(false);
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
  const workspaceGuid = getCurrentWorkspaceId();

  const handleInputChange = (key, value) => {
    setSprintFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" })); // clear error on change
  };

  // 🔹 Validation
   // ✅ Client-side validation
  const validateSprintForm = () => {
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


  const validateTicketForm = () => {
    let newErrors = {};
    if (!ticketsFormData.title.trim())
      newErrors.title = "Ticket title is required";
    if(!ticketsFormData.description.trim()){
      newErrors.description = "Description is required";
    }
    if(!ticketsFormData.projectId){
      newErrors.projectId = "Project needed to be selected";
    }
    if(!ticketsFormData.priority){
      newErrors.priority = "Priority is required";
    }
    if(!ticketsFormData.points){
      newErrors.points = "Point is required";
    }
    if(!ticketsFormData.status){
      newErrors.points = "Status is required";
    }
    // if(!ticketsFormData.reportedBy){
    //   newErrors.reportedBy = "Who reported is required";
    // }
    if(ticketsFormData.endDate<ticketsFormData.startDate){
      newErrors.endDate = "End date should be greater than start date";
      newErrors.startDate = "End date should be greater than start date";
    }
    console.log("Ticket Form Errors",newErrors);
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
  const resetIncludeSprintDialog = () => {
    setSelectedSprintId(null);
    setSprintSelectedMember(null);
    setSprintMembers([]);
    setIncludeTicketGuid(null);
    setIncludeProjectId(null);
    setErrors({});
  };


  
  // ✅ Create Sprint
  const createSprint = async () => {
    if (!validateSprintForm()) return;
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
      resetSprintForm();
      
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

      // Handle ASP.NET validation (400)
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

  const handleCreateUpdate = async (actionType, type) => {
    console.log("Handle Create Update", actionType, type);

    if (!validateTicketForm()) return;

    if (actionType === "create") {
      await createTicket(type);
    } else {
      await updateTicket(type);
    }
  };

  const updateTicket = async (type) => {
    setTicketLoading(true);
    try {
      const ticketData = {
        title: ticketsFormData.title,
        description: ticketsFormData.description,
        tags: ticketsFormData.tags,
        priority: parseInt(ticketsFormData.priority),
        status: parseInt(ticketsFormData.status),
        projectId: ticketsFormData.projectId,
        reportedBy: parseInt(ticketsFormData.reportedBy),
        steps: ticketsFormData.steps.join(","),
        points: parseInt(ticketsFormData.points),
        typeId: type === "bug" ? 1 : 2,
        startDate:ticketsFormData.startDate,
        endDate: ticketsFormData.endDate,
        assignedTo:ticketsFormData.assignedTo
      };

      await ticketService.updateTicket(workspaceGuid, updateTicketGuid, ticketData);

      toast("Ticket Updated ✅", {
        description: `${ticketsFormData.title} has been updated successfully.`,
      });
      if(type === "bug")
        fetchTickets("1")
      else{
        fetchTickets("2");
      }
      setTicketOpen(false);
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("Something went wrong while updating the ticket.");
    } finally {
      setTicketLoading(false);
    }
  };

  const onViewDetail = (ticketGuid) => {
    handleViewDetail(ticketGuid);
  };

  const handleViewDetail = (ticketGuid) => {
    navigate(`/tickets/${ticketGuid}`);
  };

 
  // Create Ticket
  const createTicket = async(type)=>{
    if(!validateTicketForm()) return;
      setTicketLoading(true);
      try{
        const ticketData = {
          "title": ticketsFormData.title,
          "description": ticketsFormData.description,
          "tags": ticketsFormData.tags,
          "priority": parseInt(ticketsFormData.priority),
          "status": parseInt(ticketsFormData.status),
          "projectId": ticketsFormData.projectId,
          "sprintId": null,
          "reportedBy": parseInt(ticketsFormData.reportedBy),
          "steps": ticketsFormData.steps,
          "points": parseInt(ticketsFormData.points),
          "typeId": type === "bug" ? 1 : 2, // small fix here
        }
        console.log("Ticket Data to be created",ticketData);
        const response = await ticketService.createTickets(workspaceGuid,ticketData);
        setTicketOpen(false);
        resetTicketForm();
        toast("Ticket Created 🎉",{description: `${ticketsFormData.title} has been added successfully.`});
        if(type === "bug"){
          fetchTickets("1");
        }else{
          fetchTickets("2");
        }

      }catch(error){
        console.error("Something went wrong while creating the ticket",error);
        setErrors({});
        toast.error("Something went wrong while creating sprint.");
      }finally{
        setTicketLoading(false);
      }
  }

  const fetchTickets = async (type)=>{
    if (!workspaceGuid) return;

    try {
      setTicketLoading(true);
      const response = await ticketService.getTickets(
        workspaceGuid,
        ticketSearchTerm,
        type,
        ticketStatusFilter,
        ticketPriority,
        ticketPage,
        ticketPageSize
      );

      if (response.success && response.data) {
        const { data, totalCount, pageSize } = response.data;
        console.log(data);
        setTickets(data);
        setTicketTotalCount(totalCount);
        setTicketTotalPages(Math.ceil(totalCount / pageSize));
      } else {
        console.warn("Failed to fetch ticket:", response.message);
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
    } finally {
      setTicketLoading(false);
    }

  }

  const handleDisplayDialogChange = (display) => {
    setDisplaySteps(display);
  }

  const handleTicketDialogChange = (action, type) => {
    console.log(action, type);
    setActionType(action); // "create" or "edit"
    resetTicketForm();     // clear form when creating
    setTicketOpen(true);
  };


  const handleSprintDialogChange = (isOpen) => {
    setSprintOpen(isOpen);
    if (!isOpen) {
      resetSprintForm();
    }
  };
  // 🧠 Helper: Reset all form fields and errors
  const resetSprintForm = () => {
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

  const resetTicketForm=()=>{
    setTicketsFormData({
      "title": '',
      "description": '',
      "tags": '',
      "priority": '',
      "status": '',
      "projectId": '',
      "sprintId": '',
      "reportedBy": '',
      "steps": '',
      "points": '',
      "ticketType": ''
    });
    setErrors({});
    setSelectedTicketGuid(null);
  }

    
  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      if (tabs === "sprints") {
        await fetchSprints();
      } else if (tabs === "bugs" || tabs == "user-story") {
        tabs == "bugs" ? await fetchTickets("1"): await fetchTickets("2");
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

  const fetchTeamMembers=async(sprintGuid)=>{
    try{
      const response = await sprintService.getSprintMembers(sprintGuid);
      setSprintMembers(response.data);
      console.log("Sprint Members",response);
    }catch(error){
      console.error("Error fetching sprint members",error);
    } 
  }

  const handleIncludeInSprint =async () => {
    try{
      setSprintDialogLoading(true);
      console.log("Include in Sprint",includeTicketGuid,selectedSprintId,sprintSelectedMember);
      var response = await sprintService.AddTicketToSprint(workspaceGuid,selectedSprintId,includeTicketGuid,sprintSelectedMember);
      if(response.success){
        toast.success("Ticket added to sprint successfully");
        setSprintDialogOpen(false);
        resetIncludeSprintDialog();
      }
    }catch(error){
      console.error("Error including ticket in sprint",error);
      toast.error("Something went wrong while adding the ticket to the sprint");
      setSprintDialogOpen(false);
    }finally{
      setSprintDialogLoading(false);
    }
  }

  const handleSprintView=(sprintGuid)=>{
    navigate(`/sprints/${sprintGuid}`);

  }
  const handleEditClick = (type,ticket) => {
    console.log("Edit Clicked", type, ticket);
    if (!ticket) return;
    setSelectedTicketGuid(ticket.ticketGuid);
    setActionType("update");
    console.log("Edit Ticket:", type, ticket);
    // Pre-fill form
    setTicketsFormData({
      title: ticket.title || "",
      description: ticket.description || "",
      tags: ticket.tags || "",
      priority: ticket.priority?.toString() || "",
      status: ticket.status?.toString() || "",
      projectId: ticket.projectId?.toString() || "",
      steps: ticket.steps?.split(",") || [],
      points: ticket.points?.toString() || "",
    });

    setTicketOpen(true);
  };


  // Step Functions
  const handleStepViewClick=async(story)=>{
    setStepLoading(true);
    setStepData([]);
    console.log("View / Generate Steps for bug:", story)
    try{
      setTicketStepId(story.ticketGuid);
      //const response = await ticketService.ViewTicketSteps(workspaceGuid,ticketGuid);
      if(story.steps && story.steps.split(",").length > 0)
      {
        var steps = story.steps.split(",");
        console.log("Ticket Steps Data",steps);
        setStepData(steps);
      }
      setDisplaySteps(true);
    }catch(error){
      console.error("Something went wrong while fetching the ticket steps",error);
      toast.error("Something went wrong while fetching the ticket steps");
    }
    finally{
      setStepLoading(false);
    }
  }

  const handleStepChange = (index, value) => {
    const updatedSteps = [...stepData];
    updatedSteps[index] = value;
    setStepData(updatedSteps);
  };

  const handleAddStep = () => setStepData([...stepData, ""]);
  const handleRemoveStep = (index) => setStepData(stepData.filter((_, i) => i !== index));

  const handleSaveSteps = async () => {
    setStepSaving(true);
    try {
      //const updatedSteps = stepData.join(", ");
      const response = await ticketService.UpdateTicketSteps(workspaceGuid, ticketStepId, stepData);

      if (response.success) {
        toast.success("Steps updated successfully!");
        setDisplaySteps(false);
      } else {
        toast.error("Failed to update steps. Please try again.");
      }
    } catch (error) {
      console.error("Error saving steps:", error);
      toast.error("An unexpected error occurred while saving steps.");
    } finally {
      setStepSaving(false);
    }
  };

  const handleOnIncludeSprint=async(ticketGuid,projectId)=>{
    console.log("Include in Sprint Clicked",ticketGuid,projectId);
    setSprintDialogOpen(true);
    setIncludeProjectId(projectId);
    setIncludeTicketGuid(ticketGuid);
  }

  const fetchWorkspaceUsers=async()=>{
    const response = await workspaceService.getWorkspaceProfiles(workspaceGuid);
    setUsers(response.data);
  }

  useEffect(()=>{
    fetchProjects();
    fetchTeams();
    fetchWorkspaceUsers();
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
            {/* Left: Add Button — only Owner/Admin/Manager can create sprints */}
            {canManageSprints ? (
            <Dialog open={sprintOpen} onOpenChange={handleSprintDialogChange}>
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
            ) : <div />}

            {/* Right: Search & Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search sprints..."
                  value={sprintSearchTerm}
                  onChange={(e)=>setSprintSearchTerm(e.target.value)}
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
                <SprintCard key={sprint.sprintId} sprint={sprint} onView={handleSprintView}/>
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
            {canManageTickets && (
            <Button className={'text-white'} onClick={() => handleTicketDialogChange("create", "user story")}>
              <PlusIcon className="w-3 h-3" />
              Add New Story
            </Button>
            )}
            <TicketDialog
              open={ticketOpen}
              roleId={roleId}
              canManageTickets = {canManageTickets}
              setOpen={setTicketOpen}
              loading={ticketLoading}
              setLoading={setTicketLoading}
              projects={project}
              formData={ticketsFormData}
              workspaceUsers={users}
              setFormData={setTicketsFormData}
              errors={errors}
              onClose={()=>setTicketOpen(false)}
              onSubmit={()=>handleCreateUpdate(actionType,"user story")}   // your userStoryService call
              type="User Story"
              actionType={actionType}
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
          <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-4 p-6 auto-rows-fr">
            <AnimatePresence mode="wait">
              {ticketLoading ? (
                // 🟡 Animated Skeleton Loader
                Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="border border-gray-800 rounded-xl bg-background/50 p-4 space-y-4"
                  >
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2 mt-3">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                  </motion.div>
                ))
              ) : tickets?.length > 0 ? (
                tickets.map((story, index) => (
                  <motion.div
                    key={story.id || index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                  >
                    <UserStoryCard
                      story={story}
                      canManageSprints={canManageSprints}
                      onViewDetail = {(ticketGuid)=>onViewDetail(ticketGuid)}
                      onEditClick={(ticket) =>
                        handleEditClick("user story",ticket)
                      }
                      onIncludeInSprint={(ticketGuid,projectId) => {
                        handleOnIncludeSprint(ticketGuid,projectId);
                      }}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="col-span-full flex flex-col items-center justify-center py-16 text-center text-muted-foreground"
                >
                      <File className='w-10 h-10' />
                      <p className="text-lg font-medium">No user stories found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Start by creating a new story to plan your project’s next features.
                      </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
        <TabsContent value="bugs" className='mt-6'>
           {/* Toolbar Row */}
          <div className="flex items-center justify-between pb-2">
            {/* Left: Add Button */}
            {canManageTickets && (
            <Button
              className="text-white"
              onClick={() => handleTicketDialogChange("create","bug")}
            >
              <PlusIcon className="w-3 h-3" />
              Add New Bug
            </Button>
            )}

            <TicketDialog
              open={ticketOpen}
              roleId={roleId}
              canManageTickets = {canManageTickets}
              setOpen={setTicketOpen}
              loading={ticketLoading}
              setLoading={setTicketLoading}
              projects={project}
              formData={ticketsFormData}
              workspaceUsers={users}
              setFormData={setTicketsFormData}
              errors={errors}
              onClose={()=>setTicketOpen(false)}
              onSubmit={()=>handleCreateUpdate(actionType,"bug")}   // your bugService call
              actionType={actionType}
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


          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 p-6">
            <AnimatePresence mode="wait">
              {ticketLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="border border-gray-800 rounded-xl bg-background/50 p-4 space-y-4"
                  >
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2 mt-3">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                  </motion.div>
                ))
              ) : tickets?.length > 0 ? (
                tickets.map((bug, index) => (
                  <motion.div
                    key={bug.id || index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                  >
                    <BugCard
                      bug={bug}
                      onViewDetail = {(ticketGuid)=>onViewDetail(ticketGuid)}
                      canManageSprints ={canManageSprints}
                      
                      onStepViewClick={(ticketGuid) =>
                        handleStepViewClick(ticketGuid)
                      }
                      onEditClick={(ticket) =>
                        handleEditClick("bug",ticket)
                      }
                      onIncludeInSprint={(ticketGuid,projectId) => handleOnIncludeSprint(ticketGuid,projectId)}
                      
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="col-span-full flex flex-col items-center justify-center py-16 text-center text-muted-foreground"
                >
                  <File className='w-10 h-10'/>
                  <p className="text-lg font-medium">No bugs found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Great job! No active bugs in this project.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>


      </Tabs>

      <Dialog open={displaySteps} onOpenChange={handleDisplayDialogChange}>
        <DialogContent className="sm:max-w-[600px] p-6">
          <DialogHeader className="px-2 border-b-2 py-2">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              Ticket Steps
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-5 p-4">
              {stepLoading ? (
                <p className="text-sm text-muted-foreground">Loading steps...</p>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Steps</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddStep}
                      className="h-8"
                      disabled={stepLoading}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Step
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {stepData.map((step, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={step}
                          onChange={(e) => handleStepChange(index, e.target.value)}
                          placeholder={`Step ${index + 1}`}
                          className="flex-1"
                          disabled={stepLoading}
                        />
                        {stepData.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveStep(index)}
                            className="h-10 w-10 text-red-500 hover:text-red-700"
                            disabled={stepLoading}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t">
            <Button
              variant="outline"
              onClick={() => setDisplaySteps(false)}
              disabled={stepLoading}
            >
              Close
            </Button>
            <Button
              className="text-white"
              onClick={handleSaveSteps}
              disabled={stepLoading}
            >
              {stepSaving ? "Saving..." : "Edit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={sprintDialogOpen} onOpenChange={(open) => {
        setSprintDialogOpen(open);
        if (!open) {
          resetIncludeSprintDialog(); // ✅ clear everything on close
        }
      }}
      >
        <DialogContent className="sm:max-w-[600px] p-6">
          <DialogHeader className="px-2 border-b-2 py-2">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              Add Ticket to Sprint
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-5 p-4">
              {sprintDialogLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Select Sprint</Label>
                    <Select
                      value={selectedSprintId?.toString()}
                      onValueChange={(value) => fetchTeamMembers(value) & setSelectedSprintId(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Sprint" />
                      </SelectTrigger>
                      <SelectContent>
                        {sprints?.filter(sprint => sprint.projectId === includeProjectId).map((sprint) => (
                          <SelectItem
                            key={sprint.sprintId}
                            value={sprint.sprintGuid.toString()}
                          >
                            {sprint.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.selectedSprint && (
                      <p className="text-sm text-red-500">{errors.selectedSprint}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Select Team Member</Label>
                      <Select
                        value={sprintSelectedMember?.toString()}
                        onValueChange={(value) => {
                          console.log(value);
                          setSprintSelectedMember(parseInt(value, 10));
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Team Member" />
                        </SelectTrigger>

                        <SelectContent>
                          {sprintMembers?.map((member) => (
                            <SelectItem
                              key={member.memberId}
                              value={member.memberId.toString()} // important
                            >
                              {member.memberName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="px-6 py-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setSprintDialogOpen(false);
                resetIncludeSprintDialog();
              }}
              disabled={sprintDialogLoading}
            >
              Cancel
            </Button>
            <Button
              className="text-white"
              onClick={handleIncludeInSprint}
              disabled={sprintDialogLoading}
            >
              {sprintDialogLoading ? "Adding..." : "Add to Sprint"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Sprints