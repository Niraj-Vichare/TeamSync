using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface IScoreRecalculationService
    {
        Task RecalculateAllWorkspacesAsync(CancellationToken ct = default);
        Task RecalculateWorkspaceAsync(string workspaceGuid, DateTime weekStart, DateTime weekEnd, CancellationToken ct = default);
    }
}
