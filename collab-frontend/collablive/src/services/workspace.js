import axiosInstance from "./axiosInstance";
import { handleWorkspaceError } from "@/lib/handleWorkspaceError";

class WorkspaceService {
    constructor() {
        this.activeWorkspace = null;
    }

    // Create a new workspace
    async createWorkspace(name, description = '') {
        try {
            // Fixed: Added missing 'await'
            const response = await axiosInstance.post('/workspace/create-workspace', {
                name,
                description
            });
            
            // Store the new workspace if creation was successful
            if (response.data.success && response.data.data) {
                localStorage.setItem('currentWorkspaceId', JSON.stringify(response.data.data));
                this.activeWorkspace = response.data.data;
            }
            
            return response.data; // Return data, not full response
        } catch (error) {
            console.error('Error while creating the workspace:', error);
            throw handleWorkspaceError(error);
        }
    }

    // Get workspace details
    async getWorkspace(workspaceId) {
        try {
            // Fixed: Added missing 'await'
            const response = await axiosInstance.get(`/workspace/${workspaceId}`);
            return response.data; // Return data, not full response
        } catch (error) {
            console.error('Error while loading the workspace:', error);
            throw handleWorkspaceError(error);
        }
    }

    // Get all user workspaces
    async getUserWorkspaces() {
        try {
            const response = await axiosInstance.get('/workspace/workspaces');
            return response;
        } catch (error) {
            console.error('Error while loading user workspaces:', error);
            throw handleWorkspaceError(error);
        }
    }

    // Switch to a different workspace
    async switchWorkspace(workspaceId) {
        try {
            const response = await axiosInstance.post(`/workspace/${workspaceId}/switch`);
            
            if (response.data.success) {
                localStorage.setItem('currentWorkspaceId', JSON.stringify(response.data.data));
                this.activeWorkspace = response.data.data;
            }
            
            return response.data;
        } catch (error) {
            console.error('Error while switching workspace:', error);
            throw handleWorkspaceError(error);
        }
    }

    // Update workspace
    async updateWorkspace(workspaceId, updates) {
        try {
            const response = await axiosInstance.put(`/workspace/${workspaceId}`, updates);
            
            // Update stored workspace if it's the current one
            if (this.activeWorkspace?.id === workspaceId) {
                const updatedWorkspace = { ...this.activeWorkspace, ...updates };
                localStorage.setItem('currentWorkspaceId', JSON.stringify(updatedWorkspace));
                this.activeWorkspace = updatedWorkspace;
            }
            
            return response.data;
        } catch (error) {
            console.error('Error while updating workspace:', error);
            throw handleWorkspaceError(error);
        }
    }

    // Delete workspace
    async deleteWorkspace(workspaceId) {
        try {
            const response = await axiosInstance.delete(`/workspace/${workspaceId}`);
            
            // Clear stored workspace if it's the deleted one
            if (this.activeWorkspace?.id === workspaceId) {
                localStorage.removeItem('currentWorkspaceId');
                this.activeWorkspace = null;
            }
            
            return response.data;
        } catch (error) {
            console.error('Error while deleting workspace:', error);
            throw handleWorkspaceError(error);
        }
    }

    // Get Workspace 
    async getWorkspaceProfiles(workspaceGuid){
        try{
            const response = await axiosInstance.get(`/workspace/dropdown?workspaceGuid=${workspaceGuid}`);
            return response.data;
        }catch(error){
            throw error;
        }
    }

    // Get current active workspace
    getActiveWorkspace() {
        return this.activeWorkspace;
    }

    // Get current workspace ID
    getActiveWorkspaceId() {
        return this.activeWorkspace?.id || null;
    }

    // Set active workspace
    setActiveWorkspace(workspace) {
        localStorage.setItem('currentWorkspaceId', JSON.stringify(workspace));
        this.activeWorkspace = workspace;
    }

    // Clear active workspace
    clearActiveWorkspace() {
        localStorage.removeItem('currentWorkspaceId');
        this.activeWorkspace = null;
    }


}

const workspaceService = new WorkspaceService();
export default workspaceService;