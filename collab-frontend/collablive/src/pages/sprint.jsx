import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, MoveLeftIcon } from 'lucide-react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend
} from 'recharts'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { GenericPieChart } from '@/components/chartComponents/GenericPieChart'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import sprintService from '@/services/sprint'
import { useAuth } from '@/context/AuthContext'
import { useRole } from '@/hooks/useRole'

// ============================================================================
// CONSTANTS
// ============================================================================
const STATUS_COLORS = {
    'InProgress': '#3b82f6',
    'Pending': '#ef4444',
    'Completed': '#6b7280',
    'Blocked': '#f59e0b',
    'Closed': '#10b981'
}

const TICKET_STATUS_COLORS = {
    'Completed': '#34d399',
    'Pending': '#fbbf24',
    'Paused': '#f87171',
    'Closed': '#10b981',
    'default': '#9ca3af'
}

const DEFAULT_PAGE_SIZE = 10
const PREVIEW_ACTIVITIES_COUNT = 5

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getStatusColor = (status) => {
    if (!status) return '#6b7280'
    return STATUS_COLORS[status] || '#6b7280'
}

const getTicketStatusColor = (name) => {
    if (!name) return TICKET_STATUS_COLORS.default
    return TICKET_STATUS_COLORS[name] || TICKET_STATUS_COLORS.default
}

const formatDate = (dateValue) => {
    if (!dateValue) return '—'
    try {
        return new Date(dateValue).toLocaleDateString()
    } catch (error) {
        console.error('[formatDate] Invalid date:', dateValue, error)
        return '—'
    }
}

const formatDateTime = (dateValue) => {
    if (!dateValue) return '—'
    try {
        return new Date(dateValue).toLocaleString()
    } catch (error) {
        console.error('[formatDateTime] Invalid date:', dateValue, error)
        return '—'
    }
}

const getAssigneeName = (ticket) => {
    if (!ticket) return 'Unassigned'
    return ticket.assignedToName || 'Unassigned'
}

