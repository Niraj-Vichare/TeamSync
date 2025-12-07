using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface ISprintService
    {
        Task<bool> CreateSprint(string userId, SprintDto sprintDto);
        Task<PaginationResponse<SprintDto>> GetSprints(string workspaceGuid, string searchTerm, string statusFilter, string projectFilter, int pageNumber, int pageSize);
        Task<bool> IncludeTicketInSprint(string sprintGuid, string ticketGuid);
        Task<List<SprintDropdownModel>> GetSprintsByProjectId(string projectGuid);
        Task<SprintDto> GetSprint(string workspaceGuid, string sprintGuid);
        Task<List<EventsLog>> GetSprintActivities(string sprintGuid,int pagNumber,int pageSize);
        Task<List<SprintProgressModel>> GetSprintProgress(string sprintGuid);
        Task<SprintBreakdownModel> GetSprintBreakdown(string sprintGuid);
    }
}
