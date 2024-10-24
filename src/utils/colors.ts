import { TASK_KIND } from "@/types/task.types";

export function getTaskKindColor(kind: TASK_KIND) {
  return kind === "community" ? "bg-task-community" : "bg-task-personal";
}
