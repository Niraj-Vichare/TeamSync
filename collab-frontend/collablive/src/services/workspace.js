import axiosInstance from "./axiosInstance";
import { handleWorkspaceError } from "@/lib/handleWorkspaceError";
import authService from "./auth";

class WorkspaceService {
    constructor() {
        this.activeWorkspace = null;
    }

    // Create a new workspace
    async createWorkspace(workspaceRequestModel) {
        try {
            const response = await axiosInstance.post('/workspace/create-workspace', workspaceRequestModel);
            
            // Store the new workspace if creation was successful
            if (response.data.success && response.data.data) {
                const workspaceId = response.data.data.id || response.data.data.workspaceId || response.data.data;
                
                // Update both services
                authService.setCurrentWorkspaceId(workspaceId);
                this.activeWorkspace = response.data.data;
            }
            
            return response;
        } catch (error) {
            console.error('Error while creating the workspace:', error);
            throw handleWorkspaceError(error);
        }
    }

    // Get workspace details
    async getWorkspace(workspaceId) {
        try {
            const response = await axiosInstance.get(`/workspace/${workspaceId}`);
            return response.data;
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
                const newWorkspaceId = response.data.data.id || response.data.data.workspaceId || response.data.data;
                
                // Update both services
                authService.setCurrentWorkspaceId(newWorkspaceId);
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
            const currentWorkspaceId = authService.getCurrentWorkspaceId();
            if (currentWorkspaceId === workspaceId) {
                const updatedWorkspace = { ...this.activeWorkspace, ...updates };
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
            const currentWorkspaceId = authService.getCurrentWorkspaceId();
            if (currentWorkspaceId === workspaceId) {
                authService.setCurrentWorkspaceId(null);
                this.activeWorkspace = null;
            }
            
            return response.data;
        } catch (error) {
            console.error('Error while deleting workspace:', error);
            throw handleWorkspaceError(error);
        }
    }

    // Get Workspace Profiles
    async getWorkspaceProfiles(workspaceGuid) {
        try {
            const response = await axiosInstance.get(`/workspace/dropdown?workspaceGuid=${workspaceGuid}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Get current active workspace
    getActiveWorkspace() {
        return this.activeWorkspace;
    }

    // Get current workspace ID
    getActiveWorkspaceId() {
        return authService.getCurrentWorkspaceId();
    }

    // Set active workspace
    setActiveWorkspace(workspace) {
        const workspaceId = workspace.id || workspace.workspaceId || workspace;
        authService.setCurrentWorkspaceId(workspaceId);
        this.activeWorkspace = workspace;
    }

    // Clear active workspace
    clearActiveWorkspace() {
        authService.setCurrentWorkspaceId(null);
        this.activeWorkspace = null;
    }
}

const workspaceService = new WorkspaceService();
export default workspaceService;