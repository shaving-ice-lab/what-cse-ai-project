import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  mobileHidden?: boolean;
  className?: string;
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  emptyText?: string;
  className?: string;
  mobileCardRender?: (item: T) => React.ReactNode;
}

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyText = "暂无数据",
  className,
  mobileCardRender,
}: ResponsiveTableProps<T>) {
  const visibleColumns = columns.filter((col) => !col.mobileHidden);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center text-gray-500">{emptyText}</div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className={cn("hidden md:block bg-white rounded-lg border overflow-hidden", className)}>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn("hover:bg-gray-50 transition-colors", onRowClick && "cursor-pointer")}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn("px-6 py-4 whitespace-nowrap", col.className)}
                  >
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key as string] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className={cn("md:hidden space-y-3", className)}>
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
            className={cn(
              "bg-white rounded-lg border p-4",
              onRowClick && "cursor-pointer active:bg-gray-50"
            )}
          >
            {mobileCardRender ? (
              mobileCardRender(item)
            ) : (
              <div className="space-y-2">
                {visibleColumns.map((col) => (
                  <div key={String(col.key)} className="flex justify-between items-start">
                    <span className="text-sm text-gray-500 shrink-0">{col.header}</span>
                    <span className="text-sm text-gray-800 text-right ml-4">
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[col.key as string] ?? "-")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

interface DataListProps<T> {
  data: T[];
  keyExtractor: (item: T) => string | number;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyText?: string;
  className?: string;
  gap?: "sm" | "md" | "lg";
}

export function DataList<T>({
  data,
  keyExtractor,
  renderItem,
  emptyText = "暂无数据",
  className,
  gap = "md",
}: DataListProps<T>) {
  const gapClass = {
    sm: "space-y-2",
    md: "space-y-3",
    lg: "space-y-4",
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center text-gray-500">{emptyText}</div>
    );
  }

  return (
    <div className={cn(gapClass[gap], className)}>
      {data.map((item, index) => (
        <div key={keyExtractor(item)}>{renderItem(item, index)}</div>
      ))}
    </div>
  );
}

export function MobileDataCard({
  title,
  subtitle,
  tags,
  actions,
  onClick,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  tags?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg border p-4",
        onClick && "cursor-pointer active:bg-gray-50",
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-800 truncate">{title}</div>
          {subtitle && <div className="text-sm text-gray-500 mt-1 truncate">{subtitle}</div>}
        </div>
        {actions && <div className="ml-3 shrink-0">{actions}</div>}
      </div>
      {tags && <div className="mt-3 flex flex-wrap gap-2">{tags}</div>}
    </div>
  );
}
