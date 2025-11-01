import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Plus, Trash, CalendarIcon, Target, Tag, Clock3, Pause, CheckCircle } from "lucide-react"

function TaskDialog({
  open = false,
  setOpen = () => {},
  loading = false,
  setLoading = () => {},
  formData = {
    name: "",
    description: "",
    assignedTo: "",
    priority: "",
    projectId: "",
    sprintId: "",
    ticketId:"",
    startDate: null,
    endDate: null,
    status: ""
  },
  setFormData = () => {},
  projects = [],
  sprints = [],
  tickets = [],
  workspaceUsers = [],
  errors = {},
  actionType = "create",
  onClose = async () => {},
  onSubmit = async () => {},
}) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(formData.dueDate || null)

  // Update local state when props change


  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

 

  const handleSave = async () => {
    try {
      setLoading(true)
      const submitData = { ...formData, dueDate: date }
      await onSubmit(submitData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        {/* Header */}
        <DialogHeader className="px-2 border-b-2 py-2">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            {actionType === "update" ? "Update Task" : "Create Task"}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Body */}
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-5 p-4">
            {/* Task Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="w-4 h-4" /> Task Name *
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter task title"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Brief task details"
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Assign To + Priority */}
            <div className="grid grid-cols-2 gap-4">
              
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => handleInputChange("priority", v)}
                >
                  <SelectTrigger
                    className={`w-full ${errors.priority ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">High</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">Low</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-sm text-red-500">{errors.priority}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => handleInputChange("status", v)}
                >
                  <SelectTrigger
                    className={`w-full ${errors.status ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">
                      <div className="flex items-center gap-2">
                        <Pause className="h-4 w-4 text-gray-500" />
                        Not Started
                      </div>
                    </SelectItem>
                    <SelectItem value="2">
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-blue-500" />
                        In Progress
                      </div>
                    </SelectItem>
                    <SelectItem value="1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Completed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status}</p>
                )}
              </div>
            </div>

            {/* Project + Sprint */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(v) => handleInputChange("projectId", v)}
                >
                  <SelectTrigger
                    className={`w-full ${errors.projectId ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((p) => (
                      <SelectItem key={p.projectId} value={p.projectId}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.projectId && (
                  <p className="text-sm text-red-500">{errors.projectId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Sprint</Label>
                <Select
                  value={formData.sprintId}
                  onValueChange={(v) => handleInputChange("sprintId", v)}
                >
                  <SelectTrigger
                    className={`w-full ${errors.sprintId ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select sprint" />
                  </SelectTrigger>
                  <SelectContent>
                    {sprints?.map((s) => (
                      <SelectItem key={s.sprintId} value={s.sprintId}>
                        {s.sprintName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sprintId && (
                  <p className="text-sm text-red-500">{errors.sprintId}</p>
                )}
              </div>
            </div>
            {/* Ticket + Assign To */}
            {
              false ? (
                <div className="grid grid-cols-2 gap-4">
                  {/* Ticket Select */}
                  <div className="space-y-2">
                    <Label>Ticket</Label>
                    <Select
                      value={formData.ticketId}
                      onValueChange={(v) => handleInputChange("ticketId", v)}
                    >
                      <SelectTrigger
                        className={`w-full ${errors.ticketId ? "border-red-500" : ""}`}
                      >
                        <SelectValue placeholder="Select Ticket" />
                      </SelectTrigger>
                      <SelectContent>
                        {tickets?.map((s) => (
                          <SelectItem key={s.ticketId} value={s.ticketId}>
                            {s.ticketName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.ticketId && (
                      <p className="text-sm text-red-500">{errors.ticketId}</p>
                    )}
                  </div>

                  {/* Assign To Select */}
                  <div className="space-y-2">
                    <Label>Assign To</Label>
                    <Select
                      value={formData.assignedTo}
                      onValueChange={(v) => handleInputChange("assignedTo", v)}
                    >
                      <SelectTrigger
                        className={`w-full ${errors.assignedTo ? "border-red-500" : ""}`}
                      >
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {workspaceUsers?.map((user) => (
                          <SelectItem key={user.id} value={String(user.id)}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={user.profileImageUrl || ""} />
                                <AvatarFallback>
                                  {user.displayName?.[0]?.toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                              {user.displayName}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.assignedTo && (
                      <p className="text-sm text-red-500">{errors.assignedTo}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Ticket</Label>
                  <Select
                    value={formData.ticketId}
                    onValueChange={(v) => handleInputChange("ticketId", v)}
                  >
                    <SelectTrigger
                      className={`w-full ${errors.ticketId ? "border-red-500" : ""}`}
                    >
                      <SelectValue placeholder="Select Ticket" />
                    </SelectTrigger>
                    <SelectContent>
                      {tickets?.map((s) => (
                        <SelectItem key={s.ticketId} value={s.ticketId}>
                          {s.ticketName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.ticketId && (
                    <p className="text-sm text-red-500">{errors.ticketId}</p>
                  )}
                </div>
              )
            }


            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" /> Start Date
                </Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                  min={today}
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" /> End Date
                </Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  min={formData.startDate || today}
                  className={errors.endDate ? "border-red-500" : ""}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>
            {/* <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => {if (date) handleInputChange("startDate", date)}}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => {if (date) handleInputChange("endDate", date)}}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div> */}

          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button className="text-white" onClick={handleSave} disabled={loading}>
            {loading
              ? "Saving..."
              : actionType === "update"
              ? "Update Task"
              : "Save Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TaskDialog
