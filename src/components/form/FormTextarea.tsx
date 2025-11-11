import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  helperText?: string;
  containerClassName?: string;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ name, label, helperText, containerClassName, className, ...props }, ref) => {
    const {
      register,
      formState: { errors },
    } = useFormContext();

    const { ref: rhfRef, ...rest } = register(name);
    const error = errors[name];
    const errorMessage = error?.message as string | undefined;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && <Label htmlFor={name}>{label}</Label>}
        <Textarea
          id={name}
          {...rest}
          {...props}
          ref={(el) => {
            rhfRef(el);
            if (typeof ref === 'function') {
              ref(el);
            } else if (ref) {
              (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
            }
          }}
          className={cn(error && "border-destructive", className)}
        />
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";
