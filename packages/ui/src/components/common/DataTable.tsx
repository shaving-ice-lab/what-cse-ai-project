"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "../../lib/utils";

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  sortable?: boolean;
  onSort?: (key: string, order: "asc" | "desc" | null) => void;
  rowKey?: keyof T | ((record: T) => string);
  emptyText?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  searchable = false,
  searchPlaceholder = "搜索...",
  onSearch,
  sortable = false,
  onSort,
  rowKey = "id",
  emptyText = "暂无数据",
  className,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = React.useState("");
  const [sortState, setSortState] = React.useState<{
    key: string | null;
    order: "asc" | "desc" | null;
  }>({ key: null, order: null });

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === "function") {
      return rowKey(record);
    }
    return record[rowKey]?.toString() || index.toString();
  };

  const getCellValue = (record: T, key: keyof T | string): any => {
    const keys = (key as string).split(".");
    let value: any = record;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  };

  const handleSearch = () => {
    onSearch?.(searchValue);
  };

  const handleSort = (key: string) => {
    if (!sortable) return;

    let newOrder: "asc" | "desc" | null = "asc";
    if (sortState.key === key) {
      if (sortState.order === "asc") {
        newOrder = "desc";
      } else if (sortState.order === "desc") {
        newOrder = null;
      }
    }

    setSortState({ key: newOrder ? key : null, order: newOrder });
    onSort?.(key, newOrder);
  };

  const renderSortIcon = (key: string, columnSortable?: boolean) => {
    if (!sortable && !columnSortable) return null;

    if (sortState.key === key) {
      if (sortState.order === "asc") {
        return <ArrowUp className="ml-1 h-4 w-4" />;
      }
      if (sortState.order === "desc") {
        return <ArrowDown className="ml-1 h-4 w-4" />;
      }
    }
    return <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />;
  };

  const pageSizeOptions = [10, 20, 50, 100];

  return (
    <div className={cn("space-y-4", className)}>
      {searchable && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} variant="secondary">
            搜索
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key as string}
                  style={{ width: column.width }}
                  className={cn(
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    (sortable || column.sortable) && "cursor-pointer select-none"
                  )}
                  onClick={() => (sortable || column.sortable) && handleSort(column.key as string)}
                >
                  <div className="flex items-center">
                    {column.title}
                    {renderSortIcon(column.key as string, column.sortable)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="ml-2">加载中...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              data.map((record, index) => (
                <TableRow key={getRowKey(record, index)}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key as string}
                      className={cn(
                        column.align === "center" && "text-center",
                        column.align === "right" && "text-right"
                      )}
                    >
                      {column.render
                        ? column.render(getCellValue(record, column.key), record, index)
                        : getCellValue(record, column.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">共 {pagination.total} 条记录</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">每页</span>
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) => pagination.onChange(1, parseInt(value))}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm">条</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
                disabled={pagination.current <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 text-sm">
                {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
