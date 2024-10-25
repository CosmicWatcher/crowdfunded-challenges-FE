import { TaskKind } from "@/types/task.types";

export function getTaskKindColor(kind: TaskKind) {
  return kind === "community" ? "bg-task-community" : "bg-task-personal";
}
