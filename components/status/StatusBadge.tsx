import { cn } from "@/lib/utils";
import {
  SERVICE_STATUS_LABELS,
  SERVICE_STATUS_STYLES,
  type ServiceStatusValue,
} from "@/lib/service-status";

export function StatusBadge({
  status,
  compact = false,
  className,
}: {
  status: ServiceStatusValue;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg",
        compact ? "px-3 py-1 text-lg font-bold" : "px-3 py-1.5 text-sm font-medium",
        SERVICE_STATUS_STYLES[status],
        className
      )}
    >
      {SERVICE_STATUS_LABELS[status]}
    </span>
  );
}
