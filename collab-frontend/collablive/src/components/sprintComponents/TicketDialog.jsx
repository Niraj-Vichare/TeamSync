import React from 'react'
import { useState } from "react"
import { toast } from "sonner"
import { Textarea } from '../ui/textarea'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import { Plus, X, Paperclip } from 'lucide-react'

function TicketDialog({
    open,
    setOpen,
    loading,
    setLoading,
    formData,
    setFormData,    
    projects,
    onSubmit,
    errors,
    type
}) {
    const [steps, setSteps] = useState([''])
    const [attachments, setAttachments] = useState([])

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

    const handleSave = async () => {
        try {
            setLoading(true)
            const submitData = {
                ...formData,
                ...(type === "Bug" && { steps, attachments })
            }
            await onSubmit(submitData)
            toast({
                title: `${type} Created 🎉`,
                description: `${formData.title} has been added successfully.`,
            })
            setOpen(false)
            setFormData({
                title: "",
                description: "",
                priority: "",
                status: "",
                tags: "",
                projectId: "",
                reportBy: "",
                points: "",
                ticketType: ""
            })
            setSteps([''])
            setAttachments([])
        } catch (err) {
            toast({
                title: "Error ❌",
                description: err?.message || `Something went wrong while creating ${type}`,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[600px]">
                {/* Header */}
                <DialogHeader className="px-4 py-2 border-b-2">
                    <DialogTitle className="text-xl font-semibold">Create {type}</DialogTitle>
                </DialogHeader>

                {/* Scrollable Form */}
                <ScrollArea className="max-h-[70vh] p-4">
                    <div className="space-y-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label>Title *</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => handleInputChange("title", e.target.value)}
                                placeholder="Enter bug title"
                                className={errors.title ? "border-red-500" : ""}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label>Description *</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="Describe the bug in detail"
                                rows={4}
                                className={errors.description ? "border-red-500" : ""}
                            />
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <Input
                                value={formData.tags}
                                onChange={(e) => handleInputChange("tags", e.target.value)}
                                placeholder="Comma separated tags"
                            />
                        </div>

                        {/* Priority & Status (50-50) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(v) => handleInputChange("priority", v)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(v) => handleInputChange("status", v)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Open">Open</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Project & Reported By (50-50) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Project</Label>
                                <Select
                                    value={formData.projectId}
                                    onValueChange={(v) => handleInputChange("projectId", v)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.projectName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Reported By</Label>
                                <Input
                                    value={formData.reportBy}
                                    onChange={(e) => handleInputChange("reportBy", e.target.value)}
                                    placeholder="Enter reported by"
                                />
                            </div>
                        </div>

                        {/* Points */}
                        <div className="space-y-2">
                            <Label>Points</Label>
                            <Input
                                value={formData.points}
                                onChange={(e) => handleInputChange("points", e.target.value)}
                                placeholder="Enter story points"
                            />
                        </div>

                        {/* Steps to Reproduce & Attachments (Only for Bugs) */}
                        {type === "Bug" && (
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="steps-attachments">
                                    <AccordionTrigger className="text-sm font-medium">
                                        Steps to Reproduce & Attachments
                                    </AccordionTrigger>
                                    <AccordionContent>
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
                                                    {steps.map((step, index) => (
                                                        <div key={index} className="flex gap-2">
                                                            <Input
                                                                value={step}
                                                                onChange={(e) => handleStepChange(index, e.target.value)}
                                                                placeholder={`Step ${index + 1}`}
                                                                className="flex-1"
                                                            />
                                                            {steps.length > 1 && (
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
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        )}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 border-t">
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="text-white" onClick={handleSave} disabled={loading}>
                            {loading ? "Saving..." : `Save ${type}`}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default TicketDialog