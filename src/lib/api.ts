import { SERVER_URL } from "@/configs/env";
import { API_ROUTES } from "@/configs/routes";
import { getUserSession } from "@/lib/supabase";
import { TaskCreationForm } from "@/pages/task-creation";
import { ResponseObject, TaskResponse } from "@/types/api.types";
import { TASK_KIND } from "@/types/task.types";

interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  responseObject: T extends null ? null : ResponseObject<T>;
  statusCode: number;
}

export async function createTask(vals: TaskCreationForm, type: TASK_KIND) {
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
    if (res.status >= 500) throw new Error("Server Error!");

    const resJson = (await res.json()) as ApiResponse;
    if (!resJson.success) throw new Error(resJson.message);
  } else {
    throw new Error("User authentication failed!");
  }
}
export async function getTaskList(page = 1) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
  });

  const res = await fetch(
    `${SERVER_URL}${API_ROUTES.TASKS.GET_LIST}?${queryParams}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (res.status >= 500) throw new Error("Server Error!");

  const resJson = (await res.json()) as ApiResponse<TaskResponse[]>;
  if (!resJson.success) throw new Error(resJson.message);
  if (!resJson.responseObject) throw new Error("No response object!");

  return resJson.responseObject;
}

export async function getTaskById(id: string) {
  const res = await fetch(
    `${SERVER_URL}${API_ROUTES.TASKS.GET_BY_ID.replace(":id", id)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (res.status >= 500) throw new Error("Server Error!");

  const resJson = (await res.json()) as ApiResponse<TaskResponse>;
  if (!resJson.success) throw new Error(resJson.message);
  if (!resJson.responseObject) throw new Error("No response object!");

  return resJson.responseObject.data;
}

export async function createTaskSubmission(
  vals: { description: string },
  id: string,
) {
  await fetch(`${SERVER_URL}`, {
    method: "POST",
    body: JSON.stringify(vals),
  });
  console.log(vals, id);
}

// export async function testSecurity() {
// (async () => {
//   const { data, error } = await supabase.from("post").select();
//   console.log(error, data);
// })();
// }
