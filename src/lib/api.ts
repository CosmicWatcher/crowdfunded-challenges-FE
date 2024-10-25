import { SERVER_URL } from "@/configs/env";
import { API_ROUTES } from "@/configs/routes";
import { getUserSession } from "@/lib/supabase";
import {
  ResponseObject,
  SolutionResponse,
  TaskResponse,
} from "@/types/api.types";
import { TaskCreationForm } from "@/types/task.types";
import { TaskKind } from "@/types/task.types";

interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  responseObject: T extends null ? null : ResponseObject<T> | null;
  statusCode: number;
}

async function handleApiErrors<T = null>(
  res: Response,
): Promise<ApiResponse<T>["responseObject"]> {
  if (res.status >= 500) throw new Error("Server Error!");

  const resJson = (await res.json()) as ApiResponse<T>;
  if (!resJson.success) throw new Error(resJson.message);

  return resJson.responseObject;
}

export async function createTask(
  vals: TaskCreationForm,
  type: TaskKind,
): Promise<void> {
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
    await handleApiErrors(res);
  } else {
    throw new Error("User authentication failed!");
  }
}

export async function getTaskList(
  page = 1,
): Promise<ResponseObject<TaskResponse[]>> {
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

  const resObj = await handleApiErrors<TaskResponse[]>(res);
  if (!resObj) throw new Error("No response object!");
  return resObj;
}

export async function getTaskById(
  id: TaskResponse["id"],
): Promise<ResponseObject<TaskResponse>> {
  const res = await fetch(
    `${SERVER_URL}${API_ROUTES.TASKS.GET_BY_ID.replace(":id", id)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const resObj = await handleApiErrors<TaskResponse>(res);
  if (!resObj) throw new Error("No response object!");
  return resObj;
}

export async function createSolution(
  vals: { description: string },
  taskId: TaskResponse["id"],
): Promise<ResponseObject<SolutionResponse> | null> {
  const session = await getUserSession();
  if (session) {
    const res = await fetch(`${SERVER_URL}${API_ROUTES.SOLUTIONS.CREATE}`, {
      method: "POST",
      body: JSON.stringify(Object.assign(vals, { taskId })),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    const resObj = await handleApiErrors<SolutionResponse>(res);
    return resObj;
  } else {
    throw new Error("User authentication failed!");
  }
}

export async function getSolutionList(
  taskId: TaskResponse["id"],
  page = 1,
): Promise<ResponseObject<SolutionResponse[]>> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
  });

  const res = await fetch(
    `${SERVER_URL}${API_ROUTES.SOLUTIONS.GET_LIST.replace(
      ":taskId",
      taskId,
    )}?${queryParams}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const resObj = await handleApiErrors<SolutionResponse[]>(res);
  if (!resObj) throw new Error("No response object!");
  return resObj;
}

// export async function testSecurity() {
// (async () => {
//   const { data, error } = await supabase.from("post").select();
//   console.log(error, data);
// })();
// }
