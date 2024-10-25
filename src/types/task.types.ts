import { z } from "zod";

import { taskCreationFormSchema } from "@/configs/schema";

export type TaskKind = "community" | "personal";
export type TaskStatus = "active" | "successful" | "failed" | "deleted";

export type TaskCreationForm = z.infer<typeof taskCreationFormSchema>;
