import React, { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { ProjectCard } from "@/components/projectComponents/projectCard"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent
} from "@/components/ui/dialog"
import projectService from "@/services/project"


import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ProjectCard from "./ProjectCard";
import projectService from "@/services/projectService";

export default function Projects() {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getUserProjects();
        const { statusCode, data, message, success } = response.data;

        if (statusCode !== 200 || !success) {
          console.error("Error fetching projects:", message);
          return;
        }
        setProjects(data || []);
        setFilteredProjects(data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // Filtering
  useEffect(() => {
    let filtered = projects;

    if (search.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((p) => p.status === status);
    }

    setFilteredProjects(filtered);
    setCurrentPage(1); // reset page when filters change
  }, [search, status, projects]);

  // Pagination calculation
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Group related tasks, goals, and timelines under one strategic initiative.
          </p>
        </div>
      </div>

      {/* Filters + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6">
        <input
          type="text"
          placeholder="Search projects..."
          className="px-3 py-2 rounded-md border border-gray-600 bg-transparent text-white focus:outline-none w-full sm:w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-3 py-2 rounded-md border border-gray-600 bg-transparent text-white focus:outline-none w-full sm:w-48"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1 text-white">
              <Plus className="w-4 h-4" />
              Add New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <h2 className="text-lg font-semibold mb-2">Add New Project</h2>
            <p className="text-sm text-muted-foreground">Form coming soon...</p>
          </DialogContent>
        </Dialog>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentProjects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Prev
          </Button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
