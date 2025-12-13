import DepartmentCard from '@/components/teamComponents/DepartmentCard';
import TeamDataTable from '@/components/teamComponents/TeamDataTable';
import TeamProjectCard from '@/components/teamComponents/TeamProjectCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/context/AuthContext';
import {  teamMembers,projectTeam, departments } from '@/data/general';
import teamService from '@/services/team';
import { Filter, FilterIcon, Plus, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react'

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

  const {getCurrentWorkspaceId} = useAuth();
  const workspaceGuid = getCurrentWorkspaceId();

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
                  <Button className='text-white'>
                    <Plus className="w-4 h-4" />
                    <span>Add Member</span>
                  </Button>
                </div>
              </div>

              {/* Data Table */}
              <TeamDataTable teamMembers={workspaceMembers} />
            </div>

          </TabsContent>
          <TabsContent value='project-team' currentValue={activeTab} className={'mt-5'}>
            <div className="flex flex-wrap gap-2">
              {customTeam.length === 0 ? (
                <div className="w-full text-center py-10 text-gray-500 text-sm">
                  No data available
                </div>
              ) : (
                customTeam.map(team => (
                  <TeamProjectCard key={team.id} team={team} />
                ))
              )}
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