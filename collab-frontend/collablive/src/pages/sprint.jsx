import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, MoveLeftIcon } from 'lucide-react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { GenericPieChart } from '@/components/chartComponents/GenericPieChart'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialogHeader } from '@/components/ui/alert-dialog'

const STATUS_COLORS = {
    'In Progress': '#3b82f6',
    Pending: '#ef4444',
    Completed: '#6b7280',
    Blocked: '#f59e0b'
}
const ticketStatusData = [
    { name: "Completed", value: 12 },
    { name: "Pending", value: 8 },
    { name: "Paused", value: 4 },
]

const summaryData = {
    overallProgress: 68,
    totalTickets: 24,
    completedTickets: 16,
    inProgressTickets: 6,
    teamVelocity: 8.5,
    daysRemaining: 0,
}

const MOCK_SPRINT = {
    sprintId: 'SP-1024',
    name: 'Sprint — Checkout & Payments Revamp',
    status: 'In Progress',
    tagline: 'Improve checkout conversion and reduce payment failures',
    startDate: '2025-09-01',
    endDate: '2025-09-14',
    goal:
        'Reduce checkout abandonment by 15% and add PCI-friendly flow for saved cards. Improve retry logic for payments.',
    tags: ['Payments', 'Critical', 'Q4'],
    estimation: '2 weeks — 40 story points',
    tickets: {
        total: 42,
        completed: 18,
        inProgress: 16,
        blocked: 3,
        pending: 5,
        list: [
            {
                id: 'TCK-9001',
                title: 'Add saved cards support',
                assignee: { name: 'Asha Patel', img: '' },
                status: 'In Progress',
                priority: 'High',
                updatedAt: '2025-09-08'
            },
            {
                id: 'TCK-9002',
                title: 'Retry failed payments',
                assignee: { name: 'Rohit Sharma', img: '' },
                status: 'Completed',
                priority: 'Medium',
                updatedAt: '2025-09-07'
            }
        ]
    },
     assignedTo: [
        { name: 'Asha Patel', img: '', role: 'Frontend Dev', position: 'Lead Engineer' },
        { name: 'Rohit Sharma', img: '', role: 'Backend Dev', position: 'Senior Engineer' },
        { name: 'Isha Mehta', img: '', role: 'QA Tester', position: 'Quality Analyst' },
        { name: 'Karan Joshi', img: '', role: 'UI Designer', position: 'Product Designer' },
        { name: 'Priya Rao', img: '', role: 'Project Manager', position: 'Manager' }
    ],
    dailyProgress: [
        { day: 'Sep 1', completed: 0, pending: 5 },
        { day: 'Sep 2', completed: 1, pending: 8 },
        { day: 'Sep 3', completed: 3, pending: 10 },
        { day: 'Sep 4', completed: 6, pending: 9 },
        { day: 'Sep 5', completed: 8, pending: 8 },
        { day: 'Sep 6', completed: 10, pending: 7 },
        { day: 'Sep 7', completed: 13, pending: 6 },
        { day: 'Sep 8', completed: 18, pending: 5 }
    ],
    dailyUpdates: [
        {
            date: '2025-09-08',
            user: { name: 'Asha Patel', img: '' },
            message: 'Completed implementation for saved cards + unit tests',
            ticketId: 'TCK-9001'
        },
        {
            date: '2025-09-07',
            user: { name: 'Rohit Sharma', img: '' },
            message: 'Fixed retry logic and added monitoring events',
            ticketId: 'TCK-9002'
        },
        {
            date: '2025-09-08',
            user: { name: 'Asha Patel', img: '' },
            message: 'Completed implementation for saved cards + unit tests',
            ticketId: 'TCK-9001'
        },
        {
            date: '2025-09-08',
            user: { name: 'Asha Patel', img: '' },
            message: 'Completed implementation for saved cards + unit tests',
            ticketId: 'TCK-9001'
        },
        {
            date: '2025-09-08',
            user: { name: 'Asha Patel', img: '' },
            message: 'Completed implementation for saved cards + unit tests',
            ticketId: 'TCK-9001'
        },
        {
            date: '2025-09-08',
            user: { name: 'Asha Patel', img: '' },
            message: 'Completed implementation for saved cards + unit tests',
            ticketId: 'TCK-9001'
        }
    ]
}

