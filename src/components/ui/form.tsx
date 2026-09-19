"use client";

import * as React from "react";
import { Controller, FormProvider, useFormContext, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = FormProvider;

type FormFieldContextValue<TFieldName extends string> = { name: TFieldName };
const FormFieldContext = React.createContext<FormFieldContextValue<string> | null>(null);

const FormField = <TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) => (
  <FormFieldContext.Provider value={{ name: props.name }}>
    <Controller {...props} />
  </FormFieldContext.Provider>
);

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  if (!fieldContext || !itemContext) throw new Error("useFormField debe usarse dentro de FormField y FormItem");
  const fieldState = getFieldState(fieldContext.name, formState);
  return { id: itemContext.id, name: fieldContext.name, ...fieldState };
}

type FormItemContextValue = { id: string };
const FormItemContext = React.createContext<FormItemContextValue | null>(null);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  const { error, id } = useFormField();
  return <Label className={cn(error && "text-destructive", className)} htmlFor={id} {...props} />;
}

function FormControl({ ...props }: React.ComponentProps<"input">) {
  const { error, id } = useFormField();
  return <input id={id} aria-invalid={Boolean(error)} {...props} />;
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { id } = useFormField();
  return <p id={`${id}-description`} className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, id } = useFormField();
  const body = error ? String(error.message ?? "") : props.children;
  if (!body) return null;
  return <p id={`${id}-message`} className={cn("text-destructive text-sm font-medium", className)} {...props}>{body}</p>;
}

export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage };
