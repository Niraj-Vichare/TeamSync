import * as React from "react"
import { ChevronsUpDown, Loader2, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { toast } from "sonner"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { DialogFooter, DialogHeader } from "../ui/dialog"
import { Label } from "recharts"
import { Input } from "../ui/input"

export function WorkspaceSwitcher({
  workspaces
}) {
  const { isMobile } = useSidebar()
  const [workspaceName,setWorkspaceName] = React.useState('');
  const [workspaceDescription,setworkspaceDescription] = React.useState('');
  const [activeTeam, setActiveTeam] = React.useState(workspaces[0])
  const [open,setOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

  if (!activeTeam) {
    return null
  }

  const handleCreateWorkspace = async () => {
    setIsCreating(true);
    try {
      // Call your backend / perform creation logic here
      await new Promise((res) => setTimeout(res, 1500)); // simulate
      // Optionally reset fields or close the dialog
    } finally {
      setIsCreating(false);
    }
  };

  return (
     <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Workspaces
            </DropdownMenuLabel>

            {workspaces.map((workspace, index) => (
              <DropdownMenuItem
                key={workspace.name}
                onSelect={(e) => {
                  e.preventDefault(); // prevent auto-close
                  setActiveTeam(workspace);
                }}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <workspace.logo className="size-3.5 shrink-0" />
                </div>
                {workspace.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {/* Add Workspace Dialog Wrapped Outside */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()} // Prevent closing dropdown
                asChild
              >
                <div className="flex items-center gap-2 p-2 w-full cursor-pointer">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <DialogTrigger asChild>
                    <div className="text-muted-foreground font-medium">
                      Add Workspace
                    </div>
                  </DialogTrigger>
                </div>
              </DropdownMenuItem>

              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Workspace</DialogTitle>
                  <DialogDescription>
                    Workspaces help organize your teams and projects.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input
                      id="workspace-name"
                      type="text"
                      placeholder="e.g. Acme Inc"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="workspace-description">Description</Label>
                    <Input
                      id="workspace-description"
                      type="text"
                      placeholder="Optional description"
                      value={workspaceDescription}
                      onChange={(e) => setworkspaceDescription(e.target.value)}
                    />
                  </div>
                </div>

                <DialogFooter className="sm:justify-end">
                  <DialogClose asChild>
                    <Button variant="ghost" type="button">
                      Cancel
                    </Button>
                  </DialogClose>

                  <Button
                    type="button"
                    className="bg-white text-black hover:bg-gray-100"
                    onClick={handleCreateWorkspace}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Workspace"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