export default function Sprint({ sprintId, sprint: sprintProp }) {
    const [sprint, setSprint] = useState(sprintProp || MOCK_SPRINT)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [openMemberModal, setOpenMemberModal] = useState(false)
    const [selectedMember, setSelectedMember] = useState(null)

  // Function to filter tickets per member
  const getMemberTickets = (memberName) => {
    return safe.tickets.list.filter(
      (ticket) => ticket.assignee?.name === memberName
    )
  }
    function colorForTicketStatus(name) {
        switch (name) {
            case "Completed":
                return "#34d399" // green
            case "Pending":
                return "#fbbf24" // yellow
            case "Paused":
                return "#f87171" // red
            default:
                return "#9ca3af" // gray
        }
    }

    useEffect(() => {
        let mounted = true
        async function load() {
            if (sprintProp) return
            if (!sprintId) return
            setLoading(true)
            try {
                // replace with real fetch
                // const res = await fetch(`/api/sprints/${sprintId}`)
                // const data = await res.json()
                // if (mounted) setSprint(data)
            } catch (e) {
                if (mounted) setSprint(prev => prev || MOCK_SPRINT)
            } finally {
                if (mounted) setLoading(false)
            }
        }
        load()
        return () => {
            mounted = false
        }
    }, [sprintId, sprintProp])

    const safe = useMemo(() => ({
        tags: sprint?.tags || [],
        assignedTo: sprint?.assignedTo || [],
        tickets: sprint?.tickets || { total: 0, completed: 0, inProgress: 0, blocked: 0, pending: 0, list: [] },
        dailyProgress: sprint?.dailyProgress || [],
        dailyUpdates: sprint?.dailyUpdates || []
    }), [sprint])

    const statusBreakdown = useMemo(() => [
        { name: 'Completed', value: safe.tickets.completed },
        { name: 'In Progress', value: safe.tickets.inProgress },
        { name: 'Blocked', value: safe.tickets.blocked },
        { name: 'Pending', value: safe.tickets.pending }
    ], [safe])

    const progressLineData = safe.dailyProgress
    const totalTeam = safe.assignedTo.length
    const updatesToShow = safe.dailyUpdates.slice(0, 5)
    const hasMore = safe.dailyUpdates.length > 5

    function getStatusColor(status) {
        return STATUS_COLORS[status] || '#6b7280'
    }

    function colorForStatusName(name) {
        return STATUS_COLORS[name] || '#9CA3AF'
    }

    function handleViewTicket(ticketId) {
        // Navigate to the ticket detail page
    }

    if (loading) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="text-sm text-gray-500">Loading sprint...</div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold">{sprint?.name}</h1>
                    <p className="text-sm text-gray-500 mt-1">{sprint?.tagline}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{sprint?.startDate} — {sprint?.endDate}</span>
                        <span className="px-2 py-0.5 rounded-md text-white text-xs" style={{ background: getStatusColor(sprint?.status) }}>{sprint?.status}</span>
                        <span>• Estimation: {sprint?.estimation}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => window.history.back()}>
                        <MoveLeftIcon className="w-4 h-4" />
                        Back to Sprints
                    </Button>
                    <Button className={'text-white bg-black border-1'}>Pause Sprint</Button>
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
                            <p className="text-sm text-gray-600">{sprint?.goal}</p>
                            <div className="flex flex-wrap gap-2">
                                {safe.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="outline">{tag}</Badge>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <span>Total Tickets: {safe.tickets.total}</span>
                                <span>• Assigned To: {totalTeam} {totalTeam === 1 ? 'member' : 'members'}</span>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Progress Chart */}
                    <Card className={'bg-yellow-400'}>
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
                    {/* Tickets List */}
                    <Card className="bg-gray-400 text-white">
                        <CardHeader>
                            <CardTitle>Tickets in Sprint</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {safe.tickets.list.length === 0 ? (
                                <div className="text-sm text-gray-200">No tickets in this sprint.</div>
                            ) : (
                                <div className="space-y-4 z-10">
                                    {safe.tickets.list.map((ticket, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
                                        >
                                            {/* Title & Status */}
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-800">{ticket.title}</h3>
                                                <span
                                                    className="px-2 py-0.5 rounded-md text-xs font-medium text-white"
                                                    style={{ background: getStatusColor(ticket.status) }}
                                                >
                                                    {ticket.status}
                                                </span>
                                            </div>
                                            {/* Badges */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge className="mt-1">{ticket.id}</Badge>
                                                {ticket.priority === "High" ? (
                                                    <Badge className="mt-1" variant="destructive">
                                                        {ticket.priority}
                                                    </Badge>
                                                ) : ticket.priority === "Medium" ? (
                                                    <Badge className="bg-amber-400 text-white mt-1">
                                                        {ticket.priority}
                                                    </Badge>
                                                ) : (
                                                    <Badge className="mt-1" variant="ghost">
                                                        {ticket.priority}
                                                    </Badge>
                                                )}
                                            </div>
                                            {/* Description */}
                                            <p className="mt-2 text-sm text-gray-600 break-words line-clamp-2">
                                                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sint architecto exercitationem voluptatem placeat numquam id hic alias est quas ipsam? Placeat, laudantium autem! Quis hic veritatis cupiditate fuga dignissimos natus.
                                            </p>
                                            <div className="flex justify-between items-center">
                                                {/* Meta info */}
                                                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                                                    <span>Assignee: {ticket.assignee.name}</span>
                                                    <span>• Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                                                </div>

                                                {/* View button */}
                                                <div className="flex justify-end mt-4">
                                                    <Button variant={'primary'} className={'bg-black w-20'} size="sm" onClick={()=>handleViewTicket(ticket.id)}>
                                                        View
                                                    </Button>
                                                </div>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>



                    {/* Team Members */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                        </CardHeader>

                        <CardContent>
                            {safe.assignedTo.length === 0 ? (
                                <div className="text-sm text-gray-500">No team members assigned.</div>
                            ) : (
                                
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {safe.assignedTo.map((member, idx) => (
                                        

                                        <div
                                            key={idx}
                                            className="p-3 border rounded-lg cursor-pointer transition hover:shadow-md flex flex-col items-center"
                                            onClick={() => {
                                                setSelectedMember(member)
                                                setOpenMemberModal(true)
                                            }}
                                        >
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={member.img} alt={member.name} />
                                                <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                    {member.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="mt-2">
                                                <p className="text-sm font-medium">{member.name}</p>
                                                <p className="text-xs text-gray-500">{member.position}</p>
                                                <p className="text-xs text-gray-400">{member.role}</p>
                                            </div>
                                        </div>
                                        
                                        
                                    ))}
                                </div>
                            )}
                        </CardContent>

                        {/* Dialog with member details */}
                        <Dialog open={openMemberModal} onOpenChange={setOpenMemberModal}>
                            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                                {selectedMember && (
                                    <>
                                        <DialogHeader>
                                            <DialogTitle>{selectedMember.name} - Sprint Tasks</DialogTitle>
                                        </DialogHeader>

                                        {/* Tickets List */}
                                        <div className="space-y-4 mt-4">
                                            {getMemberTickets(selectedMember.name).length === 0 ? (
                                                <p className="text-sm text-gray-500">No tasks assigned in this sprint.</p>
                                            ) : (
                                                getMemberTickets(selectedMember.name).map((ticket, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-3 border rounded-md bg-white shadow-sm"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-medium text-gray-800">{ticket.title}</h4>
                                                            <span
                                                                className="px-2 py-0.5 text-xs rounded-md text-white"
                                                                style={{ background: getStatusColor(ticket.status) }}
                                                            >
                                                                {ticket.status}
                                                            </span>
                                                        </div>

                                                        <p className="mt-1 text-xs text-gray-600 break-words line-clamp-2">
                                                            {ticket.description}
                                                        </p>

                                                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                            <span>Priority: {ticket.priority}</span>
                                                            <span>• Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>
                    </Card>

                </div>
                {/* Right Column */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Overall Progress */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-base font-medium">Overall Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">{summaryData.overallProgress}%</div>
                            </CardContent>
                        </Card>

                        {/* Total Tickets */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-base font-medium">Total Tickets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{summaryData.totalTickets}</div>
                                <p className="text-sm text-gray-500">
                                    {summaryData.completedTickets} completed, {summaryData.inProgressTickets} in progress
                                </p>
                            </CardContent>
                        </Card>

                        {/* Team Velocity */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-base font-medium">Team Velocity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{summaryData.teamVelocity}</div>
                                <p className="text-sm text-gray-500">Story points per day</p>
                            </CardContent>
                        </Card>

                        {/* Days Remaining */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-base font-medium">Days Remaining</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`text-3xl font-bold ${summaryData.daysRemaining === 0 ? "text-red-600" : "text-blue-600"
                                        }`}
                                >
                                    {summaryData.daysRemaining}
                                </div>
                                <p className="text-sm text-gray-500">
                                    {summaryData.daysRemaining === 0
                                        ? "Sprint ends today"
                                        : `${summaryData.daysRemaining} days left`}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Status Breakdown */}
                    <Card className={'bg-blue-500'}>
                        <CardHeader>
                            <CardTitle>Sprint Status Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {statusBreakdown.every(item => item.value === 0) ? (
                                <div className="w-full h-48 flex items-center justify-center text-sm text-gray-500">
                                    No ticket status data available.
                                </div>
                            ) : (
                                <GenericPieChart
                                    data={ticketStatusData}
                                    dataKey="value"
                                    nameKey="name"
                                    title="Ticket Status Breakdown"
                                    description="Current sprint ticket statuses"
                                    colorForItem={colorForTicketStatus}
                                    footerText="Ticket status distribution"
                                    footerTrendingText="Status trend up by 2.5% this sprint"
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Sprint Activity  Feed */}
                    <Card className={''}>
                        <CardHeader>
                            <CardTitle>Sprint Activity</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {safe.dailyUpdates.length === 0 ? (
                                <div className="text-sm text-gray-500">No activity yet.</div>
                            ) : (
                                <>
                                    {/* Show only 5 updates */}
                                    <div className="space-y-6">
                                        {updatesToShow.map((update, idx) => (
                                            <div key={idx} className="flex items-start gap-3 relative">
                                                {/* Avatar */}
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={update.user.img} alt={update.user?.name} />
                                                    <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                        {update.user.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                {/* Content */}
                                                <div className="flex-1">
                                                    <p className="text-sm">
                                                        <span className="font-medium">{update.user?.name}</span>{": "}
                                                        <span className="break-words">{update.message}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(update.date).toLocaleString()} • Ticket{" "}
                                                        <span className="font-medium text-purple-600">{update.ticketId}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* View All Button */}
                                    {hasMore && (
                                        <div className="flex justify-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setOpen(true)}
                                            >
                                                View All
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>

                        {/* Dialog with all updates */}
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>All Sprint Activity</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-6 mt-4">
                                    {safe.dailyUpdates.map((update, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={update.user.img} alt={update.user?.name} />
                                                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                    {update.user.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1">
                                                <p className="text-sm">
                                                    <span className="font-medium">{update.user?.name}</span>{": "}
                                                    <span className="break-words">{update.message}</span>
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(update.date).toLocaleString()} • Ticket{" "}
                                                    <span className="font-medium text-purple-600">{update.ticketId}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </Card>


                </div>
            </div>
        </div>
    )
}


