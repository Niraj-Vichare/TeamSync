import { Outlet, useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../../components/ui/breadcrumb"; // adjust based on where your components live
import { AppSidebar } from "../navbarComponents/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { Separator } from "@radix-ui/react-dropdown-menu";
import React from "react";

const SidebarLayout = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  return (
    <SidebarProvider>
      <div className="flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />

                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink asChild>
                        <Link to="/dashboard">Home</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>

                    {pathnames.map((segment, index) => {
                      const to = "/" + pathnames.slice(0, index + 1).join("/");
                      const isLast = index === pathnames.length - 1;

                      return (
                        <React.Fragment key={to}>
                          <BreadcrumbSeparator className="hidden md:block" />
                          <BreadcrumbItem>
                            {isLast ? (
                              <BreadcrumbPage className="capitalize">
                                {decodeURIComponent(segment.replace(/-/g, " "))}
                              </BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild>
                                <Link to={to} className="capitalize">
                                  {decodeURIComponent(segment.replace(/-/g, " "))}
                                </Link>
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        </React.Fragment>
                      );
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
          </SidebarInset>

          <main className="px-6 py-4">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SidebarLayout;
