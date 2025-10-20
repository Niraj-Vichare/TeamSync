using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface ISprintRepository
    {
        Task<bool> CreateSprint(string userId, Sprint sprint);
        Task<List<Sprint>> GetSprintsAsync(string workspaceId,string searchTerm,string status,string project,int pageNumber,int pageSize);

        Task<int> GetSprintsCountAsync(string workspaceId, string searchTerm, string status, string project);
        Task<bool> IncludeTicketInSprint(string sprintGuid, string ticketGuid);
        Task<List<SprintDropdownModel>> GetSprintsByProjectId(int projectId);
    }
}
