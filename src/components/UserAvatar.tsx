import { User } from "@/contexts/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "./RoleBadge";
import { StatusIndicator } from "./StatusIndicator";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  showRole?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    avatar: "w-8 h-8",
    status: "w-2 h-2 -bottom-0.5 -right-0.5",
    role: "w-4 h-4 -top-1 -right-1",
  },
  md: {
    avatar: "w-10 h-10",
    status: "w-3 h-3 -bottom-0.5 -right-0.5",
    role: "w-5 h-5 -top-1 -right-1",
  },
  lg: {
    avatar: "w-12 h-12",
    status: "w-3 h-3 -bottom-1 -right-1",
    role: "w-6 h-6 -top-1 -right-1",
  },
  xl: {
    avatar: "w-16 h-16",
    status: "w-4 h-4 -bottom-1 -right-1",
    role: "w-7 h-7 -top-1 -right-1",
  },
};

export const UserAvatar = ({
  user,
  size = "md",
  showStatus = true,
  showRole = true,
  className,
}: UserAvatarProps) => {
  const config = sizeConfig[size];

  const initials = user.pseudo
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={config.avatar}>
        <AvatarImage src={user.avatar} alt={user.pseudo} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>

      {showStatus && (
        <div
          className={cn(
            "absolute border-2 border-background rounded-full",
            config.status,
          )}
        >
          <StatusIndicator status={user.status} />
        </div>
      )}

      {showRole && user.role !== "user" && (
        <div className={cn("absolute", config.role)}>
          <RoleBadge role={user.role} />
        </div>
      )}
    </div>
  );
};
