import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { MoveLeftIcon } from 'lucide-react'
import {
    LineChart, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import sprintService from '@/services/sprint'
import { useAuth } from '@/context/AuthContext'
import { useRole } from '@/hooks/useRole'

// ─── constants ────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
    'InProgress': '#3b82f6',
    'Pending':    '#ef4444',
    'Completed':  '#6b7280',
    'Blocked':    '#f59e0b',
    'Closed':     '#10b981',
}
const DEFAULT_PAGE_SIZE        = 10
const PREVIEW_ACTIVITIES_COUNT = 5

// ─── utils ────────────────────────────────────────────────────────────────────
const getStatusColor  = (s) => STATUS_COLORS[s] || '#6b7280'
const getAssigneeName = (t) => t?.assignedToName || 'Unassigned'
const getTicketId     = (t) => t?.ticketId || t?.id || 'N/A'
const formatDate      = (v) => {
    if (!v) return '—'
    try { return new Date(v).toLocaleDateString() } catch { return '—' }
}

// ─── component ────────────────────────────────────────────────────────────────
export default function Sprint() {
    const { sprintId: sprintGuid } = useParams()
    const navigate                  = useNavigate()
    const { getCurrentWorkspaceId } = useAuth()
    const { canManageSprints }      = useRole()
    const workspaceGuid             = getCurrentWorkspaceId()

    // state
    const [sprint,           setSprint]           = useState(null)
    const [sprintTeam,       setSprintTeam]       = useState(null)
    const [sprintTickets,    setSprintTickets]    = useState([])
    const [sprintActivities, setSprintActivities] = useState([])
    const [sprintBreakdown,  setSprintBreakdown]  = useState(null)
    const [sprintProgress,   setSprintProgress]   = useState([])
    const [loading,          setLoading]          = useState(false)
    const [error,            setError]            = useState(null)
    const [openMemberModal,  setOpenMemberModal]  = useState(false)
    const [selectedMember,   setSelectedMember]  = useState(null)

    // ─── fetchers ─────────────────────────────────────────────────────────
    // Every service method returns `response.data` which is the full ApiResponseModel:
    //   { success, statusCode, message, data: <actual payload> }
    // Exception: getSprintsByProject returns a raw List<SprintDropdownModel> (no wrapper).
    //
    // So the rule here is: res?.data is the actual payload we want.

    const fetchSprintData = useCallback(async (wsId, spId) => {
        // ApiResponseModel<SprintDto>  →  res.data = SprintDto
        const res = await sprintService.getSprintByGuid(wsId, spId)
        const dto = res?.data
        if (dto) setSprint(dto)
        return dto || null
    }, [])

    const fetchSprintTeam = useCallback(async (spId) => {
        // ApiResponseModel<TeamWithMembersDto>  →  res.data = { name, members:[...] }
        const res  = await sprintService.getSprintTeam(spId)
        const team = res?.data || { members: [], name: 'Team' }
        setSprintTeam(team)
        return team
    }, [])

    const fetchSprintTickets = useCallback(async (spId) => {
        // ApiResponseModel<List<TicketDto>>  →  res.data = [...]
        const res     = await sprintService.getSprintTickets(spId)
        const tickets = Array.isArray(res?.data) ? res.data : []
        setSprintTickets(tickets)
        return tickets
    }, [])

    const fetchBreakdown = useCallback(async (spId) => {
        // ApiResponseModel<SprintBreakdownModel>  →  res.data = { totalTickets, ... }
        const res       = await sprintService.getSprintBreakdown(spId)
        const breakdown = res?.data || {
            totalTickets: 0, pendingTickets: 0, completedTickets: 0,
            effiency: 0, sprintVelocity: 0, notStarted: 0,
        }
        setSprintBreakdown(breakdown)
        return breakdown
    }, [])

    const fetchSprintProgress = useCallback(async (spId) => {
        // ApiResponseModel<List<SprintProgressModel>>  →  res.data = [...]
        const res      = await sprintService.getSprintProgress(spId)
        const progress = Array.isArray(res?.data) ? res.data : []
        setSprintProgress(progress)
        return progress
    }, [])

    const fetchSprintActivities = useCallback(async (spId, page, size) => {
        // ApiResponseModel<List<EventsLog>>  →  res.data = [...]
        const res        = await sprintService.getSprintActivities(spId, page, size)
        const activities = Array.isArray(res?.data) ? res.data : []
        setSprintActivities(activities)
        return activities
    }, [])

    const loadAll = useCallback(async () => {
        if (!workspaceGuid || !sprintGuid) { setError('Missing workspace or sprint ID'); return }
        setLoading(true)
        setError(null)
        try {
            const results = await Promise.allSettled([
                fetchSprintData(workspaceGuid, sprintGuid),
                fetchSprintTeam(sprintGuid),
                fetchSprintTickets(sprintGuid),
                fetchBreakdown(sprintGuid),
                fetchSprintProgress(sprintGuid),
                fetchSprintActivities(sprintGuid, 1, DEFAULT_PAGE_SIZE),
            ])
            const labels = ['Sprint', 'Team', 'Tickets', 'Breakdown', 'Progress', 'Activities']
            results.forEach((r, i) => { if (r.status === 'rejected') console.error(`[Sprint] ${labels[i]} failed:`, r.reason) })
            if (results[0].status === 'rejected') setError('Failed to load sprint. Please refresh.')
        } catch (e) {
            console.error('[Sprint] Unexpected error:', e)
            setError('Failed to load sprint data.')
        } finally {
            setLoading(false)
        }
    }, [workspaceGuid, sprintGuid, fetchSprintData, fetchSprintTeam,
        fetchSprintTickets, fetchBreakdown, fetchSprintProgress, fetchSprintActivities])

    useEffect(() => { loadAll() }, [loadAll])

    // ─── derived ──────────────────────────────────────────────────────────
    const previewActivities = useMemo(() => sprintActivities.slice(0, PREVIEW_ACTIVITIES_COUNT), [sprintActivities])
    const hasMoreActivities = sprintActivities.length > PREVIEW_ACTIVITIES_COUNT
    const totalTeamMembers  = sprintTeam?.members?.length || 0

    const progressChartData = useMemo(() => {
        if (!sprintProgress.length) return []
        return sprintProgress.map(item => ({
            date:      formatDate(item.date),
            completed: item.completed || 0,
            pending:   item.pending   || 0,
        }))
    }, [sprintProgress])

    const daysRemaining = useMemo(() => {
        if (!sprint?.endDate) return 0
        return Math.max(0, Math.ceil((new Date(sprint.endDate) - new Date()) / 86400000))
    }, [sprint?.endDate])

    // ─── handlers ─────────────────────────────────────────────────────────
    const getMemberTickets = useCallback((name) =>
        name ? sprintTickets.filter(t => getAssigneeName(t) === name) : []
    , [sprintTickets])

    const handleViewTicket  = useCallback((guid) => { if (guid) navigate(`/tickets/${guid}`) }, [navigate])
    const handleMemberClick = useCallback((m) => { setSelectedMember(m); setOpenMemberModal(true) }, [])

    // ─── guards ───────────────────────────────────────────────────────────
    if (loading) return <div className="w-full h-96 flex items-center justify-center"><p className="text-sm text-gray-500">Loading sprint...</p></div>
    if (error)   return <div className="w-full h-96 flex items-center justify-center"><p className="text-sm text-red-500">{error}</p></div>
    if (!sprint) return <div className="w-full h-96 flex items-center justify-center"><p className="text-sm text-gray-500">No sprint data available.</p></div>

    // ─── render ───────────────────────────────────────────────────────────
    return (
        <div className="p-6 space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold">{sprint.title || 'Untitled Sprint'}</h1>
                    <p className="text-sm text-gray-500 mt-1">{sprint.tagline || ''}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{sprint.startDateInString || '—'} — {sprint.endDateInString || '—'}</span>
                        {sprint.statusDescription && (
                            <span className="px-2 py-0.5 rounded-md text-white" style={{ background: getStatusColor(sprint.statusDescription) }}>
                                {sprint.statusDescription}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        <MoveLeftIcon className="w-4 h-4 mr-1" /> Back to Sprints
                    </Button>
                    {canManageSprints && (
                        <>
                            <Button className="text-white bg-black">Pause Sprint</Button>
                            <Button variant="destructive">Close Sprint</Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">

                {/* Left column */}
                <div className="col-span-12 lg:col-span-7 space-y-6">

                    {/* Overview card */}
                    <Card>
                        <CardHeader><CardTitle>Sprint Overview</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600">{sprint.goal || 'No goal specified'}</p>
                            {sprint.tags && (
                                <div className="flex flex-wrap gap-2">
                                    {sprint.tags.split(',').filter(Boolean).map((tag, i) => (
                                        <Badge key={i} variant="outline">{tag.trim()}</Badge>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>Total Tickets: {sprintTickets.length}</span>
                                <span>• Team: {sprintTeam?.name || sprintTeam?.teamName || 'Unknown'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team members */}
                    <Card>
                        <CardHeader><CardTitle>Team Members ({totalTeamMembers})</CardTitle></CardHeader>
                        <CardContent>
                            {totalTeamMembers === 0 ? (
                                <p className="text-sm text-gray-500">No team members assigned.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {sprintTeam.members.map((member, idx) => (
                                        <div
                                            key={member.profile?.guid || idx}
                                            className="p-3 border rounded-lg cursor-pointer hover:shadow-md transition flex flex-col items-center"
                                            onClick={() => handleMemberClick(member)}
                                        >
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={member.profile?.profileImageUrl} />
                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                                                    {(member.profile?.displayName || 'U').charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="mt-2 text-center">
                                                <p className="text-sm font-medium">{member.profile?.displayName || 'Unknown'}</p>
                                                {member.departmentDto?.departmentName && (
                                                    <p className="text-xs text-gray-500">{member.departmentDto.departmentName}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>

                        {/* Member tickets modal */}
                        <Dialog open={openMemberModal} onOpenChange={setOpenMemberModal}>
                            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                                {selectedMember && (
                                    <>
                                        <DialogHeader>
                                            <DialogTitle>{selectedMember.profile?.displayName || 'Member'} — Sprint Tickets</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-3 mt-4">
                                            {(() => {
                                                const mt = getMemberTickets(selectedMember.profile?.displayName)
                                                if (!mt.length) return <p className="text-sm text-gray-500">No tickets assigned in this sprint.</p>
                                                return mt.map((ticket, i) => (
                                                    <div key={getTicketId(ticket) || i} className="p-3 border rounded-md bg-white shadow-sm">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-medium text-gray-800">{ticket.title || 'Untitled'}</h4>
                                                            {ticket.statusInString && (
                                                                <span className="px-2 py-0.5 text-xs rounded-md text-white" style={{ background: getStatusColor(ticket.statusInString) }}>
                                                                    {ticket.statusInString}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-xs text-gray-600 line-clamp-2">{ticket.description || 'No description'}</p>
                                                        <div className="flex gap-2 mt-2 text-xs text-gray-500">
                                                            <span>Priority: {ticket.priorityInString || 'N/A'}</span>
                                                            <span>• Updated: {formatDate(ticket.updatedAt)}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            })()}
                                        </div>
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>
                    </Card>

                    {/* Tickets list */}
                    <Card>
                        <CardHeader><CardTitle>Tickets in Sprint</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {sprintTickets.length === 0 ? (
                                <p className="text-sm text-gray-500">No tickets in this sprint.</p>
                            ) : (
                                sprintTickets.map((ticket, idx) => (
                                    <div key={getTicketId(ticket) || idx} className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-800">{ticket.title || 'Untitled Ticket'}</h3>
                                            {ticket.statusInString && (
                                                <span className="px-2 py-0.5 rounded-md text-xs font-medium text-white" style={{ background: getStatusColor(ticket.statusInString) }}>
                                                    {ticket.statusInString}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            {ticket.typeName && <Badge>{ticket.typeName}</Badge>}
                                            {ticket.priorityInString === 'High'   && <Badge variant="destructive">{ticket.priorityInString}</Badge>}
                                            {ticket.priorityInString === 'Medium' && <Badge className="bg-amber-400 text-white">{ticket.priorityInString}</Badge>}
                                            {ticket.priorityInString === 'Low'    && <Badge variant="outline">{ticket.priorityInString}</Badge>}
                                        </div>
                                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{ticket.description || 'No description.'}</p>
                                        <div className="flex justify-between items-center mt-3">
                                            <div className="text-xs text-gray-500 flex gap-3">
                                                <span>Assignee: {getAssigneeName(ticket)}</span>
                                                <span>Updated: {formatDate(ticket.updatedAt)}</span>
                                            </div>
                                            <Button size="sm" className="bg-black text-white w-20" onClick={() => handleViewTicket(ticket.ticketGuid)}>
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right column */}
                <div className="col-span-12 lg:col-span-5 space-y-6">

                    {/* Metric cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Card>
                            <CardHeader className="pb-1"><CardTitle className="text-base font-medium">Overall Progress</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">
                                    {sprintBreakdown?.totalTickets > 0
                                        ? Math.round((sprintBreakdown.completedTickets / sprintBreakdown.totalTickets) * 100)
                                        : 0}%
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-1"><CardTitle className="text-base font-medium">Total Tickets</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{sprintBreakdown?.totalTickets || 0}</div>
                                <p className="text-sm text-gray-500">
                                    {sprintBreakdown?.completedTickets || 0} completed, {sprintBreakdown?.pendingTickets || 0} pending
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-1"><CardTitle className="text-base font-medium">Sprint Velocity</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{sprintBreakdown?.sprintVelocity || 0}</div>
                                <p className="text-sm text-gray-500">Story points delivered</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-1"><CardTitle className="text-base font-medium">Days Remaining</CardTitle></CardHeader>
                            <CardContent>
                                <div className={`text-3xl font-bold ${daysRemaining === 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                    {daysRemaining}
                                </div>
                                <p className="text-sm text-gray-500">
                                    {daysRemaining === 0 ? 'Sprint ends today' : `${daysRemaining} days left`}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Progress chart */}
                    {progressChartData.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle>Sprint Progress</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={progressChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="completed" stroke="#10b981" dot={false} name="Completed" />
                                        <Line type="monotone" dataKey="pending"   stroke="#ef4444" dot={false} name="Pending"   />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}

                    {/* Activity */}
                    <Card>
                        <CardHeader><CardTitle>Sprint Activity</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {previewActivities.length === 0 ? (
                                <p className="text-sm text-gray-500">No recent activities.</p>
                            ) : (
                                previewActivities.map((activity, idx) => (
                                    <div key={idx} className="text-sm text-gray-700 border-b last:border-b-0 pb-2 last:pb-0">
                                        <p>{activity.eventDescription || activity.description || 'Activity recorded'}</p>
                                        <span className="text-xs text-gray-400">
                                            {formatDate(activity.createdAt || activity.date)}
                                        </span>
                                    </div>
                                ))
                            )}
                            {hasMoreActivities && (
                                <div className="flex justify-center pt-1">
                                    <Button variant="outline" onClick={() => navigate(`/sprints/${sprintGuid}/activities`)}>
                                        View All Activities
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    )
}