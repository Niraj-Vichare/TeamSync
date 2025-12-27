using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Supabase.Interfaces;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Task = Enterprise.Flowstate.DAL.Models.Task;

namespace Enterprise.Flowstate.DAL.Repositories
{
    public class TaskRepository : ITaskRepository
    {
        private Supabase.Client _supabaseClient;
        public TaskRepository(Supabase.Client supabaseClient)
        {
            _supabaseClient = supabaseClient;
        }

        public async Task<bool> CreateTask(Task task)
        {
            var result = await _supabaseClient.From<Task>().Insert(task);
            if (result.Models.Any())
            {
                return true;
            }
            return false;
        }

        public async Task<bool> DeleteTask(string taskId)
        {
            if (!Guid.TryParse(taskId, out var guid))
                return false; // invalid ticketGuid
            var result = await _supabaseClient.From<Task>().Where(task => task.TaskGuid == guid).Get();
            if (!result.Models.Any())
            {
                return false;
            }
            var task = result.Models.FirstOrDefault();
            var deleteResponse = _supabaseClient.From<Task>().Delete(task);
            return true;
        }

        public async Task<int> GetTaskCountAsync(
     string userGuid,
     string searchTerm,
     string statusFilter,
     string sprintId,
     string projectId,
     string ticketId)
        {
            // 1️. Get user info
            var userResult = await _supabaseClient
                .From<Profile>()
                .Where(w => w.Guid == userGuid)
                .Get();

            var user = userResult.Models.FirstOrDefault();
            if (user == null)
                return 0;

            // 2️. Build base query
            var query = _supabaseClient
                .From<Task>()
                .Select("id") // only select ID to minimize data
                .Where(t => t.AssignedTo == user.Id);

            // 3️. Optional filters
            if (!string.IsNullOrEmpty(searchTerm))
                query = query.Filter("title", Supabase.Postgrest.Constants.Operator.ILike, $"%{searchTerm}%");

            if (!string.IsNullOrEmpty(statusFilter))
                query = query.Filter("status", Supabase.Postgrest.Constants.Operator.Equals, statusFilter);

            if (!string.IsNullOrEmpty(sprintId))
                query = query.Filter("sprint_id", Supabase.Postgrest.Constants.Operator.Equals, sprintId);

            if (!string.IsNullOrEmpty(projectId))
                query = query.Filter("project_id", Supabase.Postgrest.Constants.Operator.Equals, projectId);

            if (!string.IsNullOrEmpty(ticketId))
                query = query.Filter("ticket_id", Supabase.Postgrest.Constants.Operator.Equals, ticketId);

            // 4️. Execute query and count
            var result = await query.Get();

            return result.Models.Count;
        }

        public async Task<List<Task>> GetAllTaskAssignedToUser(string userGuid, string projectId, string sprintId, string ticketId, string priority, string status)
        {
            var userResult = await _supabaseClient
                .From<Profile>()
                .Where(w => w.Guid == userGuid)
                .Get();

            var user = userResult.Models.FirstOrDefault();

            if (user == null)
                return new List<Task>();

            var query = _supabaseClient
                .From<Task>()
                .Select("*, project:project_id(*), sprint:sprint_id(*), assignedByUser:profile!assigned_by(*),assignedToUser:profile!assigned_to(*), ticket:ticket_id(*)")
                .Where(t => t.AssignedTo == user.Id);
            // 3️. Optional filters
            if (!string.IsNullOrEmpty(priority))
                query = query.Filter("title", Supabase.Postgrest.Constants.Operator.Equals,priority);

            if (!string.IsNullOrEmpty(status))
                query = query.Filter("status", Supabase.Postgrest.Constants.Operator.Equals, status);

            if (!string.IsNullOrEmpty(sprintId))
                query = query.Filter("sprint_id", Supabase.Postgrest.Constants.Operator.Equals, sprintId);

            if (!string.IsNullOrEmpty(projectId))
                query = query.Filter("project_id", Supabase.Postgrest.Constants.Operator.Equals, projectId);

            if (!string.IsNullOrEmpty(ticketId))
                query = query.Filter("ticket_id", Supabase.Postgrest.Constants.Operator.Equals, ticketId);

            var result = await query.Get();

            return result.Models;
        }
            
