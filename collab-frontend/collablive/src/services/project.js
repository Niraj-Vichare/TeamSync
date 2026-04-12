import { default as axiosInstance } from "./axiosInstance";

class ProjectService {
    // Create a new project
    async createProject(workspaceGuid, projectData) {
        try {
            const response = await axiosInstance.post(`/projects?workspaceGuid=${workspaceGuid}`, projectData);
            return response;
        } catch (error) {
            console.error('Error while creating project:', error);
            throw error;
        }
    }

    // Get all user projects
    async getUserProjects({ workspaceGuid, search, status, pageNumber, pageSize }) {
        try {
            const response = await axiosInstance.get('/projects', {
                params: { workspaceGuid, search, status, pageNumber, pageSize }
            });
            return response;
        } catch (error) {
            console.error('Error while loading user projects:', error);
            throw error;
        }
    }

    // Delete a project by ID
    async deleteProject(workspaceGuid, projectGuid) {
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
        try {
            const response = await axiosInstance.put(`/projects/?projectGuid=${projectGuid}`, projectData);
            return response;
        } catch (error) {
            console.error('Error while updating project:', error);
            throw error;
        }
    }

    // Get a project by ID
    async getProjectById(workspaceGuid, projectGuid) {
        try {
            const response = await axiosInstance.get(`/projects/${projectGuid}`, {
                params: { workspaceGuid }
            });
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

    // Get project dropdown options
    async getProjectDropdown(workspaceGuid) {
        try {
            const response = await axiosInstance.get(`/projects/dropdown?workspaceGuid=${workspaceGuid}`);
            return response.data;
        } catch (error) {
            console.error('Error while loading project dropdown:', error);
            throw error;
        }
    }

    // Get sprints for a project
    // GET /projects/{projectGuid}/sprints
    // Returns ApiResponseModel<List<SprintDto>>
    async getProjectSprints(projectGuid) {
        try {
            const response = await axiosInstance.get(`/projects/${projectGuid}/sprints`);
            return response;
        } catch (error) {
            console.error('Error while loading project sprints:', error);
            throw error;
        }
    }

    // Get teams assigned to a project
    // GET /projects/{projectGuid}/teams
    // Returns ApiResponseModel<List<TeamDto>>
    async getProjectTeams(projectGuid) {
        try {
            const response = await axiosInstance.get(`/projects/${projectGuid}/teams`);
            return response;
        } catch (error) {
            console.error('Error while loading project teams:', error);
            throw error;
        }
    }

    // Get dashboard overview/metric cards for a project
    // GET /projects/{projectGuid}/overview
    // Returns ApiResponseModel<ProjectDashboardCard>
    async getProjectOverview(projectGuid) {
        try {
            const response = await axiosInstance.get(`/projects/${projectGuid}/overview`);
            return response;
        } catch (error) {
            console.error('Error while loading project overview:', error);
            throw error;
        }
    }
}

const projectService = new ProjectService();
export default projectService;