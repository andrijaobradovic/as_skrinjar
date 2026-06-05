"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  isServiceStatusValue,
  SERVICE_STATUS_LABELS,
  SERVICE_STATUS_STYLES,
  SERVICE_STATUS_VALUES,
  type ServiceStatusValue,
} from "@/lib/service-status";
import { cn } from "@/lib/utils";

export function StatusSelect({
  value,
  onValueChange,
  disabled = false,
  compact = false,
  className,
}: {
  value: ServiceStatusValue;
  onValueChange: (value: ServiceStatusValue) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (isServiceStatusValue(next)) {
          onValueChange(next);
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "border-0 shadow-none sm:w-fit",
          compact
            ? "h-auto w-auto px-3 py-1 text-lg font-bold"
            : "h-auto min-h-8 w-full px-3 py-1.5 font-medium sm:w-fit",
          SERVICE_STATUS_STYLES[value],
          className
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SERVICE_STATUS_VALUES.map((status) => (
          <SelectItem key={status} value={status}>
            {SERVICE_STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
