import React from 'react'
import {motion} from 'framer-motion'
import { Badge } from '../ui/badge'
import { MessageCircleIcon, MoreHorizontal, Paperclip } from 'lucide-react'
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
        <div className='flex justify-between mb-2 gap-2'>
          <div>
            {task.tags && task.tags.map((tag, index) => (
              <Badge key={index} className="text-xs mr-1" variant="outline">{tag}</Badge>
            ))}
          </div>
        <DropdownMenu>
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
        </DropdownMenu>

        </div>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-sm line-clamp-2">{task.name}</h3>
        </div>
        <div className='min-h-min[40px] mb-4'>
          {task.description && task.description !== '-' && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-3">{task.description}</p>
          )}
        </div>
        <div className='flex items-center justify-between'>
          <div>
            {task.priority === 'High' && <Badge variant="destructive" className="text-xs">High</Badge>}
            {task.priority === 'Medium' && <Badge className="text-xs bg-yellow-400 text-white">Medium</Badge>}
            {task.priority === 'Low' && <Badge className="text-xs text-white">Low</Badge>}
          </div>
          <div className='flex items-center gap-4'>
            <div className=''>
              <Paperclip className='inline-block mr-1' size={14} />
              <span className='text-xs text-gray-500'>{task.attachments}</span>
            </div>
            <div>
              <MessageCircleIcon className='inline-block mr-1' size={14}/>
              <span className='text-xs text-gray-500'>{task.comments}</span>
            </div>
          </div>


        </div>
        

    </motion.div>
  )
}

export default TaskCard