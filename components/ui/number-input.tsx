import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type" | "value"
> {
  value?: number | string;
  onChange?: (value: number, formatted: string) => void;
  allowDecimal?: boolean;
  maxDecimals?: number;
}

/**
 * NumberInput Component
 * A specialized input component for handling numeric values with proper sanitization.
 * Supports decimal numbers and formats the input to prevent invalid characters.
 */
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      value = "",
      onChange,
      allowDecimal = true,
      maxDecimals = 2,
      ...props
    },
    ref,
  ) => {
    const [displayValue, setDisplayValue] = React.useState<string>(() => {
      if (value === "" || value === undefined || value === null) return "";
      return String(value);
    });

    // Update display value when prop value changes
    React.useEffect(() => {
      if (value === "" || value === undefined || value === null) {
        setDisplayValue("");
      } else {
        setDisplayValue(String(value));
      }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Allow empty string
      if (inputValue === "") {
        setDisplayValue("");
        onChange?.(0, "");
        return;
      }

      // Only allow numbers and decimal point (if enabled)
      const regex = allowDecimal ? /[^\d.]/g : /[^\d]/g;
      const sanitized = inputValue.replace(regex, "");

      // Prevent multiple decimal points
      let formatted = sanitized;
      if (allowDecimal) {
        const parts = sanitized.split(".");
        if (parts.length > 2) {
          formatted = parts[0] + "." + parts.slice(1).join("");
        } else {
          formatted = sanitized;
        }

        // Limit decimal places
        if (formatted.includes(".") && maxDecimals !== undefined) {
          const [integerPart, decimalPart] = formatted.split(".");
          if (decimalPart && decimalPart.length > maxDecimals) {
            formatted = `${integerPart}.${decimalPart.slice(0, maxDecimals)}`;
          } else {
            formatted = `${integerPart}.${decimalPart || ""}`;
          }
        }
      }

      // Calculate numeric value
      let numericValue = 0;
      if (formatted !== "" && formatted !== ".") {
        const parsed = parseFloat(formatted);
        if (!isNaN(parsed)) {
          numericValue = parsed;
        }
      }

      setDisplayValue(formatted);
      onChange?.(numericValue, formatted);
    };

    return (
      <Input
        type="text"
        inputMode="decimal"
        ref={ref}
        value={displayValue}
        onChange={handleInputChange}
        className={cn(className)}
        {...props}
      />
    );
  },
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
