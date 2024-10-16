import { TASK_TYPES } from "@/configs/constants";
import { SERVER_URL } from "@/configs/env";
import { API_ROUTES } from "@/configs/routes";
import { getUserSession } from "@/lib/supabase";
import { TaskCreationForm } from "@/pages/task-creation";

interface ApiResponse {
  success: boolean;
  message: string;
  responseObject: object | null;
  statusCode: number;
}

export async function createTask(vals: TaskCreationForm, type: TASK_TYPES) {
  const session = await getUserSession();
  if (session) {
    const res = await fetch(`${SERVER_URL}${API_ROUTES.TASKS.CREATE}`, {
      method: "POST",
      body: JSON.stringify(Object.assign(vals, { kind: type })),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    const resJson = (await res.json()) as ApiResponse;
    if (!resJson.success) throw new Error(resJson.message);
  } else {
    throw new Error("User authentication failed!");
  }
}

export async function createTaskSubmission(vals, id) {
  console.log(vals, id);
}
