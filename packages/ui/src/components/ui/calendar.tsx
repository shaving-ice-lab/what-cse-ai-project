"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  type Locale,
} from "date-fns";
import { zhCN } from "date-fns/locale";

import { cn } from "../../lib/utils";
import { Button } from "./button";

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
  locale?: Locale;
}

export function Calendar({
  selected,
  onSelect,
  disabled,
  className,
  locale = zhCN,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date());

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isDisabled = disabled?.(cloneDay) ?? false;
        const isSelected = selected ? isSameDay(cloneDay, selected) : false;
        const isCurrentMonth = isSameMonth(cloneDay, monthStart);
        const isTodayDate = isToday(cloneDay);

        days.push(
          <button
            key={day.toString()}
            type="button"
            disabled={isDisabled}
            onClick={() => !isDisabled && onSelect?.(cloneDay)}
            className={cn(
              "h-9 w-9 p-0 font-normal text-sm rounded-md transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              !isCurrentMonth && "text-muted-foreground opacity-50",
              isSelected &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              isTodayDate && !isSelected && "bg-accent text-accent-foreground",
              isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
            )}
          >
            {format(cloneDay, "d")}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }

    return rows;
  };

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-semibold">{format(currentMonth, "yyyy年 M月", { locale })}</div>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="h-9 w-9 flex items-center justify-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="space-y-1">{renderDays()}</div>
    </div>
  );
}

export default Calendar;
