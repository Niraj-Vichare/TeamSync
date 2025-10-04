import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { EyeIcon, TicketIcon } from 'lucide-react';

function SprintCard({ sprint }) {
    console.log(sprint);
    const getStatusColor = (statusDescription) => {
        switch (statusDescription) {
            case "Active":
                return { primary: "bg-blue-500", secondary: "bg-blue-500", tertiary: "bg-blue-50", border: "border-blue-500", badge: "bg-blue-500 text-white" };
            case "Upcoming":
                return { primary: "bg-yellow-500", secondary: "bg-yellow-500", tertiary: "bg-yellow-50", border: "border-yellow-500", badge: "bg-yellow-500 text-white" };
            case "Overdue":
                return { primary: "bg-red-500", secondary: "bg-red-500", tertiary: "bg-red-50", border: "border-red-500", badge: "bg-red-500 text-white" };
            case "Completed":
                return { primary: "bg-green-500", secondary: "bg-green-500", tertiary: "bg-green-50", border: "border-green-500", badge: "bg-green-500 text-white" };
            default:
                return { primary: "bg-gray-500", secondary: "bg-gray-500", tertiary: "bg-gray-50", border: "border-gray-500", badge: "bg-gray-500 text-white" };
        }
    };

    const colors = getStatusColor(sprint.statusDescription);

    return (
        <Card className={`${colors.tertiary} p-1 pb-2 rounded-xl flex justify-center items-center h-[450px]`}>
            <Card className={`w-full max-w-md rounded-xl shadow-md border-2 ${colors.border} hover:shadow-xl transition-all h-[450px]`}>
                {/* HEADER */}
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">{sprint.title}</CardTitle>
                        <Badge className={`text-xs px-2 py-1 ${colors.secondary} text-white`}>{sprint.statusDescription}</Badge>
                    </div>

                    <p className="text-sm text-gray-500 italic min-h-[18px]">{sprint.tagline || ""}</p>
                    <p className="text-xs text-gray-400">ID: {sprint?.sprintGuid}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-1">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-1">
                            {sprint.tags.split(",").slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline">{tag}</Badge>
                            ))}
                            {sprint.tags.split(",").length > 3 && (
                                <Badge variant="outline">
                                    +{sprint.tags.split(",").length - 3}
                                </Badge>
                            )}
                        </div>

                    </div>
                </CardHeader>

                {/* CONTENT */}
                <CardContent className="text-sm flex flex-col justify-between">
                    {/* Goal / Description */}
                    <div className="text-gray-400 break-words line-clamp-2 h-[100px]">
                        {sprint.goal}
                    </div>

                    {/* Assigned + Tickets */}
                    <div className='flex justify-between align-middle mt-3'>
                        <div className='space-y-2'>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">No of Tickets</p>
                            <div className='flex items-center gap-2 align-middle'>
                                <TicketIcon className='w-4 h-4 text-yellow-300' />
                                {sprint.tickets == null ?0:sprint.tickets}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Assigned To</p>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center space-x-2">
                                    {/* Team Avatar */}
                                    <Avatar className="w-8 h-8 border-2 border-white dark:border-gray-800">
                                        <AvatarImage src={sprint.teamModel?.teamAvatar} alt={sprint.teamModel?.teamName} />
                                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                            {sprint.teamModel?.teamName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Team Name */}
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {sprint.teamModel?.teamName || "Unknown Team"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Estimation and Overdue */}
                    <div className="flex justify-between items-center mt-2">
                        {sprint.estimatedDateRange && (
                            <p className="text-xs text-gray-500">
                                Estimation: {sprint.estimatedDateRange}
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
