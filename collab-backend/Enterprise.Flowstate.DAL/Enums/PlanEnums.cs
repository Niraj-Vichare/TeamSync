using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Enums
{
    public class PlanEnums
    {
        public enum PlanType
        {
            Free = 1,
            Starter = 2,
            Professional = 3,
            Enterprise = 4
        }

        public enum PlanFeature
        {
            // Project limits
            UnlimitedProjects = 1,
            MaxProjects = 2,

            // Team limits
            UnlimitedTeamMembers = 3,
            MaxTeamMembers = 4,

            // Sprint limits
            UnlimitedSprints = 5,
            MaxSprints = 6,

            // Advanced features
            AdvancedAnalytics = 10,
            CustomRoles = 11,
            APIAccess = 12,
            PrioritySupport = 13,
            CustomIntegrations = 14,
            AuditLogs = 15,
            BulkOperations = 16,
            ExportData = 17,

            // Collaboration
            RealTimeCollaboration = 20,
            GuestAccess = 21,
            PublicSharing = 22,

            // Storage
            FileStorage = 30,
            UnlimitedStorage = 31
        }

    }
}
