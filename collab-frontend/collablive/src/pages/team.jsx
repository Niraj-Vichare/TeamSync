import DepartmentCard from '@/components/teamComponents/DepartmentCard';
import TeamDataTable from '@/components/teamComponents/TeamDataTable';
import TeamProjectCard from '@/components/teamComponents/TeamProjectCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Department, RoleEnum, UserStatus } from '@/data/general';
import teamService from '@/services/team';
import { Crown, FilterIcon, Plus, Search, Trash2, UserMinus, UserPlus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

// ── Department → allowed positions mapping ────────────────────────────────────
const DEPARTMENT_POSITIONS = {
  [Department.Technical]:              ["6","7","8","10","9","5","12"],
  [Department.Sales]:                  ["13","9","12"],
  [Department.Marketing]:              ["8","9","4","12"],
  [Department.HumanResources]:         ["1","11","12"],
  [Department.Finance]:                ["9","1","12"],
  [Department.Operations]:             ["5","10","9","11","12"],
  [Department.CustomerSupport]:        ["11","12"],
  [Department.Legal]:                  ["1","12"],
  [Department.ResearchAndDevelopment]: ["8","12"],
  [Department.IT]:                     ["11","12"],
  [Department.Administration]:         ["1","2","3","4","5","12"],
};

const POSITION_LABELS = {
  "1":"Admin","2":"CEO","3":"CTO","4":"Product Manager",
  "5":"Project Manager","6":"Developer","7":"Tester",
  "8":"Designer","9":"Business Analyst","10":"DevOps",
  "11":"Support","12":"Guest","13":"Sales Manager",
};

// ── Initial form states ───────────────────────────────────────────────────────
const INITIAL_MEMBER_FORM = {
  Id: 0, memberName: '', memberRole: '', memberPassword: '',
  memberEmail: '', memberDepartment: '', memberPosition: '', memberStatus: ''
};

const INITIAL_CUSTOM_TEAM_FORM = {
  teamId: 0, teamName: '', teamDescription: '', tagline: '',
  teamLeaderId: '',   // ← new: the chosen leader's memberId
  teamMembers: [],    // ← non-leader member IDs
};

function Team() {
  const { getCurrentWorkspaceId } = useAuth();
  const workspaceGuid = getCurrentWorkspaceId();

  // ── Tab ───────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('all-teams');

  // ── Column visibility ─────────────────────────────────────────────────────
  const [showName,       setShowName]       = useState(true);
  const [showEmail,      setShowEmail]      = useState(false);
  const [showRole,       setShowRole]       = useState(false);
  const [showDepartment, setShowDepartment] = useState(false);
  const [showStatus,     setShowStatus]     = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [customTeam,       setCustomTeam]       = useState([]);
  const [departmentTeam,   setDepartmentTeam]   = useState([]);
  const [searchTerm,       setSearchTerm]       = useState('');
  const [pageNumber,       setPageNumber]       = useState(1);
  const [pageSize]                              = useState(10);

  // ── Add member dialog ─────────────────────────────────────────────────────
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [memberLoading,    setMemberLoading]    = useState(false);
  const [formData,         setFormData]         = useState(INITIAL_MEMBER_FORM);
  const [errors,           setErrors]           = useState({});

  // ── Edit member dialog ────────────────────────────────────────────────────
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading,    setEditLoading]    = useState(false);
  const [editFormData,   setEditFormData]   = useState(INITIAL_MEMBER_FORM);
  const [editErrors,     setEditErrors]     = useState({});
  const [editMemberId,   setEditMemberId]   = useState(null);

  // ── Delete member dialog ──────────────────────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading,    setDeleteLoading]    = useState(false);
  const [deleteMemberId,   setDeleteMemberId]   = useState(null);
  const [deleteMemberName, setDeleteMemberName] = useState('');

  // ── Create custom team dialog ─────────────────────────────────────────────
  const [customTeamDialogOpen, setCustomTeamDialogOpen] = useState(false);
  const [customTeamLoading,    setCustomTeamLoading]    = useState(false);
  const [customTeamFormData,   setCustomTeamFormData]   = useState(INITIAL_CUSTOM_TEAM_FORM);
  const [customTeamErrors,     setCustomTeamErrors]     = useState({});

  // ── Edit custom team dialog ───────────────────────────────────────────────
  const [editTeamDialogOpen,  setEditTeamDialogOpen]  = useState(false);
  const [editTeamLoading,     setEditTeamLoading]     = useState(false);
  const [editTeamData,        setEditTeamData]        = useState({ teamName: '', teamDescription: '', tagline: '' });
  const [editTeamErrors,      setEditTeamErrors]      = useState({});
  const [editTeamId,          setEditTeamId]          = useState(null);
  const [editTeamTab,         setEditTeamTab]         = useState('details'); // 'details' | 'members'
  // current members shown in the Members tab
  const [editTeamMembers,     setEditTeamMembers]     = useState([]); // [{ memberId, profileId, displayName, isLeader }]
  // add-member sub-state inside edit dialog
  const [addMemberSelectId,   setAddMemberSelectId]   = useState('');
  const [addMemberIsLeader,   setAddMemberIsLeader]   = useState(false);
  const [addMemberLoading,    setAddMemberLoading]    = useState(false);
  // remove member inside edit dialog
  const [removingMemberId,    setRemovingMemberId]    = useState(null);

  // ── Delete custom team dialog ─────────────────────────────────────────────
  const [deleteTeamDialogOpen, setDeleteTeamDialogOpen] = useState(false);
  const [deleteTeamLoading,    setDeleteTeamLoading]    = useState(false);
  const [deleteTeamId,         setDeleteTeamId]         = useState(null);
  const [deleteTeamName,       setDeleteTeamName]       = useState('');

  // ── Fetch functions ───────────────────────────────────────────────────────
  const fetchWorkspaceMembers = async () => {
    try {
      const response = await teamService.getTeamMembers(workspaceGuid, searchTerm, pageNumber, pageSize);
      if (response && response.data?.success) {
        setWorkspaceMembers(response.data?.data ?? []);
      } else {
        setWorkspaceMembers([]);
      }
    } catch (error) {
      console.error("Error fetching workspace members", error);
      setWorkspaceMembers([]);
    }
  };

  const fetchProjectTeam = async () => {
    try {
      const response = await teamService.getProjectTeam(workspaceGuid);
      if (response && response.data?.success) {
        setCustomTeam(response.data?.data ?? []);
      } else {
        setCustomTeam([]);
      }
    } catch (error) {
      console.error("Error fetching project teams", error);
      setCustomTeam([]);
    }
  };

  const fetchDepartmentTeams = async () => {
    try {
      const response = await teamService.getDepartmentTeams(workspaceGuid);
      if (response && response.data?.success) {
        setDepartmentTeam(response.data?.data ?? []);
      } else {
        setDepartmentTeam([]);
      }
    } catch (error) {
      console.error("Error fetching department teams", error);
      setDepartmentTeam([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'all-teams')         fetchWorkspaceMembers();
    else if (activeTab === 'project-team') fetchProjectTeam();
    else if (activeTab === 'department')   fetchDepartmentTeams();
  }, [activeTab, searchTerm]);

  // ── Ensure workspace members are loaded when project-team tab is active
  // (needed to populate the "add member" dropdown inside edit dialog)
  useEffect(() => {
    if (workspaceMembers.length === 0) fetchWorkspaceMembers();
  }, []);

  // ── Input handlers ────────────────────────────────────────────────────────
  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev, [key]: value,
      ...(key === 'memberDepartment' ? { memberPosition: '' } : {})
    }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handleEditInputChange = (key, value) => {
    setEditFormData(prev => ({
      ...prev, [key]: value,
      ...(key === 'memberDepartment' ? { memberPosition: '' } : {})
    }));
    setEditErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handleCustomTeamInputChange = (key, value) => {
    setCustomTeamFormData(prev => ({ ...prev, [key]: value }));
    setCustomTeamErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handleEditTeamInputChange = (key, value) => {
    setEditTeamData(prev => ({ ...prev, [key]: value }));
    setEditTeamErrors(prev => ({ ...prev, [key]: '' }));
  };

  // ── Validate member form ──────────────────────────────────────────────────
  const validateMemberForm = (data, setErr) => {
    const errs = {};
    if (!data.memberName)       errs.memberName       = 'Name is required';
    if (!data.memberEmail)      errs.memberEmail      = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.memberEmail)) errs.memberEmail = 'Invalid email';
    if (!data.memberPassword)   errs.memberPassword   = 'Password is required';
    else if (data.memberPassword.length < 6) errs.memberPassword = 'Min 6 characters';
    if (!data.memberRole)       errs.memberRole       = 'Role is required';
    if (!data.memberDepartment) errs.memberDepartment = 'Department is required';
    if (!data.memberPosition)   errs.memberPosition   = 'Position is required';
    if (!data.memberStatus)     errs.memberStatus     = 'Status is required';
    setErr(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Add member ────────────────────────────────────────────────────────────
  const handleAddMember = async () => {
    if (!validateMemberForm(formData, setErrors)) return;
    setMemberLoading(true);
    try {
      const member = {
        profile: {
          displayName: formData.memberName, email: formData.memberEmail,
          password: formData.memberPassword, guid: '', bio: '', workspaceId: workspaceGuid,
        },
        roleId:       parseInt(formData.memberRole),
        positionId:   parseInt(formData.memberPosition),
        departmentId: parseInt(formData.memberDepartment),
        statusId:     parseInt(formData.memberStatus),
      };
      const response = await teamService.addTeamMember(workspaceGuid, member);
      if (response && response.data?.success) {
        toast.success("Member added successfully");
        setMemberDialogOpen(false);
        setFormData(INITIAL_MEMBER_FORM);
        setErrors({});
        fetchWorkspaceMembers();
      } else {
        toast.error(response.data?.message || "Failed to add member");
      }
    } catch (error) {
      console.error("Error adding member", error);
      toast.error("Failed to add member");
    } finally {
      setMemberLoading(false);
    }
  };

  // ── Open / submit edit member ─────────────────────────────────────────────
  const handleOpenEditMember = (memberId, member) => {
    setEditMemberId(memberId);
    setEditFormData({
      Id:               member.profile?.id ?? 0,
      memberName:       member.profile?.displayName ?? '',
      memberEmail:      member.profile?.email ?? '',
      memberPassword:   '',
      memberRole:       String(member.roleId ?? ''),
      memberDepartment: String(member.departmentId ?? ''),
      memberPosition:   String(member.positionId ?? ''),
      memberStatus:     String(member.statusId ?? ''),
    });
    setEditErrors({});
    setEditDialogOpen(true);
  };

  const handleEditMember = async () => {
    const errs = {};
    if (!editFormData.memberName)       errs.memberName       = 'Name is required';
    if (!editFormData.memberDepartment) errs.memberDepartment = 'Department is required';
    if (!editFormData.memberPosition)   errs.memberPosition   = 'Position is required';
    if (!editFormData.memberStatus)     errs.memberStatus     = 'Status is required';
    if (!editFormData.memberRole)       errs.memberRole       = 'Role is required';
    setEditErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setEditLoading(true);
    try {
      const updatedMember = {
        memberId: editMemberId,
        profile: { Id: editFormData.Id, displayName: editFormData.memberName, email: editFormData.memberEmail },
        roleId:       parseInt(editFormData.memberRole),
        positionId:   parseInt(editFormData.memberPosition),
        departmentId: parseInt(editFormData.memberDepartment),
        statusId:     parseInt(editFormData.memberStatus),
      };
      const response = await teamService.updateMember(workspaceGuid, updatedMember);
      if (response && response.data?.success) {
        toast.success("Member updated successfully");
        setEditDialogOpen(false);
        fetchWorkspaceMembers();
      } else {
        toast.error(response.data?.message || "Failed to update member");
      }
    } catch (error) {
      console.error("Error updating member", error);
      toast.error("Failed to update member");
    } finally {
      setEditLoading(false);
    }
  };

  // ── Open / submit delete member ───────────────────────────────────────────
  const handleOpenDeleteMember = (memberId, member) => {
    setDeleteMemberId(memberId);
    setDeleteMemberName(member.profile?.displayName ?? 'this member');
    setDeleteDialogOpen(true);
  };

  const handleDeleteMember = async () => {
    setDeleteLoading(true);
    try {
      const response = await teamService.deleteTeamMember(deleteMemberId);
      if (response && response.data?.success) {
        toast.success("Member removed successfully");
        setDeleteDialogOpen(false);
        fetchWorkspaceMembers();
      } else {
        toast.error(response.data?.message || "Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member", error);
      toast.error("Failed to remove member");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Create custom team ────────────────────────────────────────────────────
  const handleAddCustomTeam = async () => {
    const errs = {};
    if (!customTeamFormData.teamName)     errs.teamName     = 'Team name is required';
    if (!customTeamFormData.tagline)      errs.tagline      = 'Tagline is required';
    if (!customTeamFormData.teamLeaderId) errs.teamLeaderId = 'Team leader is required';
    setCustomTeamErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setCustomTeamLoading(true);
    try {
      // Build members array: leader gets isLeader=true, rest get false
      const leaderEntry  = { memberId: parseInt(customTeamFormData.teamLeaderId), isLeader: true };
      const memberEntries = customTeamFormData.teamMembers.map(id => ({
        memberId: parseInt(id), isLeader: false,
      }));

      const team = {
        name:        customTeamFormData.teamName,
        description: customTeamFormData.teamDescription,
        tagline:     customTeamFormData.tagline,
        members:     [leaderEntry, ...memberEntries],
      };

      const response = await teamService.createProjectTeam(workspaceGuid, team);
      if (response && response.data?.success) {
        toast.success("Team created successfully");
        setCustomTeamDialogOpen(false);
        setCustomTeamFormData(INITIAL_CUSTOM_TEAM_FORM);
        setCustomTeamErrors({});
        fetchProjectTeam();
      } else {
        toast.error(response.data?.message || "Failed to create team");
      }
    } catch (error) {
      console.error("Error creating custom team", error);
      toast.error("Failed to create team");
    } finally {
      setCustomTeamLoading(false);
    }
  };

  // ── Open edit team dialog ─────────────────────────────────────────────────
  const handleOpenEditTeam = (team) => {
    setEditTeamId(team.id ?? team.teamId);
    setEditTeamData({
      teamName:        team.name        ?? '',
      teamDescription: team.description ?? '',
      tagline:         team.tagline     ?? '',
    });
    // Flatten members from the team object
    const members = (team.members ?? []).map(m => ({
      memberId:    m.memberId ?? m.profile?.id,
      profileId:   m.profile?.id,
      displayName: m.profile?.displayName ?? 'Unknown',
      avatarUrl:   m.profile?.profileImageUrl ?? '',
      isLeader:    m.profile?.isLeader ?? false,
    }));
    setEditTeamMembers(members);
    setEditTeamErrors({});
    setEditTeamTab('details');
    setAddMemberSelectId('');
    setAddMemberIsLeader(false);
    setEditTeamDialogOpen(true);
  };

  // ── Submit edit team details ──────────────────────────────────────────────
  const handleEditTeam = async () => {
    const errs = {};
    if (!editTeamData.teamName) errs.teamName = 'Team name is required';
    if (!editTeamData.tagline)  errs.tagline  = 'Tagline is required';
    setEditTeamErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setEditTeamLoading(true);
    try {
      const team = {
        id:          editTeamId,
        name:        editTeamData.teamName,
        description: editTeamData.teamDescription,
        tagline:     editTeamData.tagline,
      };
      const response = await teamService.updateProjectTeam(workspaceGuid, team);
      if (response && response.data?.success) {
        toast.success("Team updated successfully");
        setEditTeamDialogOpen(false);
        fetchProjectTeam();
      } else {
        toast.error(response.data?.message || "Failed to update team");
      }
    } catch (error) {
      console.error("Error updating team", error);
      toast.error("Failed to update team");
    } finally {
      setEditTeamLoading(false);
    }
  };

  // ── Add member to existing team (inside edit dialog) ──────────────────────
  const handleAddMemberToTeam = async () => {
    if (!addMemberSelectId) {
      toast.error("Please select a member to add");
      return;
    }
    // Prevent duplicates
    const alreadyIn = editTeamMembers.some(
      m => String(m.memberId) === String(addMemberSelectId)
    );
    if (alreadyIn) {
      toast.error("Member is already in this team");
      return;
    }
    // If setting a new leader, validate only one leader exists
    if (addMemberIsLeader && editTeamMembers.some(m => m.isLeader)) {
      toast.error("A team leader already exists. Remove the current leader first.");
      return;
    }

    setAddMemberLoading(true);
    try {
      const payload = {
        teamId:   editTeamId,
        memberId: parseInt(addMemberSelectId),
        isLeader: addMemberIsLeader,
      };
      const response = await teamService.addMemberToTeam(workspaceGuid, payload);
      if (response && response.data?.success) {
        // Optimistically update the local list
        const selected = workspaceMembers.find(
          m => String(m.memberId) === String(addMemberSelectId)
        );
        setEditTeamMembers(prev => [
          ...prev,
          {
            memberId:    parseInt(addMemberSelectId),
            profileId:   selected?.profile?.id,
            displayName: selected?.profile?.displayName ?? 'Member',
            avatarUrl:   selected?.profile?.profileImageUrl ?? '',
            isLeader:    addMemberIsLeader,
          },
        ]);
        setAddMemberSelectId('');
        setAddMemberIsLeader(false);
        toast.success("Member added to team");
        fetchProjectTeam();
      } else {
        toast.error(response.data?.message || "Failed to add member");
      }
    } catch (error) {
      console.error("Error adding member to team", error);
      toast.error("Failed to add member");
    } finally {
      setAddMemberLoading(false);
    }
  };

  // ── Remove member from existing team (inside edit dialog) ─────────────────
  const handleRemoveMemberFromTeam = async (memberId) => {
    setRemovingMemberId(memberId);
    try {
      const payload = { teamId: editTeamId, memberId };
      const response = await teamService.removeMemberFromTeam(workspaceGuid, payload);
      if (response && response.data?.success) {
        setEditTeamMembers(prev => prev.filter(m => m.memberId !== memberId));
        toast.success("Member removed from team");
        fetchProjectTeam();
      } else {
        toast.error(response.data?.message || "Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member from team", error);
      toast.error("Failed to remove member");
    } finally {
      setRemovingMemberId(null);
    }
  };

  // ── Open / submit delete team ─────────────────────────────────────────────
  const handleOpenDeleteTeam = (team) => {
    setDeleteTeamId(team.id ?? team.teamId);
    setDeleteTeamName(team.name ?? 'this team');
    setDeleteTeamDialogOpen(true);
  };

  const handleDeleteTeam = async () => {
    setDeleteTeamLoading(true);
    try {
      const response = await teamService.deleteProjectTeam(workspaceGuid, deleteTeamId);
      if (response && response.data?.success) {
        toast.success("Team deleted successfully");
        setDeleteTeamDialogOpen(false);
        fetchProjectTeam();
      } else {
        toast.error(response.data?.message || "Failed to delete team");
      }
    } catch (error) {
      console.error("Error deleting team", error);
      toast.error("Failed to delete team");
    } finally {
      setDeleteTeamLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  // Members available for the "add member" select — exclude already-in-team members
  const availableToAdd = workspaceMembers.filter(
    m => !editTeamMembers.some(em => em.memberId === m.memberId)
  );

  // Members available as leader in Create dialog (all workspace members)
  // Members available as non-leader in Create dialog (exclude chosen leader)
  const nonLeaderMembers = workspaceMembers.filter(
    m => String(m.memberId) !== String(customTeamFormData.teamLeaderId)
  );

  // ── Reusable member form fields ───────────────────────────────────────────
  const MemberFormFields = ({ data, errs, onChange, hidePassword = false }) => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Name <span className="text-red-500">*</span></Label>
        <Input value={data.memberName} onChange={e => onChange('memberName', e.target.value)}
          placeholder="Enter name" className={errs.memberName ? 'border-red-500' : ''} />
        {errs.memberName && <p className="text-xs text-red-500">{errs.memberName}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Email <span className="text-red-500">*</span></Label>
        <Input type="email" value={data.memberEmail} onChange={e => onChange('memberEmail', e.target.value)}
          placeholder="Enter email" className={errs.memberEmail ? 'border-red-500' : ''} />
        {errs.memberEmail && <p className="text-xs text-red-500">{errs.memberEmail}</p>}
      </div>

      {!hidePassword && (
        <div className="space-y-1.5">
          <Label>Password <span className="text-red-500">*</span></Label>
          <Input type="password" value={data.memberPassword} onChange={e => onChange('memberPassword', e.target.value)}
            placeholder="Enter password" className={errs.memberPassword ? 'border-red-500' : ''} />
          {errs.memberPassword && <p className="text-xs text-red-500">{errs.memberPassword}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status <span className="text-red-500">*</span></Label>
          <Select value={data.memberStatus} onValueChange={v => onChange('memberStatus', v)}>
            <SelectTrigger className={errs.memberStatus ? 'border-red-500 w-full' : 'w-full'}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserStatus.Active}>Active</SelectItem>
              <SelectItem value={UserStatus.InActive}>Inactive</SelectItem>
              <SelectItem value={UserStatus.Pending}>Pending</SelectItem>
            </SelectContent>
          </Select>
          {errs.memberStatus && <p className="text-xs text-red-500">{errs.memberStatus}</p>}
        </div>
        <div className="space-y-2">
          <Label>Role <span className="text-red-500">*</span></Label>
          <Select value={data.memberRole} onValueChange={v => onChange('memberRole', v)}>
            <SelectTrigger className={errs.memberRole ? 'border-red-500 w-full' : 'w-full'}>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RoleEnum.Owner}>Owner</SelectItem>
              <SelectItem value={RoleEnum.Admin}>Admin</SelectItem>
              <SelectItem value={RoleEnum.Manager}>Manager</SelectItem>
              <SelectItem value={RoleEnum.Member}>Member</SelectItem>
              <SelectItem value={RoleEnum.Viewer}>Viewer</SelectItem>
            </SelectContent>
          </Select>
          {errs.memberRole && <p className="text-xs text-red-500">{errs.memberRole}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Department <span className="text-red-500">*</span></Label>
          <Select value={data.memberDepartment} onValueChange={v => onChange('memberDepartment', v)}>
            <SelectTrigger className={errs.memberDepartment ? 'border-red-500 w-full' : 'w-full'}>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Department.Technical}>Technical</SelectItem>
              <SelectItem value={Department.Sales}>Sales</SelectItem>
              <SelectItem value={Department.Marketing}>Marketing</SelectItem>
              <SelectItem value={Department.HumanResources}>Human Resources</SelectItem>
              <SelectItem value={Department.Finance}>Finance</SelectItem>
              <SelectItem value={Department.Operations}>Operations</SelectItem>
              <SelectItem value={Department.CustomerSupport}>Customer Support</SelectItem>
              <SelectItem value={Department.Legal}>Legal</SelectItem>
              <SelectItem value={Department.ResearchAndDevelopment}>R&D</SelectItem>
              <SelectItem value={Department.IT}>IT</SelectItem>
              <SelectItem value={Department.Administration}>Administration</SelectItem>
            </SelectContent>
          </Select>
          {errs.memberDepartment && <p className="text-xs text-red-500">{errs.memberDepartment}</p>}
        </div>
        <div className="space-y-2">
          <Label>Position <span className="text-red-500">*</span></Label>
          <Select value={data.memberPosition} onValueChange={v => onChange('memberPosition', v)}
            disabled={!data.memberDepartment}>
            <SelectTrigger className={errs.memberPosition ? 'border-red-500 w-full' : 'w-full'}>
              <SelectValue placeholder={data.memberDepartment ? "Select position" : "Select department first"} />
            </SelectTrigger>
            <SelectContent>
              {(DEPARTMENT_POSITIONS[data.memberDepartment] ?? []).map(id => (
                <SelectItem key={id} value={id}>{POSITION_LABELS[id]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errs.memberPosition && <p className="text-xs text-red-500">{errs.memberPosition}</p>}
        </div>
      </div>
    </div>
  );

  // ── Avatar initials helper ────────────────────────────────────────────────
  const Initials = ({ name, size = 'sm' }) => {
    const letters = (name ?? '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-xs';
    return (
      <span className={`${sz} rounded-full bg-primary/10 text-primary font-medium flex items-center justify-center shrink-0`}>
        {letters}
      </span>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full overflow-x-hidden px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 pt-5 border-b border-border pb-5">
        <div>
          <h1 className="text-xl font-semibold">Teams</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Organize, manage, and empower your teams effortlessly.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-teams">All Members</TabsTrigger>
          <TabsTrigger value="project-team">Project Teams</TabsTrigger>
          <TabsTrigger value="department">Departments</TabsTrigger>
        </TabsList>

        {/* ── All Members tab ── */}
        <TabsContent value="all-teams" className="mt-5">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search by name or role" value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)} className="pl-10 h-9" />
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <FilterIcon className="w-4 h-4 mr-1.5" /> Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked={showName}       onCheckedChange={setShowName}>Name</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={showEmail}      onCheckedChange={setShowEmail}>Email</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={showRole}       onCheckedChange={setShowRole}>Role</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={showDepartment} onCheckedChange={setShowDepartment}>Department</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={showStatus}     onCheckedChange={setShowStatus}>Status</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Add Member Dialog */}
                <Dialog open={memberDialogOpen} onOpenChange={(o) => {
                  setMemberDialogOpen(o);
                  if (!o) { setFormData(INITIAL_MEMBER_FORM); setErrors({}); }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-9 text-white">
                      <Plus className="w-4 h-4 mr-1.5" /> Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] p-0 gap-0">
                    <DialogHeader className="px-6 py-4 border-b border-border">
                      <DialogTitle className="text-base font-semibold">Add new member</DialogTitle>
                      <DialogDescription className="text-sm mt-0.5">Fill in the details to invite a new team member.</DialogDescription>
                    </DialogHeader>
                    <div className="px-6 py-5 overflow-y-auto max-h-[65vh]">
                      <MemberFormFields data={formData} errs={errors} onChange={handleInputChange} />
                    </div>
                    <DialogFooter className="px-6 py-4 border-t border-border gap-2">
                      <Button variant="outline" size="sm" className="h-9"
                        onClick={() => { setMemberDialogOpen(false); setFormData(INITIAL_MEMBER_FORM); setErrors({}); }}
                        disabled={memberLoading}>Cancel</Button>
                      <Button size="sm" className="h-9 min-w-[100px] text-white" onClick={handleAddMember} disabled={memberLoading}>
                        {memberLoading
                          ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span>
                          : 'Add Member'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <TeamDataTable
              teamMembers={workspaceMembers}
              onEdit={handleOpenEditMember}
              onDelete={handleOpenDeleteMember}
            />
          </div>
        </TabsContent>

        {/* ── Project Teams tab ── */}
        <TabsContent value="project-team" className="mt-5">
          <div className="flex justify-end mb-4">
            {/* ── Create Team Dialog ── */}
            <Dialog open={customTeamDialogOpen} onOpenChange={(o) => {
              setCustomTeamDialogOpen(o);
              if (!o) { setCustomTeamFormData(INITIAL_CUSTOM_TEAM_FORM); setCustomTeamErrors({}); }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 text-white">
                  <Plus className="w-4 h-4 mr-1.5" /> New Team
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b border-border">
                  <DialogTitle className="text-base font-semibold">Create project team</DialogTitle>
                  <DialogDescription className="text-sm mt-0.5">Group members into a focused project team.</DialogDescription>
                </DialogHeader>

                <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[65vh]">
                  {/* Team name */}
                  <div className="space-y-1.5">
                    <Label>Team name <span className="text-red-500">*</span></Label>
                    <Input
                      value={customTeamFormData.teamName}
                      onChange={e => handleCustomTeamInputChange('teamName', e.target.value)}
                      placeholder="Enter team name"
                      className={customTeamErrors.teamName ? 'border-red-500' : ''}
                    />
                    {customTeamErrors.teamName && <p className="text-xs text-red-500">{customTeamErrors.teamName}</p>}
                  </div>

                  {/* Tagline */}
                  <div className="space-y-1.5">
                    <Label>Tagline <span className="text-red-500">*</span></Label>
                    <Input
                      value={customTeamFormData.tagline}
                      onChange={e => handleCustomTeamInputChange('tagline', e.target.value)}
                      placeholder="Short catchy tagline"
                      className={customTeamErrors.tagline ? 'border-red-500' : ''}
                    />
                    {customTeamErrors.tagline && <p className="text-xs text-red-500">{customTeamErrors.tagline}</p>}
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Input
                      value={customTeamFormData.teamDescription}
                      onChange={e => handleCustomTeamInputChange('teamDescription', e.target.value)}
                      placeholder="Brief description (optional)"
                    />
                  </div>

                  {/* Team Leader — required */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      Team Leader <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={customTeamFormData.teamLeaderId}
                      onValueChange={v => {
                        handleCustomTeamInputChange('teamLeaderId', v);
                        // If leader was already in members list, remove them
                        setCustomTeamFormData(prev => ({
                          ...prev,
                          teamLeaderId: v,
                          teamMembers: prev.teamMembers.filter(id => id !== v),
                        }));
                      }}
                    >
                      <SelectTrigger className={customTeamErrors.teamLeaderId ? 'border-red-500 w-full' : 'w-full'}>
                        <SelectValue placeholder="Select team leader" />
                      </SelectTrigger>
                      <SelectContent>
                        {workspaceMembers.map(member => (
                          <SelectItem key={member.memberId} value={String(member.memberId)}>
                            <span className="flex items-center gap-2">
                              <Crown className="w-3 h-3 text-amber-500" />
                              {member.profile?.displayName}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {customTeamErrors.teamLeaderId && (
                      <p className="text-xs text-red-500">{customTeamErrors.teamLeaderId}</p>
                    )}
                    {/* Show selected leader as a pill */}
                    {customTeamFormData.teamLeaderId && (() => {
                      const leader = workspaceMembers.find(
                        m => String(m.memberId) === String(customTeamFormData.teamLeaderId)
                      );
                      return leader ? (
                        <div className="flex items-center gap-2 mt-1.5 px-2.5 py-1.5 rounded-md bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 w-fit">
                          <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                            {leader.profile?.displayName}
                          </span>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Other members — optional, leader excluded */}
                  <div className="space-y-1.5">
                    <Label>
                      Members{' '}
                      <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                    </Label>
                    <Select
                      value=""
                      onValueChange={v => {
                        setCustomTeamFormData(prev => ({
                          ...prev,
                          teamMembers: prev.teamMembers.includes(v)
                            ? prev.teamMembers.filter(id => id !== v)
                            : [...prev.teamMembers, v],
                        }));
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            customTeamFormData.teamMembers.length > 0
                              ? `${customTeamFormData.teamMembers.length} member${customTeamFormData.teamMembers.length > 1 ? 's' : ''} selected`
                              : 'Add members'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {nonLeaderMembers.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-muted-foreground">
                            {customTeamFormData.teamLeaderId
                              ? 'No other members available'
                              : 'Select a leader first'}
                          </div>
                        ) : (
                          nonLeaderMembers.map(member => {
                            const selected = customTeamFormData.teamMembers.includes(String(member.memberId));
                            return (
                              <SelectItem key={member.memberId} value={String(member.memberId)}>
                                <span className="flex items-center gap-2">
                                  {selected && <span className="w-2 h-2 rounded-full bg-primary inline-block" />}
                                  {member.profile?.displayName}
                                  {selected && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
                                </span>
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>

                    {/* Selected members pills */}
                    {customTeamFormData.teamMembers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {customTeamFormData.teamMembers.map(id => {
                          const m = workspaceMembers.find(wm => String(wm.memberId) === String(id));
                          return (
                            <span
                              key={id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-secondary border border-border"
                            >
                              {m?.profile?.displayName ?? id}
                              <button
                                type="button"
                                className="ml-0.5 hover:text-red-500 transition-colors"
                                onClick={() =>
                                  setCustomTeamFormData(prev => ({
                                    ...prev,
                                    teamMembers: prev.teamMembers.filter(mid => mid !== id),
                                  }))
                                }
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-border gap-2">
                  <Button variant="outline" size="sm" className="h-9"
                    onClick={() => { setCustomTeamDialogOpen(false); setCustomTeamFormData(INITIAL_CUSTOM_TEAM_FORM); setCustomTeamErrors({}); }}
                    disabled={customTeamLoading}>
                    Cancel
                  </Button>
                  <Button size="sm" className="h-9 min-w-[110px] text-white" onClick={handleAddCustomTeam} disabled={customTeamLoading}>
                    {customTeamLoading
                      ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</span>
                      : 'Create Team'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {customTeam.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm font-medium">No project teams yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first team to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {customTeam.map(team => (
                <TeamProjectCard
                  key={team.id ?? team.teamId}
                  team={team}
                  onEdit={handleOpenEditTeam}
                  onDelete={handleOpenDeleteTeam}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Departments tab ── */}
        <TabsContent value="department" className="mt-5">
          {departmentTeam.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">No departments found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {departmentTeam.map(dept => (
                <DepartmentCard key={dept.id} department={dept} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ════════════════════ Edit Member Dialog ════════════════════ */}
      <Dialog open={editDialogOpen} onOpenChange={(o) => { setEditDialogOpen(o); if (!o) setEditErrors({}); }}>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-base font-semibold">Edit member</DialogTitle>
            <DialogDescription className="text-sm mt-0.5">Update this member's details and access.</DialogDescription>
          </DialogHeader>
          <div className="px-6 py-5 overflow-y-auto max-h-[65vh]">
            <MemberFormFields data={editFormData} errs={editErrors} onChange={handleEditInputChange} hidePassword />
          </div>
          <DialogFooter className="px-6 py-4 border-t border-border gap-2">
            <Button variant="outline" size="sm" className="h-9" onClick={() => setEditDialogOpen(false)} disabled={editLoading}>Cancel</Button>
            <Button size="sm" className="h-9 min-w-[110px] text-white" onClick={handleEditMember} disabled={editLoading}>
              {editLoading
                ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span>
                : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════ Delete Member Dialog ════════════════════ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Trash2 className="w-4 h-4 text-red-500" /> Remove member
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm">Are you sure you want to remove <span className="font-semibold">"{deleteMemberName}"</span> from the workspace?</p>
            <p className="text-xs text-red-500 mt-1.5">This action cannot be undone.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="h-9" onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>Cancel</Button>
            <Button variant="destructive" size="sm" className="h-9 min-w-[100px]" onClick={handleDeleteMember} disabled={deleteLoading}>
              {deleteLoading
                ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Removing...</span>
                : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════ Edit Custom Team Dialog (tabbed) ════════════════════ */}
      <Dialog open={editTeamDialogOpen} onOpenChange={(o) => {
        setEditTeamDialogOpen(o);
        if (!o) { setEditTeamErrors({}); setEditTeamTab('details'); }
      }}>
        <DialogContent className="sm:max-w-[520px] p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-base font-semibold">Edit team</DialogTitle>
            <DialogDescription className="text-sm mt-0.5">Update team info or manage its members.</DialogDescription>
          </DialogHeader>

          {/* Inner tabs */}
          <Tabs value={editTeamTab} onValueChange={setEditTeamTab} className="w-full">
            <div className="px-6 pt-3">
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="details"  className="text-xs">Details</TabsTrigger>
                <TabsTrigger value="members"  className="text-xs">
                  Members
                  {editTeamMembers.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-medium">
                      {editTeamMembers.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ── Details tab ── */}
            <TabsContent value="details" className="mt-0">
              <div className="px-6 py-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>Team name <span className="text-red-500">*</span></Label>
                  <Input
                    value={editTeamData.teamName}
                    onChange={e => handleEditTeamInputChange('teamName', e.target.value)}
                    className={editTeamErrors.teamName ? 'border-red-500' : ''}
                  />
                  {editTeamErrors.teamName && <p className="text-xs text-red-500">{editTeamErrors.teamName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Tagline <span className="text-red-500">*</span></Label>
                  <Input
                    value={editTeamData.tagline}
                    onChange={e => handleEditTeamInputChange('tagline', e.target.value)}
                    className={editTeamErrors.tagline ? 'border-red-500' : ''}
                  />
                  {editTeamErrors.tagline && <p className="text-xs text-red-500">{editTeamErrors.tagline}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Input
                    value={editTeamData.teamDescription}
                    onChange={e => handleEditTeamInputChange('teamDescription', e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="px-6 py-4 border-t border-border gap-2">
                <Button variant="outline" size="sm" className="h-9" onClick={() => setEditTeamDialogOpen(false)} disabled={editTeamLoading}>
                  Cancel
                </Button>
                <Button size="sm" className="h-9 min-w-[110px] text-white" onClick={handleEditTeam} disabled={editTeamLoading}>
                  {editTeamLoading
                    ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span>
                    : 'Save Changes'}
                </Button>
              </DialogFooter>
            </TabsContent>

            {/* ── Members tab ── */}
            <TabsContent value="members" className="mt-0">
              <div className="px-6 py-5 space-y-4">

                {/* Current members list */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Current members</Label>
                  {editTeamMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-3 text-center">No members yet.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {editTeamMembers.map(m => (
                        <div
                          key={m.memberId}
                          className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-secondary/30"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Initials name={m.displayName} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate leading-tight">{m.displayName}</p>
                              {m.isLeader && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                  <Crown className="w-2.5 h-2.5" /> Leader
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={removingMemberId === m.memberId}
                            onClick={() => handleRemoveMemberFromTeam(m.memberId)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-40"
                          >
                            {removingMemberId === m.memberId
                              ? <span className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin block" />
                              : <UserMinus className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Add member section */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Add member</Label>
                  <div className="flex gap-2">
                    <Select value={addMemberSelectId} onValueChange={setAddMemberSelectId}>
                      <SelectTrigger className="flex-1 h-9">
                        <SelectValue placeholder="Select member to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableToAdd.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-muted-foreground">All members already added</div>
                        ) : (
                          availableToAdd.map(member => (
                            <SelectItem key={member.memberId} value={String(member.memberId)}>
                              {member.profile?.displayName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 px-3 shrink-0"
                      onClick={handleAddMemberToTeam}
                      disabled={!addMemberSelectId || addMemberLoading}
                    >
                      {addMemberLoading
                        ? <span className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                        : <UserPlus className="w-4 h-4" />}
                    </Button>
                  </div>

                  {/* Make leader toggle */}
                  <label className="flex items-center gap-2 cursor-pointer w-fit mt-1">
                    <input
                      type="checkbox"
                      checked={addMemberIsLeader}
                      onChange={e => setAddMemberIsLeader(e.target.checked)}
                      className="w-3.5 h-3.5 rounded accent-amber-500"
                    />
                    <span className="text-xs flex items-center gap-1 text-muted-foreground">
                      <Crown className="w-3 h-3 text-amber-500" />
                      Add as team leader
                    </span>
                    {addMemberIsLeader && editTeamMembers.some(m => m.isLeader) && (
                      <span className="text-[10px] text-red-500">(current leader will remain — remove them first)</span>
                    )}
                  </label>
                </div>
              </div>

              <DialogFooter className="px-6 py-4 border-t border-border">
                <Button variant="outline" size="sm" className="h-9" onClick={() => setEditTeamDialogOpen(false)}>
                  Done
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* ════════════════════ Delete Custom Team Dialog ════════════════════ */}
      <Dialog open={deleteTeamDialogOpen} onOpenChange={setDeleteTeamDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Trash2 className="w-4 h-4 text-red-500" /> Delete team
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm">Are you sure you want to delete <span className="font-semibold">"{deleteTeamName}"</span>?</p>
            <p className="text-xs text-red-500 mt-1.5">This action cannot be undone.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="h-9" onClick={() => setDeleteTeamDialogOpen(false)} disabled={deleteTeamLoading}>Cancel</Button>
            <Button variant="destructive" size="sm" className="h-9 min-w-[100px]" onClick={handleDeleteTeam} disabled={deleteTeamLoading}>
              {deleteTeamLoading
                ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</span>
                : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Team;