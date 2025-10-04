import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Mail, User } from "lucide-react";

function DepartmentCard({ department }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className={`relative w-80 overflow-hidden rounded-lg shadow-md ${department.backgroundColor}`}>
          <CardHeader>
              <CardTitle className="text-xl font-bold">{department.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{department.tagline}</p>
          </CardHeader>

          <CardContent className="flex items-center justify-between">
              <p className="text-sm">
                  Members:{" "}
                  <span className="font-semibold">{department.members?.length || 0}</span>
              </p>
              <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                      <Button size="sm" variant="secondary">
                          View Members
                      </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
                      <DialogHeader>
                          <DialogTitle>{department.name} Members</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                          {department.members?.map((member) => (
                              <div
                                  key={member.id}
                                  className="flex items-center gap-3 border rounded-md p-2"
                              >
                                  <Avatar className="w-12 h-12">
                                      <AvatarImage src={member.avatar} alt={member.name} />
                                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                      <h4 className="font-medium mb-1">{member.name}</h4>
                                      <div className="flex text-sm gap-3 items-center text-gray-600">
                                          <p className="flex items-center gap-2">
                                              <User className="h-4 w-4" />
                                              {member.role}
                                          </p>
                                          <p className="flex items-center gap-2 align-middle text-center">
                                              <Mail className="h-4 w-4" />
                                              {member.email}
                                          </p>
                                      </div>
                                  </div>
                                  
                              </div>
                          ))}
                      </div>
                  </DialogContent>
              </Dialog>
          </CardContent>
      </Card>
  );
}

export default DepartmentCard;
