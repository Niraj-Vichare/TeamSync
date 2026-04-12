import {
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/services/userNotification";
import { ScrollArea } from "../ui/scroll-area";

function formatNotificationTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return isNaN(date.getTime()) ? "" : date.toLocaleString();
}

export function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const { logout } = useAuth();
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    loadMore,
    hasMore,
    loading,
    refresh,
  } = useNotifications();

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsLoading(false);
      setLogoutOpen(false);
    }
  };

  const openNotifications = async () => {
    setNotificationsOpen(true);
    await refresh();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user?.avatar} alt={user?.displayName} />
                <AvatarFallback className="rounded-lg">
                  {user?.displayName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.displayName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email}
                </span>
              </div>

              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.avatar} alt={user?.displayName} />
                  <AvatarFallback className="rounded-lg">
                    {user?.displayName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.displayName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => navigate("/settings")}>
                <IconUserCircle />
                Account
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={openNotifications}>
                <IconNotification className="h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-auto min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onSelect={() => setLogoutOpen(true)}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllRead}>
                    Mark all read
                  </Button>
                )}
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-2">
                {loading ? (
                  <div className="text-sm text-muted-foreground text-center py-6">
                    Loading...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-6">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className="w-full text-left rounded-lg border p-3 hover:bg-muted transition"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{n.title}</div>
                          <div className="text-sm text-muted-foreground break-words">
                            {n.body}
                          </div>
                        </div>

                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                        )}
                      </div>

                      {n.createdAt && (
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>

            <DialogFooter className="flex items-center justify-between sm:justify-between">
              <div className="text-sm text-muted-foreground">
                {unreadCount} unread
              </div>

              <Button
                variant="secondary"
                onClick={loadMore}
                disabled={!hasMore || loading}
              >
                {hasMore ? "Load more" : "No more notifications"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Logout Confirmation</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to log out?</p>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setLogoutOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? "Logging out..." : "Log out"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}