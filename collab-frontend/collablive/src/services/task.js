import axiosInstance from "./axiosInstance";

class TaskService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async getTasks() {
    try {
      const response = await this.apiClient.get("/tasks");
      return response.data;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  async createTask(taskData) {
    try {
      const response = await this.apiClient.post("/tasks", taskData);
      return response.data;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  async updateTask(taskId, taskData) {
    try {
      const response = await this.apiClient.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  async deleteTask(taskId) {
    try {
      const response = await this.apiClient.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }
}

export default new TaskService(axiosInstance);
