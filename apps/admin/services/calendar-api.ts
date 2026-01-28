import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

// Calendar Event Types
export type CalendarEventType =
  | "announcement"
  | "registration_start"
  | "registration_end"
  | "payment_end"
  | "print_ticket"
  | "written_exam"
  | "written_result"
  | "interview"
  | "final_result"
  | "custom";

export type CalendarEventStatus = "pending" | "notified" | "completed" | "cancelled";
export type CalendarEventSource = "auto" | "manual";

// Event Type Metadata
export const EVENT_TYPE_CONFIG: Record<
  CalendarEventType,
  { name: string; color: string }
> = {
  announcement: { name: "公告发布", color: "#8b5cf6" },
  registration_start: { name: "报名开始", color: "#22c55e" },
  registration_end: { name: "报名截止", color: "#ef4444" },
  payment_end: { name: "缴费截止", color: "#f97316" },
  print_ticket: { name: "准考证打印", color: "#06b6d4" },
  written_exam: { name: "笔试", color: "#3b82f6" },
  written_result: { name: "笔试成绩公布", color: "#14b8a6" },
  interview: { name: "面试", color: "#ec4899" },
  final_result: { name: "最终结果公布", color: "#f59e0b" },
  custom: { name: "自定义", color: "#6b7280" },
};

export interface CalendarEvent {
  id: number;
  position_id?: string;
  announcement_id?: number;
  event_type: CalendarEventType;
  event_type_name: string;
  event_title: string;
  event_description?: string;
  event_date: string;
  event_time?: string;
  all_day: boolean;
  reminder_enabled: boolean;
  reminder_times: number[];
  notify_channels: string[];
  status: CalendarEventStatus;
  color: string;
  source: CalendarEventSource;
  days_remaining: number;
  is_overdue: boolean;
  position?: {
    id: number;
    position_name: string;
    department_name: string;
  };
  announcement?: {
    id: number;
    title: string;
  };
  created_at: string;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
  total: number;
  page: number;
  page_size: number;
}

export interface CalendarMonthResponse {
  year: number;
  month: number;
  events: CalendarEvent[];
  event_days: Record<string, CalendarEvent[]>;
}

export interface UpcomingEventsResponse {
  events: CalendarEvent[];
  days: number;
  upcoming_count: number;
}

export interface CalendarEventTypeInfo {
  type: CalendarEventType;
  name: string;
  color: string;
}

export interface CreateEventRequest {
  position_id?: string;
  announcement_id?: number;
  event_type: CalendarEventType;
  event_title: string;
  event_description?: string;
  event_date: string;
  event_time?: string;
  all_day?: boolean;
  reminder_enabled?: boolean;
  reminder_times?: number[];
  notify_channels?: string[];
  color?: string;
}

export interface UpdateEventRequest {
  event_title?: string;
  event_description?: string;
  event_date?: string;
  event_time?: string;
  all_day?: boolean;
  reminder_enabled?: boolean;
  reminder_times?: number[];
  notify_channels?: string[];
  color?: string;
  status?: CalendarEventStatus;
}

export interface CalendarQueryParams {
  start_date?: string;
  end_date?: string;
  event_type?: CalendarEventType;
  status?: CalendarEventStatus;
  position_id?: string;
  page?: number;
  page_size?: number;
}

export interface CalendarStats {
  by_status: Array<{ status: string; count: number }>;
  by_type: Array<{ event_type: string; count: number }>;
  upcoming_count: number;
  overdue_count: number;
}

// Create axios instance for calendar API (uses user token, not admin token)
const calendarAxios = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - use adminToken since this is admin panel
calendarAxios.interceptors.request.use(
  (config) => {
    const { adminToken } = useAuthStore.getState();
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
calendarAxios.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code !== 0) {
      return Promise.reject(new Error(data.message || "请求失败"));
    }
    return data.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
      window.location.href = "/login";
    }
    const message = error.response?.data?.message || error.message || "网络错误";
    return Promise.reject(new Error(message));
  }
);

// Calendar API
export const calendarApi = {
  // Get events with filters
  getEvents: (params?: CalendarQueryParams): Promise<CalendarEventsResponse> => {
    return calendarAxios.get("/calendar", { params });
  },

  // Get events by month
  getEventsByMonth: (year: number, month: number): Promise<CalendarMonthResponse> => {
    return calendarAxios.get(`/calendar/month/${year}/${month}`);
  },

  // Get upcoming events
  getUpcomingEvents: (days?: number): Promise<UpcomingEventsResponse> => {
    return calendarAxios.get("/calendar/upcoming", { params: days ? { days } : {} });
  },

  // Get event stats
  getStats: (): Promise<CalendarStats> => {
    return calendarAxios.get("/calendar/stats");
  },

  // Get event types
  getEventTypes: (): Promise<{ types: CalendarEventTypeInfo[] }> => {
    return calendarAxios.get("/calendar/types");
  },

  // Create event
  createEvent: (data: CreateEventRequest): Promise<CalendarEvent> => {
    return calendarAxios.post("/calendar", data);
  },

  // Update event
  updateEvent: (id: number, data: UpdateEventRequest): Promise<{ message: string }> => {
    return calendarAxios.put(`/calendar/${id}`, data);
  },

  // Delete event
  deleteEvent: (id: number): Promise<{ message: string }> => {
    return calendarAxios.delete(`/calendar/${id}`);
  },

  // Mark event as completed
  markCompleted: (id: number): Promise<{ message: string }> => {
    return calendarAxios.post(`/calendar/${id}/complete`);
  },

  // Mark event as cancelled
  markCancelled: (id: number): Promise<{ message: string }> => {
    return calendarAxios.post(`/calendar/${id}/cancel`);
  },

  // Auto-create events from position
  autoCreateFromPosition: (
    positionId: string
  ): Promise<{ message: string; count: number; events: CalendarEvent[] }> => {
    return calendarAxios.post("/calendar/auto-create", { position_id: positionId });
  },

  // Delete all events for a position
  deletePositionEvents: (positionId: string): Promise<{ message: string }> => {
    return calendarAxios.delete(`/calendar/position/${positionId}`);
  },
};

export default calendarApi;
