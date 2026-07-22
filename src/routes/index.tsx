import { SiGithub } from "@icons-pack/react-simple-icons";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3Icon,
  BotIcon,
  DatabaseIcon,
  LockIcon,
  PaletteIcon,
  RouteIcon,
  ZapIcon,
} from "lucide-react";

import { ThemeToggle } from "#/components/theme-toggle";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { useAuth } from "#/lib/auth/hooks";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const features = [
  {
    icon: RouteIcon,
    title: "Type-safe by default",
    description: "TanStack Start + Router with validated search params and typed server functions.",
  },
  {
    icon: LockIcon,
    title: "Auth included",
    description: "Better Auth with email + OAuth, protected route groups, and server middleware.",
  },
  {
    icon: DatabaseIcon,
    title: "Postgres + Drizzle",
    description:
      "Typed schema, migrations, and a compose file for a local database in one command.",
  },
  {
    icon: PaletteIcon,
    title: "Supabase-style UI",
    description:
      "shadcn/ui on Base UI, themed with design tokens — dark mode is a first-class citizen.",
  },
  {
    icon: BarChart3Icon,
    title: "Batteries included",
    description: "Forms, data tables, charts, command palette — wired together and ready to copy.",
  },
  {
    icon: BotIcon,
    title: "AI-agent ready",
    description: "AGENTS.md guides, enforced design system, and CI so coding agents ship safely.",
  },
];

function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-14 items-center justify-between border-b px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ZapIcon className="size-4" />
          </div>
          {/* scaffold:title */}
          TanStarter
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            render={
              // oxlint-disable-next-line jsx-a11y/anchor-has-content -- icon + sr-only text render as children
              <a
                href="https://github.com/Am0stafa/tanstarter"
                target="_blank"
                rel="noreferrer noopener"
              />
            }
            nativeButton={false}
          >
            <SiGithub className="size-4" />
            <span className="sr-only">GitHub repository</span>
          </Button>
          <ThemeToggle />
          {user ? (
            <Button render={<Link to="/app" />} nativeButton={false} size="sm">
              Open dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link to="/login" />} nativeButton={false}>
                Sign in
              </Button>
              <Button size="sm" render={<Link to="/signup" />} nativeButton={false}>
                Get started
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-24 text-center">
          <Badge variant="outline" className="gap-1.5 text-muted-foreground">
            <span className="size-1.5 rounded-full bg-chart-1" aria-hidden />
            TanStack Start · shadcn/ui · Drizzle · Better Auth
          </Badge>
          <h1 className="max-w-2xl font-heading text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            Build your next product on a foundation that's already wired
          </h1>
          <p className="max-w-xl text-lg text-balance text-muted-foreground">
            A batteries-included, type-safe starter — auth, database, dashboard shell, forms,
            tables, and charts, all themed and ready to ship.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" render={<Link to="/app" />} nativeButton={false}>
              Open the dashboard
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={
                // oxlint-disable-next-line jsx-a11y/anchor-has-content -- text renders as children
                <a
                  href="https://github.com/Am0stafa/tanstarter"
                  target="_blank"
                  rel="noreferrer noopener"
                />
              }
              nativeButton={false}
            >
              <SiGithub className="size-4" />
              Star on GitHub
            </Button>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-4 py-16 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="gap-0">
                <CardHeader>
                  <div className="mb-2 flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary-foreground">
                    <feature.icon className="size-4" />
                  </div>
                  <CardTitle className="text-sm">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="flex h-14 items-center justify-center border-t text-sm text-muted-foreground">
        Built with TanStarter — fork it and make it yours.
      </footer>
    </div>
  );
}
