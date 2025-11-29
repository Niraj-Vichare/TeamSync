import { default as axiosInstance } from "./axiosInstance";

class TaskService {
 
  async getTasksAssignedToUser(workspaceGuid, projectId, sprintId, ticketId, status, priority) {
    try {
      const response = await axiosInstance.get(`/tasks/assigned?workspaceGuid=${workspaceGuid}`, {
        params: { workspaceGuid, projectId, sprintId, ticketId,priority,status }
      });
      return response.data;
    } catch (error) {
      console.error("Error while getting tasks assigned to user", error);
      throw error;
    }
  }


  async createTask(workspaceGuid,taskDto) {
    try {
      const response = await axiosInstance.post(`/tasks?workspaceGuid=${workspaceGuid}`, taskDto);
      console.log(response);  
      return response.data;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  async updateTask(workspaceGuid,taskGuid, taskModel) {
    try {
      const response = await axiosInstance.patch(`/tasks/${workspaceGuid}/${taskGuid}`, taskModel);
      return response.data;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  async deleteTask(taskId) {
    try {
      const response = await axiosInstance.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  async updateTaskStatus(workspaceGuid,taskId, status) {
    try {
      const response = await axiosInstance.patch(`/tasks/${taskId}/status?status=${status}`,{});
      return response.data;
    } catch (error) {
      console.error("Error updating task status:", error);
      throw error;
    
    }
  }
}

const taskService = new TaskService();
export default taskService;
