import { SERVER_URL } from "@/configs/env";
import { API_ROUTES } from "@/configs/routes";
import { getUserSession } from "@/lib/supabase";
import {
  ResponseObject,
  SolutionResponse,
  SolutionVoteResponse,
  TaskResponse,
  UserResponse,
} from "@/types/api.types";
import {
  SolanaAddressType,
  TaskCreationForm,
  TaskStatus,
} from "@/types/misc.types";
import { TaskKind } from "@/types/misc.types";

interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  responseObject: T extends null ? null : ResponseObject<T> | null;
  statusCode: number;
}

async function apiCall<T = null>(
  method: "GET" | "POST" | "PUT" | "DELETE",
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
  console.log(
    `%c ${new Date(Date.now()).toLocaleTimeString()} %c Api success:%c ${resJson.success}%c, message:%c ${resJson.message}`,
    "color:orange; font-weight:bold;",
    "color:lightgreen;",
    "color:white;",
    "color:lightgreen;",
    "color:white;",
  );
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
  status?: TaskStatus,
): Promise<ResponseObject<TaskResponse[]>> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
  });
  if (status) queryParams.append("status", status);

  const endpoint = `${API_ROUTES.TASKS.GET_LIST}?${queryParams}`;
  const resObj = await apiCall<TaskResponse[]>("GET", endpoint);

  if (!resObj) throw new Error("No response object!");
  return resObj;
}

export async function getFeaturedTasks(): Promise<
  ResponseObject<TaskResponse[]>
> {
  const endpoint = API_ROUTES.TASKS.GET_FEATURED;
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
): Promise<ResponseObject<SolutionVoteResponse>> {
  const endpoint = API_ROUTES.SOLUTION_VOTES.RECORD;
  const resObj = await apiCall<SolutionVoteResponse>("POST", endpoint, true, {
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

export async function endTask(
  taskId: TaskResponse["id"],
  isSuccess: boolean,
): Promise<ResponseObject<TaskResponse>> {
  let endpoint: string;

  if (isSuccess) endpoint = API_ROUTES.TASKS.END.SUCCESS.replace(":id", taskId);
  else endpoint = API_ROUTES.TASKS.END.FAIL.replace(":id", taskId);

  const resObj = await apiCall<TaskResponse>("POST", endpoint, true);

  if (!resObj) throw new Error("No response object!");
  return resObj;
}

export async function getUserAccount(): Promise<ResponseObject<UserResponse>> {
  const endpoint = API_ROUTES.ACCOUNT.GET;
  const resObj = await apiCall<UserResponse>("GET", endpoint, true);

  if (!resObj) throw new Error("No response object!");
  return resObj;
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const endpoint = API_ROUTES.ACCOUNT.CHECK_USERNAME_EXISTS;
  const resObj = await apiCall<boolean>("POST", endpoint, false, {
    username,
  });

  if (!resObj) throw new Error("No response object!");
  return resObj.data;
}

export async function updateUser(
  username?: string,
  depositAddressInfo?: {
    address: string;
    kind: SolanaAddressType;
  },
): Promise<ResponseObject<UserResponse>> {
  const endpoint = API_ROUTES.ACCOUNT.UPDATE;
  const resObj = await apiCall<UserResponse>("PUT", endpoint, true, {
    username,
    depositAddressInfo,
  });

  if (!resObj) throw new Error("No response object!");
  return resObj;
}

export async function createCodeWalletLoginIntent(): Promise<
  ResponseObject<string>
> {
  const endpoint = "/code-wallet/login/create-intent";
  const resObj = await apiCall<string>("POST", endpoint);

  if (!resObj) throw new Error("No response object!");
  return resObj;
}

export async function verifyCodeWalletLogin(intentId: string): Promise<void> {
  const endpoint = "/code-wallet/login/success/:id".replace(":id", intentId);
  await apiCall("GET", endpoint);
}

// export async function testSecurity() {
//   const { data, error } = await supabase.from("task_payout").select();
//   console.log(error, data);
// }
