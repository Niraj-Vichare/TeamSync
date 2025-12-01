import axiosInstance from "./axiosInstance";


class DashboardService {
  async getDashboardCard(workspaceGuid) {
    if (!workspaceGuid) throw new Error("Workspace GUID is required");
    try {
      const response = await axiosInstance.get(`/dashboard/metrics?workspaceGuid=${workspaceGuid}`);
      return response.data;
    } catch (error) {
      console.error("Error while getting the dashboard cards", error);
      throw error;
    }
  }

  async getWeeklyLogging(workspaceGuid) {
    if (!workspaceGuid) throw new Error("Workspace GUID is required");
    try {
      const response = await axiosInstance.get(`/dashboard/weekly-logs?workspaceGuid=${workspaceGuid}`);
      return response.data;
    } catch (error) {
      console.error("Error while getting weekly logging", error);
      throw error;  
    }
  }

  async isUserClockIn(workspaceGuid) {
    if (!workspaceGuid) throw new Error("Workspace GUID is required");
    try {
      const response = await axiosInstance.get(`/dashboard/timer/status?workspaceGuid=${workspaceGuid}`);
      return response.data;
    } catch (error) {
      console.error("Error while getting the user clock-in status", error);
      return { IsRunning: false }; // fallback
    }
  }

  async clockIn(workspaceGuid) {
    if (!workspaceGuid) throw new Error("Workspace GUID is required");
    try {
      const res = await axiosInstance.post(`/dashboard/timer/clockin`, { workspaceGuid });
      return res.data;
    } catch (error) {
      console.error("Error while clocking in", error);
      throw error;
    }
  }

  async getUserWork(workspaceGuid){
    try{
      const res = await axiosInstance.get(`/user/work?workspaceGuid=${workspaceGuid}`);
      return res.data;

    }catch(error){
      console.error("Error while getting user work", error);
      throw error;
    }
  }

  async clockOut(workspaceGuid) {
    if (!workspaceGuid) throw new Error("Workspace GUID is required");
    try {
      const res = await axiosInstance.post(`/dashboard/timer/clockout`, { workspaceGuid });
      return res.data;
    } catch (error) {
      console.error("Error while clocking out", error);
      throw error;
    }
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
