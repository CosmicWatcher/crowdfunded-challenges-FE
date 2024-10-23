import { SERVER_URL } from "@/configs/env";
import { API_ROUTES } from "@/configs/routes";
import { getUserSession } from "@/lib/supabase";
import { TaskCreationForm } from "@/pages/task-creation";
import { TASK_KIND, TASK_STATUS } from "@/types/task.types";

interface ApiResponse {
  success: boolean;
  message: string;
  responseObject: ResponseObject | null;
  statusCode: number;
}

interface ResponseObject {
  data: UserResponse | TaskResponse;
  pagination?: ResponsePagination;
}

interface ResponsePagination {
  total_records: number;
  total_pages: number;
  current_page: number;
  prev_page: number | null;
  next_page: number | null;
}

interface UserResponse {
  id: string;
  username: string | null;
}

interface TaskResponse {
  id: string;
  createdBy: UserResponse | null;
  title: string | null;
  details: string | null;
  kind: TASK_KIND;
  maxWinners: number;
  status: TASK_STATUS;
  depositAddress: string | null;
  createdAt: string;
  editedAt: string | null;
  endedAt: string | null;
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
