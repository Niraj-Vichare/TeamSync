// utils/handleWorkspaceError.js
import WorkspaceErrorCodes from '../constants/workspaceErrorCode';

export function handleWorkspaceError(error) {
  const workspaceMessages = {
    [WorkspaceErrorCodes.NOT_FOUND]: 'Workspace not found.',
    [WorkspaceErrorCodes.ALREADY_EXISTS]: 'A workspace with this name already exists.',
    [WorkspaceErrorCodes.INVALID_NAME]: 'Workspace name is invalid.',
    [WorkspaceErrorCodes.UNAUTHORIZED]: 'You are not authorized to access this workspace.',
    [WorkspaceErrorCodes.UNKNOWN_ERROR]: 'An unknown error occurred while handling workspace.',
  };

  const message = workspaceMessages[error.code] || error.message || 'A workspace error occurred.';
  return new Error(message);
}
