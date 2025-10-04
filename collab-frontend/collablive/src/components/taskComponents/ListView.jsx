import React, { useState } from 'react'
import {motion} from 'framer-motion'
import ListRows from './ListRows';
import TaskRow from './TaskRow';

function ListView({taskData}) {
  const [tasks,setTasks] = useState(taskData);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    todo: true,
    progress: true,
    review: true,
    completed: true
  });

  const sections = [
    { title: 'To-do', status: 'todo' },
    { title: 'On Progress', status: 'progress' },
    { title: 'In Review', status: 'review' },
    { title: 'Completed', status: 'completed' }
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

  const handleDragOver = (e, sectionStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(sectionStatus);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropTarget(null);
    }
  };

  const handleDrop = (e, sectionStatus) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.status !== sectionStatus) {
      const updatedTasks = tasks.map(task =>
        task.id === draggedTask.id
          ? { ...task, status: sectionStatus }
          : task
      );
      
      setTasks(updatedTasks);
      
      if (onTaskUpdate) {
        onTaskUpdate(draggedTask.id, { status: sectionStatus });
      }
      
      console.log(`Task "${draggedTask.name}" moved to ${sectionStatus}`);
    }
    
    setDraggedTask(null);
    setDropTarget(null);
  };

  const toggleSection = (sectionStatus) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionStatus]: !prev[sectionStatus]
    }));
  };


  return (

    <><div className="space-y-4">
      {sections.map((section) => {
        const sectionTasks = tasks.filter(task => task.status === section.status);

        return (
          <ListRows
            key={section.status}
            title={section.title}
            status={section.status}
            count={sectionTasks.length}
            tasks={sectionTasks}
            isExpanded={expandedSections[section.status]}
            onToggleExpanded={() => toggleSection(section.status)}
            draggedTask={draggedTask}
            isDropTarget={dropTarget === section.status}
            onDragOver={(e) => handleDragOver(e, section.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, section.status)}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd} />
        );
      })}
    </div><div>
        {draggedTask && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-primary px-4 py-2 rounded-lg shadow-lg z-50"
          >
            Dragging: {draggedTask.name}
          </motion.div>
        )}

      </div></>
    
  )
}

export default ListView