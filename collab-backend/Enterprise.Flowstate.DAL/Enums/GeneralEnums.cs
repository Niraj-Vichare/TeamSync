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

        
    }
}
