import React, { useState } from "react"
import { Plus } from "lucide-react"
import { ProjectCard } from "@/components/projectComponents/projectCard"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent
} from "@/components/ui/dialog"

export default function Projects() {
  const [open, setOpen] = useState(false)

  const projects = [
    {
      title: "CRM App",
      status: "Ongoing",
      description: "CRM system for managing client data.",
      progress: 70,
      startDate: "01-Aug-2025",
      endDate: "30-Sep-2025",
    },
    {
      title: "Website Redesign",
      status: "Completed",
      description: "New responsive version of the homepage.",
      progress: 100,
      startDate: "01-May-2025",
      endDate: "01-Jul-2025",
    },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className='text-sm text-muted-foreground'>Group related tasks, goals, and timelines under one strategic initiative.</p>
        </div>
      </div>
      <div className="pb-6">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1 text-white">
              <Plus className="w-4 h-4 " />
              Add New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <h2 className="text-lg font-semibold mb-2">Add New Project</h2>
            <p className="text-sm text-muted-foreground">Form coming soon...</p>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    </div>
  )
}
