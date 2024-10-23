export type TASK_KIND = "community" | "personal";
export type TASK_STATUS = "active" | "successful" | "failed" | "deleted";

export interface Task {
  title: string;
  description: string;
  taskKind: TASK_KIND;
  status: TASK_STATUS;
  username: string;
  maxWinners: number;
  fundsRaised: number;
  depositAddress: string;
  creationDate: Date;
}
