using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Enums
{
    public class GeneralEnums
    {
        public enum ErrorStatus
        {
            [Description("Operation completed successfully.")]
            SUCCESS,
            [Description("Operation failed due to an error.")]
            FAILURE,
            [Description("User authentication failed.")]
            AUTHENTICATION_FAILED,

            [Description("User identifier not found.")]
            USERID_NOT_FOUND,
            [Description("The provided workspace GUID was not found.")]
            WORKSPACEGUID_NOT_FOUND,
            [Description("The workspace not found.")]
            WORKSPACE_NOT_FOUND,
            [Description("The provided project GUID was not found.")]
            PROJECT_GUID_NOT_FOUND,
            [Description("A project with the same name already exists in the workspace.")]
            PROJECT_NAME_ALREADY_EXISTS,

            [Description("Invalid workspace ID.")]
            INVALID_WORKSPACE_ID,
            [Description("The user was not found.")]
            USER_NOT_FOUND,
            [Description("The user is not part of the specified workspace.")]
            USER_NOT_IN_WORKSPACE,
            [Description("The project was not found.")]
            PROJECT_NOT_FOUND,
            [Description("The project details were not found.")]
            PROJECT_DETAILS_NOT_FOUND,
            [Description("The task was not found.")]
            TASK_NOT_FOUND,

        }

        
        public enum EventType
        {
            ProjectCreated =1,
            ProjectCompleted,
            ProjectDeleted,
            ProjectUpdated,
            ProjectClosed,
            ProjectPaused,
            SprintCreated,
            SprintCompleted,
            SprintDeleted,
            SprintClosed,
            SprintPaused,
            
            TaskCreated,
            TaskCompleted,
            TaskDeleted,
            TaskClosed,
            TaskUpdated,
            TaskPaused,
            AssignedUserToTask,

            TicketCreated,
            TicketUpdated,
            TicketIncludeInSprint,
            TicketCompleted,
            TicketDeleted,
            TicketClosed,
            TicketPaused,

            AddMember,
            RemoveMember,
            AssignMemberRole,
            CheckIn,
            CheckOut,

            AddCustomTeam,
            RemoveCustomTeamMember,
            UpdateCustomTeam,
            
            CreateWorkspace,
            DeleteWorkspace,
            UpdateMember,
            TicketCloseRequested
        }
        public enum ClockActionResult
        {
            Success,
            AlreadyClockedIn,
            AlreadyClockedOut,
            NotClockedIn,
            InvalidWorkspaceOrUser
        }
        public enum NotificationType
        {
            TaskAssigned = 1,
            TaskUpdated = 2,

            TicketAssigned = 3,
            TicketUpdated = 4,
            TicketClosed = 5,
            TicketCloseRequested = 6,

            CommentAdded = 7,
            Mentioned = 8,

            TeamMemberAdded = 9,

            ProjectCreated = 10,
            ProjectUpdated = 11,

            SprintCreated = 12,
            SprintClosed = 13,
            TaskDeadline = 14,   
            SprintDeadline = 15,   
            TicketCloseApproved = 16,   
            TicketCloseRejected = 17,   
            SprintCompleted = 18,   
            ProjectCompleted = 19,   
            MemberAddedToWorkspace = 20,
            TicketCreated = 21
        }

        public enum NotificationEntityType
        {
            Task = 1,
            Ticket = 2,
            Project = 3,
            Sprint = 4,
            Team = 5,
            Workspace = 6,
            Comment = 7
        }

        public enum NotificationStatus
        {
            Unread = 0,
            Read = 1
        }


    }
}
