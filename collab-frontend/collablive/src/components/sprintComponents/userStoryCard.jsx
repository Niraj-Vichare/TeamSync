import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {  Calendar, Eye, Flag, Tag, Target, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const StoryCard = ({ story, onIncludeInSprint, onViewDetails }) => {
  console.log("Rendering StoryCard with story:", story);
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-md min-h-[360px] hover:shadow-lg transition-shadow duration-200 border-l-4">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{story.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-1 break-words">{story.description}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Project & Sprint */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {story.projectName}
          </Badge>
          {story.sprintName ? (
            <Badge className="bg-blue-600 text-white text-xs">
              Sprint {story.sprintName}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 bg-orange-50">
              Backlog / Wishlist
            </Badge>
          )}
        </div>

        {/* Status & Priority Row */}
        <div className="flex items-center justify-between">
          <Badge className={`text-xs ${getStatusColor(story.statusInString)}`}>
            {story.statusInString}
          </Badge>
          <Badge className={`text-xs ${getPriorityColor(story.priorityInString)}`}>
            <Flag className="w-3 h-3 mr-1" />
            {story.priorityInString}
          </Badge>
        </div>

        {/* Team & Points */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            <span>{story.assignedToName || 'Unassigned'}</span>
          </div>
          {story.points && (
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-1" />
              <span>{story.points} pts</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {story.tags.split(",").map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewDetails(story)}
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
          {!story.sprintId && (
            console.log("Include in Sprint Button Rendered",story.ticketGuid),
            <Button 
              className="flex-1 text-white"
              onClick={() => onIncludeInSprint(story.ticketGuid)}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Include in Sprint
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryCard;