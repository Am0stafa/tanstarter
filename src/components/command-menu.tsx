import { useNavigate } from "@tanstack/react-router";
import {
  HomeIcon,
  LayoutDashboardIcon,
  MonitorIcon,
  MoonIcon,
  SearchIcon,
  Settings2Icon,
  SunIcon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useTheme } from "#/components/theme-provider";
import { Button } from "#/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "#/components/ui/command";

/**
 * Global ⌘K / Ctrl+K command palette. Renders its own trigger (a search-style
 * button for the app header) plus the dialog, and owns the keyboard shortcut.
 * Add new destinations/actions here as the app grows — every page should be
 * reachable from the palette.
 */
export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close first so the palette doesn't linger over route transitions.
  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full max-w-48 justify-start gap-2 text-muted-foreground sm:w-48"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-3.5" />
        <span className="flex-1 text-left text-xs">Search...</span>
        <CommandShortcut className="text-xs">⌘K</CommandShortcut>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        {/* CommandDialog (base-rhea) doesn't include the cmdk root — Command must wrap the content */}
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => runCommand(() => navigate({ to: "/app" }))}>
                <LayoutDashboardIcon />
                Dashboard
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate({ to: "/app/customers" }))}>
                <UsersIcon />
                Customers
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate({ to: "/app/settings" }))}>
                <Settings2Icon />
                Settings
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate({ to: "/" }))}>
                <HomeIcon />
                Home page
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Theme">
              <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                <SunIcon />
                Light
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                <MoonIcon />
                Dark
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
                <MonitorIcon />
                System
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
