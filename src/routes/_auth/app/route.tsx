import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppHeader } from "#/components/app-header";
import { AppSidebar } from "#/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar";

/**
 * Authenticated app shell: collapsible icon sidebar + header with breadcrumbs,
 * ⌘K command palette, and theme toggle. Auth is enforced by the parent _auth
 * layout (see _auth/route.tsx); pages render into the <Outlet /> below.
 */
export const Route = createFileRoute("/_auth/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
