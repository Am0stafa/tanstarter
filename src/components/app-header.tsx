import { Link, useLocation } from "@tanstack/react-router";

import { CommandMenu } from "#/components/command-menu";
import { ThemeToggle } from "#/components/theme-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#/components/ui/breadcrumb";
import { Separator } from "#/components/ui/separator";
import { SidebarTrigger } from "#/components/ui/sidebar";

/** Page titles per app route; extend when adding routes under /app. */
const pageTitles: Record<string, string> = {
  "/app": "Dashboard",
  "/app/customers": "Customers",
  "/app/settings": "Settings",
};

export function AppHeader() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const title = pageTitles[pathname.replace(/\/$/, "") || "/app"];

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden sm:block">
            <BreadcrumbLink render={<Link to="/app" />}>TanStarter</BreadcrumbLink>
          </BreadcrumbItem>
          {title && (
            <>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        <CommandMenu />
        <ThemeToggle />
      </div>
    </header>
  );
}
