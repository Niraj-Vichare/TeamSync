import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, CheckSquare, DeleteIcon, Flag, FolderOpen, GripVertical, MoreHorizontal, PenIcon, Trash2, Zap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

// Task Row Component
function TaskRow({ task, isDragging, onDragStart, onDragEnd,onEdit,onDelete }) {
  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <motion.tr
      layout
      layoutId={`task-row-${task.id}`}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, y: -10 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        scale: isDragging ? 1.02 : 1,
        y: 0
      }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      whileHover={{ backgroundColor: 'var(--muted)' }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`border-b  group hover:bg-muted/50 ${
        isDragging ? 'shadow-lg z-50 bg-accent' : ''
      }`}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* Drag Handle */}
      <td className="w-12 p-3 text-center">
        <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={16} className="text-muted-foreground" />
        </div>
      </td>

      {/* Task Name */}
      <td className="p-3 w-[200px] border-r-1">
        <div className="flex items-center">
          {/* <CheckSquare size={16} className="text-muted-foreground flex-shrink-0" /> */}
          <span className="font-medium truncate">{task.title}</span>
        </div>
      </td>

      {/* Description */}
      <td className="p-3 w-[300px] border-r-1">
        <p className="text-sm text-muted-foreground  line-clamp-2">
          {task.description || '-'}
          
        </p>
      </td>

      {/* Estimation */}
      <td className="p-3 w-[200px] border-r-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {/* <Calendar size={14} className="flex-shrink-0" /> */}
          {task.startDateInString && task.endDateInString ? (
            <span className="truncate">{`${task.startDateInString} - ${task.endDateInString}`}</span>
          ) : (
            <span className="text-xs italic text-muted-foreground">No dates</span>
          )}
        </div>
      </td>

      {/* Project Name */}
      <td className="p-3 w-[150px] border-r-1">
        <div className="flex items-center gap-2">
          {/* <FolderOpen size={14} className="text-muted-foreground flex-shrink-0" /> */}
          <Badge variant="outline" className="text-xs truncate">
            {task.project?.projectTitle || ''}
          </Badge>
        </div>
      </td>

      {/* Sprint Name */}
      <td className="p-3 w-[130px] border-r-1">
        <div className="flex items-center gap-2">
          {/* <Zap size={14} className="text-muted-foreground flex-shrink-0" /> */}
          <Badge variant="secondary" className="text-xs truncate">
            {task.sprint?.title || ''}
          </Badge>
        </div>
      </td>

      {/* Priority */}
      <td className="p-3 w-[120px] border-r-1">
        <div className="flex items-center gap-2">
          {/* <Flag size={14} className="text-muted-foreground flex-shrink-0" /> */}
          <Badge variant={getPriorityVariant(task.priorityInString)} className="text-xs">
            {task.priorityInString}
          </Badge>
        </div>
      </td>

      {/* Actions */}
      <td className="p-3 text-center flex items-center justify-center">
            <PenIcon className='w-3 h-3 mr-2' onClick={()=>onEdit(task)}/>
            <Trash2 className='w-3 h-3' onClick={()=>onDelete(task)}/>

      </td>
    </motion.tr>
  );
}

export default TaskRow