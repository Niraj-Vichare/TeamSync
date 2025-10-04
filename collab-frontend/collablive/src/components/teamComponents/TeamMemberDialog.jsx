import { Crown, Eye, Mail, User, Users } from 'lucide-react';
import React, { useState } from 'react'
import { Badge } from '../ui/badge';
import { Avatar } from '@radix-ui/react-avatar';
import { AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';

const TeamMemberDialog = ({ team }) => {
  const [open, setOpen] = useState(false);
  const teamLeaders = team.people.filter(person => person.isTeamLeader);
  const teamMembers = team.people.filter(person => !person.isTeamLeader);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-2 text-white">
          <Eye className="h-4 w-4" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5" />
            {team.name} - Team Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">

          {/* Team Leaders */}
          {teamLeaders.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                Team Leader{teamLeaders.length > 1 ? 's' : ''} ({teamLeaders.length})
              </h3>
              <div className="grid gap-3">
                {teamLeaders.map((person) => (
                  <div key={person.id} className="flex items-start gap-4 p-4 rounded-lg border">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={person.avatar} alt={person.name} />
                      <AvatarFallback className="bg-yellow-200 text-yellow-800">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{person.name}</h4>
                        <Badge variant="secondary" className="text-xs bg-yellow-200 text-yellow-800">
                          Leader
                        </Badge>
                      </div>
                      <div className="flex text-sm gap-2 items-center text-gray-600">
                        <p className="flex items-center gap-2">
                          <User className="h-4 w-4 text-white" />
                          {person.role}
                        </p>
                        <p className="flex items-center gap-2 align-middle text-center">
                          <Mail className="h-4 w-4 text-white" />
                          {person.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Members */}
          {teamMembers.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-600" />
                Team Member{teamMembers.length > 1 ? 's' : ''} ({teamMembers.length})
              </h3>
              <div className="grid gap-3">
                {teamMembers.map((person) => (
                  <div key={person.id} className="flex items-start gap-4 p-4 rounded-lg border">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={person.avatar} alt={person.name} />
                      <AvatarFallback className="bg-gray-200">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{person.name}</h4>
                      <div className="flex text-sm gap-2 items-center text-gray-600">
                        <p className="flex items-center gap-2">
                          <User className="h-4 w-4 text-white" />
                          {person.role}
                        </p>
                        <p className="flex items-center gap-2 align-middle text-center">
                          <Mail className="h-4 w-4 text-white" />
                          {person.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberDialog