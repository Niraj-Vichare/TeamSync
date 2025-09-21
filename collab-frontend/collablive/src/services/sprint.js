class SprintService {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }

    async getAllSprints() {
        try {
            const response = await this.apiClient.get("/sprints");
            return response.data;
        } catch (error) {
            console.error("Error fetching sprints:", error);
            throw error;
        }
    }

    async getAllUserStories(){
        try {
            const response = await this.apiClient.get("/sprints");
            return response.data;
        } catch (error) {
            console.error("Error fetching sprints:", error);
            throw error;
        }
    }

    async getAllBugs(){
        try {
            const response = await this.apiClient.get("/sprints");
            return response.data;
        } catch (error) {
            console.error("Error fetching sprints:", error);
            throw error;
        }
    }

    async getAllBacklogs(){
        try {
            const response = await this.apiClient.get("/sprints");
            return response.data;
        } catch (error) {
            console.error("Error fetching sprints:", error);
            throw error;
        }
    }

}

const sprintService = new SprintService();
export default sprintService;