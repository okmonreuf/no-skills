import { UserStatus } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: UserStatus;
  className?: string;
  showLabel?: boolean;
}

const statusConfig = {
  online: {
    color: "bg-green-500",
    label: "En ligne",
    pulse: true,
  },
  away: {
    color: "bg-yellow-500",
    label: "Absent",
    pulse: false,
  },
  busy: {
    color: "bg-red-500",
    label: "Occupé",
    pulse: false,
  },
  offline: {
    color: "bg-gray-400",
    label: "Hors ligne",
    pulse: false,
  },
};

export const StatusIndicator = ({
  status,
  className,
  showLabel = false,
}: StatusIndicatorProps) => {
  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div
          className={cn(
            "w-3 h-3 rounded-full border-2 border-background",
            config.color,
          )}
        />
        {config.pulse && (
          <div
            className={cn(
              "absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-75",
              config.color,
            )}
          />
        )}
      </div>

      {showLabel && (
        <span className="text-sm text-muted-foreground">{config.label}</span>
      )}
    </div>
  );
};
