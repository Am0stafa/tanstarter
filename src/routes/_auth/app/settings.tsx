import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "#/components/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { useAuthSuspense } from "#/lib/auth/hooks";

export const Route = createFileRoute("/_auth/app/settings")({
  component: SettingsPage,
});

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  bio: z.string().max(160, "Bio must be 160 characters or fewer."),
  productUpdates: z.boolean(),
});

/**
 * Reference implementation of the app form pattern: TanStack Form + Zod via
 * useAppForm (see src/components/form.tsx). The submit handler fakes a save —
 * replace it with a createServerFn mutation (useMutation + authMiddleware)
 * when wiring to real persistence.
 */
function SettingsPage() {
  const { user } = useAuthSuspense();

  const form = useAppForm({
    defaultValues: {
      name: user?.name ?? "",
      bio: "",
      productUpdates: true,
    },
    validators: { onSubmit: profileSchema },
    onSubmit: async ({ value }) => {
      // Simulated latency so the pending state is visible in the demo.
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success("Profile saved", { description: `Name set to “${value.name.trim()}”.` });
    },
  });

  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <form
        className="flex max-w-2xl flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>How you appear across the product.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <form.AppField name="name">
              {(field) => <field.TextField label="Name" placeholder="Your full name" />}
            </form.AppField>

            {/* Display-only: email changes go through the auth provider's own flow. */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
              <p className="text-sm text-muted-foreground">Managed by your sign-in provider.</p>
            </div>

            <form.AppField name="bio">
              {(field) => (
                <field.TextareaField
                  label="Bio"
                  placeholder="A short description about you"
                  description="Up to 160 characters. Shown on your public profile."
                />
              )}
            </form.AppField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>What we're allowed to email you about.</CardDescription>
          </CardHeader>
          <CardContent>
            <form.AppField name="productUpdates">
              {(field) => (
                <field.SwitchField
                  label="Product updates"
                  description="New features, improvements, and occasional tips."
                />
              )}
            </form.AppField>
          </CardContent>
          <CardFooter className="justify-end">
            <form.AppForm>
              <form.SubmitButton>Save changes</form.SubmitButton>
            </form.AppForm>
          </CardFooter>
        </Card>
      </form>
    </>
  );
}
