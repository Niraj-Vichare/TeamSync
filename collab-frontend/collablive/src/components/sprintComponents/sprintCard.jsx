import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { EyeIcon, TicketIcon } from 'lucide-react';

function SprintCard({ sprint }) {
    const getStatusColor = (status) => {
        switch (status) {
            case "In Progress":
                return { primary: "bg-blue-500", secondary: "bg-blue-400", tertiary: "bg-blue-300", border: "border-blue-500", badge: "bg-blue-500 text-white" };
            case "Pending":
                return { primary: "bg-red-500", secondary: "bg-red-400", tertiary: "bg-red-300", border: "border-red-500", badge: "bg-red-500 text-white" };
            case "Completed":
                return { primary: "bg-gray-500", secondary: "bg-gray-400", tertiary: "bg-gray-500", border: "border-gray-500", badge: "bg-gray-500 text-white" };
            default:
                return { primary: "bg-gray-500", secondary: "bg-gray-400", tertiary: "bg-gray-300", border: "border-gray-500", badge: "bg-gray-500 text-white" };
        }
    };

    const colors = getStatusColor(sprint.status);

    return (
        <Card className={`${colors.tertiary} p-1 pb-5 rounded-xl flex justify-center items-center h-[400px]`}>
            <Card className={`w-full max-w-md rounded-xl shadow-md border-2 ${colors.border} hover:shadow-xl transition-all h-[400px]`}>
                {/* HEADER */}
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">{sprint.name}</CardTitle>
                        <Badge className={`text-xs px-2 py-1 ${colors.secondary} text-white`}>{sprint.status}</Badge>
                    </div>

                    <p className="text-sm text-gray-500 italic min-h-[18px]">{sprint.tagline || ""}</p>
                    <p className="text-xs text-gray-400">ID: {sprint.sprintId}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-1">
                        {sprint.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">{tag}</Badge>
                        ))}
                        {sprint.overdue && (
                            <Badge variant="destructive" className="text-xs px-2 py-1">
                                Overdue
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                {/* CONTENT */}
                <CardContent className="text-sm space-y-3">
                    {/* Goal / Description */}
                    <div className='h-min pt-2 pb-2 text-gray-400 min-h-[40px] w-full break-words line-clamp-2'>
                        <p>{sprint.goal}</p>
                    </div>

                    {/* Assigned + Tickets */}
                    <div className='flex justify-between align-middle'>
                        <div className='space-y-2'>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">No of Tickets</p>
                            <div className='flex items-center gap-2 align-middle'>
                                <TicketIcon className='w-4 h-4 text-yellow-300' />
                                {sprint.tickets}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Assigned To</p>
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {sprint.assignedTo.slice(0, 4).map((member, idx) => (
                                        <Avatar key={idx} className="w-8 h-8 border-2 border-white dark:border-gray-800">
                                            <AvatarImage src={member.img} alt={member.name} />
                                            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                {member.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                                    {sprint.assignedTo.length > 4 && (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                                +{sprint.assignedTo.length - 4}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Alpha</span>
                            </div>
                        </div>
                    </div>

                    {/* Estimation and Overdue */}
                    <div className="flex justify-between items-center mt-2">
                        {sprint.estimation && (
                            <p className="text-xs text-gray-500 line-clamp-2">
                                Estimation: {sprint.estimation}
                            </p>
                        )}
                    </div>
                </CardContent>

                {/* FOOTER */}
                <CardFooter className="flex flex-col gap-2 mt-2">
                    <Button className="w-full flex items-center justify-center gap-1 bg-black text-white">
                        <EyeIcon className="w-4 h-4" />
                        View More
                    </Button>
                </CardFooter>
            </Card>
        </Card>
    );
}

export default SprintCard;
