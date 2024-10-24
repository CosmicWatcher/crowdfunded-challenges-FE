import { TASK_KIND, TASK_STATUS } from "@/types/task.types";

export interface ResponseObject<T> {
  data: T;
  pagination?: ResponsePagination;
}

export interface ResponsePagination {
  total_records: number;
  total_pages: number;
  current_page: number;
  prev_page: number | null;
  next_page: number | null;
}

export interface UserResponse {
  id: string;
  username: string | null;
}

export interface TaskResponse {
  id: string;
  createdBy: UserResponse | null;
  title: string | null;
  details: string | null;
  kind: TASK_KIND;
  maxWinners: number;
  status: TASK_STATUS;
  depositAddress: string | null;
  fundsRaised: number;
  createdAt: string;
  editedAt: string | null;
  endedAt: string | null;
}
