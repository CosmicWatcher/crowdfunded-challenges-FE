import { TaskKind, TaskStatus } from "@/types/task.types";

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
  kind: TaskKind;
  maxWinners: number;
  status: TaskStatus;
  depositAddress: string | null;
  fundsRaised: number;
  createdAt: string;
  editedAt: string | null;
  endedAt: string | null;
}

export interface SubmissionResponse {
  id: string;
  taskId: string | null;
  createdBy: UserResponse | null;
  details: string | null;
  voteCount: number;
  isWinner: boolean;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
}
