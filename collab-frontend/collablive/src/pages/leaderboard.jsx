import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown, ArrowUp, Filter, Minus, Users } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import signalRService from '../services/rankingHub';
import { useAuth } from '@/context/AuthContext'
import leaderBoardService from '@/services/leaderboard'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'

function Leaderboard() {
    const [rankingData, setRankingData] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { getCurrentWorkspaceId } = useAuth();


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
    const fetchLeaderboard = async (page = pageNumber) => {
        try {
            setLoading(true);
            const result = await leaderBoardService.getTopPlayers({
                workspaceId,
                pageNumber: page,
                pageSize
            });
            console.log("Leaderboard data fetched:", result);   

            if (!result || !result.rankings) {
                setRankingData([]);
                setTotalCount(0);
                setLoading(false);
                return;
            }

            const transformed = result.rankings.map(r => ({
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
            console.log("Transformed leaderboard data:", transformed);

            setRankingData(transformed);
            setTotalCount(result.totalCount);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
            setRankingData([]);
            setLoading(false);
        }
    };
    const handlePageChange = (page) => {
        setPageNumber(page);
        fetchLeaderboard(page);
    };

    // Setup SignalR connection
    useEffect(() => {
        if (!workspaceId) return;

        // Connect to SignalR
        signalRService.connect(workspaceId);

        // Listen for full leaderboard updates (every 30 seconds from backend)
        signalRService.onLeaderboardUpdate((leaderboard) => {
            console.log('📊 Full leaderboard update received');

            if (!leaderboard || !leaderboard.rankings) return;

            const transformed = leaderboard.rankings.map(r => ({
                rank: r.currentRank,
                name: r.userName,
                avatar: getInitials(r.userName),
                score: Math.round(r.currentScore),
                ticketCompleted: r.currentMetrics.ticketCompleted,
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

        // Cleanup
        return () => {
            // Don't disconnect if other components are using it
        };
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
        switch (changeType) {
            case 0: return 'up';
            case 1: return 'down';
            case 2: return 'same';
            default: return 'new';
        }
    };

    // Loading skeleton component
    const LeaderboardSkeleton = () => (
        <>
            {[...Array(8)].map((_, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center py-3 px-2">
                    <div className="col-span-1">
                        <Skeleton className="w-8 h-8 rounded-full" />
                    </div>
                    <div className="col-span-4 flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                    <div className="col-span-2">
                        <Skeleton className="h-5 w-16 mb-1" />
                        <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="col-span-2">
                        <Skeleton className="h-5 w-12 mb-1" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="col-span-2">
                        <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                    <div className="col-span-1">
                        <Skeleton className="h-4 w-8" />
                    </div>
                </div>
            ))}
        </>
    );

    // Empty state component
    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No Ranking Data</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
                There are no team members ranked yet. Complete tasks and check in to start appearing on the leaderboard.
            </p>
        </div>
    );

    return (
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
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
                        {/* Header - always show */}
                        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-3 mb-4">
                            <div className="col-span-1">Rank</div>
                            <div className="col-span-4">Team Member</div>
                            <div className="col-span-2">Score</div>
                            <div className="col-span-2">Tickets</div>
                            <div className="col-span-2">Efficiency</div>
                            <div className="col-span-1">Trend</div>
                        </div>

                        {/* Content area */}
                        {loading ? (
                            <div className="space-y-3">
                                <LeaderboardSkeleton />
                            </div>
                        ) : rankingData.length === 0 ? (
                            <EmptyState />
                        ) : (

                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {rankingData.map((member, index) => (
                                        <motion.div
                                            key={member.userId || index}
                                            layout
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: 20, opacity: 0 }}
                                            transition={{
                                                delay: index * 0.05,
                                                layout: {
                                                    duration: 0.5,
                                                    type: "spring",
                                                    bounce: 0.2
                                                }
                                            }}
                                            className={`grid grid-cols-12 gap-4 items-center py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors ${member.name.includes('You') ? 'bg-muted/50 border-2 border-primary' : ''
                                                }`}
                                        >
                                            <div className="col-span-1">
                                                <motion.div
                                                    layout
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${member.rank === 1 ? 'bg-yellow-100 border-yellow-500 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-600' :
                                                        member.rank === 2 ? 'bg-gray-100 border-gray-400 text-gray-700 dark:bg-gray-800 dark:border-gray-500' :
                                                            member.rank === 3 ? 'bg-orange-100 border-orange-400 text-orange-700 dark:bg-orange-900/30 dark:border-orange-500' :
                                                                'bg-background border-muted-foreground'
                                                        }`}
                                                >
                                                    {member.rank}
                                                </motion.div>
                                            </div>

                                            <div className="col-span-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center text-foreground font-semibold border border-primary/20">
                                                        {member.avatar}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{member.name}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-span-2">
                                                <motion.p
                                                    layout
                                                    className="font-bold text-foreground"
                                                >
                                                    {member.score.toLocaleString()}
                                                </motion.p>
                                                <p className="text-xs text-muted-foreground">points</p>
                                            </div>

                                            <div className="col-span-2">
                                                <p className="font-semibold text-foreground">{member.ticketsCompleted}</p>
                                                <p className="text-xs text-muted-foreground">completed</p>
                                            </div>

                                            <div className="col-span-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                                        <motion.div
                                                            className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${member.efficiency}%` }}
                                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium min-w-[40px] text-right">
                                                        {member.efficiency}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="col-span-1">
                                                <div className="flex items-center gap-1">
                                                    {getTrendIcon(member.trend)}
                                                    {member.change !== 0 && (
                                                        <span className={`text-xs font-medium ${member.trend === 'up' ? 'text-green-500' :
                                                            member.trend === 'down' ? 'text-red-500' :
                                                                'text-muted-foreground'
                                                            }`}>
                                                            {member.change > 0 ? '+' : ''}{member.change}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                        )}
                    </div>
                    {totalCount > pageSize && (
                        <Pagination className="mt-6">
                            <PaginationContent>

                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => pageNumber > 1 && handlePageChange(pageNumber - 1)}
                                        className={pageNumber === 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>

                                {/* Page numbers */}
                                {[...Array(Math.ceil(totalCount / pageSize))].map((_, idx) => (
                                    <PaginationItem key={idx}>
                                        <PaginationLink
                                            onClick={() => handlePageChange(idx + 1)}
                                            isActive={pageNumber === idx + 1}
                                        >
                                            {idx + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() =>
                                            pageNumber < Math.ceil(totalCount / pageSize) &&
                                            handlePageChange(pageNumber + 1)
                                        }
                                        className={
                                            pageNumber === Math.ceil(totalCount / pageSize)
                                                ? "pointer-events-none opacity-50"
                                                : ""
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default Leaderboard