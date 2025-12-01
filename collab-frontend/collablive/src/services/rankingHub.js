import * as signalR from "@microsoft/signalr";


class SignalRService {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }

    async connect(workspaceId) {
        if (this.isConnected) {
            console.log("Already connected");
            return;
        }

        try {
            // Create connection
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl("/hubs/leaderboard")
                .withAutomaticReconnect()
                .build();

            // Start connection
            await this.connection.start();
            console.log("✅ Connected to SignalR");

            this.isConnected = true;

            // Join workspace
            await this.connection.invoke("JoinWorkspace", workspaceId.toString());
            console.log(`✅ Joined workspace ${workspaceId}`);

        } catch (error) {
            console.error("❌ SignalR Connection Error:", error);
            this.isConnected = false;
        }
    }

    // Listen for full leaderboard updates
    onLeaderboardUpdate(callback) {
        if (!this.connection) return;

        this.connection.on("LeaderboardUpdated", (leaderboard) => {
            console.log("📊 Leaderboard Updated:", leaderboard);
            callback(leaderboard);
        });
    }

    // Listen for individual rank changes
    onRankChange(callback) {
        if (!this.connection) return;

        this.connection.on("RankChanged", (data) => {
            console.log("📈 Rank Changed:", data);
            callback(data);
        });
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.stop();
            console.log("✅ Disconnected");
            this.isConnected = false;
        }
    }
}

// Export singleton
const signalRService = new SignalRService();
export default signalRService;