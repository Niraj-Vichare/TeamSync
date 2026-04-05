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
    
    // Permission checks
    canManageWorkspace: roleId === 1,
    canManageTeam: roleId <= 2, // Owner or Admin
    canManageProjects: roleId <= 3, // Owner, Admin, or Manager
    canManageSprints: roleId <= 3,
    canManageTickets: roleId <= 3, 
    canManageTasks: roleId <= 4, // Everyone except Viewer
    canViewAnalytics: roleId <= 2,
    canViewReports: roleId <= 2,
    canDeleteWorkspace: roleId === 1,
    canAddMembers: roleId <= 2,
    canRemoveMembers: roleId <= 2,
    
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