import React, { useEffect, useState } from "react";
import { Plus, Folder, Target, Tag, FileText, Calendar, Clock, Image } from "lucide-react";
// import { ProjectCard } from "@/components/projectComponents/projectCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
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

export default function Projects() {
  const navigate = useNavigate(); 
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState({ totalCount: 0 });
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    projectTagline: '',
    projectLogo: '',
    status: ProjectStatus.Ongoing,
    category: ProjectCategory.INFORMATION_TECHNOLOGY,
    startDate: '',
    endDate: '',
    dueDate: ''
  });
  const [errors, setErrors] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;

  // Form state
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "active",
  });
  const [submitting, setSubmitting] = useState(false);

  const { getCurrentWorkspaceId } = useAuth();
  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const workspaceGuid = getCurrentWorkspaceId();
      console.log("Current Workspace ID:", workspaceGuid);
      const response = await projectService.getUserProjects({
        workspaceGuid,
        search: search.trim() || null,
        status: status !== "all" ? status : null,
        pageNumber: currentPage,
        pageSize: projectsPerPage
      });

      const { statusCode, data, message, success } = response.data;

      if (statusCode !== 200 || !success) {
        console.error("Error fetching projects:", message);
        return;
      }

      const projectsArray = Array.isArray(data?.items) ? data.items : [];
      setProjects(projectsArray);
      setFilteredProjects(projectsArray);
      setApiData(data); // contains totalCount, pageNumber, pageSize
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.projectTitle.trim()) {
      newErrors.projectTitle = 'Project title is required';
    } else if (formData.projectTitle.length > 100) {
      newErrors.projectTitle = 'Project title must be less than 100 characters';
    }

    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = 'Project description is required';
    } else if (formData.projectDescription.length > 1000) {
      newErrors.projectDescription = 'Project description must be less than 1000 characters';
    }

    if (formData.projectTagline && formData.projectTagline.length > 200) {
      newErrors.projectTagline = 'Project tagline must be less than 200 characters';
    }

    // Date validation
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (startDate >= endDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.startDate && formData.dueDate) {
      const startDate = new Date(formData.startDate);
      const dueDate = new Date(formData.dueDate);

      if (startDate >= dueDate) {
        newErrors.dueDate = 'Due date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle modal close
  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const handleDeleteProject = async (projectGuid) => {
    try {
      setLoading(true);
      const workspaceGuid = getCurrentWorkspaceId();
      const response = await projectService.deleteProject(workspaceGuid, projectGuid);
      const { statusCode, success, message } = response.data;
      if (statusCode === 200 && success) {
        toast.success('Project deleted successfully!');
        fetchProjects(); // Refresh the project list
      } else {
        toast.error('Failed to delete project.');
        console.error('Failed to delete project:', message);
        // You can add error handling here (e.g., show toast notification)
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      // You can add error handling here (e.g., show toast notification)
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = async (projectGuid, updatedProject) => {
    try {
      setLoading(true);
      const response = await projectService.updateProject(projectGuid, updatedProject);
      const { statusCode, success, message } = response.data;
      if (statusCode === 200 && success) {
        toast.success('Project updated successfully!');
        fetchProjects(); // Refresh the project list
      } else {
        toast.error('Failed to update project.');
        console.error('Failed to update project:', message);
        // You can add error handling here (e.g., show toast notification)
      }
    } catch (error) {
      console.error('Error updating project:', error);
      // You can add error handling here (e.g., show toast notification)
    } finally {
      setLoading(false);
    }
  };

  const handleOnViewProject = (projectGuid) => {
    // Navigate to project details page
    navigate(`/projects/${projectGuid}`);
  };



  // Format enum names for display
  const formatEnumName = (name) => {
    return name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get today's date for date inputs
  const today = new Date().toISOString().split('T')[0];

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      debugger;
      // Prepare data in the format expected by your API
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

      // Call the parent function to create project
      const workspaceGuid = getCurrentWorkspaceId();
      const response = await projectService.createProject(workspaceGuid,projectData);
      const { statusCode, success, message } = response.data;
      if (statusCode === 201 && success) {
        toast.success('Project created successfully!');
        fetchProjects(); // Refresh the project list
      } else {
        toast.error('Failed to create project.');
        console.error('Failed to create project:', message);
        // You can add error handling here (e.g., show toast notification)
      }


    } catch (error) {
      console.error('Error creating project:', error);
      // You can add error handling here (e.g., show toast notification)
    } finally {
      setLoading(false);
      //resetForm();
      setOpen(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      projectTitle: '',
      projectDescription: '',
      projectTagline: '',
      projectLogo: '',
      status: ProjectStatus.DRAFT,
      category: ProjectCategory.GENERAL,
      startDate: '',
      endDate: '',
      dueDate: ''
    });
    setErrors({});
  };

  useEffect(() => {
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
  const currentProjects = Array.isArray(filteredProjects)
    ? filteredProjects.slice(startIndex, endIndex)
    : [];

  const totalPages = Math.ceil(
    (apiData?.totalCount || filteredProjects.length) / projectsPerPage
  );

  // Handle project creation
  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      alert("Project name is required.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await projectService.createProject(newProject);
      const { statusCode, success } = response.data;

      if (statusCode === 201 && success) {
        setOpen(false);
        setNewProject({ name: "", description: "", status: "active" });
        fetchProjects(); // Refresh the list
      } else {
        alert("Failed to create project.");
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Group related tasks, goals, and timelines under one strategic initiative.
          </p>
        </div>
      </div>

      {/* Filters + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6">

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4" />
              Add New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center text-center gap-2">
                Create New Project

              </DialogTitle>
              <Separator/>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] ">
              <div className="space-y-5 pt-3 px-4">
                {/* Project Title */}
                <div className="space-y-2">
                  <Label htmlFor="projectTitle" className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Project Title *
                  </Label>
                  <Input
                    id="projectTitle"
                    value={formData.projectTitle}
                    onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                    placeholder="Enter project title"
                    className={errors.projectTitle ? 'border-red-500' : ''}
                    maxLength={100}
                  />
                </div>

                {/* Project Tagline */}
                <div className="space-y-2">
                  <Label htmlFor="projectTagline" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Project Tagline
                  </Label>
                  <Input
                    id="projectTagline"
                    value={formData.projectTagline}
                    onChange={(e) => handleInputChange('projectTagline', e.target.value)}
                    placeholder="Enter a catchy tagline"
                    className={errors.projectTagline ? 'border-red-500' : ''}
                    maxLength={200}
                  />
                  {errors.projectTagline && (
                    <p className="text-sm text-red-500">{errors.projectTagline}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {formData.projectTagline.length}/200 characters
                  </p>
                </div>

                {/* Project Description */}
                <div className="space-y-2">
                  <Label htmlFor="projectDescription" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Project Description *
                  </Label>
                  <Textarea
                    id="projectDescription"
                    value={formData.projectDescription}
                    onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                    placeholder="Describe your project in detail"
                    rows={4}
                    className={errors.projectDescription ? 'border-red-500' : ''}
                    maxLength={1000}
                  />
                  {errors.projectDescription && (
                    <p className="text-sm text-red-500">{errors.projectDescription}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {formData.projectDescription.length}/1000 characters
                  </p>
                </div>

                {/* Project Logo URL */}
                <div className="space-y-2">
                  <Label htmlFor="projectLogo" className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Project Logo URL
                  </Label>
                  <Input
                    id="projectLogo"
                    type="url"
                    value={formData.projectLogo}
                    onChange={(e) => handleInputChange('projectLogo', e.target.value)}
                    placeholder=""
                  />
                  <p className="text-xs text-gray-500">
                    Optional: Enter a URL for your project logo
                  </p>
                </div>

                {/* Status and Category Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Project Status */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Project Status
                    </Label>
                    <Select
                      value={formData.status.toString()}
                      onValueChange={(value) => handleInputChange('status', parseInt(value))}
                    >
                      <SelectTrigger className={'w-full'}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ProjectStatus).map(([key, value]) => (
                          <SelectItem key={value} value={value.toString()}>
                            {formatEnumName(key)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Project Category */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Project Category
                    </Label>
                    <Select
                      value={formData.category.toString()}
                      onValueChange={(value) => handleInputChange('category', parseInt(value))}
                    >
                      <SelectTrigger className={'w-full'}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ProjectCategory).map(([key, value]) => (
                          <SelectItem key={value} value={value.toString()}>
                            {formatEnumName(key)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dates Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Project Timeline
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Start Date */}
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        min={today}
                      />
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        min={formData.startDate || today}
                        className={errors.endDate ? 'border-red-500' : ''}
                      />
                      {errors.endDate && (
                        <p className="text-sm text-red-500">{errors.endDate}</p>
                      )}
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                      <Label htmlFor="dueDate" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due Date
                      </Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                        min={formData.startDate || today}
                        className={errors.dueDate ? 'border-red-500' : ''}
                      />
                      {errors.dueDate && (
                        <p className="text-sm text-red-500">{errors.dueDate}</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </ScrollArea>

            <DialogFooter className="flex gap-2 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.projectTitle.trim() || !formData.projectDescription.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            </DialogFooter>


          </DialogContent>
        </Dialog>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center text-gray-400 py-10">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center text-center py-16">
          <div className="bg-gray-800 rounded-full p-6 mb-4">
            <Folder className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            No Projects Found
          </h3>
          <p className="mb-4">
            It looks like you haven’t created any projects yet.
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create Your First Project
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        // Project List
        <div className="grid grid-cols-2 gap-5">
          {currentProjects.map((project, index) => (
            <ProjectCard key={index} project={project} onDelete={handleDeleteProject} onEdit={handleEditProject} onView={handleOnViewProject}/>
          ))}
        </div>
      )}

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
          <span className="">
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
