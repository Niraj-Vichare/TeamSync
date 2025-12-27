import TeamErrorCodes from "@/constants/teamErrorCode";

export function handleTeamError(error) {
  const teamMessages = {
    [TeamErrorCodes.NOT_FOUND]: 'Team not found.',
    [TeamErrorCodes.ALREADY_EXISTS]: 'A team with this name already exists.',
    [TeamErrorCodes.INVALID_NAME]: 'Team name is invalid.',
    [TeamErrorCodes.UNAUTHORIZED]: 'You are not authorized to access this team.',
    [TeamErrorCodes.UNKNOWN_ERROR]: 'An unknown error occurred while handling team.',
  };

  const message = teamMessages[error.code] || error.message || 'A team error occurred.';
  return new Error(message);
}
