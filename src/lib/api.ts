import { SERVER_URL } from "@/configs/env";
import { API_ROUTES } from "@/configs/routes";
import { getUserSession } from "@/lib/supabase";
import {
  ResponseObject,
  SolutionResponse,
  SolutionVoteMetrics,
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

async function apiCall<T = null>(
  method: "GET" | "POST",
  endpoint: string,
  authRequired = false,
  body?: object,
): Promise<ApiResponse<T>["responseObject"]> {
  const session = await getUserSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authRequired) {
    if (!session) throw new Error("User authentication failed!");
    headers.Authorization = `Bearer ${session.access_token}`;
  } else if (session) headers.Authorization = `Bearer ${session.access_token}`;

  let res: Response;
  try {
    res = await fetch(`${SERVER_URL}${endpoint}`, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  } catch (err) {
    throw new Error(`API call failed: ${String(err)}`);
  }
  if (res.status >= 500) throw new Error("Server Error!");

  const resJson = (await res.json()) as ApiResponse<T>;
  if (!resJson.success) throw new Error(resJson.message);

  return resJson.responseObject;
}

export async function createTask(
  vals: TaskCreationForm,
  type: TaskKind,
): Promise<void> {
  const endpoint = API_ROUTES.TASKS.CREATE;
  const body = Object.assign(vals, { kind: type });
  await apiCall("POST", endpoint, true, body);
}

export async function getTaskList(
  page = 1,
): Promise<ResponseObject<TaskResponse[]>> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
  });
  const endpoint = `${API_ROUTES.TASKS.GET_LIST}?${queryParams}`;
  const resObj = await apiCall<TaskResponse[]>("GET", endpoint);

  if (!resObj) throw new Error("No response object!");
  return resObj;
}

export async function getTaskById(
  id: TaskResponse["id"],
): Promise<ResponseObject<TaskResponse>> {
  const endpoint = API_ROUTES.TASKS.GET_BY_ID.replace(":id", id);
  const resObj = await apiCall<TaskResponse>("GET", endpoint);

  if (!resObj) throw new Error("No response object!");
  return resObj;
}

export async function createSolution(
  vals: { description: string },
  taskId: TaskResponse["id"],
): Promise<ResponseObject<SolutionResponse> | null> {
  const endpoint = API_ROUTES.SOLUTIONS.CREATE;
  const body = Object.assign(vals, { taskId });
  return await apiCall<SolutionResponse>("POST", endpoint, true, body);
}

export async function getSolutionList(
  taskId: TaskResponse["id"],
  page = 1,
): Promise<ResponseObject<SolutionResponse[]>> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
  });
  const endpoint = `${API_ROUTES.SOLUTIONS.GET_LIST.replace(":taskId", taskId)}?${queryParams}`;
  const resObj = await apiCall<SolutionResponse[]>("GET", endpoint);

  if (!resObj) throw new Error("No response object!");
  return resObj;
}

// export async function getSolutionVoteDetails(
//   solutionId: SolutionResponse["id"],
// ): Promise<ResponseObject<SolutionResponse["userVoteMetrics"]>> {
//   const endpoint = API_ROUTES.SOLUTION_VOTES.GET_DETAILS.replace(
//     ":solutionId",
//     solutionId,
//   );
//   const resObj = await apiCall<SolutionResponse["userVoteMetrics"]>(
//     "GET",
//     endpoint,
//     true,
//   );

//   if (!resObj) throw new Error("No response object!");
//   return resObj;
// }

export async function voteForSolution(
  solutionId: SolutionResponse["id"],
  amount: number,
): Promise<ResponseObject<SolutionVoteMetrics>> {
  const endpoint = API_ROUTES.SOLUTION_VOTES.RECORD;
  const resObj = await apiCall<SolutionVoteMetrics>("POST", endpoint, true, {
    solutionId,
    amount,
  });

  if (!resObj) throw new Error("No response object!");
  return resObj;
}

export async function fundTask(
  taskId: TaskResponse["id"],
  amount: number,
): Promise<ResponseObject<TaskResponse> | null> {
  const endpoint = "/task-funds/post";
  const resObj = await apiCall<TaskResponse>("POST", endpoint, true, {
    taskId,
    amount,
  });

  return resObj;
}

// export async function testSecurity() {
// (async () => {
//   const { data, error } = await supabase.from("post").select();
//   console.log(error, data);
// })();
// }
