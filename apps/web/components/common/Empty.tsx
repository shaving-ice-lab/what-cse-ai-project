import Link from "next/link";
import { FileX, LucideIcon } from "lucide-react";

interface EmptyAction {
  label: string;
  href: string;
}

interface EmptyProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  /** Custom icon component from lucide-react */
  Icon?: LucideIcon;
  /** Pre-built action element */
  action?: React.ReactNode;
  /** Link action - will render a link button */
  linkAction?: EmptyAction;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Custom className */
  className?: string;
}

export default function Empty({ 
  title = "暂无数据", 
  description, 
  icon, 
  Icon,
  action,
  linkAction,
  size = "md",
  className = "",
}: EmptyProps) {
  // Size configurations
  const sizeConfig = {
    sm: {
      wrapper: "py-6",
      iconContainer: "w-10 h-10",
      icon: "w-5 h-5",
      title: "text-sm font-medium",
      description: "text-xs",
    },
    md: {
      wrapper: "py-12",
      iconContainer: "w-16 h-16",
      icon: "w-8 h-8",
      title: "text-lg font-medium",
      description: "text-sm",
    },
    lg: {
      wrapper: "py-16",
      iconContainer: "w-20 h-20",
      icon: "w-10 h-10",
      title: "text-xl font-semibold",
      description: "text-base",
    },
  };

  const config = sizeConfig[size];

  // Determine which icon to use
  const renderIcon = () => {
    if (icon) return icon;
    if (Icon) return <Icon className={`${config.icon} text-stone-400`} />;
    return <FileX className={`${config.icon} text-stone-400`} />;
  };

  return (
    <div className={`flex flex-col items-center justify-center ${config.wrapper} text-center ${className}`}>
      <div className={`${config.iconContainer} bg-stone-100 rounded-full flex items-center justify-center mb-4`}>
        {renderIcon()}
      </div>
      <h3 className={`${config.title} text-stone-700 mb-1`}>{title}</h3>
      {description && (
        <p className={`${config.description} text-stone-500 mb-4 max-w-md`}>{description}</p>
      )}
      {action}
      {linkAction && (
        <Link 
          href={linkAction.href}
          className="text-amber-600 hover:text-amber-700 hover:underline text-sm font-medium mt-2"
        >
          {linkAction.label}
        </Link>
      )}
    </div>
  );
}

// Named export for EmptyState alias (backward compatibility and plan compliance)
export { Empty as EmptyState };
