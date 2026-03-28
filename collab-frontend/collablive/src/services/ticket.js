import axiosInstance from "./axiosInstance";

class TicketService {

    async getTickets(workspaceGuid, searchTerm, type, status, priority, pageNumber, pageSize) {
        try {
            const response = await axiosInstance.get(`/tickets?workspaceGuid=${workspaceGuid}`, {
                params: { workspaceGuid, searchTerm, type, status, priority, pageNumber, pageSize }
            })
            return response.data;
        } catch (error) {
            console.error("Error while getting the team members", error);
            throw error;
        }
    }

    async createTickets(workspaceGuid, type, ticketDto) {
        try {
            const response = await axiosInstance.post(`/tickets?workspaceGuid=${workspaceGuid}`, ticketDto);
            return response.data;
        } catch (error) {
            console.error("Error while creating the user stories", error);
            throw error;
        }
    }
    async ViewTicketSteps(workspaceGuid, ticketId) {
        try {
            const response = await axiosInstance.get(`/tickets/${ticketId}/steps`);
            return response.data;
        } catch (error) {
            console.error("Error while fetching the ticket steps", error);
            throw error;
        }
    }

    async updateTicket(workspaceGuid, ticketGuid, ticketDto) {
        try {
            ticketDto.workspaceGuid = workspaceGuid;
            const response = await axiosInstance.patch(`/tickets/${ticketGuid}`, ticketDto);
            return response.data;
        } catch (error) {
            console.error("Error while updating the ticket", error);
            throw error;
        }
    }

    async UpdateTicketSteps(workspaceGuid, ticketId, steps) {
        try {
            const response = await axiosInstance.put(`/tickets/${ticketId}/steps`, steps);
            return response.data;
        } catch (error) {
            console.error("Error while updating the ticket steps", error);
            throw error;
        }
    }

    async fetchTicket(projectGuid, sprintGuid) {
        try {
            const response = await axiosInstance.get(`/tickets?projectGuid=${projectGuid}&sprintGuid=${sprintGuid}`);
            return response.data;
        } catch (error) {
            console.error("Error while fetching the tickets", error);
            throw error;
        }
    }

    async fetchUserAssignedTickets(workspaceGuid, userId, searchTerm, status, priority, pageNumber, pageSize) {
        try {
            const response = await axiosInstance.get(`/tickets/user/${userId}`, {
                params: { workspaceGuid, userId, searchTerm, status, priority, pageNumber, pageSize }
            });
            return response.data;
        } catch (error) {
            console.error("Error while fetching the user assigned tickets", error);
            throw error;
        }
    }

    async fetchTicketBySprintId(sprintId) {
        try {
            const response = await axiosInstance.get(`/tickets/${sprintId}/dropdown`);
            return response.data;
        } catch (error) {
            console.error("Error while fetching the tickets by sprint id", error);
            throw error;
        }
    }

    async getUserAssignedTickets(workspaceGuid){
        try{
            const response = await axiosInstance.get(`/tickets/users`,{
                params:{workspaceGuid}
            });
            return response.data;

        }catch(error){
            console.error("Error while fetching user assigned tickets", error);
            throw error;
        }
    }
}

const ticketService = new TicketService();
export default ticketService;