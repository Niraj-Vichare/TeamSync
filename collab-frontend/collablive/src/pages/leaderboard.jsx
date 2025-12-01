// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { motion } from 'framer-motion'
// import { ArrowDown, ArrowUp, Filter, Minus, Users } from 'lucide-react'
// import React from 'react'

// function Leaderboard() {
//     const cardVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: {
//         duration: 0.5,
//         ease: "easeOut"
//       }
//     }
//   };

//     const getTrendIcon = (trend) => {
//         switch (trend) {
//             case 'up': return <ArrowUp className="h-3 w-3 text-green-500" />;
//             case 'down': return <ArrowDown className="h-3 w-3 text-red-500" />;
//             default: return <Minus className="h-3 w-3 text-muted-foreground" />;
//         }
//     };
//     const rankingData = [
//         { rank: 1, name: 'Alex Johnson (You)', avatar: 'AJ', score: 2485, tasksCompleted: 47, efficiency: 94, change: 5, trend: 'up' },
//         { rank: 2, name: 'Sarah Chen', avatar: 'SC', score: 2431, tasksCompleted: 43, efficiency: 91, change: -1, trend: 'down' },
//         { rank: 3, name: 'Mike Rodriguez', avatar: 'MR', score: 2398, tasksCompleted: 41, efficiency: 89, change: 2, trend: 'up' },
//         { rank: 4, name: 'Anna Davis', avatar: 'AD', score: 2367, tasksCompleted: 39, efficiency: 87, change: 0, trend: 'same' },
//         { rank: 5, name: 'Tom Wilson', avatar: 'TW', score: 2312, tasksCompleted: 38, efficiency: 85, change: 3, trend: 'up' },
//         { rank: 6, name: 'Emma Brown', avatar: 'EB', score: 2289, tasksCompleted: 36, efficiency: 83, change: -2, trend: 'down' },
//         { rank: 7, name: 'James Lee', avatar: 'JL', score: 2245, tasksCompleted: 34, efficiency: 81, change: 1, trend: 'up' },
//         { rank: 8, name: 'Lisa Wang', avatar: 'LW', score: 2198, tasksCompleted: 32, efficiency: 79, change: -1, trend: 'down' },
//     ];

//   return (

    
//       <motion.div variants={cardVariants}>
//           <Card>
//               <CardHeader>
//                   <div className="flex items-center justify-between">
//                       <div>
//                           <CardTitle className="flex items-center gap-2">
//                               <Users className="h-5 w-5" />
//                               Performance Leaderboard
//                           </CardTitle>
//                           <CardDescription>Team member performance rankings</CardDescription>
//                       </div>
//                       <Button variant="outline" size="sm">
//                           <Filter className="h-4 w-4 mr-2" />
//                           Filter
//                       </Button>
//                   </div>
//               </CardHeader>
//               <CardContent>
//                   <div className="overflow-hidden">
//                       <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-3 mb-4">
//                           <div className="col-span-1">Rank</div>
//                           <div className="col-span-4">Team Member</div>
//                           <div className="col-span-2">Score</div>
//                           <div className="col-span-2">Tasks</div>
//                           <div className="col-span-2">Efficiency</div>
//                           <div className="col-span-1">Trend</div>
//                       </div>

//                       <div className="space-y-3">
//                           {rankingData.map((member, index) => (
//                               <motion.div
//                                   key={index}
//                                   initial={{ x: -20, opacity: 0 }}
//                                   animate={{ x: 0, opacity: 1 }}
//                                   transition={{ delay: index * 0.05 }}
//                                   className={`grid grid-cols-12 gap-4 items-center py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors ${member.name.includes('You') ? 'bg-muted/50 border' : ''
//                                       }`}
//                               >
//                                   <div className="col-span-1">
//                                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${index === 0 ? 'bg-background border-foreground' :
//                                               index === 1 ? 'bg-muted border-muted-foreground' :
//                                                   index === 2 ? 'bg-muted border-muted-foreground' :
//                                                       'bg-background border-muted-foreground'
//                                           }`}>
//                                           {member.rank}
//                                       </div>
//                                   </div>

