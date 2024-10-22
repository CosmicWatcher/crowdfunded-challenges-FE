import { TASK_TYPES } from "@/configs/constants";

export interface Task {
  title: string;
  description: string;
  taskType: TASK_TYPES;
  status: string;
  username: string;
  maxWinners: number;
  fundsRaised: number;
  depositAddress: string;
  creationDate: Date;
}
