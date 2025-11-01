import React from 'react'
import {motion} from 'framer-motion'
import { Badge } from '../ui/badge'
import { Edit2Icon, MessageCircleIcon, MoreHorizontal, Paperclip, Trash2Icon } from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'

function TaskCard({ task, onCardClick, onEdit, onDelete, isDragging, onDragStart, onDragEnd }) {

  return (
    <motion.div layout 
      layoutId={`task-${task.id}`}
      draggable
      onClick={() => onCardClick?.(task)}
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        y: 0,
        scale: isDragging ? 1.05 : 1,
        rotate: isDragging ? 2 : 0
      }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      whileHover={{ y: 0, boxShadow: "0 4px 20px rgba(0,0,100,0.1)" }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`rounded-lg border p-4 cursor-move hover:shadow-md transition-all mt-2 mb-3 ${
        isDragging ? 'shadow-xl border-blue-300 z-50' : ''
      }`}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
        <div className='flex justify-between mb-2 gap-1'>
          <div>
            <Badge className="text-xs mr-1" variant="outline">{task.project.projectTitle}</Badge>
            <Badge className="text-xs mr-1" variant="outline">{task.sprint.title}</Badge>
          </div>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => e.stopPropagation()} // 👈 prevent card click
            >
              <MoreHorizontal size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(task)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete?.(task)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
            onClick={() => onEdit(task)}
          >
            <Edit2Icon className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
            onClick={() => onDelete(task)}
          >
            <Trash2Icon className="w-4 h-4" />
          </Button>
        </div>

        </div>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-sm line-clamp-2">{task.title}</h3>
        </div>
        <div className='min-h-min[40px] mb-4'>
          {task.description && task.description !== '-' && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-3">{task.description}</p>
          )}
        </div>
        <div className='flex items-center justify-between'>
          <div>
            {task.priorityInString === 'High' && <Badge variant="destructive" className="text-xs">High</Badge>}
            {task.priorityInString === 'Medium' && <Badge className="text-xs bg-yellow-400 text-white">Medium</Badge>}
            {task.priorityInString === 'Low' && <Badge className="text-xs text-white">Low</Badge>}
          </div>
          <div className='flex items-center gap-4'>
            <div className='text-gray-600 text-xs'>
              {task.startDateInString} {task.endDateInString}
            </div>
            {/* <div className=''>
              <Paperclip className='inline-block mr-1' size={14} />
              <span className='text-xs text-gray-500'>{task.attachments}</span>
            </div>
            <div>
              <MessageCircleIcon className='inline-block mr-1' size={14}/>
              <span className='text-xs text-gray-500'>{task.comments}</span>
            </div> */}
          </div>


        </div>
        

    </motion.div>
  )
}

export default TaskCard