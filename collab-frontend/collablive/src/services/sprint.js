import { default as axiosInstance } from "./axiosInstance";

class SprintService {

    async createSprint(workspaceGuid,sprintData) {
        try {
            const response = await axiosInstance.post(`/sprints?workspaceGuid=${workspaceGuid}`,sprintData);
            return response.data;
        } catch (error) {
            console.error('Error while creating project:', error);
            throw error;
        }
    }

    async getAllSprints(workspaceGuid,searchTerm,status,projectId,pageNumber,pageSize) {
        try {
            console.log(workspaceGuid,searchTerm,status,projectId,pageNumber,pageSize);
            const response = await axiosInstance.get("/sprints",{
                params:{workspaceGuid,searchTerm,status,projectId,pageNumber,pageSize}
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching sprints:", error);
            throw error;
        }
    }

    async getAllTicket(ticketType,search,filter,pageNumber,pageSize)
    {
        try {
            const response = await axiosInstance.get("/tickets",{
            params: { ticketType, search, filter, pageNumber, pageSize }
        })
        return response.data;
        } catch (error) {
            console.error("Error fetching sprints:", error);
            throw error;
        }
    }

    async AddTicketToSprint(workspaceGuid,sprintId,ticketGuid){
        try {
            console.log("AddTicketToSprint",workspaceGuid,sprintId,ticketGuid);
            const response = await axiosInstance.post(`/sprints/${sprintId}/tickets/${ticketGuid}`);
            return response.data;
        } catch (error) {
            console.error("Error adding ticket to sprint:", error);
            throw error;
        }
    }

    async getSprintByProject(workspaceGuid,projectId){
        try {
            const response = await axiosInstance.get(`/sprints/project/${projectId}`,{
                params:{workspaceGuid}
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching sprints by project:", error);
            throw error;
        }   
    }

    async getSprintsByProject(projectId){
        try {
            const response = await axiosInstance.get(`/projects/${projectId}/sprints`);
            return response.data;
        } catch (error) {
            console.error("Error fetching sprints by project:", error);
            throw error;
        }
    }


}

const sprintService = new SprintService();
export default sprintService;