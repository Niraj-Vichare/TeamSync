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
            // BUG FIX: passing all params unconditionally sent the literal string "undefined"
            // to the backend when filters were empty, causing wrong DB matches.
            // Only include filter params when they actually have a value.
            const params = { workspaceGuid, pageNumber, pageSize };
            if (searchTerm) params.searchTerm = searchTerm;
            if (status)     params.status = status;
            if (projectId)  params.projectId = projectId;
            const response = await axiosInstance.get("/sprints", { params });
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

    async AddTicketToSprint(workspaceGuid, sprintId, ticketGuid, selectedMember) {
        try {
            const response = await axiosInstance.post(
                `/sprints/${sprintId}/tickets/${ticketGuid}`,
                // BUG FIX: Select value is always a string; backend [FromBody] int expects a number.
                // Parse here as a safety net (sprints.jsx also parses on store).
                parseInt(selectedMember, 10)
            );
            return response.data;
        } catch (error) {
            console.error("Error adding ticket to sprint:", error);
            throw error;
        }
    }

    // async getSprintByProject(workspaceGuid,projectId){
    //     try {
    //         const response = await axiosInstance.get(`/sprints/project/${projectId}`,{
    //             params:{workspaceGuid}
    //         });
    //         return response.data;
    //     } catch (error) {
    //         console.error("Error fetching sprints by project:", error);
    //         throw error;
    //     }   
    // }

    async getSprintByGuid(workspaceGuid,sprintGuid){
        try{
            const response = await axiosInstance.get(`/sprints/${sprintGuid}`,{
                params:{workspaceGuid}
            });
            return response.data;

        }catch(error){
            throw error;
        }
    }

    async getSprintTickets(sprintGuid){
        try{
            const response = await axiosInstance.get(`/sprints/${sprintGuid}/tickets`);
            return response.data;

        }catch(error){
            throw error;
        }
    }

    async getSprintBreakdown(sprintGuid){
        try{
            const response = await axiosInstance.get(`/sprints/${sprintGuid}/breakdown`);
            return response.data;
        }catch(error){
            throw error;
        }
    }

    async getSprintProgress(sprintGuid){
        try{
            const response = await axiosInstance.get(`/sprints/${sprintGuid}/progress`);
            return response.data;
        }catch(error){
            throw error;
        }
    }

    async getSprintActivities(sprintGuid,pageNumber,pageSize){
        try{
            const response = await axiosInstance.get(`/sprints/${sprintGuid}/activities`,{
                params:{pageNumber,pageSize}
            })
            return response.data;
        }catch(error){
            throw error;
        }
    }

    async getSprintTeam(sprintGuid){
        try{
            const response = await axiosInstance.get(`/sprints/${sprintGuid}/assignedTeam`);
            return response.data;

        }catch(err){
            throw err;
        }
    }

    async getSprintsByProject(projectId){
        try {
            const response = await axiosInstance.get(`/sprints/projects/${projectId}/sprints`);
            return response.data;
        } catch (error) {
            console.error("Error fetching sprints by project:", error);
            throw error;
        }
    }

    async getSprintMembers(sprintGuid){
        try{
            const response = await axiosInstance.get(`/sprints/${sprintGuid}/members`);
            return response.data;
        }catch(error){
            throw error;
        }
    }

}

const sprintService = new SprintService();
export default sprintService;