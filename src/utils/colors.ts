import { TaskKind, TaskStatus } from "@/types/misc.types";

export function getTaskKindColor(kind: TaskKind) {
  return kind === "community"
    ? "bg-task-community hover:opacity-90 hover:transition-opacity"
    : "bg-task-personal hover:opacity-90 hover:transition-opacity";
}

export function getTaskStatusColor(status: TaskStatus) {
  if (status === "successful") {
    return {
      background: "bg-status-success-main",
      border: "ring-offset-status-success-border",
    };
  }
  if (status === "failed") {
    return {
      background: "bg-status-fail-main",
      border: "ring-offset-status-fail-border",
    };
  }
  if (status === "ended") {
    return {
      background: "bg-status-ended-main",
      border: "ring-offset-status-ended-border",
    };
  }

  return { background: "", border: "" };
}
