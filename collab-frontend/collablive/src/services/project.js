import { default as axiosInstance } from "./axiosInstance";

class ProjectService {
    // Other methods...

    // Get all user projects
    async getUserProjects() {
        try {
            const response = await axiosInstance.get('/project/projects');
            return response;
        } catch (error) {
            console.error('Error while loading user projects:', error);
            throw error;
        }
    }

    async getOngoingProjects() {
        try {
            const response = await axiosInstance.get('/project/ongoing-projects');
            return response;
        } catch (error) {
            console.error('Error while loading ongoing projects:', error);
            throw error;
        }
    }
}
const projectService = new ProjectService();
export default projectService;