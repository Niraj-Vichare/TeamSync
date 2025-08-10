import axiosInstance from "./axiosInstance";
import { handleWorkspaceError } from "@/lib/handleWorkspaceError";

class WorkspaceService{
    constructor(){
        this.activeWorkspace = JSON.parse(localStorage.getItem('activeWorkspace')) || null;
    }

    async createWorkspace(name,description='')
    {
        try{
            const response = axiosInstance.post(`/create-workspace`,{
                name,description
            });
            return response;
            
        }catch(error){
            console.error('Error while creating the workspace',error);
            throw handleWorkspaceError(error);
        }
    }

    async getWorkspace(workspaceId){
        try{
            const response = axiosInstance.get(`/workspaces/${workspaceId}`);
            return response;
        }catch(error){
            console.error('Error while loading the workspace',error);
            throw handleWorkspaceError(error);
        }
    }
}


const workspaceService = new WorkspaceService();
export default workspaceService;