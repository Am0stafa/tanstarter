import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { LoaderCircleIcon } from "lucide-react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Switch } from "#/components/ui/switch";
import { Textarea } from "#/components/ui/textarea";

/**
 * App-wide form kit: TanStack Form + Zod wired to the shadcn primitives.
 *
 * Usage (see /app/settings for a full example):
 *
 *   const form = useAppForm({
 *     defaultValues,
 *     validators: { onSubmit: someZodSchema },
 *     onSubmit: async ({ value }) => { ... },
 *   });
 *
 *   <form.AppField name="name">{(field) => <field.TextField label="Name" />}</form.AppField>
 *   <form.AppForm><form.SubmitButton>Save</form.SubmitButton></form.AppForm>
 *
 * Add new field types by writing a component that calls useFieldContext()
 * and registering it in `fieldComponents` below.
 */
const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

/** Shared label + description + first-error scaffolding around a control. */
function FieldShell({
  label,
  description,
  htmlFor,
  error,
  children,
}: {
  label: string;
  description?: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {description && !error && <p className="text-sm text-muted-foreground">{description}</p>}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** First validation error for a touched field, as display text. */
function fieldError(meta: { isTouched: boolean; errors: unknown[] }): string | undefined {
  if (!meta.isTouched || meta.errors.length === 0) return undefined;
  const first = meta.errors[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && "message" in first) {
    return String((first as { message: unknown }).message);
  }
  return "Invalid value";
}

function TextField({
  label,
  description,
  ...inputProps
}: { label: string; description?: string } & Omit<
  React.ComponentProps<typeof Input>,
  "id" | "name" | "value" | "onChange" | "onBlur"
>) {
  const field = useFieldContext<string>();
  const error = fieldError(field.state.meta);

  return (
    <FieldShell label={label} description={description} htmlFor={field.name} error={error}>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        aria-invalid={Boolean(error)}
        {...inputProps}
      />
    </FieldShell>
  );
}

function TextareaField({
  label,
  description,
  ...textareaProps
}: { label: string; description?: string } & Omit<
  React.ComponentProps<typeof Textarea>,
  "id" | "name" | "value" | "onChange" | "onBlur"
>) {
  const field = useFieldContext<string>();
  const error = fieldError(field.state.meta);

  return (
    <FieldShell label={label} description={description} htmlFor={field.name} error={error}>
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        aria-invalid={Boolean(error)}
        {...textareaProps}
      />
    </FieldShell>
  );
}

function SwitchField({ label, description }: { label: string; description?: string }) {
  const field = useFieldContext<boolean>();

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="grid gap-0.5">
        <Label htmlFor={field.name}>{label}</Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <Switch
        id={field.name}
        name={field.name}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked)}
      />
    </div>
  );
}

/** Submit button that disables itself while submitting or invalid. */
function SubmitButton({ children }: { children: React.ReactNode }) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
      {([canSubmit, isSubmitting]) => (
        <Button type="submit" disabled={!canSubmit}>
          {isSubmitting && <LoaderCircleIcon className="animate-spin" />}
          {children}
        </Button>
      )}
    </form.Subscribe>
  );
}

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    TextareaField,
    SwitchField,
  },
  formComponents: {
    SubmitButton,
  },
});
