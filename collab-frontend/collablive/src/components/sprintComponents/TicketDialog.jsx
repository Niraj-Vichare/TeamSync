import React, { useEffect } from 'react'
import { useState } from "react"
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Plus, X, Paperclip, Tag, FileText, Target, CalendarIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { format } from 'date-fns'
import { Calendar } from '../ui/calendar'

function TicketDialog({
    open = false,   
    setOpen = () => {},
    loading = false,
    setLoading = () => {},
    formData = {
        title: "",
        description: "",
        priority: "",
        status: "",
        tags: "",
        projectId: "",
        reportedBy: "",
        points: "",
        ticketType: "",
        startDate:"",
        endDate:"",
        assignedTo:"",
        steps:[]
    },
    setFormData = () => {},    
    projects = [],
    workspaceUsers = [],
    onClose = async ()=>{},
    onSubmit = async () => {},
    actionType = "create",
    errors = {},
    type = "bug"
}) {
   
    const today = new Date().toISOString().split('T')[0];
    const [steps, setSteps] = useState([]);
    const [attachments, setAttachments] = useState([])
    const selectedUser = workspaceUsers.find(u => String(u.id) === String(formData.reportedBy))

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleAddStep = () => {
        setSteps([...steps, ''])
    }

    const handleRemoveStep = (index) => {
        setSteps(steps.filter((_, i) => i !== index))
    }

    const handleStepChange = (index, value) => {
        const newSteps = [...steps]
        newSteps[index] = value
        setSteps(newSteps)
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files)
        setAttachments([...attachments, ...files])
    }

    const handleRemoveAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index))
    }
    const handleClose=()=>{
        setSteps([]);
        setAttachments([]);
        onClose();
    }
    useEffect(() => {
        setSteps(formData.steps || [""]);
    }, [formData.steps]);


    const handleSave = async () => {
        try {
            setLoading(true)
            const submitData = {
                ...formData,
                ...(type === "Bug" && { steps, attachments })
            }
            await onSubmit(submitData)            
        } catch (err) {
        } finally {
            setLoading(false)
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[600px]">
                {/* Header */}
                <DialogHeader className="px-2 border-b-2 py-2">
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        {actionType == "update" ?`Update ${type}` : `Create ${type}`}
                    </DialogTitle>
                </DialogHeader>

                {/* Scrollable Form */}
                <ScrollArea className="max-h-[70vh]">
                    <div className="space-y-5 p-4 px-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Title *
                            </Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => handleInputChange("title", e.target.value)}
                                placeholder="Enter ticket title"
                                className={errors.title ? "border-red-500" : ""}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-500">{errors.title}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Description *
                            </Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="Describe the ticket in detail"
                                rows={4}
                                className={errors.description ? "border-red-500" : ""}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">{errors.description}</p>
                            )}
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Tags
                            </Label>
                            <Input
                                value={formData.tags}
                                onChange={(e) => handleInputChange("tags", e.target.value)}
                                placeholder="Enter tags separated by commas"
                                className={errors.tags ? "border-red-500" : ""}
                            />
                            {errors.tags && (
                                <p className="text-sm text-red-500">{errors.tags}</p>
                            )}
                        </div>

                        {/* Priority & Status (50-50) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Target className="w-4 h-4" /> Priority
                                </Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(v) => handleInputChange("priority", v)}
                                >
                                    <SelectTrigger className={`w-full ${errors.priority ? "border-red-500" : ""}`}>
                                        <SelectValue placeholder="Select Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="3">Low</SelectItem>
                                        <SelectItem value="2">Medium</SelectItem>
                                        <SelectItem value="1">High</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.priority && (
                                    <p className="text-sm text-red-500">{errors.priority}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Target className="w-4 h-4" /> Status
                                </Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(v) => handleInputChange("status", v)}
                                >
                                    <SelectTrigger className={`w-full ${errors.status ? "border-red-500" : ""}`}>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Open</SelectItem>
                                        <SelectItem value="2">In Progress</SelectItem>
                                        <SelectItem value="3">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-sm text-red-500">{errors.status}</p>
                                )}
                            </div>
                        </div>

                        <div className={`grid gap-4 ${'user' === "admin" ? "grid-cols-2" : "grid-cols-1"}`}>
                            {/* Project Field */}
                            <div className="space-y-2 w-full">
                                <Label className="flex items-center gap-2">
                                    <Target className="w-4 h-4" /> Project
                                </Label>
                                <Select
                                    value={formData.projectId}
                                    onValueChange={(v) => handleInputChange("projectId", v)}
                                >
                                    <SelectTrigger className={`w-full ${errors.projectId ? "border-red-500" : ""}`}>
                                        <SelectValue placeholder="Select Project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map((p) => (
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

                            {/* Reported By (Only visible for Admins) */}
                            {"user" === "admin" && (
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Target className="w-4 h-4" /> Reported By
                                    </Label>
                                    <Select
                                        value={formData.reportedBy}
                                        onValueChange={(v) => handleInputChange("assignedTo", v)}
                                    >
                                        <SelectTrigger
                                            className={`w-full ${errors.assignedTo ? "border-red-500" : ""}`}
                                        >
                                            <SelectValue placeholder="Select Assigned To" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {workspaceUsers.map((user) => (
                                                <SelectItem key={user.id} value={String(user.id)}>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="w-5 h-5">
                                                            <AvatarImage src={user.profileImageUrl || ""} />
                                                            <AvatarFallback>
                                                                {user.displayName?.[0]?.toUpperCase() || "?"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span>{user.displayName}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {errors.assignedTo && (
                                        <p className="text-sm text-red-500">{errors.assignedTo}</p>
                                    )}
                                </div>
                            )}
                        </div>
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


                        {/* Start Date and End Date */}
                        {/* <div className="grid grid-cols-2 gap-4">
                            {/* Start Date */}
                            {/* <div className="space-y-2">
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
                                            onSelect={(date) => { if (date) handleInputChange("startDate", date) }}
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
                                            onSelect={(date) => { if (date) handleInputChange("endDate", date) }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>  */}

                        {/* Points */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Target className="w-4 h-4" /> Story Points
                            </Label>
                            <Input
                                type="number"
                                value={formData.points}
                                onChange={(e) => handleInputChange("points", e.target.value)}
                                placeholder="Enter story points"
                                className={errors.points ? "border-red-500" : ""}
                            />
                            {errors.points && (
                                <p className="text-sm text-red-500">{errors.points}</p>
                            )}
                        </div>

                        {/* Steps to Reproduce & Attachments (Only for Bugs) */}
                        {type === "Bug" && (
                            <div className="w-full border rounded-lg">
                                <details className="group">
                                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent">
                                        <span className="text-sm font-medium">
                                            Steps to Reproduce & Attachments
                                        </span>
                                        <svg
                                            className="w-4 h-4 transition-transform group-open:rotate-180"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </summary>
                                    <div className="p-4 pt-0 border-t">
                                        <div className="space-y-4 pt-2">
                                            {/* Steps */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label>Steps to Reproduce</Label>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleAddStep}
                                                        className="h-8"
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Add Step
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {steps?.map((step, index) => (
                                                        <div key={index} className="flex gap-2">
                                                            <Input
                                                                value={step}
                                                                onChange={(e) => handleStepChange(index, e.target.value)}
                                                                placeholder={`Step ${index + 1}`}
                                                                className="flex-1"
                                                            />
                                                            {steps?.length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRemoveStep(index)}
                                                                    className="h-10 w-10"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Attachments */}
                                            <div className="space-y-2">
                                                <Label>Attachments</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="file"
                                                        multiple
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                        id="file-upload"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => document.getElementById('file-upload').click()}
                                                        className="h-10"
                                                    >
                                                        <Paperclip className="h-4 w-4 mr-2" />
                                                        Choose Files
                                                    </Button>
                                                </div>
                                                {attachments.length > 0 && (
                                                    <div className="space-y-2 mt-2">
                                                        {attachments.map((file, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between p-2 bg-secondary rounded-md"
                                                            >
                                                                <span className="text-sm truncate flex-1">
                                                                    {file.name}
                                                                </span>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRemoveAttachment(index)}
                                                                    className="h-8 w-8"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </details>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 border-t">
                    <Button 
                        variant="outline" 
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        className="text-white" 
                        onClick={handleSave} 
                        disabled={loading}
                    >
                        {loading ? "Saving..." : actionType == "update" ?"Update" :`Save ${type}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default TicketDialog