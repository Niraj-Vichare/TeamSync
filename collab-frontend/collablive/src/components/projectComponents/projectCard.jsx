import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ChevronDown, Edit2Icon, Trash2Icon, Tag, Calendar, Clock, Image, FileText, Target } from 'lucide-react';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ProjectCategory, ProjectStatus } from '@/data/general';
import { Separator } from '../ui/separator';

const ProjectCard = ({ project, onEdit, onDelete, onView }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editedProject, setEditedProject] = useState(project);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleEditInputChange = (field, value) => {
    setEditedProject(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleView = () => {
    onView(project.projectGuid);
  }

  const validateForm = () => {
    const newErrors = {};

    if (!editedProject.projectTitle?.trim()) {
      newErrors.projectTitle = 'Project title is required';
    }

    if (!editedProject.projectDescription?.trim()) {
      newErrors.projectDescription = 'Project description is required';
    }

    if (editedProject.endDate && editedProject.startDate &&
      new Date(editedProject.endDate) < new Date(editedProject.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (editedProject.dueDate && editedProject.startDate &&
      new Date(editedProject.dueDate) < new Date(editedProject.startDate)) {
      newErrors.dueDate = 'Due date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateForm()) return;
    console.log(project.projectGuid, editedProject);
    setLoading(true);
    try {
      await onEdit(project.projectGuid, editedProject);
      setEditOpen(false);
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await onDelete(project.projectGuid);
      setDeleteOpen(false);
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = () => {
    setEditedProject(project);
    setErrors({});
    setEditOpen(true);
  };

  const formatEnumName = (name) => {
    return name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") return "Not set";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getProjectInitials = (title) => {
    if (!title) return 'PR';
    return title
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getStatusInfo = (status, projectStatus) => {
    const statusText = projectStatus || (status === 1 ? "Active" : "Inactive");

    switch (statusText.toLowerCase()) {
      case 'ongoing':
      case 'active':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
          text: statusText
        };
      case 'completed':
        return {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
          text: statusText
        };
      case 'pending':
      case 'paused':
        return {
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
          text: statusText
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
          text: statusText
        };
      default:
        return {
          color: 'bg-muted text-muted-foreground',
          text: statusText
        };
    }
  };

  const calculateProgress = () => {
    if (project.startDate && project.endDate &&
      project.startDate !== "0001-01-01T00:00:00" &&
      project.endDate !== "0001-01-01T00:00:00") {
      const start = new Date(project.startDate);
      const end = new Date(project.endDate);
      const now = new Date();

      if (now < start) return 0;
      if (now > end) return 100;

      const total = end - start;
      const elapsed = now - start;
      return Math.round((elapsed / total) * 100);
    }
    return Math.floor(Math.random() * 100);
  };

  const progress = calculateProgress();
  const initials = getProjectInitials(project.projectTitle);
  const statusInfo = getStatusInfo(project.status, project.projectStatus);

  return (
    <Card className="shadow-sm border">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Logo - Now theme adaptive */}
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              <span className="font-bold text-xl">{initials}</span>
            </div>

            {/* Title and subtitle - Now theme adaptive */}
            <div className='flex flex-col'>
              <h1 className="text-xl font-semibold text-foreground mb-1">
                {project.projectTitle || "Untitled Project"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {project.projectTagline || "No tagline provided"}
              </p>
              {/* Status Badge */}
              <div className='pt-2'>
                <div className="flex items-center gap-2">
                  <Badge className={statusInfo.color}>
                    {statusInfo.text}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {formatEnumName(project.projectCategory || 'GENERAL')}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Menu buttons - Now theme adaptive */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setEditOpen(true)}
            >
              <Edit2Icon className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2Icon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Project details grid - Now theme adaptive */}
        <div className="grid grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">Start Date</h3>
            <p className="text-sm font-semibold text-foreground">{project.startDateInString || formatDate(project.startDate)}</p>
          </div>

          <div>
            <h4 className="text-lg font-medium text-muted-foreground mb-2">Due Date</h4>
            <p className="text-sm font-semibold text-foreground">{project.dueDateInString || formatDate(project.dueDate)}</p>
          </div>
          <div>
            <h4 className="text-lg font-medium text-muted-foreground mb-2">End Date</h4>
            <p className="text-sm font-semibold text-foreground">{project.endDateInString || formatDate(project.endDate)}</p>
          </div>
        </div>

        {/* Content section - Now theme adaptive */}
        <div className="grid pt-5 border-t border-border">
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.projectDescription || "No description provided for this project."}
            </p>
          </div>
        </div>

        {/* View details button - Now theme adaptive */}
        <div className="flex justify-center pt-4">
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground font-medium" 
            onClick={handleView}
          >
            View details <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>

      {/* Edit Dialog - Theme adaptive */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Edit2Icon className="w-5 h-5" />
              Edit Project
            </DialogTitle>
            <Separator />
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-5 pt-3 px-4">
              {/* Project Title */}
              <div className="space-y-2">
                <Label htmlFor="editProjectTitle" className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Project Title *
                </Label>
                <Input
                  id="editProjectTitle"
                  value={editedProject.projectTitle || ''}
                  onChange={(e) => handleEditInputChange('projectTitle', e.target.value)}
                  placeholder="Enter project title"
                  className={errors.projectTitle ? 'border-destructive' : ''}
                  maxLength={100}
                />
                {errors.projectTitle && (
                  <p className="text-sm text-destructive">{errors.projectTitle}</p>
                )}
              </div>

              {/* Project Tagline */}
              <div className="space-y-2">
                <Label htmlFor="editProjectTagline" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Project Tagline
                </Label>
                <Input
                  id="editProjectTagline"
                  value={editedProject.projectTagline || ''}
                  onChange={(e) => handleEditInputChange('projectTagline', e.target.value)}
                  placeholder="Enter a catchy tagline"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {(editedProject.projectTagline || '').length}/200 characters
                </p>
              </div>

              {/* Project Description */}
              <div className="space-y-3">
                <Label htmlFor="editProjectDescription" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Project Description *
                </Label>
                <Textarea
                  id="editProjectDescription"
                  value={editedProject.projectDescription || ''}
                  onChange={(e) => handleEditInputChange('projectDescription', e.target.value)}
                  placeholder="Describe your project in detail"
                  rows={4}
                  className={errors.projectDescription ? 'border-destructive' : ''}
                  maxLength={1000}
                />
                {errors.projectDescription && (
                  <p className="text-sm text-destructive">{errors.projectDescription}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {(editedProject.projectDescription || '').length}/1000 characters
                </p>
              </div>

              {/* Project Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="editProjectLogo" className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Project Logo URL
                </Label>
                <Input
                  id="editProjectLogo"
                  type="file"
                  accept='image/*'
                  value={editedProject.projectLogo || ''}
                  onChange={(e) => handleEditInputChange('projectLogo', e.target.files?.[0])}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Enter a URL for your project logo
                </p>
              </div>

              {/* Status and Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Project Status
                  </Label>
                  <Select
                    value={editedProject.status?.toString() || '1'}
                    onValueChange={(value) => handleEditInputChange('status', parseInt(value))}
                  >
                    <SelectTrigger className='w-full'>
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

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Project Category
                  </Label>
                  <Select
                    value={editedProject.category?.toString() || '1'}
                    onValueChange={(value) => handleEditInputChange('category', parseInt(value))}
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
                  <div className="space-y-2">
                    <Label htmlFor="editStartDate">Start Date</Label>
                    <Input
                      id="editStartDate"
                      type="date"
                      value={editedProject.startDate ? editedProject.startDate.split('T')[0] : ''}
                      onChange={(e) => handleEditInputChange('startDate', e.target.value ? `${e.target.value}T00:00:00` : '')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editEndDate">End Date</Label>
                    <Input
                      id="editEndDate"
                      type="date"
                      value={editedProject.endDate ? editedProject.endDate.split('T')[0] : ''}
                      onChange={(e) => handleEditInputChange('endDate', e.target.value ? `${e.target.value}T00:00:00` : '')}
                      min={editedProject.startDate ? editedProject.startDate.split('T')[0] : ''}
                      className={errors.endDate ? 'border-destructive' : ''}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-destructive">{errors.endDate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editDueDate" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due Date
                    </Label>
                    <Input
                      id="editDueDate"
                      type="date"
                      value={editedProject.dueDate ? editedProject.dueDate.split('T')[0] : ''}
                      onChange={(e) => handleEditInputChange('dueDate', e.target.value ? `${e.target.value}T00:00:00` : '')}
                      min={editedProject.startDate ? editedProject.startDate.split('T')[0] : ''}
                      className={errors.dueDate ? 'border-destructive' : ''}
                    />
                    {errors.dueDate && (
                      <p className="text-sm text-destructive">{errors.dueDate}</p>
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
              onClick={() => setEditOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={loading || !editedProject.projectTitle?.trim() || !editedProject.projectDescription?.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2Icon className="w-5 h-5 text-destructive" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground">
              Are you sure you want to delete the project{' '}
              <span className="font-semibold">"{project.projectTitle}"</span>?
            </p>
            <p className="text-sm text-destructive mt-2">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost'>Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProjectCard;