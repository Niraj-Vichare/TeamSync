import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, Edit2Icon, Trash2Icon, Tag, Calendar, Clock, Image, FileText, Target } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ProjectCategory, ProjectStatus } from '@/data/general';

const ProjectCard = ({ project, onEdit, onDelete, onView }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editedProject, setEditedProject] = useState(project);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleEditInputChange = (field, value) => {
    setEditedProject(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleView = () => onView(project.projectGuid);

  const validateForm = () => {
    const newErrors = {};
    if (!editedProject.projectTitle?.trim())
      newErrors.projectTitle = 'Project title is required';
    if (!editedProject.projectDescription?.trim())
      newErrors.projectDescription = 'Project description is required';
    if (editedProject.endDate && editedProject.startDate &&
      new Date(editedProject.endDate) < new Date(editedProject.startDate))
      newErrors.endDate = 'End date must be after start date';
    if (editedProject.dueDate && editedProject.startDate &&
      new Date(editedProject.dueDate) < new Date(editedProject.startDate))
      newErrors.dueDate = 'Due date must be after start date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateForm()) return;
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

  const formatEnumName = (name) =>
    name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") return null;
    const d = new Date(dateString);
    const now = new Date();
    // ✅ If date is more than 20 years away — treat as not set
    if (d.getFullYear() - now.getFullYear() > 20) return null;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const getProjectInitials = (title) => {
    if (!title) return 'PR';
    return title.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase();
  };

  const getStatusInfo = (status, projectStatus) => {
    const statusText = projectStatus || (status === 1 ? "Active" : "Inactive");
    switch (statusText.toLowerCase()) {
      case 'ongoing': case 'active':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', text: statusText };
      case 'completed':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300', text: statusText };
      case 'pending': case 'paused':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', text: statusText };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300', text: statusText };
      default:
        return { color: 'bg-muted text-muted-foreground', text: statusText };
    }
  };

  const initials = getProjectInitials(project.projectTitle);
  const statusInfo = getStatusInfo(project.status, project.projectStatus);

  return (
    <>
      <Card className="shadow-sm border flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 min-w-0">
            {/* Logo + Title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-base sm:text-lg">{initials}</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
                  {project.projectTitle || "Untitled Project"}
                </h1>
                {/* ✅ Tagline truncated to 1 line */}
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {project.projectTagline || "No tagline provided"}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                  <Badge className={`text-xs ${statusInfo.color}`}>{statusInfo.text}</Badge>
                  <Badge variant="outline" className="text-xs">
                    {formatEnumName(project.projectCategory || 'GENERAL')}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                onClick={handleEditOpen}
              >
                <Edit2Icon className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2Icon className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 flex flex-col">
          {/* Dates — responsive grid */}
          {(() => {
            const start = project.startDateInString || formatDate(project.startDate);
            const due = project.dueDateInString || formatDate(project.dueDate);
            const end = project.endDateInString || formatDate(project.endDate);

            const dates = [
              { label: "Start", value: start },
              due ? { label: "Due", value: due } : null,   // ✅ only show if due date exists
              end ? { label: "End", value: end } : null,   // ✅ only show if end date exists
            ].filter(Boolean);

            if (dates.length === 0) return null; // ✅ no dates at all — show nothing

            return (
              <div className={`grid gap-2 sm:gap-4`} style={{ gridTemplateColumns: `repeat(${dates.length}, minmax(0, 1fr))` }}>
                {dates.map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-xs sm:text-sm font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* ✅ Description — 2 lines max with ellipsis, no full text */}
          <div className="border-t border-border pt-3 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {project.projectDescription || "No description provided for this project."}
            </p>
          </div>

          {/* View button */}
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-sm font-medium"
              onClick={handleView}
            >
              View details <ChevronDown className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Edit Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        {/* ✅ No Separator — removed */}
        <DialogContent className="sm:max-w-[580px] p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <Edit2Icon className="w-4 h-4" />
              Edit project
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[65vh]">
            <div className="space-y-5 px-6 py-5">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="editProjectTitle" className="text-sm font-medium">
                  Project title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="editProjectTitle"
                  value={editedProject.projectTitle || ''}
                  onChange={(e) => handleEditInputChange('projectTitle', e.target.value)}
                  placeholder="Enter project title"
                  className={`h-9 text-sm ${errors.projectTitle ? 'border-destructive' : ''}`}
                  maxLength={100}
                />
                {errors.projectTitle && <p className="text-xs text-destructive">{errors.projectTitle}</p>}
              </div>

              {/* Tagline */}
              <div className="space-y-1.5">
                <Label htmlFor="editProjectTagline" className="text-sm font-medium">
                  Tagline <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="editProjectTagline"
                  value={editedProject.projectTagline || ''}
                  onChange={(e) => handleEditInputChange('projectTagline', e.target.value)}
                  placeholder="A short, catchy description"
                  className="h-9 text-sm"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {(editedProject.projectTagline || '').length}/200
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="editProjectDescription" className="text-sm font-medium">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="editProjectDescription"
                  value={editedProject.projectDescription || ''}
                  onChange={(e) => handleEditInputChange('projectDescription', e.target.value)}
                  placeholder="Describe your project"
                  rows={3}
                  className={`text-sm resize-none ${errors.projectDescription ? 'border-destructive' : ''}`}
                  maxLength={1000}
                />
                {errors.projectDescription && <p className="text-xs text-destructive">{errors.projectDescription}</p>}
                <p className="text-xs text-muted-foreground text-right">
                  {(editedProject.projectDescription || '').length}/1000
                </p>
              </div>

              {/* Logo */}
              <div className="space-y-1.5">
                <Label htmlFor="editProjectLogo" className="text-sm font-medium">
                  Logo URL <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="editProjectLogo"
                  type="url"
                  value={editedProject.projectLogo || ''}
                  onChange={(e) => handleEditInputChange('projectLogo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="h-9 text-sm"
                />
              </div>

              {/* Status + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select
                    value={editedProject.status?.toString() || '1'}
                    onValueChange={(v) => handleEditInputChange('status', parseInt(v))}
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
                    value={editedProject.category?.toString() || '1'}
                    onValueChange={(v) => handleEditInputChange('category', parseInt(v))}
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

              {/* Dates */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Timeline
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'editStartDate', label: 'Start', field: 'startDate', minField: null },
                    { id: 'editEndDate',   label: 'End',   field: 'endDate',   minField: 'startDate', error: errors.endDate },
                    { id: 'editDueDate',   label: 'Due',   field: 'dueDate',   minField: 'startDate', error: errors.dueDate },
                  ].map(({ id, label, field, minField, error }) => (
                    <div key={id} className="space-y-1.5">
                      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
                      <Input
                        id={id}
                        type="date"
                        value={editedProject[field] ? editedProject[field].split('T')[0] : ''}
                        onChange={(e) => handleEditInputChange(field, e.target.value ? `${e.target.value}T00:00:00` : '')}
                        min={minField && editedProject[minField] ? editedProject[minField].split('T')[0] : ''}
                        className={`h-9 text-sm ${error ? 'border-destructive' : ''}`}
                      />
                      {error && <p className="text-xs text-destructive">{error}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t border-border gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(false)} disabled={loading} className="h-9">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={loading || !editedProject.projectTitle?.trim() || !editedProject.projectDescription?.trim()}
              className="h-9 min-w-[110px] bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Saving...
                </span>
              ) : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Trash2Icon className="w-4 h-4 text-destructive" />
              Delete project
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm text-foreground">
              Are you sure you want to delete{' '}
              <span className="font-semibold">"{project.projectTitle}"</span>?
            </p>
            <p className="text-xs text-destructive mt-1.5">This action cannot be undone.</p>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="h-9">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={loading}
              className="h-9 min-w-[100px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </span>
              ) : 'Delete project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectCard;