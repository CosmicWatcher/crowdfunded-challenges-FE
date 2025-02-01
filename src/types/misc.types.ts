import { z } from "zod";

import { taskCreationFormSchema } from "@/configs/schema";

export type TaskKind = "community" | "personal";
export type TaskStatus =
  | "active"
  | "ended"
  | "successful"
  | "failed"
  | "deleted";

export type TaskCreationForm = z.infer<typeof taskCreationFormSchema>;

export type SolanaAddressType = "solana" | "token";
