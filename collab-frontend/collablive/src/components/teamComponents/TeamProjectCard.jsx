import React, { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Calendar, Clock, Crown, Users } from 'lucide-react';
import { Badge } from '../ui/badge';
import TeamMemberDialog from './TeamMemberDialog';

const TeamProjectCard = ({ team }) => {
  const teamLeaders = team.people.filter(person => person.isTeamLeader);
  const teamMembers = team.people.filter(person => !person.isTeamLeader);

  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300 border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h3 className="text-lg font-semibold">{team.name}</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {team.people.length} members
          </Badge>
        </div>
        
        <div className="space-y-2 mt-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">{team.project.projectName}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{team.sprint.sprintName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{team.sprint.duration}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 min-h-16">
        <div className='min-h-10'>
          {team.sprint.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-3">
              {team.sprint.description}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className={'flex justify-between items-center'}>
        {teamLeaders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Leader{teamLeaders.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {teamLeaders.slice(0, 2).map((person) => (
                  <div key={person.id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={person.avatar} alt={person.name} />
                      <AvatarFallback className="text-sm">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{person.name}</span>
                  </div>
                ))}
                {teamLeaders.length > 2 && (
                  <span className="text-xs text-gray-500">+{teamLeaders.length - 2} more</span>
                )}
              </div>
            </div>
          )}
        <TeamMemberDialog team={team} />
        
      </CardFooter>
    </Card>
  );
};
export default TeamProjectCard