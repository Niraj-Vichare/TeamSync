import React from 'react'
import {AnimatePresence, motion} from 'framer-motion'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { Card } from '../ui/card'



function KanbanColumn({ status, title, count, children, onDrop, isDropTarget, onDragOver, onDragLeave }) {
  return (
    <motion.div 
      className={`border-2 p-2 rounded-lg transition-all duration-200 ${
        isDropTarget ? 'border-blue-400' : 'border-gray-200'
      }`}
      layout
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <Card className="flex items-center justify-between sticky top-0 p-3 rounded-lg shadow-sm mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            status === 'NotStarted' ? 'bg-gray-400' :
            status === 'InProgress' ? 'bg-blue-500' :
            'bg-green-500'
          }`}></div>
          {title}
          <Badge variant="secondary" className="ml-2">
            {count}
          </Badge>
        </h3>
      </Card>
      
      <motion.div 
        className={`min-h-[400px] transition-all duration-200 ${
          isDropTarget ? 'bg-blue-25' : ''
        }`}
        layout
      >
        <AnimatePresence>
          {children}
        </AnimatePresence>
        
        {count === 0 && (
          <motion.div 
            className="flex items-center justify-center h-32 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Drop tasks here
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default KanbanColumn