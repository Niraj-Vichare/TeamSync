import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Flag, Flame, Goal, Pencil, Target, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/services/useRole";

import taskService from "@/services/task";
import ticketService from "@/services/ticket";
import { mapTicketDetail } from "@/data/general";

// Enum maps — must match TicketEnums on the backend
const STATUS_OPTIONS = [
  { label: "Open",        value: 1 },
  { label: "In Progress", value: 2 },
  { label: "Closed",      value: 3 },
];

const PRIORITY_OPTIONS = [
  { label: "High",   value: 1 },
  { label: "Medium", value: 2 },
  { label: "Low",    value: 3 },
];

function TicketDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8 space-y-4">
          <Card className="p-4">
            <CardHeader className="space-y-3">
              <Skeleton className="h-8 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
            </CardContent>
          </Card>
          <Card className="p-4 h-[450px]">
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          </Card>
        </div>
        <div className="col-span-4 space-y-4">
          {[...Array(3)].map((_, idx) => (
            <Card key={idx} className="p-4 space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function TicketDetail() {
  const { ticketGuid } = useParams();
  const navigate = useNavigate();
  const { getCurrentWorkspaceId } = useAuth();
  const { canManageTasks } = useRole();
  const workspaceGuid = getCurrentWorkspaceId();

  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);

  const [statusDialogOpen, setStatusDialogOpen]             = useState(false);
  const [priorityDialogOpen, setPriorityDialogOpen]         = useState(false);
  const [closeRequestDialogOpen, setCloseRequestDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen]             = useState(false);
  const [addTaskDialogOpen, setAddTaskDialogOpen]           = useState(false);
  const [addCommentDialogOpen, setAddCommentDialogOpen]     = useState(false);

  const [commentText, setCommentText]           = useState("");
  const [selectedStatus, setSelectedStatus]     = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [closeReason, setCloseReason]           = useState("");
  const [errors, setErrors]                     = useState({});

  const [taskFormData, setTaskFormData] = useState({
    taskName: "", taskDescription: "", priority: "", status: "",
  });

  const resetTaskForm = () => {
    setTaskFormData({ taskName: "", taskDescription: "", priority: "", status: "" });
    setErrors({});
  };

  const validateTaskForm = () => {
    const e = {};
    if (!taskFormData.taskName?.trim())        e.taskName = "Task name required";
    if (!taskFormData.taskDescription?.trim()) e.taskDescription = "Description required";
    if (!taskFormData.priority)                e.priority = "Priority required";
    if (!taskFormData.status)                  e.status = "Status required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTicketDetail(ticketGuid);
      if (response?.success) {
        setTicketDetails(mapTicketDetail(response.data));
      } else {
        setTicketDetails(null);
        toast.error(response?.message || "Failed to fetch ticket details");
      }
    } catch {
      toast.error("Failed to fetch ticket details");
      setTicketDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ticketGuid) return;
    fetchTicketDetails();
  }, [ticketGuid]);

  const ticketAgeDays = useMemo(() => {
    if (!ticketDetails?.startDate) return null;
    const start = new Date(ticketDetails.startDate);
    if (Number.isNaN(start.getTime())) return null;
    const end = ticketDetails.statusInString === "Closed"
      ? new Date(ticketDetails.endDate || ticketDetails.updatedAt || ticketDetails.createdAt)
      : new Date();
    if (Number.isNaN(end.getTime())) return null;
    return Math.max(0, Math.floor((end - start) / 86400000));
  }, [ticketDetails]);

  const statusBadgeClass = (s) => {
    if (s === "Open")        return "bg-green-500 text-white";
    if (s === "InProgress" || s === "In Progress") return "bg-yellow-500 text-black";
    if (s === "Closed")      return "bg-blue-500 text-white";
    return "";
  };

  const priorityBadgeClass = (p) => {
    if (p === "High")   return "bg-red-500 text-white";
    if (p === "Medium") return "bg-orange-500 text-white";
    if (p === "Low")    return "bg-green-500 text-white";
    return "";
  };

  const typeBadgeClass = (t) => {
    if (t === "Bug")                            return "bg-red-500 text-white";
    if (t === "UserStories" || t === "Feature") return "bg-blue-500 text-white";
    if (t === "Task")                           return "bg-green-500 text-white";
    return "";
  };

  // ADD COMMENT — FIX: was calling non-existent addCommentToTicket
  const handleAddComment = async () => {
    if (!commentText.trim()) { toast.error("Comment cannot be empty"); return; }
    try {
      setSubmitting(true);
      const response = await ticketService.addComment(ticketGuid, workspaceGuid, commentText);
      if (response?.success) {
        toast.success("Comment added successfully");
        setCommentText("");
        setAddCommentDialogOpen(false);
        await fetchTicketDetails();
      } else {
        toast.error(response?.message || "Failed to add comment");
      }
    } catch (error) {
      toast.error(
        error?.response?.status === 403
          ? "Only the assigned user or a Manager/Admin/Owner can comment on this ticket"
          : "Failed to add comment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // CHANGE STATUS — FIX: was only showing toast.info, never called the API
  const handleStatusSubmit = async () => {
    const statusValue = Number(selectedStatus);
    if (!statusValue) { toast.error("Please select a status"); return; }
    try {
      setSubmitting(true);
      const response = await ticketService.updateTicketStatus(workspaceGuid, ticketGuid, statusValue);
      if (response?.success) {
        const label = STATUS_OPTIONS.find((o) => o.value === statusValue)?.label ?? statusValue;
        toast.success(`Status updated to "${label}"`);
        setStatusDialogOpen(false);
        setSelectedStatus("");
        await fetchTicketDetails();
      } else {
        toast.error(response?.message || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  // CHANGE PRIORITY — FIX: was only showing toast.info, never called the API
  const handlePrioritySubmit = async () => {
    const priorityValue = Number(selectedPriority);
    if (!priorityValue) { toast.error("Please select a priority"); return; }
    try {
      setSubmitting(true);
      const response = await ticketService.updateTicketPriority(workspaceGuid, ticketGuid, priorityValue);
      if (response?.success) {
        const label = PRIORITY_OPTIONS.find((o) => o.value === priorityValue)?.label ?? priorityValue;
        toast.success(`Priority updated to "${label}"`);
        setPriorityDialogOpen(false);
        setSelectedPriority("");
        await fetchTicketDetails();
      } else {
        toast.error(response?.message || "Failed to update priority");
      }
    } catch {
      toast.error("Failed to update priority");
    } finally {
      setSubmitting(false);
    }
  };

  // REQUEST CLOSE — FIX: was only showing toast.info, never called the API
  const handleCloseRequestSubmit = async () => {
    if (!closeReason.trim()) { toast.error("Reason is required to request ticket closure"); return; }
    try {
      setSubmitting(true);
      const response = await ticketService.requestClose(ticketGuid, closeReason);
      if (response?.success) {
        toast.success("Close request submitted. An admin will review it shortly.");
        setCloseRequestDialogOpen(false);
        setCloseReason("");
        await fetchTicketDetails();
      } else {
        toast.error(response?.message || "Failed to submit close request");
      }
    } catch (error) {
      toast.error(
        error?.response?.status === 403
          ? "Only the user assigned to this ticket can request its closure"
          : "Failed to submit close request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE TICKET — FIX: was only showing toast.info, never called the API
  const handleDeleteTicket = async () => {
    try {
      setSubmitting(true);
      const response = await ticketService.deleteTicket(ticketGuid);
      if (response?.success) {
        toast.success("Ticket deleted successfully");
        setDeleteDialogOpen(false);
        navigate(-1);
      } else {
        toast.error(response?.message || "Failed to delete ticket");
      }
    } catch (error) {
      toast.error(
        error?.response?.status === 403
          ? "You don't have permission to delete this ticket"
          : "Failed to delete ticket"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateOrUpdateTask = async () => {
    if (!validateTaskForm()) return;
    try {
      setTaskLoading(true);
      const payload = {
        ticketGuid:  ticketDetails.ticketGuid,
        title:       taskFormData.taskName,
        description: taskFormData.taskDescription,
        priority:    Number(taskFormData.priority),
        status:      Number(taskFormData.status),
      };
      const response = await taskService.createTask(workspaceGuid, payload);
      if (response?.success) {
        toast.success("Task created successfully");
        resetTaskForm();
        setAddTaskDialogOpen(false);
      } else {
        toast.error(response?.message || "Task creation failed");
      }
    } catch {
      toast.error("Task creation failed");
    } finally {
      setTaskLoading(false);
    }
  };

  const ticket = ticketDetails;

  if (loading) return <TicketDetailSkeleton />;

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">Ticket not found</p>
        <p className="text-sm mt-1">It may have been deleted or you don't have access.</p>
      </div>
    );
  }

  return (
    <>
      {/* Action bar */}
      <div className="flex gap-4 mb-3 flex-wrap">
        <Button variant="secondary" className="flex items-center gap-2"
          onClick={() => setDeleteDialogOpen(true)}>
          <Trash2 className="h-4 w-4" /> Delete Ticket
        </Button>
        <Button variant="secondary" className="flex items-center gap-2"
          onClick={() => setStatusDialogOpen(true)}>
          <Flame className="h-4 w-4" /> Change Status
        </Button>
        <Button variant="secondary" className="flex items-center gap-2"
          onClick={() => setPriorityDialogOpen(true)}>
          <Flag className="h-4 w-4" /> Change Priority
        </Button>
        {canManageTasks && (
          <Button variant="secondary" className="flex items-center gap-2"
            onClick={() => {
              setTaskFormData((p) => ({
                ...p,
                ticketId: ticketDetails?.ticketId ? String(ticketDetails.ticketId) : "",
              }));
              setAddTaskDialogOpen(true);
            }}>
            <Goal className="h-4 w-4" /> Add Task
          </Button>
        )}
        {/* Hide when already requested or ticket is already closed */}
        {!ticket.closeRequested && ticket.statusInString !== "Closed" && (
          <Button variant="secondary" className="flex items-center gap-2"
            onClick={() => setCloseRequestDialogOpen(true)}>
            <Target className="h-4 w-4" /> Request Close
          </Button>
        )}
        <Button variant="secondary" className="flex items-center gap-2"
          onClick={() => setAddCommentDialogOpen(true)}>
          <Pencil className="h-4 w-4" /> Add Comment
        </Button>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          <Card className="p-4">
            <CardHeader className="px-0 pt-0">
              <h2 className="text-2xl font-bold mb-2">{ticket?.title}</h2>
              <div className="flex flex-wrap items-center gap-2">
                {ticket?.tags?.length ? (
                  ticket.tags.map((tag, i) => (
                    <Badge key={i} className="px-2 text-white">{tag}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <CardDescription>
                <p className="mb-4 whitespace-pre-line">
                  {ticket?.description || "No description available"}
                </p>
              </CardDescription>
            </CardContent>
          </Card>

          {ticket.steps?.length > 0 && (
            <Card className="p-4 mt-4">
              <CardHeader>
                <h3 className="text-lg font-semibold">Steps to Reproduce</h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {ticket.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="font-semibold text-muted-foreground">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="mt-4 flex flex-col h-[450px]">
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-3">
                <div className="space-y-4">
                  {!ticket?.comments?.length ? (
                    <p className="text-sm text-muted-foreground">
                      No comments yet. Be the first to comment on this ticket.
                    </p>
                  ) : (
                    ticket.comments.map((comment) => (
                      <div key={comment.id}
                        className="flex rounded-md border p-3 justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{comment.authorName || "Unknown"}</p>
                          <p className="text-sm whitespace-pre-line break-words">{comment.text}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs text-gray-500 mt-1">
                            {comment.createdAtInString || "—"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Card className="p-4">
            <CardHeader className="px-0 pt-0">
              <h3 className="text-lg font-semibold mb-3">Details</h3>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <CardDescription>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center">
                    <span className="font-medium text-gray-400 mr-2">Ticket ID:</span>
                    <Badge className="px-2 text-white">{ticket?.ticketGuid || "—"}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center">
                    <span className="font-medium text-gray-400 mr-2">Type:</span>
                    <Badge className={`px-2 ${typeBadgeClass(ticket?.typeName)}`}>
                      {ticket?.typeName || "—"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center">
                    <span className="font-medium text-gray-400 mr-2">Created At:</span>
                    <span className="text-sm">{ticket?.createdAt || "—"}</span>
                  </div>
                  <div className="flex flex-wrap items-center">
                    <span className="font-medium text-gray-400 mr-2">Updated At:</span>
                    <span className="text-sm">{ticket?.updatedAt || "—"}</span>
                  </div>
                  <div className="flex flex-wrap items-center">
                    <span className="font-medium text-gray-400 mr-2">Close Requested:</span>
                    <Badge variant={ticket?.closeRequested ? "destructive" : "secondary"} className="px-2">
                      {ticket?.closeRequested ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader className="px-0 pt-0">
              <h3 className="text-lg font-semibold mb-3">Participants</h3>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <CardDescription>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center">
                    <span className="font-medium text-gray-400 mr-2">Assigned To:</span>
                    <span className="text-sm">{ticket?.assignedToName || "—"}</span>
                  </div>
                  <div className="flex flex-wrap items-center">
                    <span className="font-medium text-gray-400 mr-2">Assigned By:</span>
                    <span className="text-sm">{ticket?.assignedByName || "—"}</span>
                  </div>
                  <div className="flex flex-wrap items-center">
                    <span className="font-medium text-gray-400 mr-2">Assigned To Email:</span>
                    <span className="text-sm">{ticket?.assignedToEmail || "—"}</span>
                  </div>
                  <div className="flex flex-wrap items-center">
                    <span className="font-medium text-gray-400 mr-2">Assigned By Email:</span>
                    <span className="text-sm">{ticket?.assignedByEmail || "—"}</span>
                  </div>
                </div>
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader className="px-0 pt-0">
              <h3 className="text-lg font-semibold mb-3">Properties</h3>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <CardDescription>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center">
                    <span className="font-medium text-gray-400 mr-2">Status:</span>
                    <Badge className={`px-2 ${statusBadgeClass(ticket?.statusInString)}`}>
                      {ticket?.statusInString || "—"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center">
                    <span className="font-medium text-gray-400 mr-2">Priority:</span>
                    <Badge className={`px-2 ${priorityBadgeClass(ticket?.priorityInString)}`}>
                      {ticket?.priorityInString || "—"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center">
                    <span className="font-medium text-gray-400 mr-2">Project:</span>
                    <span className="text-sm">{ticket?.projectName || "—"}</span>
                  </div>
                  <div className="flex flex-wrap items-center">
                    <span className="font-medium text-gray-400 mr-2">Sprint:</span>
                    <span className="text-sm">{ticket?.sprintName || "Backlog"}</span>
                  </div>
                  <div className="flex flex-wrap items-center">
                    <span className="font-medium text-gray-400 mr-2">
                      {ticket?.statusInString === "Closed" ? "Completed in:" : "Open for:"}
                    </span>
                    <Badge variant="secondary" className="px-2">
                      {ticketAgeDays === null ? "—" : `${ticketAgeDays} days`}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center">
                    <span className="font-medium text-gray-400 mr-2">Points:</span>
                    <span className="text-sm">{ticket?.points ?? "—"}</span>
                  </div>
                  <div className="flex flex-wrap items-center">
                    <span className="font-medium text-gray-400 mr-2">Ticket Start:</span>
                    <span className="text-sm">{ticket?.startDateInString || ticket?.startDate || "—"}</span>
                  </div>
                  <div className="flex flex-wrap items-center">
                    <span className="font-medium text-gray-400 mr-2">Ticket End:</span>
                    <span className="text-sm">{ticket?.endDateInString || ticket?.endDate || "—"}</span>
                  </div>
                </div>
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Status */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Change Ticket Status</DialogTitle></DialogHeader>
          <div className="py-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="secondary"
              onClick={() => { setStatusDialogOpen(false); setSelectedStatus(""); }}>
              Cancel
            </Button>
            <Button className="text-white" onClick={handleStatusSubmit} disabled={submitting}>
              {submitting ? "Updating…" : "Change Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Priority */}
      <Dialog open={priorityDialogOpen} onOpenChange={setPriorityDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Change Priority</DialogTitle></DialogHeader>
          <div className="py-4">
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="secondary"
              onClick={() => { setPriorityDialogOpen(false); setSelectedPriority(""); }}>
              Cancel
            </Button>
            <Button className="text-white" onClick={handlePrioritySubmit} disabled={submitting}>
              {submitting ? "Updating…" : "Change Priority"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Close */}
      <Dialog open={closeRequestDialogOpen} onOpenChange={setCloseRequestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Request Close</DialogTitle></DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Reason for closing…"
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
            />
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="secondary"
              onClick={() => { setCloseRequestDialogOpen(false); setCloseReason(""); }}>
              Cancel
            </Button>
            <Button className="text-white" onClick={handleCloseRequestSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Ticket */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Delete Ticket</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The ticket and all its comments will be permanently deleted.
            </p>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTicket} disabled={submitting}>
              {submitting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Comment */}
      <Dialog open={addCommentDialogOpen} onOpenChange={setAddCommentDialogOpen}>
        <DialogContent className="sm:max-w-lg w-full max-w-[650px]">
          <DialogHeader><DialogTitle>Add Comment</DialogTitle></DialogHeader>
          <div className="py-4">
            <Textarea
              className="min-h-[120px] max-h-[220px] overflow-y-auto resize-none"
              placeholder="Write a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="secondary"
              onClick={() => { setAddCommentDialogOpen(false); setCommentText(""); }}>
              Cancel
            </Button>
            <Button onClick={handleAddComment} disabled={submitting}>
              {submitting ? "Posting…" : "Add Comment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task */}
      {canManageTasks && (
        <Dialog open={addTaskDialogOpen} onOpenChange={setAddTaskDialogOpen}>
          <DialogContent className="sm:max-w-lg w-full max-w-[550px]">
            <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Name</label>
                <Input
                  value={taskFormData.taskName}
                  onChange={(e) => setTaskFormData((p) => ({ ...p, taskName: e.target.value }))}
                  placeholder="Enter task name"
                />
                {errors.taskName && <p className="text-xs text-red-500">{errors.taskName}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={taskFormData.taskDescription}
                  onChange={(e) => setTaskFormData((p) => ({ ...p, taskDescription: e.target.value }))}
                  placeholder="Describe the task…"
                  className="min-h-[120px]"
                />
                {errors.taskDescription && (
                  <p className="text-xs text-red-500">{errors.taskDescription}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={taskFormData.priority}
                    onValueChange={(v) => setTaskFormData((p) => ({ ...p, priority: v }))}>
                    <SelectTrigger className='w-full'><SelectValue placeholder="Priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Low</SelectItem>
                      <SelectItem value="2">Medium</SelectItem>
                      <SelectItem value="3">High</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priority && <p className="text-xs text-red-500">{errors.priority}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={taskFormData.status}
                    onValueChange={(v) => setTaskFormData((p) => ({ ...p, status: v }))}>
                    <SelectTrigger className='w-full'><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Open</SelectItem>
                      <SelectItem value="2">In Progress</SelectItem>
                      <SelectItem value="3">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="secondary"
                onClick={() => { setAddTaskDialogOpen(false); resetTaskForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrUpdateTask} disabled={taskLoading}>
                {taskLoading ? "Creating…" : "Create Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default TicketDetail;