//                                   <div className="col-span-4">
//                                       <div className="flex items-center gap-3">
//                                           <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-foreground font-semibold">
//                                               {member.avatar}
//                                           </div>
//                                           <div>
//                                               <p className="font-medium text-foreground">{member.name}</p>
//                                               <p className="text-sm text-muted-foreground">Software Engineer</p>
//                                           </div>
//                                       </div>
//                                   </div>

//                                   <div className="col-span-2">
//                                       <p className="font-bold text-foreground">{member.score.toLocaleString()}</p>
//                                       <p className="text-xs text-muted-foreground">points</p>
//                                   </div>

//                                   <div className="col-span-2">
//                                       <p className="font-semibold text-foreground">{member.tasksCompleted}</p>
//                                       <p className="text-xs text-muted-foreground">completed</p>
//                                   </div>

//                                   <div className="col-span-2">
//                                       <div className="flex items-center gap-2">
//                                           <div className="flex-1 bg-muted rounded-full h-2">
//                                               <div
//                                                   className="bg-foreground h-2 rounded-full transition-all duration-500"
//                                                   style={{ width: `${member.efficiency}%` }}
//                                               />
//                                           </div>
//                                           <span className="text-sm font-medium">{member.efficiency}%</span>
//                                       </div>
//                                   </div>

//                                   <div className="col-span-1">
//                                       <div className="flex items-center gap-1">
//                                           {getTrendIcon(member.trend)}
//                                           <span className={`text-xs ${member.trend === 'up' ? 'text-green-500' :
//                                                   member.trend === 'down' ? 'text-red-500' :
//                                                       'text-muted-foreground'
//                                               }`}>
//                                               {member.change > 0 ? '+' : ''}{member.change}
//                                           </span>
//                                       </div>
//                                   </div>
//                               </motion.div>
//                           ))}
//                       </div>
//                   </div>
//               </CardContent>
//           </Card>
//       </motion.div>
//   )
// }

// export default Leaderboard

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, Filter, Minus, Users } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import signalRService from '../services/rankingHub';
import { useAuth } from '@/context/AuthContext'
import leaderBoardService from '@/services/leaderboard'

