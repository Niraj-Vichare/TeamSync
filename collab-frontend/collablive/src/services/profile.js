import axiosInstance from "./axiosInstance";

class ProfileService{

    async getUserProfile()
    {
        try {
            const response = await axiosInstance.get(`/user/profile`);
            console.log("Profile data fetched:", response.data);
            return response;
        } catch (error) {
            console.error('Error while getting profile:', error);
            throw error;
        }
    }

    async updateUserProfile(workspaceGuid, profile){
        try{
            const response = await axiosInstance.put(`/profile?workspaceGuid=${workspaceGuid}`,profile);
            return response;
        }catch(error){
            console.error("Error while updating the profile",error);
            throw error;
        }
    }

    async savePerference(themeColor){
        try{
            const response = await axiosInstance.patch(`/profile?themeColor=${themeColor}`);
            return response;
        }catch(error){
            console.error("Error while saving the perference",error);
        }
    }

}


const profileService = new ProfileService();
export default profileService;