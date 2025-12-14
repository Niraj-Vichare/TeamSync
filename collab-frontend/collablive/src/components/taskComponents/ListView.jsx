import React, { useEffect, useState } from 'react'
import {motion} from 'framer-motion'
import ListRows from './ListRows';
import TaskRow from './TaskRow';

function ListView({taskData,onTaskUpdate,onEditTask,onDeleteTask}) {
  const [tasks,setTasks] = useState(taskData);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    NoStarted: true,
    InProgress: true,
    Complete: true
  });
  useEffect(() => {
    setTasks(taskData);
  }, [taskData]);

  const sections = [  
    { title: 'To-do', status: "NoStarted" },
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

    if (draggedTask && draggedTask.statusInString !== sectionStatus) {
      const updatedTasks = tasks.map(task =>
        task.id === draggedTask.id
          ? { ...task, statusInString: sectionStatus }
          : task
      );

      setTasks(updatedTasks);

      // ✅ Call parent handler
      if (onTaskUpdate) {
        onTaskUpdate(draggedTask.id,sectionStatus);
      }

      console.log(`Task "${draggedTask.title}" moved to ${sectionStatus}`);
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
  const handleEditTask=(task)=>{
    console.log(task);
    alert("Edit option should open");

  }
  const handleDeleteTask=(task)=>{
    alert("Delete option should open");
    

  }


  return (

    <><div className="space-y-4">
      {sections.map((section) => {
        const sectionTasks = tasks.filter(task => task.statusInString === section.status);
        
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
            onDelete={(task)=>onDeleteTask(task)}
            onEdit={(task)=>onEditTask(task)}
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
            Dragging: {draggedTask.title}
          </motion.div>
        )}

      </div></>
    
  )
}

export default ListView