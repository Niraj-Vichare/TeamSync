import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircleDot, Pencil, CalendarPlus } from "lucide-react";
import { Button } from "../ui/button";

const BugCard = ({
  bug,
  onStepViewClick,
  onEditClick,
  onIncludeInSprint
}) => {
  {console.log("Rendering BugCard with bug:", bug)}
  const getStatusBadge = () => {
    switch (bug.statusInString.toLowerCase()) {
      case "open": return "bg-red-600 text-white";
      case "progress": return "bg-orange-500 text-white";
      case "closed": return "bg-purple-800 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getPriorityBadge = () => {
    switch (bug.priorityInString.toLowerCase()) {
      case "high": return "bg-red-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "low": return "bg-green-500 text-white";
      default: return "bg-gray-400 text-white";
    }
  };

  return (
    <Card className="w-full shadow-md border rounded-xl hover:shadow-xl transition-all">
      {/* Header */}
      <CardHeader className="pb-1">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{bug.title}</CardTitle>
          <Badge className={`mb-2 flex items-center gap-1 ${getStatusBadge()}`}>
            <CircleDot className="w-4 h-4" />
            {bug.statusInString.charAt(0).toUpperCase() + bug.statusInString.slice(1)}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          <Badge variant="default">UI Bugs</Badge>
          {bug.sprintId ? (
            <Badge variant="outline">{bug.sprintName}</Badge>
          ) : (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Backlog
            </Badge>
          )}
          <Badge className={`${getPriorityBadge()}`}>{bug.priorityInString}</Badge>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent>
        <p className="leading-relaxed mt-2 line-clamp-3">{bug.description}</p>
        <p className="mt-2 text-xs text-gray-400">Reported By: {bug.assignedToName || "Unassigned"}</p>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => onEditClick(bug)}
          className="flex items-center gap-1"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Button>

        {!bug.sprintId && (
          <Button
            variant="outline"
            onClick={() => onIncludeInSprint(bug.ticketGuid,bug.projectId)}
            className="flex items-center gap-1"
          >
            <CalendarPlus className="w-4 h-4" />
            Include in Sprint
          </Button>
        )}

        <Button
          variant="default"
          className="text-white"
          onClick={() => onStepViewClick(bug)}
        >
          View / Generate Steps
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BugCard;
