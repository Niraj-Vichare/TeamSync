import DepartmentCard from '@/components/teamComponents/DepartmentCard';
import TeamDataTable from '@/components/teamComponents/TeamDataTable';
import TeamProjectCard from '@/components/teamComponents/TeamProjectCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Department, RoleEnum, UserStatus, WorkspacePosition } from '@/data/general';
import teamService from '@/services/team';
import { FilterIcon, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

// ── Department → allowed positions mapping (matches backend IDs) ──────────────
const DEPARTMENT_POSITIONS = {
  [Department.Technical]:             ["6","7","8","10","9","5","12"],
  [Department.Sales]:                 ["13","9","12"],
  [Department.Marketing]:             ["8","9","4","12"],
  [Department.HumanResources]:        ["1","11","12"],
  [Department.Finance]:               ["9","1","12"],
  [Department.Operations]:            ["5","10","9","11","12"],
  [Department.CustomerSupport]:       ["11","12"],
  [Department.Legal]:                 ["1","12"],
  [Department.ResearchAndDevelopment]:["8","12"],
  [Department.IT]:                    ["11","12"],
  [Department.Administration]:        ["1","2","3","4","5","12"],
};

const POSITION_LABELS = {
  "1":"Admin","2":"CEO","3":"CTO","4":"Product Manager",
  "5":"Project Manager","6":"Developer","7":"Tester",
  "8":"Designer","9":"Business Analyst","10":"DevOps",
  "11":"Support","12":"Guest","13":"Sales Manager",
};

// ── Initial form states ───────────────────────────────────────────────────────
const INITIAL_MEMBER_FORM = {
  Id:0,memberName: '', memberRole: '', memberPassword: '',
  memberEmail: '', memberDepartment: '', memberPosition: '', memberStatus: ''
};

const INITIAL_CUSTOM_TEAM_FORM = {
  teamId:0,teamName: '', teamDescription: '', tagline: '', teamMembers: []
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
  const [editDialogOpen,   setEditDialogOpen]   = useState(false);
  const [editLoading,      setEditLoading]      = useState(false);
  const [editFormData,     setEditFormData]     = useState(INITIAL_MEMBER_FORM);
  const [editErrors,       setEditErrors]       = useState({});
  const [editMemberId,   setEditMemberId]   = useState(null);

  // ── Delete member dialog ──────────────────────────────────────────────────
  const [deleteDialogOpen,  setDeleteDialogOpen]  = useState(false);
  const [deleteLoading,     setDeleteLoading]     = useState(false);
  const [deleteMemberId,  setDeleteMemberId]  = useState(null);
  const [deleteMemberName,  setDeleteMemberName]  = useState('');

  // ── Custom team dialog ────────────────────────────────────────────────────
  const [customTeamDialogOpen, setCustomTeamDialogOpen] = useState(false);
  const [customTeamLoading,    setCustomTeamLoading]    = useState(false);
  const [customTeamFormData,   setCustomTeamFormData]   = useState(INITIAL_CUSTOM_TEAM_FORM);
  const [customTeamErrors,     setCustomTeamErrors]     = useState({});

  // ── Edit custom team dialog ───────────────────────────────────────────────
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [editTeamLoading,    setEditTeamLoading]    = useState(false);
  const [editTeamData,       setEditTeamData]       = useState({ teamName:'', teamDescription:'', tagline:'' });
  const [editTeamErrors,     setEditTeamErrors]     = useState({});
  const [editTeamId,         setEditTeamId]         = useState(null);

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
      const response = await teamService.getProjectTeam(workspaceGuid, searchTerm, pageNumber, pageSize);
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
    if (activeTab === 'all-teams')      fetchWorkspaceMembers();
    else if (activeTab === 'project-team') fetchProjectTeam();
    else if (activeTab === 'department')   fetchDepartmentTeams();
  }, [activeTab]);

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

  // ── Open edit member dialog ───────────────────────────────────────────────
  const handleOpenEditMember = (memberId, member) => {
    setEditMemberId(memberId);
    setEditFormData({
      Id:       member.profile?.id ?? 0,
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

  // ── Edit member ───────────────────────────────────────────────────────────
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
        profile: { Id:editFormData.Id,displayName: editFormData.memberName, email: editFormData.memberEmail },
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

  // ── Open delete member dialog ─────────────────────────────────────────────
  const handleOpenDeleteMember = (memberId, member) => {
    setDeleteMemberId(memberId);
    setDeleteMemberName(member.profile?.displayName ?? 'this member');
    setDeleteDialogOpen(true);
  };

  // ── Delete member ─────────────────────────────────────────────────────────
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

  // ── Add custom team ───────────────────────────────────────────────────────
  const handleAddCustomTeam = async () => {
    const errs = {};
    if (!customTeamFormData.teamName) errs.teamName = 'Team name is required';
    if (!customTeamFormData.tagline)  errs.tagline  = 'Tagline is required';
    setCustomTeamErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setCustomTeamLoading(true);
    try {
      const team = {
        name:        customTeamFormData.teamName,
        description: customTeamFormData.teamDescription,
        tagline:     customTeamFormData.tagline,
        members:     customTeamFormData.teamMembers,
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

  // ── Open edit custom team dialog ──────────────────────────────────────────
  const handleOpenEditTeam = (team) => {
    setEditTeamId(team.id);
    setEditTeamData({ teamName: team.name ?? '', teamDescription: team.description ?? '', tagline: team.tagline ?? '' });
    setEditTeamErrors({});
    setEditTeamDialogOpen(true);
  };

  // ── Edit custom team ──────────────────────────────────────────────────────
  const handleEditTeam = async () => {
    const errs = {};
    if (!editTeamData.teamName) errs.teamName = 'Team name is required';
    if (!editTeamData.tagline)  errs.tagline  = 'Tagline is required';
    setEditTeamErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setEditTeamLoading(true);
    try {
      const team = { id: editTeamId, name: editTeamData.teamName, description: editTeamData.teamDescription, tagline: editTeamData.tagline };
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

  // ── Open delete custom team dialog ────────────────────────────────────────
  const handleOpenDeleteTeam = (team) => {
    setDeleteTeamId(team.id);
    setDeleteTeamName(team.name ?? 'this team');
    setDeleteTeamDialogOpen(true);
  };

  // ── Delete custom team ────────────────────────────────────────────────────
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
            <SelectTrigger className={errs.memberPosition ? 'border-red-500 w-full' : 'w-full '}>
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

                {/* ── Add Member Dialog ── */}
                <Dialog open={memberDialogOpen} onOpenChange={(o) => { setMemberDialogOpen(o); if (!o) { setFormData(INITIAL_MEMBER_FORM); setErrors({}); } }}>
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
                        {memberLoading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : 'Add Member'}
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
            <Dialog open={customTeamDialogOpen} onOpenChange={(o) => { setCustomTeamDialogOpen(o); if (!o) { setCustomTeamFormData(INITIAL_CUSTOM_TEAM_FORM); setCustomTeamErrors({}); } }}>
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
                <div className="px-6 py-5 space-y-4">
                  <div className="space-y-2">
                    <Label>Team name <span className="text-red-500">*</span></Label>
                    <Input value={customTeamFormData.teamName} onChange={e => handleCustomTeamInputChange('teamName', e.target.value)}
                      placeholder="Enter team name" className={customTeamErrors.teamName ? 'border-red-500' : ''} />
                    {customTeamErrors.teamName && <p className="text-xs text-red-500">{customTeamErrors.teamName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Tagline <span className="text-red-500">*</span></Label>
                    <Input value={customTeamFormData.tagline} onChange={e => handleCustomTeamInputChange('tagline', e.target.value)}
                      placeholder="Short catchy tagline" className={customTeamErrors.tagline ? 'border-red-500' : ''} />
                    {customTeamErrors.tagline && <p className="text-xs text-red-500">{customTeamErrors.tagline}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={customTeamFormData.teamDescription} onChange={e => handleCustomTeamInputChange('teamDescription', e.target.value)}
                      placeholder="Brief description (optional)" />
                  </div>
                  <div className="space-y-2">
                    <Label>Members <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
                    <Select onValueChange={v => {
                      setCustomTeamFormData(prev => ({
                        ...prev,
                        teamMembers: prev.teamMembers.includes(v)
                          ? prev.teamMembers.filter(id => id !== v)
                          : [...prev.teamMembers, v]
                      }));
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder={customTeamFormData.teamMembers.length > 0 ? `${customTeamFormData.teamMembers.length} selected` : "Select members"} />
                      </SelectTrigger>
                      <SelectContent>
                        {workspaceMembers.map(member => (
                          <SelectItem key={member.profile?.id} value={String(member.profile?.id)}>
                            {member.profile?.displayName}
                            {customTeamFormData.teamMembers.includes(String(member.profile?.id)) ? ' ✓' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="px-6 py-4 border-t border-border gap-2">
                  <Button variant="outline" size="sm" className="h-9"
                    onClick={() => { setCustomTeamDialogOpen(false); setCustomTeamFormData(INITIAL_CUSTOM_TEAM_FORM); setCustomTeamErrors({}); }}
                    disabled={customTeamLoading}>Cancel</Button>
                  <Button size="sm" className="h-9 min-w-[110px] text-white" onClick={handleAddCustomTeam} disabled={customTeamLoading}>
                    {customTeamLoading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</span> : 'Create Team'}
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
                <TeamProjectCard key={team.id} team={team}
                  onEdit={handleOpenEditTeam} onDelete={handleOpenDeleteTeam} />
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

      {/* ── Edit Member Dialog ── */}
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
              {editLoading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Member Dialog ── */}
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
              {deleteLoading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Removing...</span> : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Custom Team Dialog ── */}
      <Dialog open={editTeamDialogOpen} onOpenChange={(o) => { setEditTeamDialogOpen(o); if (!o) setEditTeamErrors({}); }}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-base font-semibold">Edit team</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Team name <span className="text-red-500">*</span></Label>
              <Input value={editTeamData.teamName} onChange={e => handleEditTeamInputChange('teamName', e.target.value)}
                className={editTeamErrors.teamName ? 'border-red-500' : ''} />
              {editTeamErrors.teamName && <p className="text-xs text-red-500">{editTeamErrors.teamName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Tagline <span className="text-red-500">*</span></Label>
              <Input value={editTeamData.tagline} onChange={e => handleEditTeamInputChange('tagline', e.target.value)}
                className={editTeamErrors.tagline ? 'border-red-500' : ''} />
              {editTeamErrors.tagline && <p className="text-xs text-red-500">{editTeamErrors.tagline}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={editTeamData.teamDescription} onChange={e => handleEditTeamInputChange('teamDescription', e.target.value)} />
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-border gap-2">
            <Button variant="outline" size="sm" className="h-9" onClick={() => setEditTeamDialogOpen(false)} disabled={editTeamLoading}>Cancel</Button>
            <Button size="sm" className="h-9 min-w-[110px] text-white" onClick={handleEditTeam} disabled={editTeamLoading}>
              {editTeamLoading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Custom Team Dialog ── */}
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
              {deleteTeamLoading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</span> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Team;