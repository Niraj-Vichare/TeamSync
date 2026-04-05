import * as React from "react"
import {
  IconBox,
  IconChartBar,
  IconFileDescription,
  IconLayoutDashboard,
  IconNotebook,
  IconPresentation,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"
import { NavMain } from "@/components/navbarComponents/nav-main"
import { NavUser } from "@/components/navbarComponents/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { WorkspaceSwitcher } from "./workspace-switcher"
import { AudioWaveform, Command, Frame, GalleryVerticalEnd, Map, MedalIcon, PieChart } from "lucide-react"
import { NavProjects } from "./nav-projects"
import { useAuth } from "@/context/AuthContext"
import { Skeleton } from "@/components/ui/skeleton" // ✅ ShadCN Skeleton
import { useRole } from "@/hooks/useRole"

const staticData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconLayoutDashboard,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: IconPresentation,
    },
    {
      title: "Sprints",
      url: "/sprints",
      icon: IconBox,
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: IconNotebook,
    },
    // {
    //   title: "Report & Analytics",
    //   url: "/analytics",
    //   icon: IconChartBar,
    // },
    {
      "title":"Leaderboard",
      url:"/leaderboard",
      icon: MedalIcon
    },
    {
      title: "Team",
      url: "/team",
      icon: IconUsers,
    },
    {
      title: "Setting",
      url: "/settings",
      icon: IconSettings,
    },
  ],
}

export function AppSidebar(props) {
  const { currentUser, workspaces, ongoingProjects } = useAuth()
  const {userRole,roleId,canManageProjects} = useRole();
  
  const [loading, setLoading] = React.useState(true)
  const filteredNavMain = staticData.navMain.filter((item) => {
    if (item.title === "Projects" && !canManageProjects) {
      return false
    }
    return true
  })


  // ✅ Skeleton Loader UI while fetching
  // if (loading || !workspaces || !ongoingProjects) {
  //   return (
  //     <Sidebar collapsible="icon" {...props}>
  //       <SidebarHeader>
  //         <SidebarMenu>
  //           <div className="flex items-center space-x-2 p-2">
  //             <Skeleton className="h-8 w-8 rounded-full" />
  //             <Skeleton className="h-4 w-24" />
  //           </div>
  //         </SidebarMenu>
  //       </SidebarHeader>

  //       <SidebarContent>
  //         <div className="space-y-2 p-2">
  //           {Array.from({ length: 6 }).map((_, i) => (
  //             <div key={i} className="flex items-center space-x-2">
  //               <Skeleton className="h-5 w-5 rounded" />
  //               <Skeleton className="h-4 w-24" />
  //             </div>
  //           ))}
  //         </div>

  //         <div className="mt-4 space-y-2 p-2">
  //           <Skeleton className="h-4 w-20" />
  //           {Array.from({ length: 3 }).map((_, i) => (
  //             <div key={i} className="flex items-center space-x-2">
  //               <Skeleton className="h-5 w-5 rounded" />
  //               <Skeleton className="h-4 w-24" />
  //             </div>
  //           ))}
  //         </div>
  //       </SidebarContent>

  //       <SidebarFooter>
  //         <div className="flex items-center space-x-2 p-2">
  //           <Skeleton className="h-8 w-8 rounded-full" />
  //           <div className="flex flex-col space-y-1">
  //             <Skeleton className="h-3 w-20" />
  //             <Skeleton className="h-3 w-16" />
  //           </div>
  //         </div>
  //       </SidebarFooter>
  //     </Sidebar>
  //   )
  // }

  // ✅ Render actual sidebar when data is ready
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <WorkspaceSwitcher workspaces={workspaces} />
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />        
        {canManageProjects && (
          <NavProjects projects={ongoingProjects} />
        )}

      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
