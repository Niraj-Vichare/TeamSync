import * as signalR from '@microsoft/signalr'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL

class SignalRService {
    constructor() {
        this.connection = null
        this.isConnected = false
        this.currentWorkspaceId = null
    }

    async connect(workspaceId) {
        if (!workspaceId) return

        // Already connected to the same workspace.
        if (this.isConnected && this.currentWorkspaceId === workspaceId) {
            console.log('Already connected to this workspace')
            return
        }

        // If connected to a different workspace, rebuild the connection
        // so we don't keep receiving events from the old group.
        if (this.isConnected && this.currentWorkspaceId !== workspaceId) {
            await this.disconnect()
        }

        try {
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(`${API_BASE_URL}/hubs/leaderboard`, {
                    withCredentials: true   // ← add this
                })
                .withAutomaticReconnect()
                .build()

            this.connection.onreconnecting((error) => {
                console.warn('🔄 SignalR reconnecting...', error)
                this.isConnected = false
            })

            this.connection.onreconnected(async () => {
                console.log('✅ SignalR reconnected')

                try {
                    if (this.currentWorkspaceId) {
                        await this.connection.invoke('JoinWorkspace', this.currentWorkspaceId.toString())
                        console.log(`✅ Rejoined workspace ${this.currentWorkspaceId}`)
                    }
                    this.isConnected = true
                } catch (error) {
                    console.error('❌ Failed to rejoin workspace after reconnect:', error)
                }
            })

            this.connection.onclose(() => {
                console.log('🔌 SignalR closed')
                this.isConnected = false
            })

            await this.connection.start()
            console.log('✅ Connected to SignalR')

            this.isConnected = true
            this.currentWorkspaceId = workspaceId

            await this.connection.invoke('JoinWorkspace', workspaceId.toString())
            console.log(`✅ Joined workspace ${workspaceId}`)
        } catch (error) {
            console.error('❌ SignalR Connection Error:', error)
            this.isConnected = false
        }
    }

    onLeaderboardUpdate(callback) {
        if (!this.connection) return

        this.connection.off('LeaderboardUpdated')
        this.connection.on('LeaderboardUpdated', (leaderboard) => {
            console.log('📊 Leaderboard Updated:', leaderboard)
            callback(leaderboard)
        })
    }

    onRankChange(callback) {
        if (!this.connection) return

        this.connection.off('RankChanged')
        this.connection.on('RankChanged', (data) => {
            console.log('📈 Rank Changed:', data)
            callback(data)
        })
    }

    offLeaderboardUpdate() {
        if (this.connection) {
            this.connection.off('LeaderboardUpdated')
        }
    }

    offRankChange() {
        if (this.connection) {
            this.connection.off('RankChanged')
        }
    }

    async disconnect() {
        if (this.connection) {
            try {
                await this.connection.stop()
                console.log('✅ Disconnected')
            } catch (error) {
                console.error('❌ Error while disconnecting SignalR:', error)
            } finally {
                this.connection = null
                this.isConnected = false
                this.currentWorkspaceId = null
            }
        }
    }
}

const signalRService = new SignalRService()
export default signalRService