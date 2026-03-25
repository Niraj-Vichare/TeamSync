// Permission definitions matching backend
export const PERMISSIONS = {
  // Project permissions
  PROJECTS_VIEW: 'projects.view',
  PROJECTS_CREATE: 'projects.create',
  PROJECTS_EDIT: 'projects.edit',
  PROJECTS_DELETE: 'projects.delete',
  
  // Sprint permissions
  SPRINTS_VIEW: 'sprints.view',
  SPRINTS_CREATE: 'sprints.create',
  SPRINTS_EDIT: 'sprints.edit',
  SPRINTS_DELETE: 'sprints.delete',
  
  // Task permissions
  TASKS_VIEW: 'tasks.view',
  TASKS_CREATE: 'tasks.create',
  TASKS_EDIT: 'tasks.edit',
  TASKS_DELETE: 'tasks.delete',
  TASKS_ASSIGN: 'tasks.assign',
  
  // Team permissions
  TEAMS_VIEW: 'teams.view',
  TEAMS_CREATE: 'teams.create',
  TEAMS_EDIT: 'teams.edit',
  TEAMS_DELETE: 'teams.delete',
  TEAMS_MANAGE_MEMBERS: 'teams.manage_members',
  
  // Workspace permissions
  WORKSPACE_MANAGE: 'workspace.manage',
  WORKSPACE_SETTINGS: 'workspace.settings',
  WORKSPACE_BILLING: 'workspace.billing',
  
  // User permissions
  USERS_INVITE: 'users.invite',
  USERS_REMOVE: 'users.remove',
  USERS_MANAGE_ROLES: 'users.manage_roles',
  
  // Dashboard permissions
  DASHBOARD_VIEW: 'dashboard.view',
  ANALYTICS_VIEW: 'analytics.view',
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
};

// Role definitions matching backend
export const ROLES = {
  ADMIN: 'Admin',
  OWNER: 'Owner',
  MANAGER: 'Manager',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};

// Role-to-Permission mapping (example - adjust based on your needs)
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS), // Full access
  [ROLES.OWNER]: Object.values(PERMISSIONS), // Full access
  [ROLES.MANAGER]: [
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_EDIT,
    PERMISSIONS.SPRINTS_VIEW,
    PERMISSIONS.SPRINTS_CREATE,
    PERMISSIONS.SPRINTS_EDIT,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT,
    PERMISSIONS.TASKS_ASSIGN,
    PERMISSIONS.TEAMS_VIEW,
    PERMISSIONS.TEAMS_MANAGE_MEMBERS,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],
  [ROLES.MEMBER]: [
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.SPRINTS_VIEW,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT,
    PERMISSIONS.TEAMS_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.SPRINTS_VIEW,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TEAMS_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
};