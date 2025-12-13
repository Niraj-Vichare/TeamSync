import React, { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Clock, Crown, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import TeamMemberDialog from './TeamMemberDialog'

const TeamProjectCard = ({ team }) => {
  const teamLeaders = team.members.filter(member => member.profile?.isLeader)
  const teamMembers = team.members.filter(member => !member.profile?.isLeader)

  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300 border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h3 className="text-lg font-semibold">{team.name}</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
          </Badge>
        </div>
        
        {team.tagline && (
          <div className="mt-3">
            <p className="text-sm text-gray-600">{team.tagline}</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Departments</h4>
            <div className="flex flex-wrap gap-2">
              {[...new Set(team.members.map(m => m.departmentDto.departmentName))].map((dept, idx) => {
                const deptData = team.members.find(m => m.departmentDto.departmentName === dept).departmentDto
                return (
                  <Badge key={idx} variant="outline" className="text-xs">
                    <div 
                      className="w-2 h-2 rounded-full mr-1.5" 
                      style={{ backgroundColor: `${deptData.departmentColor}` }}
                    />
                    {dept}
                  </Badge>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t pt-4">
        {teamLeaders.length > 0 && (
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4" />
              <span className="text-sm font-medium">
                Leader{teamLeaders.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {teamLeaders.slice(0, 2).map((member) => (
                <div key={member.profile.id} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.profile.profileImageUrl} alt={member.profile.displayName} />
                    <AvatarFallback className="text-xs">
                      {member.profile.displayName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{member.profile.displayName}</span>
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
  )
}
export default TeamProjectCard;