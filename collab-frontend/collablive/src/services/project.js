import { default as axiosInstance } from "./axiosInstance";

class ProjectService {
    // Create a new project
    async createProject(workspaceGuid, projectData) {
        try {
            const response = await axiosInstance.post(`/projects?workspaceGuid=${workspaceGuid}`,projectData);
            return response;
        } catch (error) {
            console.error('Error while creating project:', error);
            throw error;
        }
    }
    // 

    // Get all user projects
    async getUserProjects({workspaceGuid, search, status, pageNumber, pageSize}) {
        try {
            const response = await axiosInstance.get('/projects',{
                params: { workspaceGuid, search, status, pageNumber, pageSize }
            });
            return response;
        } catch (error) {
            console.error('Error while loading user projects:', error);
            throw error;
        }
    }

    // Delete a project by ID
    async deleteProject(workspaceGuid,projectGuid) {
        try {
            const response = await axiosInstance.delete(`/projects?workspaceGuid=${workspaceGuid}&projectGuid=${projectGuid}`);
            return response;
        } catch (error) {
            console.error('Error while deleting project:', error);
            throw error;
        }
    }

    // Update a project by ID
    async updateProject(projectGuid, projectData) {
        debugger;
        try {
            const response = await axiosInstance.put(`/projects/?projectGuid=${projectGuid}`, projectData);
            return response;
        } catch (error) {
            console.error('Error while updating project:', error);
            throw error;
        }
    }

    // Get a project by ID
    async getProjectById(projectGuid) {
        try {
            const response = await axiosInstance.get(`/projects/${projectGuid}`);
            return response;
        } catch (error) {
            console.error('Error while loading project by ID:', error);
            throw error;
        }
    }

    // Update project status
    async updateProjectStatus(projectGuid, status) {
        try {
            const response = await axiosInstance.patch(`/projects/${projectGuid}/status`, { status });
            return response;
        } catch (error) {
            console.error('Error while updating project status:', error);
            throw error;
        }
    }

    // Get ongoing projects
    async getOngoingProjects() {
        try {
            const response = await axiosInstance.get('/projects/ongoing');
            return response;
        } catch (error) {
            console.error('Error while loading ongoing projects:', error);
            throw error;
        }
    }

    async getProjectDropdown(workspaceGuid){
        try{
            const response = await axiosInstance.get(`/projects/dropdown?workspaceGuid=${workspaceGuid}`)
            return response.data;
        }catch(error){
            console.error("Error while project dropdown",error);
            throw error;
        }
    }
}
const projectService = new ProjectService();
export default projectService;