        public async Task<List<Task>> GetTaskAsync(string userGuid, string searchTerm, string statusFilter, string sprintId,string projectId,string ticketId,int pageNumber, int pageSize)
        {
            // 1️. Get the workspace
            var userResult = await _supabaseClient
                .From<Profile>()
                .Where(w => w.Guid == userGuid)
                .Get();

            var user = userResult.Models.FirstOrDefault();
            
            if (user == null)
                return new List<Task>();

            // 2️. Base query
            var query = _supabaseClient
                .From<Task>()
                .Select("*, project:project_id(project_name), sprint:sprint_id(title), assignedBy:assigned_by(display_name), assignedTo:assigned_to(display_name), ticket:ticket_id(title)")
                .Where(t => t.AssignedTo == user.Id);


            // 3️. Optional filters
            if (!string.IsNullOrEmpty(searchTerm))
                query = query.Filter("title", Supabase.Postgrest.Constants.Operator.ILike, $"%{searchTerm}%");

            if (!string.IsNullOrEmpty(statusFilter))
                query = query.Filter("status", Supabase.Postgrest.Constants.Operator.Equals, statusFilter);

            if (!string.IsNullOrEmpty(sprintId))
                query = query.Filter("sprint_id", Supabase.Postgrest.Constants.Operator.Equals, sprintId);

            if (!string.IsNullOrEmpty(projectId))
                query = query.Filter("project_id", Supabase.Postgrest.Constants.Operator.Equals, projectId);

            if (!string.IsNullOrEmpty(ticketId))
                query = query.Filter("ticket_id", Supabase.Postgrest.Constants.Operator.Equals, ticketId);

            // 4️. Pagination
            int start = (pageNumber - 1) * pageSize;
            int end = pageNumber * pageSize - 1;

            var result = await query.Range(start, end).Get();

            return result.Models;
        }

        public async Task<bool> UpdateTaskStatus(string userGuid, int taskId, int taskStatus)
        {
            var userResult = await _supabaseClient
                .From<Profile>()
                .Where(w => w.Guid == userGuid)
                .Get();

            if (!userResult.Models.Any())
            {
                return false;
            }
            int userId = userResult.Models.FirstOrDefault().Id;

            var taskResult = await _supabaseClient.From<Task>().Where(task => task.TaskId == taskId && task.AssignedTo == userId).Get();
            if (!taskResult.Models.Any())
            {
                return false;
            }
            var task = taskResult.Models.FirstOrDefault();
            task.Status = taskStatus;
            var updated = await _supabaseClient.From<Task>().Update(task);
            return updated.Models.Any();
        }

        public async Task<bool> UpdateTask(string taskGuid, string userGuid, Task taskModel)
        {
            if (!Guid.TryParse(taskGuid, out var guid))
                return false; // invalid ticketGuid
            // Fetch existing record
            var result = await _supabaseClient
                .From<Task>()
                .Where(t => t.TaskGuid == guid)
                .Get();

            if (!result.Models.Any())
                return false;

            var existingTask = result.Models.First();

            // === CONDITIONAL UPDATES ===
            existingTask.Title = taskModel.Title ?? existingTask.Title;
            existingTask.Description = taskModel.Description ?? existingTask.Description;
            existingTask.AssignedTo = taskModel.AssignedTo != 0 ? taskModel.AssignedTo : existingTask.AssignedTo;
            existingTask.AssignedBy = taskModel.AssignedBy != 0 ? taskModel.AssignedBy : existingTask.AssignedBy;
            existingTask.Priority = taskModel.Priority != 0 ? taskModel.Priority : existingTask.Priority;
            existingTask.Status = taskModel.Status != 0 ? taskModel.Status : existingTask.Status;

            // Only update these if non-zero
            existingTask.ProjectId = taskModel.ProjectId != 0 ? taskModel.ProjectId : existingTask.ProjectId;
            existingTask.SprintId = taskModel.SprintId != 0 ? taskModel.SprintId : existingTask.SprintId;
            existingTask.TicketId = taskModel.TicketId != 0 ? taskModel.TicketId : existingTask.TicketId;

            // Nullable fields
            existingTask.StartDate = taskModel.StartDate ?? existingTask.StartDate;
            existingTask.EndDate = taskModel.EndDate ?? existingTask.EndDate;

            // You might want to track updates:
            // existingTask.UpdatedAt = DateTime.UtcNow;

            // === SAVE ===
            var updated = await _supabaseClient.From<Task>().Update(existingTask);

            return updated.Models.Any();
        }


        public async Task<List<Task>> GetOngoingUserTask(string userGuid, string workspaceGuid)
        {
            var userResult = await _supabaseClient
                .From<Profile>()
                .Where(w => w.Guid == userGuid)
                .Get();


            if (!userResult.Models.Any())
            {
                return null;
            }


            var workspaceResult = await _supabaseClient
            .From<Workspace>()
            .Where(w => w.WorkspaceGuid == workspaceGuid)
            .Get();

            if (!workspaceResult.Models.Any())
            {
                return null;
            }
            var profileId = userResult.Models.FirstOrDefault().Id;
            var result = await _supabaseClient.From<Task>().Select("*, project:project_id(*), sprint:sprint_id(*), assignedByUser:profile!assigned_by(*),assignedToUser:profile!assigned_to(*), ticket:ticket_id(*)").Where(tasks => tasks.AssignedTo == profileId && tasks.EndDate>=DateTime.Now && tasks.Status != (int)TaskEnums.TaskStatus.Complete).Get();
            return result.Models.ToList();
        }
    }
}