const getTicketId = (ticket) => {
    if (!ticket) return 'N/A'
    return ticket.ticketId || ticket.id || 'N/A'
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Sprint() {
    
    // -------------------------
    // HOOKS & STATE
    // -------------------------
    const params = useParams()
    const navigate = useNavigate()
    const { getCurrentWorkspaceId } = useAuth()
    const { canManageSprints } = useRole()
    
    const sprintGuid = params.sprintId
    const workspaceGuid = getCurrentWorkspaceId()
    
    // State
    const [sprint, setSprint] = useState(null)
    const [sprintTeam, setSprintTeam] = useState(null)
    const [sprintTickets, setSprintTickets] = useState([])
    const [sprintActivities, setSprintActivities] = useState([])
    const [sprintBreakdown, setSprintBreakdown] = useState(null)
    const [sprintProgress, setSprintProgress] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize] = useState(DEFAULT_PAGE_SIZE)
    
    // Modal states
    const [openActivityModal, setOpenActivityModal] = useState(false)
    const [openMemberModal, setOpenMemberModal] = useState(false)
    const [selectedMember, setSelectedMember] = useState(null)
    
    // -------------------------
    // API CALLS
    // -------------------------
    
    const fetchSprintProgress = useCallback(async (sprintId) => {
        console.log('[fetchSprintProgress] Starting...', { sprintId })
        
        if (!sprintId) {
            console.error('[fetchSprintProgress] Missing sprint ID')
            throw new Error('Sprint ID is required')
        }
        
        try {
            const response = await sprintService.getSprintProgress(sprintId)
            console.log('[fetchSprintProgress] Response:', response?.data)
            
            // Handle the progress data - it's already an array
            const progressData = Array.isArray(response?.data) ? response.data : []
            setSprintProgress(progressData)
            return progressData
        } catch (error) {
            console.error('[fetchSprintProgress] Error:', error.message, error)
            setSprintProgress([])
            throw error
        }
    }, [])

    const fetchSprintData = useCallback(async (workspaceId, sprintId) => {
        console.log('[fetchSprintData] Starting...', { workspaceId, sprintId })
        
        if (!workspaceId || !sprintId) {
            console.error('[fetchSprintData] Missing required parameters')
            throw new Error('Workspace ID and Sprint ID are required')
        }
        
        try {
            const response = await sprintService.getSprintByGuid(workspaceId, sprintId)
            console.log('[fetchSprintData] Success:', response?.data)
            
            if (!response?.data) {
                console.warn('[fetchSprintData] No data in response')
                return null
            }
            
            setSprint(response.data)
            return response.data
        } catch (error) {
            console.error('[fetchSprintData] Error:', error.message, error)
            throw error
        }
    }, [])
    
    const fetchSprintTeam = useCallback(async (sprintId) => {
        console.log('[fetchSprintTeam] Starting...', { sprintId })
        
        if (!sprintId) {
            console.error('[fetchSprintTeam] Missing sprint ID')
            throw new Error('Sprint ID is required')
        }
        
        try {
            const response = await sprintService.getSprintTeam(sprintId)
            console.log('[fetchSprintTeam] Success:', response?.data)
            
            // The team data is an object with members array
            const teamData = response?.data || { members: [], name: 'Team' }
            setSprintTeam(teamData)
            return teamData
        } catch (error) {
            console.error('[fetchSprintTeam] Error:', error.message, error)
            setSprintTeam({ members: [], name: 'Team' })
            throw error
        }
    }, [])
    
    const fetchSprintTickets = useCallback(async (sprintId) => {
        if (!sprintId) {
            console.error('[fetchSprintTickets] Missing sprint ID')
            throw new Error('Sprint ID is required')
        }
        
        try {
            const response = await sprintService.getSprintTickets(sprintId)
            console.log('[fetchSprintTickets] Success:', response?.data)
            
            // Tickets come as an array directly
            const ticketsData = Array.isArray(response?.data) ? response.data : []
            setSprintTickets(ticketsData)
            return ticketsData
        } catch (error) {
            console.error('[fetchSprintTickets] Error:', error.message, error)
            setSprintTickets([])
            throw error
        }
    }, [])

    const fetchBreakdown = useCallback(async (sprintId) => {
        if (!sprintId) {
            console.error('[fetchBreakdown] Missing sprint ID')
            throw new Error('Sprint ID is required')
        }
        
        try {
            const response = await sprintService.getSprintBreakdown(sprintId)
            console.log('[fetchBreakdown] Success:', response?.data)
            
            const breakdown = response?.data || {
                totalTickets: 0,
                pendingTickets: 0,
                completedTickets: 0,
                effiency: 0,
                sprintVelocity: 0,
                notStarted: 0
            }
            setSprintBreakdown(breakdown)
            return breakdown
        } catch (error) {
            console.error('[fetchBreakdown] Error:', error.message, error)
            setSprintBreakdown(null)
            throw error
        }
    }, [])
    
    const fetchSprintActivities = useCallback(async (sprintId, page, size) => {
        console.log('[fetchSprintActivities] Starting...', { sprintId, page, size })
        
        if (!sprintId) {
            console.error('[fetchSprintActivities] Missing sprint ID')
            throw new Error('Sprint ID is required')
        }
        
        try {
            const response = await sprintService.getSprintActivities(sprintId, page, size)
            console.log('[fetchSprintActivities] Success:', response?.data)
            
            const activitiesData = Array.isArray(response?.data) ? response.data : []
            setSprintActivities(activitiesData)
            return activitiesData
        } catch (error) {
            console.error('[fetchSprintActivities] Error:', error.message, error)
            setSprintActivities([])
            throw error
        }
    }, [])
    
    const loadSprintData = useCallback(async () => {
        console.log('[loadSprintData] Starting data load...')
        
        if (!workspaceGuid || !sprintGuid) {
            console.error('[loadSprintData] Missing required IDs', { workspaceGuid, sprintGuid })
            setError('Missing required workspace or sprint ID')
            return
        }
        
        setLoading(true)
        setError(null)
        
        try {
            console.log('[loadSprintData] Fetching all sprint data in parallel...')
            
            const results = await Promise.allSettled([
                fetchSprintData(workspaceGuid, sprintGuid),
                fetchSprintTeam(sprintGuid),
                fetchSprintTickets(sprintGuid),
                fetchBreakdown(sprintGuid),
                fetchSprintProgress(sprintGuid),
                fetchSprintActivities(sprintGuid, pageNumber, pageSize)
            ])
            
            results.forEach((result, index) => {
                const names = ['Sprint Data', 'Team', 'Tickets', 'Breakdown', 'Progress', 'Activities']
                if (result.status === 'fulfilled') {
                    console.log(`[loadSprintData] ${names[index]} loaded successfully`)
                } else {
                    console.error(`[loadSprintData] ${names[index]} failed:`, result.reason)
                }
            })
            
            const criticalFailed = results.slice(0, 3).some(r => r.status === 'rejected')
            if (criticalFailed) {
                console.warn('[loadSprintData] Some critical data failed to load')
                setError('Some data could not be loaded. Please refresh the page.')
            }
            
            console.log('[loadSprintData] Data load complete')
        } catch (error) {
            console.error('[loadSprintData] Unexpected error:', error)
            setError('Failed to load sprint data. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [workspaceGuid, sprintGuid, pageNumber, pageSize, fetchSprintData, fetchSprintTeam, fetchSprintTickets, fetchBreakdown, fetchSprintProgress, fetchSprintActivities])
    
    // -------------------------
    // EFFECTS
    // -------------------------
    useEffect(() => {
        console.log('[Sprint] Initial data load triggered')
        loadSprintData()
    }, [loadSprintData])
    
    // -------------------------
    // COMPUTED VALUES
    // -------------------------
    const previewActivities = useMemo(() => {
        const preview = sprintActivities.slice(0, PREVIEW_ACTIVITIES_COUNT)
        console.log('[previewActivities] Computed:', preview.length, 'items')
        return preview
    }, [sprintActivities])
    
    const hasMoreActivities = useMemo(() => {
        return sprintActivities.length > PREVIEW_ACTIVITIES_COUNT
    }, [sprintActivities])
    
    // Transform progress data for the chart
    const progressChartData = useMemo(() => {
        if (!Array.isArray(sprintProgress) || sprintProgress.length === 0) {
            console.log('[progressChartData] No progress data available')
            return []
        }
        
        // Format the data for recharts
        const chartData = sprintProgress.map(item => ({
            date: formatDate(item.date),
            completed: item.completed || 0,
            pending: item.pending || 0,
            fullDate: item.date
        }))
        
        console.log('[progressChartData] Formatted data:', chartData)
        return chartData
    }, [sprintProgress])
    
    const totalTeamMembers = useMemo(() => {
        const count = sprintTeam?.members?.length || 0
        console.log('[totalTeamMembers]', count)
        return count
    }, [sprintTeam])
    
    // Calculate days remaining
    const daysRemaining = useMemo(() => {
        if (!sprint?.endDate) return 0
        
        try {
            const endDate = new Date(sprint.endDate)
            const today = new Date()
            const diffTime = endDate - today
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return Math.max(0, diffDays)
        } catch (error) {
            console.error('[daysRemaining] Error calculating:', error)
            return 0
        }
    }, [sprint?.endDate])
    
    // -------------------------
    // EVENT HANDLERS
    // -------------------------
    
    const getMemberTickets = useCallback((memberName) => {
        console.log('[getMemberTickets] Filtering for:', memberName)
        
        if (!memberName) {
            console.warn('[getMemberTickets] No member name provided')
            return []
        }
        
        const tickets = sprintTickets.filter(ticket => {
            if (!ticket) return false
            const assignee = getAssigneeName(ticket)
            return assignee === memberName
        })
        
        console.log('[getMemberTickets] Found', tickets.length, 'tickets for', memberName)
        return tickets
    }, [sprintTickets])
    
    const handleViewTicket = useCallback((ticketId) => {
        console.log('[handleViewTicket] Navigating to ticket:', ticketId)
        
        if (!ticketId) {
            console.warn('[handleViewTicket] No ticket ID provided')
            return
        }
        
        navigate(`/tickets/${ticketId}`)
    }, [navigate])
    
    const handleMemberClick = useCallback((member) => {
        console.log('[handleMemberClick] Member clicked:', member?.profile?.displayName)
        
        if (!member) {
            console.warn('[handleMemberClick] No member data provided')
            return
        }
        
        setSelectedMember(member)
        setOpenMemberModal(true)
    }, [])
    
    const handleBackNavigation = useCallback(() => {
        console.log('[handleBackNavigation] Navigating back')
        navigate(-1)
    }, [navigate])
    
    // -------------------------
    // RENDER CONDITIONS
    // -------------------------
    if (loading) {
        console.log('[Sprint] Rendering loading state')
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="text-sm text-gray-500">Loading sprint...</div>
            </div>
        )
    }
    
    if (error) {
        console.log('[Sprint] Rendering error state:', error)
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="text-sm text-red-500">{error}</div>
            </div>
        )
    }
    
    if (!sprint) {
        console.log('[Sprint] No sprint data available')
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="text-sm text-gray-500">No sprint data available.</div>
            </div>
        )
    }
    
    console.log('[Sprint] Rendering main content')
    
    // -------------------------
    // RENDER
    // -------------------------
    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold">{sprint.title || 'Untitled Sprint'}</h1>
                    <p className="text-sm text-gray-500 mt-1">{sprint.tagline || ''}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{sprint.startDateInString || '—'} — {sprint.endDateInString || '—'}</span>
                        {sprint.status && (
                            <span 
                                className="px-2 py-0.5 rounded-md text-white text-xs" 
                                style={{ background: getStatusColor(sprint.status) }}
                            >
                                {sprint.statusDescription}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={handleBackNavigation}>
                        <MoveLeftIcon className="w-4 h-4" />
                        Back to Sprints
                    </Button>
                    {/* Only Owner/Admin/Manager can pause or close a sprint */}
                    {canManageSprints && (
                        <>
                            <Button className="text-white bg-black border-1">Pause Sprint</Button>
                            <Button variant="destructive">Close Sprint</Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Left Column */}
                <div className="col-span-12 lg:col-span-7 space-y-6">
                    {/* Sprint Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sprint Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600">{sprint.goal || 'No goal specified'}</p>
                            {sprint?.tags && sprint.tags.split(",").length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {sprint.tags.split(",").map((tag, idx) => (
                                        <Badge key={idx} variant="outline">{tag}</Badge>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <span>Total Tickets: {sprintTickets?.length || 0}</span>
                                <span>• Team: {sprintTeam?.name || 'Unknown'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Members */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members ({totalTeamMembers})</CardTitle>
                        </CardHeader>

                        <CardContent>
                            {!sprintTeam?.members || sprintTeam.members.length === 0 ? (
                                <div className="text-sm text-gray-500">No team members assigned.</div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {sprintTeam.members.map((member, idx) => (
                                        <div
                                            key={member.profile?.guid || idx}
                                            className="p-3 border rounded-lg cursor-pointer transition hover:shadow-md flex flex-col items-center"
                                            onClick={() => handleMemberClick(member)}
                                        >
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={member.profile?.profileImageUrl} alt={member.profile?.displayName || 'User'} />
                                                <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                    {member.profile?.displayName ? member.profile.displayName.charAt(0).toUpperCase() : 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="mt-2 text-center">
                                                <p className="text-sm font-medium">{member.profile?.displayName || 'Unknown'}</p>
                                                {member.departmentDto?.departmentName && (
                                                    <p className="text-xs text-gray-500">{member.departmentDto.departmentName}</p>
                                                )}
                                                {member.position && <p className="text-xs text-gray-400">{member.position}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>

                        {/* Member Tasks Modal */}
                        <Dialog open={openMemberModal} onOpenChange={setOpenMemberModal}>
                            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                                {selectedMember && (
                                    <>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {selectedMember.profile?.displayName || 'Member'} - Sprint Tasks
                                            </DialogTitle>
                                        </DialogHeader>

                                        <div className="space-y-4 mt-4">
                                            {(() => {
                                                const memberTickets = getMemberTickets(selectedMember.profile?.displayName)
                                                
                                                if (memberTickets.length === 0) {
                                                    return <p className="text-sm text-gray-500">No tickets assigned in this sprint.</p>
                                                }
                                                
                                                return memberTickets.map((ticket, idx) => {
                                                    const updatedDate = formatDate(ticket.updatedAt)
                                                    
                                                    return (
                                                        <div
                                                            key={getTicketId(ticket) || idx}
                                                            className="p-3 border rounded-md bg-white shadow-sm"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-medium text-gray-800">{ticket.title || 'Untitled'}</h4>
                                                                {ticket.statusInString && (
                                                                    <span
                                                                        className="px-2 py-0.5 text-xs rounded-md text-white"
                                                                        style={{ background: getStatusColor(ticket.statusInString) }}
                                                                    >
                                                                        {ticket.statusInString}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="mt-1 text-xs text-gray-600 break-words line-clamp-2">
                                                                {ticket.description || 'No description'}
                                                            </p>

                                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                                <span>Priority: {ticket.priorityInString || 'N/A'}</span>
                                                                <span>• Updated: {updatedDate}</span>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            })()}
                                        </div>
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>
                    </Card>

                    {/* Tickets List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tickets in Sprint</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {sprintTickets.length === 0 ? (
                                <div className="text-sm text-gray-500">No tickets in this sprint.</div>
                            ) : (
                                <div className="space-y-4">
                                    {sprintTickets.map((ticket, idx) => {
                                        const ticketId = getTicketId(ticket)
                                        const assigneeName = getAssigneeName(ticket)
                                        const updatedDate = formatDate(ticket.updatedAt)
                                        
                                        return (
                                            <div
                                                key={ticketId || idx}
                                                className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold text-gray-800">{ticket.title || 'Untitled Ticket'}</h3>
                                                    {ticket.statusInString && (
                                                        <span
                                                            className="px-2 py-0.5 rounded-md text-xs font-medium text-white"
                                                            style={{ background: getStatusColor(ticket.statusInString) }}
                                                        >
                                                            {ticket.statusInString}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge className="mt-1">{ticket.typeName}</Badge>
                                                    {ticket.priorityInString === "High" ? (
                                                        <Badge className="mt-1" variant="destructive">
                                                            {ticket.priorityInString}
                                                        </Badge>
                                                    ) : ticket.priorityInString === "Medium" ? (
                                                        <Badge className="bg-amber-400 text-white mt-1">
                                                            {ticket.priorityInString}
                                                        </Badge>
                                                    ) : ticket.priorityInString ? (
                                                        <Badge className="mt-1" variant="ghost">
                                                            {ticket.priorityInString}
                                                        </Badge>
                                                    ) : null}
                                                </div>

                                                <p className="mt-2 text-sm text-gray-600 break-words line-clamp-2">
                                                    {ticket.description || 'No description.'}
                                                </p>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                                                        <span>Assignee: {assigneeName}</span>
                                                        <span>• Updated: {updatedDate}</span>
                                                    </div>

                                                    <div className="flex justify-end mt-4">
                                                        <Button 
                                                            variant="primary" 
                                                            className="bg-black text-white w-20" 
                                                            size="sm" 
                                                            onClick={() => handleViewTicket(ticket.ticketGuid)}
                                                        >
                                                            View
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-base font-medium">Overall Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">
                                    {sprintBreakdown?.totalTickets > 0 
                                        ? Math.round((sprintBreakdown.completedTickets / sprintBreakdown.totalTickets) * 100)
                                        : 0}%
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-base font-medium">Total Tickets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{sprintBreakdown?.totalTickets || 0}</div>
                                <p className="text-sm text-gray-500">
                                    {sprintBreakdown?.completedTickets || 0} completed, {sprintBreakdown?.pendingTickets || 0} pending
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-base font-medium">Sprint Velocity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{sprintBreakdown?.sprintVelocity || 0}</div>
                                <p className="text-sm text-gray-500">Story points per day</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-base font-medium">Days Remaining</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`text-3xl font-bold ${daysRemaining === 0 ? "text-red-600" : "text-blue-600"}`}
                                >
                                    {daysRemaining}
                                </div>
                                <p className="text-sm text-gray-500">
                                    {daysRemaining === 0
                                        ? "Sprint ends today"
                                        : `${daysRemaining} days left`}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* BUG FIX: chart was imported and progressChartData was computed but JSX was missing entirely */}
                    {progressChartData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Sprint Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={progressChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="completed" stroke="#10b981" dot={false} name="Completed" />
                                        <Line type="monotone" dataKey="pending" stroke="#ef4444" dot={false} name="Pending" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}

                    {/* Sprint Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sprint Activity</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {previewActivities.length === 0 ? (
                                <div className="text-sm text-gray-500">No recent activities.</div>  
                            ) : (
                                <div className="space-y-3">
                                    {previewActivities.map((activity, idx) => {
                                        const activityDate = formatDate(activity.date)
                                        return (
                                            <div key={idx} className="text-sm text-gray-700">
                                                <p>{activity.description || 'No description'}</p>
                                                <span className="text-xs text-gray-400">• {activityDate}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                            {hasMoreActivities && (
                                <div className="flex justify-center mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate(`/sprints/${sprintGuid}/activities`)}
                                    >
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