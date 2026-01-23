interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  extra?: React.ReactNode;
  bordered?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  title,
  extra,
  bordered = true,
  hoverable = false,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg
        ${bordered ? "border" : ""}
        ${hoverable ? "hover:shadow-md transition-shadow cursor-pointer" : ""}
        ${className}
      `}
    >
      {(title || extra) && (
        <div className="flex items-center justify-between px-6 py-4 border-b">
          {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
          {extra}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
