
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BugIcon, CalendarIcon, CheckCircle, CircuitBoardIcon, Clock3, Clock3Icon, DatabaseIcon, GiftIcon, ListIcon, Pause, PauseIcon, Pencil, PencilIcon, PenIcon, Plus, PlusIcon, Search, SquareKanbanIcon, Tag, Trash, Trash2Icon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ca } from 'date-fns/locale';
import SprintCard from '@/components/sprintComponents/sprintCard';
import BugCard from '@/components/sprintComponents/bugCard';
import sprintService from '@/services/sprint';
import UserStoryCard from '@/components/sprintComponents/userStoryCard';
import { IconBrandStorybook } from '@tabler/icons-react';



function Sprints() {

  const [sprints, setSprints] = useState([
    {
      sprintId: "SPR-101",
      name: "Sprint Alpha",
      goal: "Complete core authentication module and integrate with OAuth providers for seamless login.",
      tagline: "The foundation of user security",
      status: "In Progress",
      assignedTo: [
        { name: "Alice", img: "https://i.pravatar.cc/40?img=1" },
        { name: "Bob", img: "https://i.pravatar.cc/40?img=2" },
      ],
      tickets: 14,
      estimation: "Sep 10, 2025 - Sep 24, 2025",
      overdue: false,
      tags: ["Backend", "Priority-High"],
    },
    {
      sprintId: "SPR-102",
      name: "Sprint Beta",
      goal: "Build dashboard analytics with charts, metrics, and filters for decision-making.",
      tagline: "Smarter insights, better decisions",
      status: "Pending",
      assignedTo: [
        { name: "Charlie", img: "https://i.pravatar.cc/40?img=3" },
        { name: "Dana", img: "https://i.pravatar.cc/40?img=4" },
      ],
      tickets: 10,
      estimation: "Sep 25, 2025 - Oct 5, 2025",
      overdue: false,
      tags: ["Frontend", "Analytics"],
    },
    {
      sprintId: "SPR-103",
      name: "Sprint Gamma",
      goal: "Optimize database queries and improve response time by caching frequently accessed records.",
      tagline: "",
      status: "Completed",
      assignedTo: [
        { name: "Eve", img: "https://i.pravatar.cc/40?img=5" },
        { name: "Frank", img: "https://i.pravatar.cc/40?img=6" },
      ],
      tickets: 7,
      estimation: "Aug 20, 2025 - Sep 1, 2025",
      overdue: true,
      tags: ["Database", "Performance"],
    },

  ]);
  const [bugs, setBugs] = useState(
    [
      {
        sprintId: null,
        title: "Login page crashes on special characters",
        description: "The login page crashes when a user enters special characters in the username field. No error message is displayed.",
        reportedBy: "Alice Johnson",
        assignedTo: "Bob Smith",
        status: "open",
        priority: "High",
        reportedOn: "2025-09-18",
        steps: [
          "Go to the login page",
          "Enter special characters in the username field",
          "Click the login button",
          "Observe the page crash"
        ],
        images: [
          "https://via.placeholder.com/150",
          "https://via.placeholder.com/150/ff0000"
        ]
      },
      {
        sprintId: "SPR-102",
        title: "Dashboard metrics not updating",
        description: "After syncing data, some metrics on the dashboard do not update, causing inconsistency in the displayed values.",
        reportedBy: "Clara Lee",
        assignedTo: "David Kim",
        status: "progress",
        priority: "Medium",
        reportedOn: "2025-09-19",
        steps: [
          "Open the dashboard",
          "Perform a data sync",
          "Check metrics values",
          "Observe which metrics do not update"
        ],
        images: [
          "https://via.placeholder.com/150/00ff00",
          "https://via.placeholder.com/150/0000ff"
        ]
      },
      {
        sprintId: "SPR-103",
        title: "Report generation throws error 500",
        description: "Generating reports sometimes results in a server error (500) due to timeout issues with large datasets.",
        reportedBy: "Bob Smith",
        assignedTo: "Alice Johnson",
        status: "closed",
        priority: "High",
        reportedOn: "2025-09-20",
        steps: [
          "Go to the reports section",
          "Select a large date range",
          "Click generate report",
          "Observe server error 500"
        ],
        images: [
          "https://via.placeholder.com/150/ff00ff"
        ]
      },
      {
        sprintId: "SPR-104",
        title: "Profile picture upload fails for large files",
        description: "Users cannot upload profile pictures larger than 2MB. No error message is shown; the image simply doesn't upload.",
        reportedBy: "David Kim",
        assignedTo: "Clara Lee",
        status: "open",
        priority: "Low",
        reportedOn: "2025-09-21",
        steps: [
          "Go to user profile page",
          "Attempt to upload a picture larger than 2MB",
          "Click save",
          "Observe the upload fails silently"
        ],
        images: [
          "https://via.placeholder.com/150/ffff00"
        ]
      }]);

  const [userStories, setUserStories] = useState([
    {
      storyId: "US-101",
      title: "User can reset password",
      description: "As a user, I want to reset my password so that I can regain access if I forget it.Hellow heiwevhkwevgwwuevgnwo wvwvogwivyowvv wgiwgvwwe",
      project: "Authentication Module",
      sprint: "5",
      status: "In Progress",
      priority: "High",
      storyPoints: 5,
      tags: ["Frontend", "Security"]
    },
    {
      storyId: "US-102",
      title: "Dashboard shows user activity",
      description: "Display a summary of the user’s activities including logins, purchases, and messages.",
      project: "Dashboard Module",
      sprint: "5",
      status: "Open",
      priority: "Medium",
      storyPoints: 3,
      tags: ["Frontend", "Backend", "API"]
    },
    {
      storyId: "US-103",
      title: "Profile picture upload",
      description: "Allow users to upload a profile picture and crop it to a square format.",
      project: "User Profile",
      sprint: null, // Backlog story
      status: "Open",
      priority: "Low",
      storyPoints: 2,
      tags: ["Frontend", "UI/UX"]
    },
    {
      storyId: "US-104",
      title: "Email notifications for comments",
      description: "Send email notifications to users when someone comments on their post.",
      project: "Notification System",
      sprint: null, // Backlog story
      status: "Open",
      priority: "Medium",
      storyPoints: 3,
      tags: ["Backend", "API"]
    },
    {
      storyId: "US-105",
      title: "Search functionality",
      description: "Implement search to allow users to search posts by keywords and hashtags.",
      project: "Search Module",
      sprint: "6",
      status: "In Progress",
      priority: "High",
      storyPoints: 8,
      tags: ["Backend", "Frontend", "Performance"]
    },
    {
      storyId: "US-106",
      title: "Dark mode toggle",
      description: "Allow users to toggle between light and dark mode in the settings.",
      project: "UI Enhancements",
      sprint: null, // Wishlist story
      status: "Open",
      priority: "Low",
      storyPoints: 1,
      tags: ["Frontend", "UI/UX"]
    },
    {
      storyId: "US-107",
      title: "Export data as CSV",
      description: "Users should be able to export their account data in CSV format for offline analysis.",
      project: "Reporting Module",
      sprint: "6",
      status: "Completed",
      priority: "High",
      storyPoints: 5,
      tags: ["Backend", "API"]
    }
  ]);
  const [backlogs, setBacklogs] = useState([]);

  const [open, setOpen] = useState(false);
  const [tabs, setTabs] = useState("sprints");

  const fetchSprint = async () => {
    try {
      const response = await sprintService.getAllSprints();
      setSprints(response.data);
    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  }

  const getuserStories = async () => {
    try {
      const response = await sprintService.getAllUserStories();
      setSprints(response.data);
    } catch (error) {

    }
  }

  const getBugs = async () => {
    try {
      const response = await sprintService.getAllBugs();
      setSprints(response.data);
    } catch (error) {

    }
  }

  const getBacklogs = async () => {
    try {
      const response = await sprintService.getAllBacklogs();
      setSprints(response.data);
    } catch (error) {
    }
  }

  useEffect(() => {
    // Fetch sprint from the API

    fetchSprint();

  }, [])

  return (
    <div className='p-3'>
      <div className='flex justify-between items-center mb-3'>
        <div>
          <h1 className='text-2xl font-bold'>Sprints</h1>
          <p className='text-sm text-muted-foreground'>Organize work into time-boxed iterations to enhance focus and deliver value incrementally.</p>
        </div>

      </div>
      <Tabs value={tabs} onValueChange={setTabs} className='w-full'>
        <TabsList className={'flex overflow-x-auto gap-2 w-full'}>
          <TabsTrigger value="sprints" className="flex items-center gap-2 whitespace-nowrap">
            <SquareKanbanIcon className='w-4 h-4' />
            <span className='text-sm'>Sprints</span>
          </TabsTrigger>
          <TabsTrigger value="bugs" className={"flex items-center gap-2 whitespace-nowrap"}>
            <BugIcon className='w-4 h-4' />
            <span className='text-sm'>Bugs</span>
          </TabsTrigger>
          <TabsTrigger value="user-story" className={"flex items-center gap-2 whitespace-nowrap"}>
            <IconBrandStorybook className='w-4 h-4' />
            <span className='text-sm'>User Stories</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sprints" className="mt-3">
          {/* Toolbar Row */}
          <div className="flex items-center justify-between pb-2">
            {/* Left: Add Button */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="text-white">
                  <PlusIcon className="w-3 h-3 mr-2" />
                  Add New Sprint
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                {/* Fixed Header */}
                <DialogHeader className="px-2 border-b-2 py-2">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                    Create Sprint
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh]">
                  {/* Form content goes here */}
                </ScrollArea>

                {/* Fixed Footer */}
                <DialogFooter className="px-6 py-4 border-t">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="text-white" onClick={() => setOpen(false)}>
                    Save Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Right: Search & Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search sprints..."
                  className="pl-8 pr-3 py-2 border rounded-md text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
              </div>
              <Select>
                <SelectTrigger className="w-20 border rou nded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sprint Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 p-6">
            {sprints.map((sprint) => (
              <SprintCard key={sprint.sprintId} sprint={sprint} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="user-story" className='mt-6'>
          {/* Toolbar Row */}
          <div className="flex items-center justify-between pb-2">
            {/* Left: Add Button */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="text-white">
                  <PlusIcon className="w-3 h-3" />
                  Add New Story
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                {/* Fixed Header */}
                <DialogHeader className="px-2 border-b-2 py-2">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                    Create User Story
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh]">
                  {/* Form content goes here */}
                </ScrollArea>

                {/* Fixed Footer */}
                <DialogFooter className="px-6 py-4 border-t">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="text-white" onClick={() => setOpen(false)}>
                    Save User Story
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Right: Search & Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search story..."
                  className="pl-8 pr-3 py-2 border rounded-md text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
              </div>
              <Select>
                <SelectTrigger className="w-30 border rou nded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="close">Close</SelectItem>
                  <SelectItem value="progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6'>
            {userStories.map((story, index) => (
              <UserStoryCard key={index} story={story} onViewDetails={(story) => {
                // Open dialog to view details  
                console.log("View details for story:", story);
              }} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="bugs" className='mt-6'>
           {/* Toolbar Row */}
          <div className="flex items-center justify-between pb-2">
            {/* Left: Add Button */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="text-white">
                  <PlusIcon className="w-3 h-3" />
                  Add New Bug
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                {/* Fixed Header */}
                <DialogHeader className="px-2 border-b-2 py-2">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                    Create User Story
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh]">
                  {/* Form content goes here */}
                </ScrollArea>

                {/* Fixed Footer */}
                <DialogFooter className="px-6 py-4 border-t">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="text-white" onClick={() => setOpen(false)}>
                    Save User Story
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Right: Search & Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search bugs..."
                  className="pl-8 pr-3 py-2 border rounded-md text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
              </div>
              <Select>
                <SelectTrigger className="w-30 border rou nded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className='grid md:grid-cols-2 lg:grid-cols-2 gap-6 p-6'>
            {bugs.map((bug, index) => (
              <BugCard key={index} bug={bug} onViewClick={(bug) => {
                // Open dialog to view / generate steps
                console.log("View / Generate Steps for bug:", bug);
              }} />
            ))}
          </div>
        </TabsContent>


      </Tabs>
      <div>

      </div>
    </div>
  )
}

export default Sprints