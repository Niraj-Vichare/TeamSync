
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, CheckCircle, CircuitBoardIcon, Clock3, Clock3Icon, FilterIcon, ListIcon, Pause, PauseIcon, Pencil, PencilIcon, PenIcon, Plus, PlusIcon, SquareKanbanIcon, Tag, Trash, Trash2Icon } from 'lucide-react'
import React, { useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import clsx from 'clsx';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import TeamDataTable from '@/components/teamComponents/TeamDataTable';
import { teamMembers } from '@/data/general';
import ListView from '@/components/taskComponents/ListView';
import TimelineView from '@/components/taskComponents/TimelineView';
import KanbanView from '@/components/taskComponents/KanbanView';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

function Task() {
  const [open, setOpen] = useState(false);
  const [act, setAct] = useState('list');
  const [subtasks, setSubtasks] = useState([]);

  // State to manage the task creation form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(null);
  const [status, setStatus] = useState('not-started');
  const [date, setDate] = useState(null);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: 'Employee Details page',
      description: 'Create a page where there is information about employees',
      type: 'Dashboard',
      priority: 'Medium',
      status: 'todo',
      assignees: ['AL', 'DT'],
      estimation: 'Feb 14, 2024 - Feb 1, 2024',
      timeline: { start: 'Thu 13', end: 'Fri 14' },
      project: 'HR System',
      tags:["Management","UI"],  
      sprint: 'Sprint 1',
      comments: 3,
      attachments: 2
    },
    {
      id: 2,
      name: 'Darkmode version',
      description: 'Darkmode version for all screens',
      type: 'Mobile app',
      priority: 'Low',
      status: 'todo',
      assignees: ['AL', 'DT'],
      estimation: 'Feb 14, 2024 - Feb 1, 2024',
      timeline: { start: 'Tue 11', end: 'Wed 12' },
      project: 'Mobile App',
      tags:["Management","UI"],  
      sprint: 'Sprint 1',
      comments: 2,
      attachments: 1
    },
    {
      id: 3,
      name: 'Super Admin Role',
      description: 'Create super admin functionality with advanced permissions',
      type: 'Dashboard',
      priority: 'Medium',
      status: 'todo',
      assignees: ['AL', 'DT'],
      estimation: 'Feb 14, 2024 - Feb 1, 2024',
      timeline: { start: 'Sun 16', end: 'Mon 17' },
      tags:["Management","UI"],  
      project: 'Admin Panel',
      sprint: 'Sprint 2',
      comments: 1,
      attachments: 0
    },
    {
      id: 4,
      name: 'Super Admin Role Implementation',
      description: 'Implementation of admin role features',
      type: 'Dashboard',
      priority: 'High',
      status: 'progress',
      assignees: ['DT'],
      tags:["Management","UI"],  
      estimation: 'Feb 14, 2024 - Feb 1, 2024',
      project: 'Admin Panel',
      sprint: 'Sprint 1',
      comments: 5,
      attachments: 3
    },
    {
      id: 5,
      name: 'Settings page',
      description: 'User settings and preferences page',
      type: 'Mobile app',
      priority: 'Medium',
      status: 'progress',
      tags:["Management","UI"],  

      assignees: ['AL', 'DT'],
      estimation: 'Feb 14, 2024 - Feb 1, 2024',
      project: 'Mobile App',
      sprint: 'Sprint 1',
      comments: 2,
      attachments: 1
    },
    {
      id: 6,
      name: 'KPI and Employee Statistics',
      description: 'Create a design that displays KPIs and employee statistics',
      type: 'Dashboard',
      priority: 'Low',
      status: 'progress',
      assignees: ['DT'],
      tags:["Management","UI"],  

      estimation: 'Feb 14, 2024 - Feb 1, 2024',
      timeline: { start: 'Thu 13', end: 'Sat 15' },
      project: 'Analytics',
      sprint: 'Sprint 2',
      comments: 4,
      attachments: 2
    },
    {
      id: 7,
      name: 'Customer Role Management',
      description: 'Implement customer role permissions',
      type: 'Dashboard',
      priority: 'Medium',
      status: 'review',
      assignees: ['AL'],
      tags:["Management","UI"],  
      estimation: 'Feb 14, 2024 - Feb 1, 2024',
      project: 'Admin Panel',
      sprint: 'Sprint 1',
      comments: 2,
      attachments: 1
    },
    {
      id: 8,
      name: 'Design system & Style guide',
      description: 'Create comprehensive design system',
      type: 'Design',
      priority: 'High',
      status: 'review',
      assignees: ['DT', 'AL'],
      estimation: 'Feb 14, 2024 - Feb 1, 2024',
      project: 'Design System',
      tags:["Management","UI"],  
      sprint: 'Sprint 2',
      comments: 8,
      attachments: 5
    },
    {
      id: 9,
      name: 'Mobile App Optimization',
      description: 'Performance optimization for mobile app',
      type: 'Mobile app',
      priority: 'High',
      status: 'completed',
      assignees: ['DT'],
      estimation: 'Feb 14, 2024 - Feb 1, 2024',
      project: 'Mobile App',
      tags:["Management","UI"],  
      sprint: 'Sprint 1',
      comments: 6,
      attachments: 3
    },
    {
      id: 10,
      name: 'User Authentication System',
      description: 'Complete authentication flow implementation',
      type: 'Dashboard',
      priority: 'High',
      status: 'completed',
      assignees: ['AL', 'DT'],
      tags:["Management","UI"],  
      estimation: 'Feb 14, 2024 - Feb 1, 2024',
      project: 'Auth System',
      sprint: 'Sprint 1',
      comments: 10,
      attachments: 4
    }
  ]);



  const addSubtask = () => {
    setSubtasks((prev) => [...prev, ""])
  }

  const createTask = async() => {
    // Logic to create a task
    try{
      let task = {
        title: taskTitle,
        description: taskDescription,
        assignedTo:assignedTo,
        priority: priority,
        dueDate: dueDate,
        status: status,
        subtasks: subtasks
      }

    }catch(e){
      console.error("Error creating task:", e);
    }finally{
      setOpen(false);
    }
  }

  const updateSubtask = (index, value) => {
    setSubtasks((prev) => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  const removeSubtask = (index) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index))
  }
  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>Task</h1>
          <p className='text-sm text-muted-foreground'>Break down work into manageable actions to stay productive and accountable.</p>
        </div>
        <div className="pb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild/>
            <Button variant="outline" className='ml-3'>
              <FilterIcon className='w-4 h-4'/>
              Sprints
            </Button>
            <DropdownMenuContent>
              <DropdownMenuItem>Active</DropdownMenuItem>
              <DropdownMenuItem>InActive</DropdownMenuItem>
              <DropdownMenuItem>Active</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild/>
            <Button variant="outline" className='ml-3 mr-2'>
              <FilterIcon className='w-4 h-4'/>
              Projects
            </Button>
            <DropdownMenuContent>
              <DropdownMenuItem>Active</DropdownMenuItem>
              <DropdownMenuItem>InActive</DropdownMenuItem>
              <DropdownMenuItem>Active</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className={'text-white'}>
                <PlusIcon className='w-3 h-3'/>
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              {/* Fixed Header */}
              <DialogHeader className="px-2 border-b-2 py-2">
                <DialogTitle className={'text-xl font-semibold flex items-center gap-2'}>
                  {/* <PenIcon className='w-4 h-4'/> */}
                  Create Task
                </DialogTitle>
              </DialogHeader>
              <ScrollArea  className="max-h-[70vh]">
                {/* Scrollable Body */}
                <div className="space-y-5 pt-3 px-2">
                  
                    {/* Task Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name"  className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Task Name
                      </Label>
                      <Input id="name" placeholder="Enter task title" />
                    </div>

                    {/* Task Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description"  className="flex items-center gap-2">Description</Label>
                      <Textarea id="description" placeholder="Brief task details" />
                    </div>
                    

                    {/* Assign + Priority */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">Assign To</Label>
                        <Select>
                          <SelectTrigger className={'w-full'}>
                            <SelectValue placeholder="Select a person" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alice">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src="https://i.pravatar.cc/150?u=alice" />
                                  <AvatarFallback>A</AvatarFallback>
                                </Avatar>
                                Alice
                              </div>
                            </SelectItem>
                            <SelectItem value="bob">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src="https://i.pravatar.cc/150?u=bob" />
                                  <AvatarFallback>B</AvatarFallback>
                                </Avatar>
                                Bob
                              </div>
                            </SelectItem>
                            <SelectItem value="charlie">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src="https://i.pravatar.cc/150?u=charlie" />
                                  <AvatarFallback>C</AvatarFallback>
                                </Avatar>
                                Charlie
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">Priority</Label>
                        <Select>
                          <SelectTrigger className={'w-full'}>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { value: "high", label: "High", color: "text-red-500" },
                              { value: "medium", label: "Medium", color: "text-yellow-500" },
                              { value: "low", label: "Low", color: "text-green-500" },
                            ].map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                <span className={clsx("font-medium", p.color)}>{p.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {/* Project Name and Sprint Name */}
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-3'>
                        <Label>Project Name</Label>
                        <Select>
                          <SelectTrigger className={'w-full'}>
                            <SelectValue placeholder="Select a person" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alice">
                                
                                Alice
                              
                            </SelectItem>
                            <SelectItem value="bob">
                              
                                Bob
                              
                            </SelectItem>
                            <SelectItem value="charlie">
                                Charlie                              
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='space-y-3'>
                        <Label>Sprint Name</Label>
                        <Select>
                          <SelectTrigger className={'w-full'}>
                            <SelectValue placeholder="Select a person" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alice">
                                
                                Alice
                              
                            </SelectItem>
                            <SelectItem value="bob">
                              
                                Bob
                              
                            </SelectItem>
                            <SelectItem value="charlie">
                                Charlie                              
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        
                      </div>

                    </div>

                    {/* Due Date + Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select>
                          <SelectTrigger className={'w-full'}>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not-started">
                              <div className="flex items-center gap-2">
                                <Pause className="h-4 w-4 text-gray-500" />
                                Not Started
                              </div>
                            </SelectItem>
                            <SelectItem value="in-progress">
                              <div className="flex items-center gap-2">
                                <Clock3 className="h-4 w-4 text-blue-500" />
                                In Progress
                              </div>
                            </SelectItem>
                            <SelectItem value="completed">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Completed
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                    </div>

                  </div>
                  {/* Advanced Section */}
                  <Accordion type="single" collapsible>
                    <AccordionItem value="advanced">
                      <AccordionTrigger>Advanced Options</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-3">
                          {/* Subtasks */}
                          <div className="flex items-center justify-between">
                            <Label>Subtasks</Label>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={addSubtask}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {subtasks.map((task, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2"
                            >
                              <Input
                                value={task}
                                onChange={(e) =>
                                  updateSubtask(idx, e.target.value)
                                }
                                placeholder={`Subtask ${idx + 1}`}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSubtask(idx)}
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </ScrollArea>

              {/* Fixed Footer */}
              <DialogFooter className="px-6 py-4 border-t">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button className='text-white' onClick={() => setOpen(false)}>Save Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
        </div>
      </div>
      <Tabs value={act} onValueChange={setAct}>
        <TabsList className='flex overflow-x-auto gap-2'>
          <TabsTrigger value="list" className="flex items-center gap-2 whitespace-nowrap p-2">
            <ListIcon className='w-4 h-4' />
            <span className='text-sm'>Task List</span>
          </TabsTrigger>
          {/* <TabsTrigger value="timeline" className="flex items-center gap-2 whitespace-nowrap p-2">
            <CalendarIcon className='w-4 h-4' />
            <span className='text-sm'>Timeline View</span>
          </TabsTrigger> */}
          <TabsTrigger value="kanban" className="flex items-center gap-2 whitespace-nowrap p-2">
            <SquareKanbanIcon className='w-4 h-4' />
            <span className='text-sm'>Kanban Board</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className='mt-6'>
          <ListView taskData={tasks}/>
        </TabsContent>
        {/* <TabsContent value="timeline" className={'mt-6'}>
          <TimelineView tasks={tasks}/>
        </TabsContent> */}
        <TabsContent value="kanban" className={'mt-6'}>
          <KanbanView tasksData={tasks}/>
        </TabsContent>

      </Tabs>


    </div>
  )
}

export default Task