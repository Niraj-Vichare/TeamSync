import axiosInstance from "./axiosInstance";

class TicketService {

  async getTickets(workspaceGuid, searchTerm, type, status, priority, pageNumber, pageSize) {
    try {
      const response = await axiosInstance.get("/tickets", {
        params: { workspaceGuid, searchTerm, type, status, priority, pageNumber, pageSize }
      });
      return response.data;
    } catch (error) {
      console.error("Error while getting tickets", error);
      throw error;
    }
  }

  async createTickets(workspaceGuid, ticketDto) {
    try {
      const response = await axiosInstance.post(`/tickets?workspaceGuid=${workspaceGuid}`, ticketDto);
      return response.data;
    } catch (error) {
      console.error("Error while creating ticket", error);
      throw error;
    }
  }

  // ── Full ticket edit (all fields) ───────────────────────────────────────
  async updateTicket(workspaceGuid, ticketGuid, ticketDto) {
    try {
      ticketDto.workspaceGuid = workspaceGuid;
      const response = await axiosInstance.patch(`/tickets/${ticketGuid}`, ticketDto);
      return response.data;
    } catch (error) {
      console.error("Error while updating ticket", error);
      throw error;
    }
  }

  // ── Targeted status change ──────────────────────────────────────────────
  // Uses the existing PATCH /tickets/{ticketGuid} endpoint.
  // Only status + workspaceGuid are required; backend EditTicket merges them.
  //
  // statusValue integers (TicketEnums.TicketStatus):
  //   Open = 1 | InProgress = 2 | Closed = 3
  async updateTicketStatus(workspaceGuid, ticketGuid, statusValue) {
    try {
      const response = await axiosInstance.patch(`/tickets/${ticketGuid}`, {
        workspaceGuid,
        status: statusValue,
      });
      return response.data;
    } catch (error) {
      console.error("Error while updating ticket status", error);
      throw error;
    }
  }

  // ── Targeted priority change ────────────────────────────────────────────
  // priorityValue integers (TicketEnums.TicketPriority):
  //   High = 1 | Medium = 2 | Low = 3
  async updateTicketPriority(workspaceGuid, ticketGuid, priorityValue) {
    try {
      const response = await axiosInstance.patch(`/tickets/${ticketGuid}`, {
        workspaceGuid,
        priority: priorityValue,
      });
      return response.data;
    } catch (error) {
      console.error("Error while updating ticket priority", error);
      throw error;
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────
  // DELETE /tickets?ticketGuid={guid}
  async deleteTicket(ticketGuid) {
    try {
      const response = await axiosInstance.delete("/tickets", {
        params: { ticketGuid }
      });
      return response.data;
    } catch (error) {
      console.error("Error while deleting ticket", error);
      throw error;
    }
  }

  async ViewTicketSteps(ticketId) {
    try {
      const response = await axiosInstance.get(`/tickets/${ticketId}/steps`);
      return response.data;
    } catch (error) {
      console.error("Error while fetching ticket steps", error);
      throw error;
    }
  }

  async UpdateTicketSteps(ticketId, steps) {
    try {
      const response = await axiosInstance.put(`/tickets/${ticketId}/steps`, steps);
      return response.data;
    } catch (error) {
      console.error("Error while updating ticket steps", error);
      throw error;
    }
  }

  async fetchTicketBySprintId(sprintId) {
    try {
      const response = await axiosInstance.get(`/tickets/${sprintId}/dropdown`);
      return response.data;
    } catch (error) {
      console.error("Error while fetching tickets by sprint id", error);
      throw error;
    }
  }

  async getUserAssignedTickets(workspaceGuid) {
    try {
      const response = await axiosInstance.get("/tickets/users", { params: { workspaceGuid } });
      return response.data;
    } catch (error) {
      console.error("Error while fetching user assigned tickets", error);
      throw error;
    }
  }

  // ── Ticket Detail Page ──────────────────────────────────────────────────

  async getTicketDetail(ticketGuid) {
    try {
      const response = await axiosInstance.get(`/tickets/${ticketGuid}/detail`);
      return response.data;
    } catch (error) {
      console.error("Error while fetching ticket detail", error);
      throw error;
    }
  }

  // Canonical name used by ticket-details.jsx.
  // (The old codebase mistakenly called this addCommentToTicket.)
  async addComment(ticketGuid, workspaceGuid, commentText, attachments = []) {
    try {
      const response = await axiosInstance.post(`/tickets/${ticketGuid}/comments`, {
        commentText,
        attachments,
        workspaceGuid,
      });
      return response.data;
    } catch (error) {
      console.error("Error while adding comment", error);
      throw error;
    }
  }

  async requestClose(ticketGuid, reason = "") {
    try {
      const response = await axiosInstance.post(`/tickets/${ticketGuid}/close-request`, { reason });
      return response.data;
    } catch (error) {
      console.error("Error while requesting ticket close", error);
      throw error;
    }
  }
}

const ticketService = new TicketService();
export default ticketService;