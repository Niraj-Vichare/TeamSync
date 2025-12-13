import React, { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Crown, Eye, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'

// const TeamMemberDialog = ({ team }) => {
//   const [open, setOpen] = useState(false)
  
//   return (
//     <>
//       <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
//         View All
//       </Button>
//       {open && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
//             <h3 className="text-lg font-semibold mb-4">Team Members</h3>
//             <div className="space-y-3">
//               {team.members.map((member) => (
//                 <div key={member.profile.id} className="flex items-center gap-3 p-2 border rounded">
//                   <Avatar className="h-10 w-10">
//                     <AvatarImage src={member.profile.profileImageUrl} alt={member.profile.displayName} />
//                     <AvatarFallback>
//                       {member.profile.displayName.split(' ').map(n => n[0]).join('')}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2">
//                       <span className="font-medium">{member.profile.displayName}</span>
//                       {member.profile.isLeader && (
//                         <Crown className="h-4 w-4 text-yellow-600" />
//                       )}
//                     </div>
//                     <span className="text-sm text-gray-600">{member.departmentDto.departmentName}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <Button onClick={() => setOpen(false)} className="mt-4 w-full">
//               Close
//             </Button>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }

// export default TeamMemberDialog;


const TeamMemberDialog = ({ team }) => {
  const [open, setOpen] = useState(false);
  const teamLeaders = team.members.filter(member => member.profile?.isLeader)
  const teamMembers = team.members.filter(member => !member.profile?.isLeader)

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

          {team.members.map((member) => (
                <div key={member.profile.id} className="flex items-center gap-3 p-2 border rounded">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.profile.profileImageUrl} alt={member.profile.displayName} />
                    <AvatarFallback>
                      {member.profile.displayName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.profile.displayName}</span>
                      {member.profile.isLeader && (
                        <Crown className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{member.departmentDto.departmentName}</span>
                  </div>
                </div>
              ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberDialog