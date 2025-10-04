import axiosInstance from "./axiosInstance";

class TeamService{
  async getTeamMembers({workspaceGuid,search,filter,pageNumber,pageSize})
  {
    try{
        const response = await axiosInstance.get("/teams/members",{
            params: { workspaceGuid, search, filter, pageNumber, pageSize }
        })
        return response.data;
    }catch(error){
        console.error("Error while getting the team members",error);
        throw handleTeamError(error);
    }
  }

  async deleteTeamMember(memberId){
    try{
        const response = await axiosInstance.delete(`/teams?memberId=${memberId}`);
        return response.data;
    }catch(error){
        console.error("Error while deleting the team members",error);
        throw handleTeamError(error);
    }
  }

  async updateMember(memberId, memberData) 
  {
        try {
            const response = await axiosInstance.put(`/projects/?memberId=${memberId}`, memberData);
            return response;
        } catch (error) {
            console.error('Error while updating project:', error);
            throw error;
        }
    }

  async addTeamMember(workspaceGuid,member)
  {
    try{
        const response = await axiosInstance.post('/teams',{
            workspaceGuid:workspaceGuid,
            mapping:member
        });
        return response.data;
    }catch(error){
        console.error("Error while adding the team member",error);
        throw handleTeamError(error);
    }
  }

  async getTeamDropdown(workspaceGuid){
    try{
        const response = await axiosInstance.get(`/teams/dropdown?workspaceGuid=${workspaceGuid}`)
        return response.data;

    }catch(error){
        console.error('Error while get team dropdown',error);
        throw handleTeamError(error);
    }
  }
}


const teamService = new TeamService();
export default teamService; 