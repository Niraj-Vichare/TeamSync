import { useAuth } from '@/context/AuthContext';

export function useRole() {
  const { userRole } = useAuth();
  
  const roleId = userRole || 0;
  
  return {
    // Current role
    role: roleId,
    roleId: roleId,
    
    // Role checks
    isOwner: roleId === 1,
    isAdmin: roleId === 2,
    isManager: roleId === 3,
    isMember: roleId === 4,
    isViewer: roleId === 5,
    
    // ── TASKS ────────────────────────────────────────────────────
    // View tasks:           Owner, Admin, Manager, Member, Viewer
    canViewTasks: roleId >= 1 && roleId <= 5,
    // Create / edit / update task status: Owner, Admin, Manager, Member
    canManageTasks: roleId <= 4,
    // Delete task:          Owner, Admin, Manager
    canDeleteTasks: roleId <= 3,
    // Assign task to others: Owner, Admin, Manager (Member = self only, handled in UI)
    canAssignTasks: roleId <= 3,
    canAssignTasksSelf: roleId === 4, // Member can only assign to self

    // ── SPRINTS ──────────────────────────────────────────────────
    // View sprints:         Owner, Admin, Manager, Member, Viewer
    canViewSprints: roleId >= 1 && roleId <= 5,
    // Create sprint:        Owner, Admin, Manager
    canCreateSprint: roleId <= 3,
    // Add ticket to sprint: Owner, Admin, Manager
    canAddTicketToSprint: roleId <= 3,
    // View breakdown / progress / activities: all roles
    canViewSprintDetails: roleId >= 1 && roleId <= 5,
    // Pause / close sprint: Owner, Admin, Manager
    canManageSprints: roleId <= 3,

    // ── WORKSPACE & TEAM ─────────────────────────────────────────
    // Manage workspace settings / delete: Owner only
    canManageWorkspace: roleId === 1,
    canDeleteWorkspace: roleId === 1,
    // Manage billing:       Owner only
    canManageBilling: roleId === 1,
    // Invite / remove members: Owner, Admin
    canAddMembers: roleId <= 2,
    canRemoveMembers: roleId <= 2,
    // Manage team:          Owner, Admin
    canManageTeam: roleId <= 2,
    // Manage roles:         Owner, Admin
    canManageRoles: roleId <= 2,

    // ── PROJECTS ─────────────────────────────────────────────────
    // View projects:        Owner, Admin, Manager, Member, Viewer
    canViewProjects: roleId >= 1 && roleId <= 5,
    // Create / edit project: Owner, Admin, Manager
    canManageProjects: roleId <= 3,

    // ── ANALYTICS & BILLING ──────────────────────────────────────
    // View analytics / reports: Owner, Admin
    canViewAnalytics: roleId <= 2,
    canViewReports: roleId <= 2,
    
    // Get role name
    getRoleName: () => {
      const roleNames = {
        1: 'Owner',
        2: 'Admin',
        3: 'Manager',
        4: 'Member',
        5: 'Viewer'
      };
      return roleNames[roleId] || 'Unknown';
    }
  };
}