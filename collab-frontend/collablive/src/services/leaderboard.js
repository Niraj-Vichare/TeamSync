import { default as axiosInstance } from "./axiosInstance";

class LeaderBoardService {

    

    async getTopPlayers({ workspaceId, pageNumber, pageSize }) {
        try {
            const response = await axiosInstance.get('/leaderboard', {
                params: { workspaceId, pageNumber, pageSize }
            });
            return response;
        } catch (error) {
            console.error('Error while loading leaderboard:', error);
            throw error;
        }
    }

}


export const leaderBoardService = new LeaderBoardService();
export default leaderBoardService;