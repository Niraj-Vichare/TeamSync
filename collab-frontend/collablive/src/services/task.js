import { default as axiosInstance } from "./axiosInstance";

class TaskService {

  async getTasksAssignedToUser(workspaceGuid, projectId, sprintId, ticketId, status, priority) {
    try {
      const response = await axiosInstance.get("/tasks/assigned", {
        params: { workspaceGuid, projectId, sprintId, ticketId, priority, status },
      });
      return response.data;
    } catch (error) {
      console.error("Error while getting tasks assigned to user", error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE TASK
  // ─────────────────────────────────────────────────────────────
  async createTask(workspaceGuid, taskDto) {
    try {
      const response = await axiosInstance.post("/tasks", taskDto, {
        params: { workspaceGuid },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE TASK
  // ─────────────────────────────────────────────────────────────
  async updateTask(workspaceGuid, taskGuid, taskModel) {
    try {
      const response = await axiosInstance.patch(
        `/tasks/${workspaceGuid}/${taskGuid}`,
        taskModel
      );
      return response.data;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE TASK STATUS
  // FIX: workspaceGuid was not forwarded to the backend at all —
  // the controller now expects it as a query param so events can be
  // published with the correct workspace context.
  // ─────────────────────────────────────────────────────────────
  async updateTaskStatus(workspaceGuid, taskId, status) {
    try {
      const response = await axiosInstance.patch(
        `/tasks/${taskId}/status`,
        {},
        { params: { workspaceGuid, status } }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating task status:", error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE TASK
  // ─────────────────────────────────────────────────────────────
  async deleteTask(taskGuid) {
    try {
      const response = await axiosInstance.delete(`/tasks/${taskGuid}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // GET ONGOING TASKS
  // ─────────────────────────────────────────────────────────────
  async getOnGoingTasks(workspaceGuid) {
    try {
      const response = await axiosInstance.get("/tasks/ongoing", {
        params: { workspaceGuid },
      });
      return response.data;
    } catch (error) {
      console.error("Error while getting ongoing tasks", error);
      throw error;
    }
  }
}

const taskService = new TaskService();
export default taskService;