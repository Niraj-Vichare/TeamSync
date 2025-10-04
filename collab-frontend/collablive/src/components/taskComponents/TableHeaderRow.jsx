import { Calendar, CheckSquare, Flag, FolderOpen, GripVertical, MoreHorizontal, Zap } from 'lucide-react';
import React from 'react'

function TableHeaderRow() {
  return (
    <tr className="bg-muted/50 border-b">
      <th className="w-12 p-3 text-center">
        <GripVertical size={14} className="text-muted-foreground mx-auto" />
      </th>
      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[250px]">
        <div className="flex items-center gap-2">
          <CheckSquare size={14} />
          Task Name
        </div>
      </th>
      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[300px]">
        Description
      </th>
      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[200px]">
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          Estimation
        </div>
      </th>
      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[150px]">
        <div className="flex items-center gap-2">
          <FolderOpen size={14} />
          Project
        </div>
      </th>
      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[130px]">
        <div className="flex items-center gap-2">
          <Zap size={14} />
          Sprint
        </div>
      </th>
      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[120px]">
        <div className="flex items-center gap-2">
          <Flag size={14} />
          Priority
        </div>
      </th>
      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[120px]">
        <div className="flex items-center gap-2">
          Action
        </div>
      </th>
    </tr>
  );
}


export default TableHeaderRow