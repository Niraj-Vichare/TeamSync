using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class AuthorizationService : IAuthorizationService
    {
        private readonly IOmniRepository _repository;
        private readonly ICache _cache;
        private readonly Supabase.Client _supabaseClient;

        public AuthorizationService(IOmniRepository repository, ICache cache, Supabase.Client supabaseClient)
        {
            _repository = repository;
            _cache = cache;
            _supabaseClient = supabaseClient;
        }

        public async Task<bool> HasPermission(string userId, string workspaceId, int requiredRole)
        {
            try
            {
                // Get user's actual role
                var userRole = await _repository.WorkspaceRepository.GetUserWorkspaceInfo(workspaceId, userId);

                return userRole <= requiredRole;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> HasFeature(string workspaceId, PlanEnums.PlanFeature feature)
        {
            try
            {
                // Try cache first
                var cacheKey = $"workspace:{workspaceId}:features";
                var cachedFeatures = await _cache.GetStringAsync(cacheKey);

                List<int> enabledFeatures;

                if (!string.IsNullOrEmpty(cachedFeatures))
                {
                    enabledFeatures = JsonSerializer.Deserialize<List<int>>(cachedFeatures);
                }
                else
                {
                    // Fetch from database
                    var workspaceIdInt = await _repository.WorkspaceRepository.GetWorkspaceId(workspaceId);

                    var subscription = await _supabaseClient
                        .From<WorkspaceSubscription>()
                        .Where(s => s.WorkspaceId == workspaceIdInt)
                        .Where(s => s.IsActive == true)
                        .Single();

                    if (subscription == null)
                    {
                        // No subscription = Free plan
                        enabledFeatures = GetFreePlanFeatures();
                    }
                    else
                    {
                        enabledFeatures = JsonSerializer.Deserialize<List<int>>(subscription.Features ?? "[]");
                    }

                    // Cache for 5 minutes
                    await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(enabledFeatures), TimeSpan.FromMinutes(5));
                }

                return enabledFeatures.Contains((int)feature);
            }
            catch
            {
                // On error, allow basic features
                return IsBasicFeature(feature);
            }
        }

        public async Task<bool> CanCreateProject(string workspaceId)
        {
            try
            {
                var workspaceIdInt = await _repository.WorkspaceRepository.GetWorkspaceId(workspaceId);

                var subscription = await _supabaseClient
                    .From<DAL.Models.WorkspaceSubscription>()
                    .Where(s => s.WorkspaceId == workspaceIdInt)
                    .Where(s => s.IsActive == true)
                    .Single();

                // Check if unlimited
                if (await HasFeature(workspaceId, PlanEnums.PlanFeature.UnlimitedProjects))
                {
                    return true;
                }

                // Check limit
                var currentCount = await GetCurrentProjectCount(workspaceId);
                var maxProjects = subscription?.MaxProjects ?? 3; // Free plan = 3 projects

                return currentCount < maxProjects;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> CanAddMember(string workspaceId)
        {
            try
            {
                var workspaceIdInt = await _repository.WorkspaceRepository.GetWorkspaceId(workspaceId);

                var subscription = await _supabaseClient
                    .From<DAL.Models.WorkspaceSubscription>()
                    .Where(s => s.WorkspaceId == workspaceIdInt)
                    .Where(s => s.IsActive == true)
                    .Single();

                // Check if unlimited
                if (await HasFeature(workspaceId, PlanEnums.PlanFeature.UnlimitedTeamMembers))
                {
                    return true;
                }

                // Check limit
                var currentCount = await GetCurrentMemberCount(workspaceId);
                var maxMembers = subscription?.MaxTeamMembers ?? 5; // Free plan = 5 members

                return currentCount < maxMembers;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> CanCreateSprint(string workspaceId)
        {
            try
            {
                var workspaceIdInt = await _repository.WorkspaceRepository.GetWorkspaceId(workspaceId);

                var subscription = await _supabaseClient
                    .From<DAL.Models.WorkspaceSubscription>()
                    .Where(s => s.WorkspaceId == workspaceIdInt)
                    .Where(s => s.IsActive == true)
                    .Single();

                // Check if unlimited
                if (await HasFeature(workspaceId, PlanEnums.PlanFeature.UnlimitedSprints))
                {
                    return true;
                }

                // Free plan = unlimited sprints (basic feature)
                return true;
            }
            catch
            {
                return true; // Allow sprints by default
            }
        }

        public async Task<int> GetCurrentProjectCount(string workspaceId)
        {
            var workspaceIdInt = await _repository.WorkspaceRepository.GetWorkspaceId(workspaceId);

            var projects = await _supabaseClient
                .From<DAL.Models.ProjectWorkspaceMapping>()
                .Where(p => p.WorkspaceId == workspaceIdInt)
                .Get();

            return projects.Models.Count;
        }

        public async Task<int> GetCurrentMemberCount(string workspaceId)
        {
            return await _repository.WorkspaceRepository.GetWorkspaceMemberCount(workspaceId);
        }

        private List<int> GetFreePlanFeatures()
        {
            return new List<int>
            {
                (int)PlanEnums.PlanFeature.MaxProjects, // 3 projects
                (int)PlanEnums.PlanFeature.MaxTeamMembers, // 5 members
                (int)PlanEnums.PlanFeature.UnlimitedSprints,
                (int)PlanEnums.PlanFeature.RealTimeCollaboration,
                (int)PlanEnums.PlanFeature.FileStorage // 1GB
            };
        }

        private bool IsBasicFeature(PlanEnums.PlanFeature feature)
        {
            var basicFeatures = new[]
            {
                PlanEnums.PlanFeature.UnlimitedSprints,
                PlanEnums.PlanFeature.RealTimeCollaboration,
                PlanEnums.PlanFeature.FileStorage
            };

            return basicFeatures.Contains(feature);
        }
    }
}
