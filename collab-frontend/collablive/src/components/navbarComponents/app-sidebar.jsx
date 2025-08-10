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
import { AudioWaveform, Command, Frame, GalleryVerticalEnd, Map, PieChart } from "lucide-react"
import { NavProjects } from "./nav-projects"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  workspaces: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconLayoutDashboard,
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: IconNotebook,
    },
    {
      title:"Sprints",
      url:"/sprints",
      icon:IconBox
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: IconChartBar,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: IconPresentation,
    },
    {
      title:"Report",
      url:"/report",
      icon:IconFileDescription
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
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
  
  
}

export function AppSidebar({
  ...props
}) {
  
  const [projects,setProjects]= React.useState([]);
  const [workspaces,setWorkspaces] = React.useState([]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <WorkspaceSwitcher workspaces={data.workspaces}/>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects}/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
