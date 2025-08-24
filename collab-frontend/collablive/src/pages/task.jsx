
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, CheckCircle, CircuitBoardIcon, Clock3, Clock3Icon, ListIcon, Pause, PauseIcon, Plus, SquareKanbanIcon, Trash, Trash2Icon } from 'lucide-react'
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
          <h1 className='text-2xl font-bold text-white'>Task</h1>
          <p className='text-sm text-muted-foreground'>Break down work into manageable actions to stay productive and accountable.</p>
        </div>
        <div className="pb-6">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Task</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] p-0">
              {/* Fixed Header */}
              <DialogHeader className="px-6 py-4 border-b">
                <DialogTitle>Create Task</DialogTitle>
              </DialogHeader>
              <ScrollArea  className="h-[calc(100vh-300px)]">
                {/* Scrollable Body */}
                <div className="flex-1 px-6 py-4">
                  <div className="grid gap-4">
                    {/* Task Name */}
                    <div className="grid gap-2">
                      <Label htmlFor="name">Task Name</Label>
                      <Input id="name" placeholder="Enter task title" />
                    </div>

                    {/* Task Description */}
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Brief task details" />
                    </div>

                    {/* Assign + Priority */}
                    <div className="flex align-middle justify-between gap-4">
                      <div className="grid gap-2">
                        <Label>Assign To</Label>
                        <Select>
                          <SelectTrigger>
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
                      <div className="grid gap-2">
                        <Label>Priority</Label>
                        <Select>
                          <SelectTrigger>
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

                    {/* Due Date + Status */}
                    <div className="flex align-middle justify-between p-3 gap-4">
                      <div className="grid gap-2">
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
                          <SelectTrigger>
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
      <Tabs value={act} onValueChange={setAct} className="w-full">
        <TabsList className='flex overflow-x-auto gap-2 w-full'>
          <TabsTrigger value="list" className="flex items-center gap-2 whitespace-nowrap">
            <ListIcon className='w-4 h-4 mr-2' />
            <span className='text-sm'>Task List</span>
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex items-center gap-2 whitespace-nowrap">
            <SquareKanbanIcon className='w-4 h-4 mr-2' />
            <span className='text-sm'>Kanban Board</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className='mt-6'>

          {/* <DataTable data={data} /> */}


        </TabsContent>

      </Tabs>


    </div>
  )
}

export default Task