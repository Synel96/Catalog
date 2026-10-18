import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormFieldProps = React.ComponentProps<typeof Input> & {
  label: string;
};

export function FormField({ label, id, ...inputProps }: FormFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="grid gap-2">
      <Label htmlFor={inputId}>
        {label}
        {inputProps.required && <span className="text-destructive">*</span>}
      </Label>
      <Input id={inputId} {...inputProps} />
    </div>
  );
}
