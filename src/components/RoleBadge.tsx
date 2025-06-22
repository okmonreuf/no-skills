import { Crown, Shield, ShieldCheck } from "lucide-react";
import { UserRole } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
  showTooltip?: boolean;
}

const roleConfig = {
  owner: {
    icon: Crown,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    label: "Propriétaire",
    description: "Propriétaire de la plateforme",
  },
  admin: {
    icon: Shield,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "Administrateur",
    description: "Administrateur avec tous les privilèges",
  },
  moderator: {
    icon: ShieldCheck,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Modérateur",
    description: "Modérateur de la communauté",
  },
  user: {
    icon: null,
    color: "",
    bgColor: "",
    label: "Utilisateur",
    description: "Utilisateur standard",
  },
};

export const RoleBadge = ({
  role,
  className,
  showTooltip = true,
}: RoleBadgeProps) => {
  const config = roleConfig[role];

  if (role === "user") {
    return null; // Pas de badge pour les utilisateurs normaux
  }

  const Icon = config.icon!;

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full p-1",
        config.bgColor,
        className,
      )}
      title={
        showTooltip ? `${config.label} - ${config.description}` : undefined
      }
    >
      <Icon className={cn("w-3 h-3", config.color)} />
    </div>
  );
};
