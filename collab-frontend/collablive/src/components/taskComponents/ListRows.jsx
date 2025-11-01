import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import TaskRow from './TaskRow';
import TableHeaderRow from './TableHeaderRow';


function ListRows({ 
  title, 
  count, 
  tasks, 
  isExpanded, 
  onToggleExpanded, 
  draggedTask, 
  isDropTarget,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  status
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-muted';
      case 'progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  return (
    <motion.div
      layout
      className={`border rounded-lg mb-4 bg-card ${
        isDropTarget ? 'border-primary bg-accent/50' : 'border-border'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Section Header */}
      <div 
        className="flex items-center justify-between p-4 bg-muted/30 rounded-t-lg cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        </div>
      </div>

      {/* Section Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <TableHeaderRow />
                </thead>
                <tbody>
                  {tasks.length > 0 ? (
                    <AnimatePresence>
                      {tasks.map(task => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          isDragging={draggedTask?.id === task.id}
                          onDragStart={onDragStart}
                          onDragEnd={onDragEnd}
                          onEdit={(task)=>onEdit(task)}
                          onDelete={(task)=>onDelete(task)}
                        />
                      ))}
                    </AnimatePresence>
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        No tasks in this section
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop zone indicator when collapsed */}
      {!isExpanded && isDropTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border-t bg-accent text-accent-foreground text-sm text-center"
        >
          Drop task here to move to {title}
        </motion.div>
      )}
    </motion.div>
  );
}



export default ListRows