import { TaskKind, TaskStatus } from "@/types/task.types";

export function getTaskKindColor(kind: TaskKind) {
  return kind === "community" ? "task-community" : "task-personal";
}

export function getTaskStatusColor(status: TaskStatus) {
  if (status === "active") return "";
  return status === "successful" ? "status-success" : "status-fail";
}
