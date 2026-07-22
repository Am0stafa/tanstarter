import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import {
  ChevronsUpDownIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  Settings2Icon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "#/components/ui/sidebar";
import { authClient } from "#/lib/auth/auth-client";
import { useAuthSuspense } from "#/lib/auth/hooks";
import { authQueryOptions } from "#/lib/auth/queries";

/**
 * Single source of truth for app navigation — the sidebar, command palette,
 * and header breadcrumbs should stay in sync with these entries.
 */
const navItems = [
  { title: "Dashboard", to: "/app", icon: LayoutDashboardIcon, exact: true },
  { title: "Customers", to: "/app/customers", icon: UsersIcon, exact: false },
  { title: "Settings", to: "/app/settings", icon: Settings2Icon, exact: false },
] as const;

export function AppSidebar() {
  const pathname = useLocation({ select: (location) => location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link to="/" />}
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <ZapIcon className="size-4" />
              </div>
              {/* scaffold:title */}
              <span className="truncate font-semibold">TanStarter</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={item.exact ? pathname === item.to : pathname.startsWith(item.to)}
                    render={<Link to={item.to} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}

/**
 * Sidebar footer user menu. Rendered under the _auth layout, so the user is
 * always present (useAuthSuspense would suspend otherwise, guarded upstream).
 */
function UserMenu() {
  const { user } = useAuthSuspense();
  const { isMobile } = useSidebar();
  const queryClient = useQueryClient();
  const router = useRouter();

  if (!user) return null;

  const initials =
    user.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onResponse: async () => {
          // Clear cached auth state so guarded routes re-evaluate immediately.
          queryClient.setQueryData(authQueryOptions().queryKey, null);
          await router.invalidate();
          await router.navigate({ to: "/" });
        },
      },
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={user.image ?? undefined} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link to="/app/settings" />}>
              <Settings2Icon />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOutIcon />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