function Leaderboard() {
    const [rankingData, setRankingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const {getCurrentWorkspaceId} = useAuth();

    const workspaceId = getCurrentWorkspaceId();
    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up': return <ArrowUp className="h-3 w-3 text-green-500" />;
            case 'down': return <ArrowDown className="h-3 w-3 text-red-500" />;
            default: return <Minus className="h-3 w-3 text-muted-foreground" />;
        }
    };

    // Fetch initial leaderboard
    const fetchLeaderboard = async () => {
        try {
            var result = await leaderBoardService.getTopPlayers({workspaceId, pageNumber:1, pageSize:10});
            if(!result){
                setLoading(false);
                return;
            }
            // Transform API response to match your UI format
            const transformed = data.rankings.map(r => ({
                rank: r.currentRank,
                name: r.userName,
                avatar: getInitials(r.userName),
                score: Math.round(r.currentScore),
                tasksCompleted: r.currentMetrics.tasksCompleted,
                efficiency: Math.round(r.currentMetrics.efficiency * 100),
                change: r.comparison.rankChange,
                trend: getTrendType(r.comparison.rankChangeType),
                userId: r.userId
            }));

            setRankingData(transformed);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            setLoading(false);
        }
    };

    // Setup SignalR connection
    useEffect(() => {
        // Connect to SignalR
        signalRService.connect(workspaceId);

        // Listen for full leaderboard updates (every 30 seconds from backend)
        signalRService.onLeaderboardUpdate((leaderboard) => {
            console.log('📊 Full leaderboard update received');

            const transformed = leaderboard.rankings.map(r => ({
                rank: r.currentRank,
                name: r.userName,
                avatar: getInitials(r.userName),
                score: Math.round(r.currentScore),
                tasksCompleted: r.currentMetrics.tasksCompleted,
                efficiency: Math.round(r.currentMetrics.efficiency * 100),
                change: r.comparison.rankChange,
                trend: getTrendType(r.comparison.rankChangeType),
                userId: r.userId
            }));

            setRankingData(transformed);
        });

        // Listen for individual rank changes (real-time)
        signalRService.onRankChange((data) => {
            console.log('📈 Rank change received:', data);

            setRankingData(prevData => {
                const userIndex = prevData.findIndex(u => u.userId === data.userId);

                if (userIndex === -1) {
                    // User not in list, refresh entire leaderboard
                    fetchLeaderboard();
                    return prevData;
                }

                // Update the specific user
                const newData = [...prevData];
                const user = { ...newData[userIndex] };

                const oldRank = user.rank;
                user.rank = data.newRank;
                user.score = Math.round(data.score);
                user.change = oldRank - data.newRank;
                user.trend = user.change > 0 ? 'up' : user.change < 0 ? 'down' : 'same';

                newData[userIndex] = user;

                // Re-sort by rank
                newData.sort((a, b) => a.rank - b.rank);

                return newData;
            });
        });

        // Fetch initial data
        fetchLeaderboard();

        // Cleanup (don't disconnect, keep for other components)
        return () => { };
    }, [workspaceId]);

    // Helper functions
    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getTrendType = (changeType) => {
        switch (changeType?.toLowerCase()) {
            case 'up': return 'up';
            case 'down': return 'down';
            case 'new': return 'up'; // Show as up for new entries
            default: return 'same';
        }
    };

    if (loading) {
        return (
            <motion.div variants={cardVariants}>
                <Card>
                    <CardContent className="flex items-center justify-center h-64">
                        <div className="text-muted-foreground">Loading leaderboard...</div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div variants={cardVariants}>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Performance Leaderboard
                            </CardTitle>
                            <CardDescription>Team member performance rankings</CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-3 mb-4">
                            <div className="col-span-1">Rank</div>
                            <div className="col-span-4">Team Member</div>
                            <div className="col-span-2">Score</div>
                            <div className="col-span-2">Tasks</div>
                            <div className="col-span-2">Efficiency</div>
                            <div className="col-span-1">Trend</div>
                        </div>

                        <div className="space-y-3">
                            {rankingData.map((member, index) => (
                                <motion.div
                                    key={member.userId || index}
                                    layout
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ 
                                        delay: index * 0.05,
                                        layout: { duration: 0.3 }
                                    }}
                                    className={`grid grid-cols-12 gap-4 items-center py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors ${
                                        member.name.includes('You') ? 'bg-muted/50 border' : ''
                                    }`}
                                >
                                    <div className="col-span-1">
                                        <motion.div
                                            key={member.rank}
                                            initial={{ scale: 1.1 }}
                                            animate={{ scale: 1 }}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                                                index === 0 ? 'bg-background border-foreground' :
                                                index === 1 ? 'bg-muted border-muted-foreground' :
                                                index === 2 ? 'bg-muted border-muted-foreground' :
                                                'bg-background border-muted-foreground'
                                            }`}
                                        >
                                            {member.rank}
                                        </motion.div>
                                    </div>

                                    <div className="col-span-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-foreground font-semibold">
                                                {member.avatar}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{member.name}</p>
                                                <p className="text-sm text-muted-foreground">Software Engineer</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <motion.p
                                            key={member.score}
                                            initial={{ scale: 1.1, color: '#10b981' }}
                                            animate={{ scale: 1, color: 'inherit' }}
                                            transition={{ duration: 0.3 }}
                                            className="font-bold text-foreground"
                                        >
                                            {member.score.toLocaleString()}
                                        </motion.p>
                                        <p className="text-xs text-muted-foreground">points</p>
                                    </div>

                                    <div className="col-span-2">
                                        <p className="font-semibold text-foreground">{member.tasksCompleted}</p>
                                        <p className="text-xs text-muted-foreground">completed</p>
                                    </div>

                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-muted rounded-full h-2">
                                                <motion.div
                                                    className="bg-foreground h-2 rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${member.efficiency}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">{member.efficiency}%</span>
                                        </div>
                                    </div>

                                    <div className="col-span-1">
                                        <div className="flex items-center gap-1">
                                            {getTrendIcon(member.trend)}
                                            <span className={`text-xs ${
                                                member.trend === 'up' ? 'text-green-500' :
                                                member.trend === 'down' ? 'text-red-500' :
                                                'text-muted-foreground'
                                            }`}>
                                                {member.change > 0 ? '+' : ''}{member.change}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default Leaderboard