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

// ============================================================================
// CONSTANTS
// ============================================================================
const STATUS_COLORS = {
    'InProgress': '#3b82f6',
    'Pending': '#ef4444',
    'Completed': '#6b7280',
    'Blocked': '#f59e0b'
}

const TICKET_STATUS_COLORS = {
    'Completed': '#34d399',
    'Pending': '#fbbf24',
    'Paused': '#f87171',
    'default': '#9ca3af'
}

const DEFAULT_PAGE_SIZE = 10
const PREVIEW_ACTIVITIES_COUNT = 5

// Static demo data (kept for backwards compatibility)
const DEMO_SUMMARY_DATA = {
    overallProgress: 68,
    totalTickets: 24,
    completedTickets: 16,
    inProgressTickets: 6,
    teamVelocity: 8.5,
    daysRemaining: 0,
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets status color with fallback
 * @param {string} status - The status string
 * @returns {string} Hex color code
 */
const getStatusColor = (status) => {
    if (!status) {
        console.warn('[getStatusColor] No status provided, using default color')
        return '#6b7280'
    }
    return STATUS_COLORS[status] || '#6b7280'
}

/**
 * Gets ticket status color with fallback
 * @param {string} name - The ticket status name
 * @returns {string} Hex color code
 */
const getTicketStatusColor = (name) => {
    if (!name) {
        console.warn('[getTicketStatusColor] No status name provided')
        return TICKET_STATUS_COLORS.default
    }
    return TICKET_STATUS_COLORS[name] || TICKET_STATUS_COLORS.default
}

/**
 * Safely formats a date string
 * @param {string|Date} dateValue - Date to format
 * @returns {string} Formatted date or fallback
 */
const formatDate = (dateValue) => {
    if (!dateValue) return '—'
    
    try {
        return new Date(dateValue).toLocaleDateString()
    } catch (error) {
        console.error('[formatDate] Invalid date:', dateValue, error)
        return '—'
    }
}

/**
 * Safely formats a date-time string
 * @param {string|Date} dateValue - Date to format
 * @returns {string} Formatted date-time or fallback
 */
const formatDateTime = (dateValue) => {
    if (!dateValue) return '—'
    
    try {
        return new Date(dateValue).toLocaleString()
    } catch (error) {
        console.error('[formatDateTime] Invalid date:', dateValue, error)
        return '—'
    }
}

/**
 * Gets assignee name with multiple fallbacks
 * @param {Object} ticket - Ticket object
 * @returns {string} Assignee name or 'Unassigned'
 */
const getAssigneeName = (ticket) => {
    if (!ticket) return 'Unassigned'
    return ticket.assignee?.name || ticket.assignedToName || ticket.assignedToName || 'Unassigned'
}

/**
 * Gets ticket ID with fallback
 * @param {Object} ticket - Ticket object
 * @returns {string|number} Ticket ID
 */
const getTicketId = (ticket) => {
    if (!ticket) return 'N/A'
    return ticket.id || ticket.ticketId || 'N/A'
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
    
    const sprintGuid = params.sprintId
    const workspaceGuid = getCurrentWorkspaceId()
    
    // State
    const [sprint, setSprint] = useState(null)
    const [sprintTeam, setSprintTeam] = useState([])
    const [sprintTickets, setSprintTickets] = useState({ list: [], total: 0 })
    const [sprintActivities, setSprintActivities] = useState([])
    const [sprintBreakdown,setSprintBreakdown] = useState(null);
    const [sprintProgress,setSprintProgress] = useState(null);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize] = useState(DEFAULT_PAGE_SIZE)
    
    // Modal states
    const [openActivityModal, setOpenActivityModal] = useState(false)
    const [openMemberModal, setOpenMemberModal] = useState(false)
    const [selectedMember, setSelectedMember] = useState(null)
    
    // -------------------------
    // VALIDATION
    // -------------------------
    useEffect(() => {
        console.log('[Sprint] Validating required props')
        
        if (!sprintGuid) {
            const errorMsg = 'Sprint ID is required but not provided'
            console.error('[Sprint]', errorMsg)
            setError(errorMsg)
            return
        }
        
        if (!workspaceGuid) {
            const errorMsg = 'Workspace ID is required but not found'
            console.error('[Sprint]', errorMsg)
            setError(errorMsg)
            return
        }
        
        console.log('[Sprint] Validation passed', { workspaceGuid, sprintGuid })
    }, [sprintGuid, workspaceGuid])
    
    // -------------------------
    // API CALLS (with proper error handling)
    // -------------------------
    
    /**
     * Fetches sprint progress data
     */
    const fetchSprintProgress = useCallback(async (sprintId) => {
        console.log('[fetchSprintProgress] Starting...', { sprintId })
        
        if (!sprintId) {
            console.error('[fetchSprintProgress] Missing required parameters')
            throw new Error('Workspace ID and Sprint ID are required')
        }
        
        try {
            const response = await sprintService.getSprintProgress(sprintId)
            console.log('[fetchSprintProgress] Success:', response?.data)
            
            if (!response?.data) {
                console.warn('[fetchSprintProgress] No data in response')
                return null
            }
            console.log(response.data,"Progress");
            setSprintProgress(response.data)
            return response.data
        } catch (error) {
            console.error('[fetchSprintProgress] Error:', error.message, error)
            throw error
        }
    }, [])

    /**
     * Fetches sprint data from API
     */
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
    
    /**
     * Fetches sprint team members
     */
    const fetchSprintTeam = useCallback(async (sprintId) => {
        console.log('[fetchSprintTeam] Starting...', { sprintId })
        
        if (!sprintId) {
            console.error('[fetchSprintTeam] Missing sprint ID')
            throw new Error('Sprint ID is required')
        }
        
        try {
            const response = await sprintService.getSprintTeam(sprintId)
            console.log('[fetchSprintTeam] Success:', response?.data?.length,response.data ,'members')
            
            setSprintTeam(response.data)
            console.log(sprintTeam,"SERPPRPRPPRPRPRPdvbejvevjevbeh");
            return response.data;
        } catch (error) {
            console.error('[fetchSprintTeam] Error:', error.message, error)
            setSprintTeam([])
            throw error
        }
    }, [])
    
    /**
     * Fetches sprint tickets
     */
    const fetchSprintTickets = useCallback(async (sprintId) => {
        if (!sprintId) {
            console.error('[fetchSprintTickets] Missing sprint ID')
            throw new Error('Sprint ID is required')
        }
        
        try {
            const response = await sprintService.getSprintTickets(sprintId)
            console.log('[fetchSprintTickets] Success:', response?.data)
            
            const ticketsData = response?.data
            
            
            setSprintTickets(ticketsData)
            return ticketsData
        } catch (error) {
            console.error('[fetchSprintTickets] Error:', error.message, error)
            setSprintTickets({ list: [], total: 0 })
            throw error
        }
    }, [])

    /**
     * Fetch the sprint breakdown
     */
    const fetchBreakdown = useCallback(async (sprintId)=>{
        if (!sprintId) {
            console.error('[fetchBreakdown] Missing sprint ID')
            throw new Error('Sprint ID is required')
        }
        
        try {
            const response = await sprintService.getSprintBreakdown(sprintId)
            console.log('[fetchBreakdown] Success:', response?.data)
            
            const sprintBreakdown = response?.data
            setSprintBreakdown(sprintBreakdown);
            console.log(sprintBreakdown);
            return sprintBreakdown;
        } catch (error) {
            console.error('[fetchSprintTickets] Error:', error.message, error)
            setSprintBreakdown(null);
            throw error
        }

    },[])
    
    /**
     * Fetches sprint activities with pagination
     */
    const fetchSprintActivities = useCallback(async (sprintId, page, size) => {
        console.log('[fetchSprintActivities] Starting...', { sprintId, page, size })
        
        if (!sprintId) {
            console.error('[fetchSprintActivities] Missing sprint ID')
            throw new Error('Sprint ID is required')
        }
        
        try {
            const response = await sprintService.getSprintActivities(sprintId, page, size)
            console.log('[fetchSprintActivities] Success:', response?.data?.length, 'activities')
            
            const activitiesData = Array.isArray(response?.data) ? response.data : []
            setSprintActivities(activitiesData)
            return activitiesData
        } catch (error) {
            console.error('[fetchSprintActivities] Error:', error.message, error)
            setSprintActivities([])
            throw error
        }
    }, [])
    
    /**
     * Main data loading function
     */
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
            
            // Log results
            results.forEach((result, index) => {
                const names = ['Sprint Data', 'Team', 'Tickets', 'Activities']
                if (result.status === 'fulfilled') {
                    console.log(`[loadSprintData] ${names[index]} loaded successfully`)
                } else {
                    console.error(`[loadSprintData] ${names[index]} failed:`, result.reason)
                }
            })
            
            // Check if any critical data failed
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
    }, [workspaceGuid, sprintGuid, pageNumber, pageSize, fetchSprintData, fetchSprintTeam, fetchSprintTickets, fetchSprintActivities])
    
    // -------------------------
    // EFFECTS
    // -------------------------
    useEffect(() => {
        console.log('[Sprint] Initial data load triggered')
        loadSprintData()
    }, [loadSprintData])
    
    // -------------------------
    // COMPUTED VALUES (Memoized for performance)
    // -------------------------
    const previewActivities = useMemo(() => {
        const preview = sprintActivities.slice(0, PREVIEW_ACTIVITIES_COUNT)
        console.log('[previewActivities] Computed:', preview.length, 'items')
        return preview
    }, [sprintActivities])
    
    const hasMoreActivities = useMemo(() => {
        const hasMore = sprintActivities.length > PREVIEW_ACTIVITIES_COUNT
        console.log('[hasMoreActivities]', hasMore)
        return hasMore
    }, [sprintActivities])
    
    const progressLineData = useMemo(() => {
        const data = sprint?.dailyProgress || []
        console.log('[progressLineData] Computed:', data.length, 'data points')
        return data
    }, [sprint?.dailyProgress])
    
    const totalTeamMembers = useMemo(() => {
        console.log("!!!!!SPRINT TEAM!!!",sprintTeam)
        const count = sprintTeam?.length
        console.log('[totalTeamMembers]', count)
        return count
    }, [sprintTeam])
    
    // -------------------------
    // EVENT HANDLERS
    // -------------------------
    
    /**
     * Filters tickets assigned to a specific member
     */
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
    
    /**
     * Handles ticket navigation
     */
    const handleViewTicket = useCallback((ticketId) => {
        console.log('[handleViewTicket] Navigating to ticket:', ticketId)
        
        if (!ticketId) {
            console.warn('[handleViewTicket] No ticket ID provided')
            return
        }
        
        navigate(`/tickets/${ticketId}`)
    }, [navigate])
    
    /**
     * Handles member card click
     */
    const handleMemberClick = useCallback((member) => {
        console.log('[handleMemberClick] Member clicked:', member?.name)
        
        if (!member) {
            console.warn('[handleMemberClick] No member data provided')
            return
        }
        
        setSelectedMember(member)
        setOpenMemberModal(true)
    }, [])
    
    /**
     * Handles back navigation
     */
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
                    <Button className="text-white bg-black border-1">Pause Sprint</Button>
                    <Button variant="destructive">Close Sprint</Button>
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
                                <span>• Assigned To: {sprintTeam.name} team</span>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Team Members */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                        </CardHeader>

                        <CardContent>
                            {sprintTeam?.members.length === 0 ? (
                                <div className="text-sm text-gray-500">No team members assigned.</div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {sprintTeam?.members.map((member, idx) => (
                                        <div
                                            key={member.guid || idx}
                                            className="p-3 border rounded-lg cursor-pointer transition hover:shadow-md flex flex-col items-center"
                                            onClick={() => handleMemberClick(member)}
                                        >
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={member.profile?.profileImageUrl} alt={member?.profile.displayName || 'User'} />
                                                <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                    {member.profile?.displayName ? member.profile?.displayName.charAt(0).toUpperCase() : 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="mt-2 text-center">
                                                <p className="text-sm font-medium">{member.profile?.displayName || 'Unknown'}</p>
                                                {member.departmentDto?.departmentName && <p className="text-xs text-gray-500">{member.departmentDto?.departmentName}</p>}
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
                                            <DialogTitle>{selectedMember.displayName || 'Member'} - Sprint Tasks</DialogTitle>
                                        </DialogHeader>

                                        <div className="space-y-4 mt-4">
                                            {(() => {
                                                const memberTickets = getMemberTickets(selectedMember.displayName)
                                                
                                                if (memberTickets.length === 0) {
                                                    return <p className="text-sm text-gray-500">No tasks assigned in this sprint.</p>
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
                                                                {ticket.status && (
                                                                    <span
                                                                        className="px-2 py-0.5 text-xs rounded-md text-white"
                                                                        style={{ background: getStatusColor(ticket.status) }}
                                                                    >
                                                                        {ticket.status}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="mt-1 text-xs text-gray-600 break-words line-clamp-2">
                                                                {ticket.description || 'No description'}
                                                            </p>

                                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                                <span>Priority: {ticket.priority || 'N/A'}</span>
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
                    <Card className="bg-gray-400 text-white">
                        <CardHeader>
                            <CardTitle>Tickets in Sprint</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {sprintTickets.length === 0 ? (
                                <div className="text-sm text-gray-200">No tickets in this sprint.</div>
                            ) : (
                                <div className="space-y-4 z-10">
                                    {sprintTickets.map((ticket, idx) => {
                                        const ticketId = getTicketId(ticket)
                                        const assigneeName = getAssigneeName(ticket)
                                        const updatedDate = formatDate(ticket.updatedAt || ticket.UpdatedAt)
                                        
                                        return (
                                            <div
                                                key={ticketId || idx}
                                                className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold text-gray-800">{ticket.title || 'Untitled Ticket'}</h3>
                                                    {ticket.status && (
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
                                                    {ticket.description || ticket.Description || 'No description.'}
                                                </p>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                                                        <span>Assignee: {assigneeName}</span>
                                                        <span>• Updated: {updatedDate}</span>
                                                    </div>

                                                    <div className="flex justify-end mt-4">
                                                        <Button 
                                                            variant="primary" 
                                                            className="bg-black w-20" 
                                                            size="sm" 
                                                            onClick={() => handleViewTicket(ticketId)}
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
                                    {DEMO_SUMMARY_DATA.overallProgress}%
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-base font-medium">Total Tickets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{DEMO_SUMMARY_DATA.totalTickets}</div>
                                <p className="text-sm text-gray-500">
                                    {DEMO_SUMMARY_DATA.completedTickets} completed, {DEMO_SUMMARY_DATA.inProgressTickets} in progress
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-base font-medium">Team Velocity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{DEMO_SUMMARY_DATA.teamVelocity}</div>
                                <p className="text-sm text-gray-500">Story points per day</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-base font-medium">Days Remaining</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`text-3xl font-bold ${DEMO_SUMMARY_DATA.daysRemaining === 0 ? "text-red-600" : "text-blue-600"}`}
                                >
                                    {DEMO_SUMMARY_DATA.daysRemaining}
                                </div>
                                <p className="text-sm text-gray-500">
                                    {DEMO_SUMMARY_DATA.daysRemaining === 0
                                        ? "Sprint ends today"
                                        : `${DEMO_SUMMARY_DATA.daysRemaining} days left`}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sprint Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sprint Activity</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {sprintActivities.length === 0 ? (
                                <div className="text-sm text-gray-500">No activity yet.</div>
                            ) : (
                                <>
                                    <div className="space-y-6">
                                        {previewActivities.map((update, idx) => {
                                            const userName = update.user?.name || 'Unknown User'
                                            const userInitial = userName.charAt(0).toUpperCase()
                                            const activityDate = formatDateTime(update.date)
                                            
                                            return (
                                                <div key={update.id || idx} className="flex items-start gap-3 relative">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage src={update.user?.img} alt={userName} />
                                                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                            {userInitial}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="flex-1">
                                                        <p className="text-sm">
                                                            <span className="font-medium">{userName}</span>{": "}
                                                            <span className="break-words">{update.message || 'No message'}</span>
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {activityDate}
                                                            {update.ticketId && (
                                                                <>
                                                                    {" • Ticket "}
                                                                    <span className="font-medium text-purple-600">{update.ticketId}</span>
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {hasMoreActivities && (
                                        <div className="flex justify-center">
                                            <Button variant="ghost" size="sm" onClick={() => setOpenActivityModal(true)}>
                                                View All
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>

                        {/* All Activities Modal */}
                        <Dialog open={openActivityModal} onOpenChange={setOpenActivityModal}>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>All Sprint Activity</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-6 mt-4">
                                    {sprintActivities.map((update, idx) => {
                                        const userName = update.user?.name || 'Unknown User'
                                        const userInitial = userName.charAt(0).toUpperCase()
                                        const activityDate = formatDateTime(update.date)
                                        
                                        return (
                                            <div key={update.id || idx} className="flex items-start gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={update.user?.img} alt={userName} />
                                                    <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                        {userInitial}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1">
                                                    <p className="text-sm">
                                                        <span className="font-medium">{userName}</span>{": "}
                                                        <span className="break-words">{update.message || 'No message'}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {activityDate}
                                                        {update.ticketId && (
                                                            <>
                                                                {" • Ticket "}
                                                                <span className="font-medium text-purple-600">{update.ticketId}</span>
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </Card>
                </div>
            </div>
            <div className='grid grid-cols-12 gap-6'>
                <div className="col-span-12 lg:col-span-12">
                    {/* Progress Chart */}
                    <Card className="bg-yellow-400">
                        <CardHeader>
                            <CardTitle>Sprint Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {progressLineData.length === 0 ? (
                                <div className="w-full h-48 flex items-center justify-center text-sm text-gray-500">
                                    No progress data available.
                                </div>
                            ) : (
                                <Card>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={progressLineData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                            <XAxis dataKey="day" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completed" />
                                            <Line type="monotone" dataKey="pending" stroke="#ef4444" strokeWidth={2} name="Pending" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Card>
                            )}
                        </CardContent>
                    </Card>
                    
                </div>


            </div>
        </div>
    )
}




