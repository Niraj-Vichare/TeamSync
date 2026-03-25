import React, { useEffect, useState, useCallback } from "react";
import { Plus, Folder, Target, Tag, FileText, Calendar, Clock, Image, Search, Filter, LayoutGrid, List, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import projectService from "@/services/project";
import { useAuth } from "@/context/AuthContext";
import ProjectCard from "@/components/projectComponents/projectCard";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ProjectCategory, ProjectStatus } from "@/data/general";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const INITIAL_FORM = {
  projectTitle: "",
  projectDescription: "",
  projectTagline: "",
  projectLogo: "",
  status: ProjectStatus.Ongoing,
  category: ProjectCategory.INFORMATION_TECHNOLOGY,
  startDate: "",
  endDate: "",
  dueDate: "",
};

const PROJECTS_PER_PAGE = 6;

const formatEnumName = (name) =>
  name.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

const today = new Date().toISOString().split("T")[0];

export default function Projects() {
  const navigate = useNavigate();
  const { getCurrentWorkspaceId } = useAuth();

  // ── Data ─────────────────────────────────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [apiData, setApiData] = useState({ totalCount: 0 });
  const [loading, setLoading] = useState(false);

  // ── Filters ───────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Modal ─────────────────────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const workspaceGuid = getCurrentWorkspaceId();
      const response = await projectService.getUserProjects({
        workspaceGuid,
        search: search.trim() || null,
        status: statusFilter !== "all" ? statusFilter : null,
        pageNumber: currentPage,
        pageSize: PROJECTS_PER_PAGE,
      });
      const { statusCode, data, message, success } = response.data;
      if (statusCode !== 200 || !success) {
        console.error("Error fetching projects:", message);
        return;
      }
      setProjects(Array.isArray(data?.items) ? data.items : []);
      setApiData(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, [getCurrentWorkspaceId, search, statusFilter, currentPage]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // ── Validation ────────────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors = {};
    if (!formData.projectTitle.trim())
      newErrors.projectTitle = "Project title is required";
    else if (formData.projectTitle.length > 100)
      newErrors.projectTitle = "Max 100 characters";

    if (!formData.projectDescription.trim())
      newErrors.projectDescription = "Project description is required";
    else if (formData.projectDescription.length > 1000)
      newErrors.projectDescription = "Max 1000 characters";

    if (formData.projectTagline && formData.projectTagline.length > 200)
      newErrors.projectTagline = "Max 200 characters";

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate))
        newErrors.endDate = "End date must be after start date";
    }
    if (formData.startDate && formData.dueDate) {
      if (new Date(formData.startDate) >= new Date(formData.dueDate))
        newErrors.dueDate = "Due date must be after start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
  };

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const projectData = {
        projectTitle: formData.projectTitle.trim(),
        projectDescription: formData.projectDescription.trim(),
        projectTagline: formData.projectTagline.trim() || null,
        projectLogo: formData.projectLogo.trim() || null,
        status: parseInt(formData.status),
        category: parseInt(formData.category),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        createAt: new Date().toISOString(),
      };
      const workspaceGuid = getCurrentWorkspaceId();
      const response = await projectService.createProject(workspaceGuid, projectData);
      const { statusCode, success, message } = response.data;
      if (statusCode === 201 && success) {
        toast.success("Project created successfully!");
        resetForm();           // ✅ clear form
        setOpen(false);        // ✅ close modal
        fetchProjects();       // ✅ refresh list
      } else {
        toast.error(message || "Failed to create project.");
      }
    } catch (err) {
      console.error("Error creating project:", err);
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectGuid) => {
    try {
      const workspaceGuid = getCurrentWorkspaceId();
      const response = await projectService.deleteProject(workspaceGuid, projectGuid);
      const { statusCode, success, message } = response.data;
      if (statusCode === 200 && success) {
        toast.success("Project deleted.");
        fetchProjects();
      } else {
        toast.error(message || "Failed to delete project.");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("Something went wrong.");
    }
  };

  const handleEditProject = async (projectGuid, updatedProject) => {
    try {
      const response = await projectService.updateProject(projectGuid, updatedProject);
      const { statusCode, success, message } = response.data;
      if (statusCode === 200 && success) {
        toast.success("Project updated.");
        fetchProjects();
      } else {
        toast.error(message || "Failed to update project.");
      }
    } catch (err) {
      console.error("Error updating project:", err);
      toast.error("Something went wrong.");
    }
  };

  const handleOnViewProject = (projectGuid) => navigate(`/projects/${projectGuid}`);

  // ── Pagination ────────────────────────────────────────────────────────
  const totalPages = Math.ceil((apiData?.totalCount || 0) / PROJECTS_PER_PAGE);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-screen bg-background">

      {/* ── Page Header ── */}
      <div className="border-border px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {apiData?.totalCount ?? 0} project{apiData?.totalCount !== 1 ? "s" : ""} in this workspace
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="border-border px-6 py-3 flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-8 h-8 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[160px] text-sm">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(ProjectStatus).map(([key, value]) => (
              <SelectItem key={value} value={value.toString()}>
                {formatEnumName(key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto text-xs text-muted-foreground">
          {loading ? "Loading..." : `${projects.length} shown`}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 px-4 sm:px-6 py-6">
        {loading ? (
          // Skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-lg border border-border bg-muted/30 animate-pulse"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Folder className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-1">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              {search || statusFilter !== "all"
                ? "No projects match your current filters."
                : "Create your first project to start organising work into focused initiatives."}
            </p>
            {search || statusFilter !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearch(""); setStatusFilter("all"); }}
              >
                Clear filters
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create project
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.projectGuid ?? index}
                  project={project}
                  onDelete={handleDeleteProject}
                  onEdit={handleEditProject}
                  onView={handleOnViewProject}
                />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 p-0 text-xs ${currentPage === page ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" : ""}`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Create Project Modal ── */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[580px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-base font-semibold">Create new project</DialogTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Fill in the details below to set up your project.
            </p>
          </DialogHeader>

          <ScrollArea className="max-h-[65vh]">
            <div className="px-6 py-5 space-y-5">

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="projectTitle" className="text-sm font-medium">
                  Project title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="projectTitle"
                  value={formData.projectTitle}
                  onChange={(e) => handleInputChange("projectTitle", e.target.value)}
                  placeholder="e.g. Customer Portal Redesign"
                  className={`h-9 text-sm ${errors.projectTitle ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  maxLength={100}
                />
                {errors.projectTitle && (
                  <p className="text-xs text-red-500">{errors.projectTitle}</p>
                )}
                <p className="text-xs text-muted-foreground text-right">
                  {formData.projectTitle.length}/100
                </p>
              </div>

              {/* Tagline */}
              <div className="space-y-1.5">
                <Label htmlFor="projectTagline" className="text-sm font-medium">
                  Tagline <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="projectTagline"
                  value={formData.projectTagline}
                  onChange={(e) => handleInputChange("projectTagline", e.target.value)}
                  placeholder="A short, catchy description"
                  className={`h-9 text-sm ${errors.projectTagline ? "border-red-500" : ""}`}
                  maxLength={200}
                />
                {errors.projectTagline && (
                  <p className="text-xs text-red-500">{errors.projectTagline}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="projectDescription" className="text-sm font-medium">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="projectDescription"
                  value={formData.projectDescription}
                  onChange={(e) => handleInputChange("projectDescription", e.target.value)}
                  placeholder="What is this project about? What problem does it solve?"
                  rows={3}
                  className={`text-sm resize-none ${errors.projectDescription ? "border-red-500" : ""}`}
                  maxLength={1000}
                />
                {errors.projectDescription && (
                  <p className="text-xs text-red-500">{errors.projectDescription}</p>
                )}
                <p className="text-xs text-muted-foreground text-right">
                  {formData.projectDescription.length}/1000
                </p>
              </div>

              {/* Status + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select
                    value={formData.status.toString()}
                    onValueChange={(v) => handleInputChange("status", parseInt(v))}
                  >
                    <SelectTrigger className="h-9 text-sm w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ProjectStatus).map(([key, value]) => (
                        <SelectItem key={value} value={value.toString()} className="text-sm">
                          {formatEnumName(key)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Category</Label>
                  <Select
                    value={formData.category.toString()}
                    onValueChange={(v) => handleInputChange("category", parseInt(v))}
                  >
                    <SelectTrigger className="h-9 text-sm w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ProjectCategory).map(([key, value]) => (
                        <SelectItem key={value} value={value.toString()} className="text-sm">
                          {formatEnumName(key)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Logo URL */}
              <div className="space-y-1.5">
                <Label htmlFor="projectLogo" className="text-sm font-medium">
                  Logo URL <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="projectLogo"
                  type="url"
                  value={formData.projectLogo}
                  onChange={(e) => handleInputChange("projectLogo", e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="h-9 text-sm"
                />
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Timeline <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="startDate" className="text-xs text-muted-foreground">Start</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      min={today}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="endDate" className="text-xs text-muted-foreground">End</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                      min={formData.startDate || today}
                      className={`h-9 text-sm ${errors.endDate ? "border-red-500" : ""}`}
                    />
                    {errors.endDate && (
                      <p className="text-xs text-red-500">{errors.endDate}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dueDate" className="text-xs text-muted-foreground">Due</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange("dueDate", e.target.value)}
                      min={formData.startDate || today}
                      className={`h-9 text-sm ${errors.dueDate ? "border-red-500" : ""}`}
                    />
                    {errors.dueDate && (
                      <p className="text-xs text-red-500">{errors.dueDate}</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t border-border flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
              className="h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                submitting ||
                !formData.projectTitle.trim() ||
                !formData.projectDescription.trim()
              }
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 min-w-[120px]"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create project
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}