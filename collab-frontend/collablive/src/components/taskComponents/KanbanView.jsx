import React, { useState } from 'react'
import TaskCard from './TaskCard';
import KanbanColumn from './KanbanColumn';
import {motion} from 'framer-motion'


function KanbanView({tasksData,onTaskUpdate,onEditTask,onDeleteTask}) {
  const [tasks, setTasks] = useState(tasksData);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const columns = [
    { title: 'To-do', status: 'NoStarted' },
    { title: 'On Progress', status: 'InProgress' },
    { title: 'Completed', status: 'Complete' }
  ];

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDropTarget(null);
  };

  const handleDragOver = (e, columnStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(columnStatus);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropTarget(null);
    }
  };

  const handleDrop = (e, columnStatus) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.statusInString !== columnStatus) {
      const updatedTasks = tasks.map(task =>
        task.id === draggedTask.id
          ? { ...task, statusInString: columnStatus }
          : task
      );
      
      setTasks(updatedTasks);
      
      // Call the parent update function if provided
      if (onTaskUpdate) {
        onTaskUpdate(draggedTask.id,columnStatus);
      }
      
      // Show success feedback
      console.log(`Task "${draggedTask.title}" moved to ${columnStatus}`);
    }
    
    setDraggedTask(null);
    setDropTarget(null);
  };

  const handleDelete = (task) => {
    onDeleteTask(task);
  };

  return (
    <div className='grid grid-cols-3 gap-6'>
      {columns.map((column) => {
        const columnTasks = tasks.filter(task => task.statusInString === column.status);
        return (
          <KanbanColumn
              key={column.status}
              status={column.status}
              title={column.title}
              count={columnTasks.length}
              isDropTarget={dropTarget === column.status}
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {columnTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isDragging={draggedTask?.id === task.id}
                  onEdit={onEditTask}
                  onDelete={handleDelete}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}                  
                />
              ))}
            </KanbanColumn>
        );
      })}
      {draggedTask && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
        >
          Dragging: {draggedTask.title}
        </motion.div>
      )}
        
    </div>
  )
}

export default KanbanView
