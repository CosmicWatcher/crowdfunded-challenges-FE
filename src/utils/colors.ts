import { TaskKind, TaskStatus } from "@/types/task.types";

export function getTaskKindColor(kind: TaskKind) {
  return kind === "community"
    ? "bg-task-community hover:opacity-90 hover:transition-opacity"
    : "bg-task-personal hover:opacity-90 hover:transition-opacity";
}

export function getTaskStatusColor(status: TaskStatus) {
  if (status === "active") return { background: "", border: "" };
  return status === "successful"
    ? {
        background: "bg-status-success-main",
        border: "ring-offset-status-success-border",
      }
    : {
        background: "bg-status-fail-main",
        border: "ring-offset-status-fail-border",
      };
}
