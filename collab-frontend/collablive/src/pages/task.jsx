import React, { useEffect, useRef, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FilterIcon,
  ListIcon,
  PlusIcon,
  SquareKanbanIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import { useAuth } from "@/context/AuthContext";
import workspaceService from "@/services/workspace";
import projectService from "@/services/project";
import sprintService from "@/services/sprint";
import ticketService from "@/services/ticket";
import taskService from "@/services/task";

import ListView from "@/components/taskComponents/ListView";
import KanbanView from "@/components/taskComponents/KanbanView";
import TaskDialog from "@/components/taskComponents/TaskDialog";

function Task() {
  const { getCurrentWorkspaceId } = useAuth();
  const workspaceGuid = getCurrentWorkspaceId();

  // === STATE ===
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [taskOpen, setTaskOpen] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [actionType, setActionType] = useState("create");
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("list");

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // === FORM DATA ===
  const [taskFormData, setTaskFormData] = useState({
    name: "",
    description: "",
    assignedTo: "",
    priority: "",
    projectId: "",
    sprintId: "",
    ticketId: "",
    startDate: null,
    endDate: null,
    status: "",
  });

  // === FETCH GUARDS ===
  const hasFetchedTasks = useRef(false);
  const hasFetchedProjects = useRef(false);
  const hasFetchedUsers = useRef(false);

  // === VALIDATION ===
  const validateTaskForm = () => {
    const newErrors = {};

    if (!taskFormData.name?.trim()) newErrors.name = "Task name is required.";
    if (!taskFormData.description?.trim())
      newErrors.description = "Description is required.";
    if (!taskFormData.projectId) newErrors.projectId = "Project is required.";
    if (!taskFormData.sprintId) newErrors.sprintId = "Sprint is required.";
    if (!taskFormData.ticketId) newErrors.ticketId = "Ticket is required.";
    if (!taskFormData.priority) newErrors.priority = "Priority is required.";
    if (!taskFormData.status) newErrors.status = "Status is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // === RESET FORM ===
  const resetTaskForm = () => {
    setTaskFormData({
      name: "",
      description: "",
      assignedTo: "",
      priority: "",
      projectId: "",
      sprintId: "",
      ticketId: "",
      startDate: null,
      endDate: null,
      status: "",
    });
    setErrors({});
  };

  // === CRUD ===
  const createTask = async () => {
    try {
      setTaskLoading(true);
      const payload = {
        title: taskFormData.name,
        description: taskFormData.description,
        assignedTo: 0,
        assignedBy: 0,
        priority: parseInt(taskFormData.priority),
        projectId: taskFormData.projectId,
        sprintId: taskFormData.sprintId,
        ticketId: taskFormData.ticketId,
        startDate: taskFormData.startDate,
        endDate: taskFormData.endDate,
        status: parseInt(taskFormData.status),
      };

      const response = await taskService.createTask(workspaceGuid, payload);
      if (response?.success) {
        toast.success("Task Created 🎉", {
          description: `${taskFormData.name} added successfully.`,
        });
        resetTaskForm();
        fetchTasks();
      } else {
        toast.error("Failed to create task.", {
          description: response?.message || "Something went wrong.",
        });
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Error creating task.", { description: error.message });
    } finally {
      setTaskLoading(false);
    }
  };

  const updateTask = async () => {
    try {
      setTaskLoading(true);

      // build payload
      const payload = {
        id: taskFormData.id || 0,
        title: taskFormData.name || taskFormData.title || "",
        description: taskFormData.description || "",
        taskGuid: taskFormData.taskGuid || null,
        projectId: Number(taskFormData.projectId) || 0,
        assignedBy: taskFormData.assignedBy || 0,
        assignedTo: Number(taskFormData.assignedTo) || 0,
        startDate: taskFormData.startDate
          ? new Date(taskFormData.startDate).toISOString()
          : null,
        endDate: taskFormData.endDate
          ? new Date(taskFormData.endDate).toISOString()
          : null,
        status: Number(taskFormData.status) || 0,
        priority: Number(taskFormData.priority) || 0,
        ticketId: Number(taskFormData.ticketId) || 0,
        sprintId: Number(taskFormData.sprintId) || 0,
      };

      // call API
      const response = await taskService.updateTask(
        workspaceGuid,
        taskFormData.taskGuid, // must be the actual GUID of the task
        payload
      );

      if (response?.success) {
        toast.success("Task Updated ✅", {
          description: `${taskFormData.title || taskFormData.name} updated successfully.`,
        });
        resetTaskForm();
        fetchTasks();
        setTaskOpen(false);
      } else {
        toast.error("Failed to update task.", {
          description: response?.message || "Something went wrong.",
        });
      }
    } catch (error) {
      console.error("Error updating task:", error.response?.data || error.message);
      toast.error("Error updating task.", {
        description: error.message,
      });
    } finally {
      setTaskLoading(false);
    }
  };


  const handleCreateOrUpdate = async () => {
    if (!validateTaskForm()) return;
    if (actionType === "create") await createTask();
    else await updateTask();
    setTaskOpen(false);
  };

  const handleTaskStatusUpdate = async (taskId, updatedFields) => {
    try {
      const response = await taskService.updateTaskStatus(
        workspaceGuid,
        taskId,
        updatedFields
      );
      if (response?.success) {
        toast.success("Status Updated ✅");
        fetchTasks();
      } else {
        toast.error("Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Something went wrong while updating status.");
    }
  };

  // === EDIT / DELETE ===
  const handleEditTask = (task) => {
    if (!task) return;
    setActionType("edit");
    setTaskFormData({
      taskId: task.id,
      name: task.title || "",
      description: task.description || "",
      assignedTo: task.assignedTo || "",
      priority: task.priority?.toString() || "",
      projectId: task.projectId || "",
      sprintId: task.sprintId || "",
      ticketId: task.ticketId || "",
      startDate: task.startDate || null,
      endDate: task.endDate || null,
      taskGuid:task.taskGuid,
      status: task.status?.toString() || "",
    });
    setTaskOpen(true);
  };

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      console.log(taskToDelete);
      const response = await taskService.deleteTask(taskToDelete.taskGuid);
      if (response?.success) {
        toast.success("Task deleted successfully!");
        fetchTasks();
      } else {
        toast.error("Failed to delete task.");
      }
    } catch (error) {
      toast.error("Something went wrong deleting the task.");
    } finally {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  // === FETCH ===
  const fetchTasks = async () => {
    if (!workspaceGuid) return;
    try {
      setTaskLoading(true);
      const response = await taskService.getTasksAssignedToUser(workspaceGuid);
      console.log(response);
      if (response.success && response.data) {
        setTasks(response.data);
      } else {
        console.warn("Failed to fetch tasks:", response.message);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setTaskLoading(false);
    }
  };

  const fetchProjects = async () => {
    const response = await projectService.getProjectDropdown(workspaceGuid);
    if (response) setProjects(response);
  };

  const fetchWorkspaceUsers = async () => {
    const response = await workspaceService.getWorkspaceProfiles(workspaceGuid);
    if (response?.data) setUsers(response.data);
  };

  const fetchSprintsByProject = async () => {
    if (!taskFormData.projectId) return setSprints([]);
    const response = await sprintService.getSprintsByProject(taskFormData.projectId);
    if (response) setSprints(response);
  };

  const fetchTicketsBySprintId = async () => {
    if (!taskFormData.sprintId) return setTickets([]);
    const response = await ticketService.fetchTicketBySprintId(taskFormData.sprintId);
    if (response) setTickets(response);
  };

  // === EFFECTS ===
  useEffect(() => {
    if (!hasFetchedTasks.current) {
      fetchTasks();
      hasFetchedTasks.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedProjects.current || !hasFetchedUsers.current) {
      hasFetchedProjects.current = true;
      hasFetchedUsers.current = true;
      fetchProjects();
      fetchWorkspaceUsers();
    }
  }, [workspaceGuid,activeTab]);

  useEffect(() => {
    fetchSprintsByProject();
  }, [taskFormData.projectId]);

  useEffect(() => {
    fetchTicketsBySprintId();
  }, [taskFormData.sprintId]);

  // === UI ===
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Break down work into manageable actions to stay productive and accountable.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            className="text-white"
            onClick={() => {
              setActionType("create");
              resetTaskForm();
              setTaskOpen(true);
            }}
          >
            <PlusIcon className="w-3 h-3 mr-2" /> Add Task
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex overflow-x-auto gap-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <ListIcon className="w-4 h-4" /> Task List
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <SquareKanbanIcon className="w-4 h-4" /> Kanban Board
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <ListView
            taskData={tasks}
            onTaskUpdate={handleTaskStatusUpdate}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        </TabsContent>

        <TabsContent value="kanban" className="mt-6">
          <KanbanView
            tasksData={tasks}
            onTaskUpdate={handleTaskStatusUpdate}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Task Dialog */}
      <TaskDialog
        open={taskOpen}
        setOpen={setTaskOpen}
        loading={taskLoading}
        setLoading={setTaskLoading}
        projects={projects}
        sprints={sprints}
        tickets={tickets}
        workspaceUsers={users}
        formData={taskFormData}
        setFormData={setTaskFormData}
        errors={errors}
        actionType={actionType}
        onClose={() => setTaskOpen(false)}
        onSubmit={handleCreateOrUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent aria-describedby="delete-dialog-description">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription id="delete-dialog-description">
              Are you sure you want to delete{" "}
              <span className="font-medium">{taskToDelete?.title}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Task;
