import DepartmentCard from '@/components/teamComponents/DepartmentCard';
import TeamDataTable from '@/components/teamComponents/TeamDataTable';
import TeamProjectCard from '@/components/teamComponents/TeamProjectCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/context/AuthContext';
import {  teamMembers,projectTeam, departments, Department, RoleEnum, UserStatus, WorkspacePosition } from '@/data/general';
import teamService from '@/services/team';
import { set } from 'date-fns';
import { Filter, FilterIcon, Plus, Search, Tag } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

function Team() {
  const [activeTab, setActiveTab] = useState('all-teams');
  const [showName, setShowName] = useState(true)
  const [showEmail, setShowEmail] = useState(false)
  const [showRole, setShowRole] = useState(false)
  const [showDepartment, setShowDepartment] = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  
  const [customTeam,setCustomTeam] = useState([]);
  const [departmentTeam,setDepartmentTeam] = useState([]);
  
  const [workspaceMembers,setWorkspaceMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber,setPageNumber] = useState(1);
  const [pageSize,setPageSize] = useState(10);

  const [memberDialogOpen,setMemberDialogOpen] = useState(false);
  const [memberLoading,setMemberLoading] = useState(false);
  const [formData,setFormData] = useState({
    memberName:'',
    memberRole:'',
    memberPassword:'',  
    memberEmail:'',
    memberDepartment:'',
    memberPosition:'',
    memberStatus:''
  });
  const [errors,setErrors] = useState({});

  const [customTeamDialogOpen,setCustomTeamDialogOpen] = useState(false);
  const [customTeamLoading,setCustomTeamLoading] = useState(false);
  const [customTeamFormData,setCustomTeamFormData] = useState({
    teamName:'',
    teamDescription:'',
    teamMembers:[],
    tagline:'',
  });
  const [customTeamErrors,setCustomTeamErrors] = useState({});


  const {getCurrentWorkspaceId} = useAuth();
  const workspaceGuid = getCurrentWorkspaceId();

  const handleAddMember=async()=>{
    debugger;
    // Validate form data
    const newErrors = {};
    if (!formData.memberName) newErrors.memberName = 'Member name is required';
    if(!formData.memberPassword) newErrors.memberPassword = 'Password is required';
    if (!formData.memberEmail) newErrors.memberEmail = 'Member email is required';
    if (!formData.memberRole) newErrors.memberRole = 'Member role is required';
    if (!formData.memberDepartment) newErrors.memberDepartment = 'Member department is required';
    if(!formData.memberPosition) newErrors.memberPosition = 'Member position is required';
    if (!formData.memberStatus) newErrors.memberStatus = 'Member status is required';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return; // Stop if there are validation errors
    }
    setMemberLoading(true);
    try{
      const member = {
        profile:{
          displayName:formData.memberName,
          email:formData.memberEmail,
          password:formData.memberPassword,
          guid:'',
          bio:'',
          workspaceId:workspaceGuid,
        },
        roleId:parseInt(formData.memberRole),
        positionId:parseInt(formData.memberPosition),
        departmentId:parseInt(formData.memberDepartment),
        statusId:parseInt(formData.memberStatus),
      };
      var response = await teamService.addTeamMember(workspaceGuid,member);
      if(response && response.data?.success)
      {
        setMemberDialogOpen(false);
        fetchWorkspaceMembers(workspaceGuid);
        toast.success("Team member added successfully");
      }
    }catch(error){
      console.error("Error while adding the team member",error);
      toast.error("Error while adding the team member");
    }
  }

  const handleAddCustomTeam=async()=>{
    // Validate form data
    const newErrors = {};
    if (!customTeamFormData.teamName) newErrors.teamName = 'Team name is required';
    if (!customTeamFormData.tagline) newErrors.tagline = 'Tagline is required';
    setCustomTeamErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return; // Stop if there are validation errors
    }
    setCustomTeamLoading(true);
    try{
      const team = {
        name:customTeamFormData.teamName,
        description:customTeamFormData.teamDescription,
        tagline:customTeamFormData.tagline,
        members:customTeamFormData.teamMembers,
      };
      var response = await teamService.createProjectTeam(workspaceGuid,team);
      if(response && response.success){
        setCustomTeamDialogOpen(false);
        fetchProjectTeam(workspaceGuid);
        toast.success("Custom team added successfully");
      }
    }catch(error){
      console.error("Error while adding the custom team",error);
      toast.error("Error while adding the custom team");
    }
  }
  const fetchWorkspaceMembers=async(workspaceGuid)=>{
    try{
     var response =await teamService.getTeamMembers(workspaceGuid,searchTerm,pageNumber,pageSize);
     if(response && response.success){
      setWorkspaceMembers(response.data);
     }else{
      setWorkspaceMembers([]);
     }
    }catch(error){
      console.error("Error while fetching the workspace members");
    }finally{
      console.log(workspaceMembers);
    }
  }

  const fetchProjectTeam = async()=>{
    try{
     var response =await teamService.getProjectTeam(workspaceGuid,searchTerm,pageNumber,pageSize);
     if(response && response.success){
      setCustomTeam(response.data);
     }else{
       setCustomTeam([]);
     }
    }catch(error){
      console.error("Error while fetching the workspace members");
    }finally{
      console.log(customTeam);
    }
  }
  const fetchDepartmentTeams=async()=>{
    try{
     var response =await teamService.getDepartmentTeams(workspaceGuid);
     console.log(response);
     if(response && response.success){
      setDepartmentTeam(response.data);
     }else{
       setDepartmentTeam([]);
     }
    }catch(error){
      console.error("Error while fetching the workspace members");
    }finally{
      console.log(departmentTeam);
    }

  }

  const handleMemberDialogOpen=(open)=>{
    console.log("handleMemberDialogOpen",open);
    setMemberDialogOpen(open);
    if(!open){
      setFormData({
        memberName:'',
        memberRole:'',
        memberEmail:'',
        memberDepartment:'',
        memberPosition:'',
        memberStatus:''
      });
      setErrors({});
      setMemberLoading(false);
    }
  }

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" })); // clear error on change
  };

  useEffect(()=>{
    if(activeTab == "all-teams"){
      fetchWorkspaceMembers(workspaceGuid);
    }else if(activeTab == "project-team"){
      fetchProjectTeam(workspaceGuid);
    }else if(activeTab == "department")
      fetchDepartmentTeams(workspaceGuid);

  },[activeTab])



  return (
    <div className="w-full overflow-x-hidden px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-2xl font-bold mb-1'>Teams</h1>
          <p className='text-sm text-muted-foreground'>
            Organize, manage, and empower your teams effortlessly.
          </p>
        </div>

      </div>
      {/* Filter */}
      <div className='flex justify-between items-center mb-6'>
        {/* Search Box */}
        <div>

        </div>
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all-teams" currentValue={activeTab}
              onValueChange={setActiveTab}
              className="flex items-center gap-2">
              All Teams
            </TabsTrigger>
            <TabsTrigger value="project-team" currentValue={activeTab}
              onValueChange={setActiveTab}
              className="flex items-center gap-2">
              Project Team
            </TabsTrigger>
            <TabsTrigger value="department" currentValue={activeTab} onValueChange={setActiveTab} className='flex items-center gap-2'>
              Department
            </TabsTrigger>
          </TabsList>

          <TabsContent value='all-teams' currentValue={activeTab} className={'mt-5'}>
            <div className="space-y-4">
              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by name or role"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <FilterIcon />
                        Filters
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>Columns</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuCheckboxItem
                        checked={showName}
                        onCheckedChange={setShowName}
                      >
                        Name
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={showEmail}
                        onCheckedChange={setShowEmail}
                      >
                        Email
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={showRole}
                        onCheckedChange={setShowRole}
                      >
                        Role
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={showDepartment}
                        onCheckedChange={setShowDepartment}
                      >
                        Department
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={showStatus}
                        onCheckedChange={setShowStatus}
                      >
                        Status
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Dialog open={memberDialogOpen} onOpenChange={handleMemberDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="text-white">
                        <Plus className="w-4 h-4" />
                        <span>Add Member</span>
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[700px]">
                      <DialogHeader className="mb-4">
                        <DialogTitle>Add New Team Member</DialogTitle>
                        <DialogDescription>
                          Capture core identity, access level, and org alignment.
                        </DialogDescription>
                      </DialogHeader>

                      {/* Name */}
                      <div className="space-y-2">
                        <Label htmlFor="memberName">Member Name *</Label>
                        <Input
                          id="memberName"
                          value={formData.memberName}
                          onChange={(e) => handleInputChange("memberName", e.target.value)}
                          placeholder="Enter member name"
                          className={errors.memberName ? "border-red-500" : ""}
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="memberEmail">Member Email *</Label>
                        <Input
                          id="memberEmail"
                          type="email"
                          value={formData.memberEmail}
                          onChange={(e) => handleInputChange("memberEmail", e.target.value)}
                          placeholder="Enter member email"
                          className={errors.memberEmail ? "border-red-500" : ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="memberPassword">Member Password *</Label>
                        <Input
                          id="memberPassword"
                          type="password"
                          value={formData.memberPassword}
                          onChange={(e) => handleInputChange("memberPassword", e.target.value)}
                          placeholder="Enter member password"
                          className={errors.memberPassword ? "border-red-500" : ""}
                        />
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        {/* Status */}
                        <div className="space-y-2">
                          <Label>Member Status *</Label>
                          <Select
                            value={formData.memberStatus}
                            onValueChange={(v) => handleInputChange("memberStatus", v)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={UserStatus.Active}>Active</SelectItem>
                              <SelectItem value={UserStatus.InActive}>Inactive</SelectItem>
                              <SelectItem value={UserStatus.Pending}>Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Role */}
                        <div className="space-y-2">
                          <Label>Member Role *</Label>
                          <Select
                            value={formData.memberRole}
                            onValueChange={(v) => handleInputChange("memberRole", v)}
                          >
                            <SelectTrigger className="w-full">
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
                        </div>

                      </div>
                      <div className='grid grid-cols-2 gap-2'>
                        {/* Department */}
                        <div className="space-y-2">
                          <Label>Member Department *</Label>
                          <Select
                            value={formData.memberDepartment}
                            onValueChange={(v) => handleInputChange("memberDepartment", v)}
                          >
                            <SelectTrigger className="w-full">
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
                        </div>
                        <div className='space-y-2'>
                          <Label>Member Position *</Label>
                          <Select
                            value={formData.memberPosition}
                            onValueChange={(v) => handleInputChange("memberPosition", v)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={WorkspacePosition.Admin}>Admin</SelectItem>
                              <SelectItem value={WorkspacePosition.CEO}>CEO</SelectItem>
                              <SelectItem value={WorkspacePosition.CTO}>CTO</SelectItem>
                              <SelectItem value={WorkspacePosition.ProductManager}>Product Manager</SelectItem>
                              <SelectItem value={WorkspacePosition.ProjectManager}>Project Manager</SelectItem>
                              <SelectItem value={WorkspacePosition.Developer}>Developer</SelectItem>
                              <SelectItem value={WorkspacePosition.Tester}>Tester</SelectItem>
                              <SelectItem value={WorkspacePosition.Designer}>Designer</SelectItem>
                              <SelectItem value={WorkspacePosition.BusinessAnalyst}>Business Analyst</SelectItem>
                              <SelectItem value={WorkspacePosition.DevOps}>DevOps</SelectItem>
                              <SelectItem value={WorkspacePosition.Support}>Support</SelectItem>
                              <SelectItem value={WorkspacePosition.Guest}>Guest</SelectItem>
                              <SelectItem value={WorkspacePosition.SalesManager}>Sales Manager</SelectItem>
                            </SelectContent>
                          </Select>

                        </div>

                      </div>

                      <DialogFooter className="px-6 py-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => handleMemberDialogOpen(false)}
                          disabled={memberLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="text-white"
                          onClick={handleAddMember}
                          disabled={memberLoading}
                        >
                          {memberLoading ? "Saving..." : "Add Member"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                </div>
              </div>

              {/* Data Table */}
              <TeamDataTable teamMembers={workspaceMembers} />
            </div>

          </TabsContent>
          <TabsContent value='project-team' currentValue={activeTab} className={'mt-5'}>
            <div className="flex flex-wrap gap-2">
              <Dialog open={customTeamDialogOpen} onOpenChange={setCustomTeamDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="text-white">
                    <Plus className="w-4 h-4" />
                    <span>Add Custom Team</span>
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader className="mb-4">
                    <DialogTitle>Add New Custom Team</DialogTitle>
                    <DialogDescription>
                      Create a custom team to manage project-specific collaborations.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Team Name *</Label>
                    <Input
                      id="teamName"
                      value={formData.teamName}
                      onChange={(e) => handleInputChange("teamName", e.target.value)}
                      placeholder="Enter team name"
                      className={errors.teamName ? "border-red-500" : ""}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="teamDescription">Team Description *</Label>
                    <Input
                      id="teamDescription"
                      type="text"
                      value={formData.teamDescription}
                      onChange={(e) => handleInputChange("teamDescription", e.target.value)}
                      placeholder="Enter team description"
                      className={errors.teamDescription ? "border-red-500" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamTagline">Team Tagline *</Label>
                    <Input
                      id="teamTagline"
                      type="text"
                      value={formData.teamTagline}
                      onChange={(e) => handleInputChange("teamTagline", e.target.value)}
                      placeholder="Enter team tagline"
                      className={errors.teamTagline ? "border-red-500" : ""}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor="teamMembers">Team Members</Label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select team members" />
                      </SelectTrigger>

                      <SelectContent>
                        {workspaceMembers.map((member) => (
                          <SelectItem key={member.profile?.id} value={member.profile?.id}>
                            {member.profile?.displayName}<br/>
                            <small className="text-gray-500 ml-2">({member.profile?.email})</small>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                  </div>

                  <DialogFooter className="px-6 py-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setCustomTeamDialogOpen(false)}
                      disabled={customTeamLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="text-white"
                      onClick={handleAddCustomTeam}
                      disabled={customTeamLoading}
                    >
                      {customTeamLoading ? "Saving..." : "Add Custom Team"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className='flex flex-wrap gap-4 mt-4'>
              {customTeam.map((team) => (
                <TeamProjectCard key={team.id} team={team} />
              ))}
            </div>

          </TabsContent>
          <TabsContent value='department' currentValue={activeTab} className={'mt-5'}>
            <div className='flex flex-wrap gap-4'>
              {departmentTeam.map((department) => (
                <DepartmentCard key={department.id} department={department} />
              ))}
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}

export default Team