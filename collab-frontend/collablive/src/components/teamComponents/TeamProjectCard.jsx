import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Users, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TeamMemberDialog from './TeamMemberDialog';

const TeamProjectCard = ({ team, onEdit, onDelete }) => {
  // ✅ Guard — members may be null on a freshly created team
  const members     = team.members ?? [];
  const teamLeaders = members.filter(m => m.profile?.isLeader);

  // ✅ Guard — departmentDto may be null
  const departments = [
    ...new Set(
      members
        .filter(m => m.departmentDto?.departmentName)
        .map(m => m.departmentDto.departmentName)
    )
  ];

  return (
    <Card className="w-full hover:shadow-sm transition-shadow duration-200 border flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Users className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <h3 className="text-sm font-semibold truncate">{team.name}</h3>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Badge variant="secondary" className="text-xs">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </Badge>
            {/* ✅ Edit button */}
            <Button variant="ghost" size="icon" className="h-7 w-7"
              onClick={() => onEdit?.(team)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            {/* ✅ Delete button */}
            <Button variant="ghost" size="icon" className="h-7 w-7"
              onClick={() => onDelete?.(team)}>
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </Button>
          </div>
        </div>

        {team.tagline && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{team.tagline}</p>
        )}
      </CardHeader>

      <CardContent className="pt-0 flex-1">
        {departments.length > 0 ? (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Departments</h4>
            <div className="flex flex-wrap gap-1.5">
              {departments.map((dept, idx) => {
                const color = members.find(
                  m => m.departmentDto?.departmentName === dept
                )?.departmentDto?.departmentColor;
                return (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {color && (
                      <div className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: color }} />
                    )}
                    {dept}
                  </Badge>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No members assigned yet.</p>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t pt-3">
        {teamLeaders.length > 0 ? (
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-medium">
                Leader{teamLeaders.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {teamLeaders.slice(0, 2).map(member => (
                <div key={member.profile?.id} className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={member.profile?.profileImageUrl} />
                    <AvatarFallback className="text-xs">
                      {member.profile?.displayName?.split(' ').map(n => n[0]).join('') ?? '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{member.profile?.displayName}</span>
                </div>
              ))}
              {teamLeaders.length > 2 && (
                <span className="text-xs text-muted-foreground">+{teamLeaders.length - 2} more</span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No leader assigned</span>
        )}
        <TeamMemberDialog team={team} />
      </CardFooter>
    </Card>
  );
};

export default TeamProjectCard;