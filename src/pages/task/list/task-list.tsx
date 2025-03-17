import { ArrowBigDownDash, OctagonX } from "lucide-react";
import { useEffect, useState } from "react";

import { FeaturedTasks } from "@/components/layout/featured-tasks";
import { TaskPreview } from "@/components/layout/task-preview";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import NotFoundAlert from "@/components/ui/not-found";
import { Skeleton } from "@/components/ui/skeleton";
import { getTaskList } from "@/lib/api";
import { handleError } from "@/lib/error";
import { ResponseObject, TaskResponse } from "@/types/api.types";
import { TaskStatus } from "@/types/misc.types";

export default function TaskListPage() {
  const [activeTasks, setActiveTasks] = useState<
    ResponseObject<TaskResponse[]>
  >({
    data: [],
    pagination: {
      total_records: 0,
      total_pages: 0,
      current_page: 0,
      prev_page: null,
      next_page: null,
    },
  });
  const [successfulTasks, setSuccessfulTasks] = useState<
    ResponseObject<TaskResponse[]>
  >({
    data: [],
    pagination: {
      total_records: 0,
      total_pages: 0,
      current_page: 0,
      prev_page: null,
      next_page: null,
    },
  });
  const [failedTasks, setFailedTasks] = useState<
    ResponseObject<TaskResponse[]>
  >({
    data: [],
    pagination: {
      total_records: 0,
      total_pages: 0,
      current_page: 0,
      prev_page: null,
      next_page: null,
    },
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isError, setIsError] = useState(false);
  const [statusFilter, setStatusFilter] =
    useState<Exclude<TaskStatus, "deleted">>("active");

  function handleNextPageClick() {
    const currentTasks =
      statusFilter === "active"
        ? activeTasks
        : statusFilter === "successful"
          ? successfulTasks
          : failedTasks;
    if (
      currentTasks.pagination?.next_page &&
      currentTasks.pagination.next_page !== page
    ) {
      setPage(currentTasks.pagination.next_page);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function fetchAllTasks() {
      setLoading(true);
      try {
        const [activeRes, successfulRes, failedRes] = await Promise.all([
          getTaskList(1, "active"),
          getTaskList(1, "successful"),
          getTaskList(1, "failed"),
        ]);

        if (!ignore) {
          setActiveTasks(activeRes);
          setSuccessfulTasks(successfulRes);
          setFailedTasks(failedRes);
        }
      } catch (err) {
        console.error(
          `%c ${new Date(Date.now()).toLocaleTimeString()}`,
          "color:CornflowerBlue; font-weight:bold;",
          "Error fetching tasks:",
          err,
        );
        handleError(err);
        setIsError(true);
      } finally {
        setLoading(false);
      }
    }

    void fetchAllTasks();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function fetchMoreTasks() {
      if (page === 1) return;

      setLoading(true);
      try {
        const response = await getTaskList(page, statusFilter);
        if (!ignore && response.data) {
          if (statusFilter === "active") {
            setActiveTasks((prev) => ({
              data: [...prev.data, ...response.data],
              pagination: response.pagination,
            }));
          } else if (statusFilter === "successful") {
            setSuccessfulTasks((prev) => ({
              data: [...prev.data, ...response.data],
              pagination: response.pagination,
            }));
          } else {
            setFailedTasks((prev) => ({
              data: [...prev.data, ...response.data],
              pagination: response.pagination,
            }));
          }
        }
      } catch (err) {
        console.error(
          `%c ${new Date(Date.now()).toLocaleTimeString()}`,
          "color:CornflowerBlue; font-weight:bold;",
          "Error fetching more tasks:",
          err,
        );
        handleError(err);
        setIsError(true);
      } finally {
        setLoading(false);
      }
    }

    void fetchMoreTasks();

    return () => {
      ignore = true;
    };
  }, [page, statusFilter]);

  if (isError) {
    return (
      <Alert className="max-w-lg mx-auto">
        <OctagonX className="size-5" />
        <AlertTitle>Error fetching tasks!</AlertTitle>
        <AlertDescription>Please check back later.</AlertDescription>
      </Alert>
    );
  }

  const currentTasks =
    statusFilter === "active"
      ? activeTasks
      : statusFilter === "successful"
        ? successfulTasks
        : failedTasks;

  return (
    <div>
      <FeaturedTasks />
      <div className="flex items-center justify-center bg-background gap-4 mt-10 mb-8 p-4 rounded-full border-2 self-center w-full max-w-md mx-auto">
        <Button
          variant={statusFilter === "active" ? "default" : "secondary"}
          className="text-lg"
          onClick={() => {
            setStatusFilter("active");
            setPage(1);
          }}
        >
          Active
        </Button>
        <Button
          variant={statusFilter === "successful" ? "default" : "secondary"}
          className="text-lg"
          onClick={() => {
            setStatusFilter("successful");
            setPage(1);
          }}
        >
          Successful
        </Button>
        <Button
          variant={statusFilter === "failed" ? "default" : "secondary"}
          className="text-lg"
          onClick={() => {
            setStatusFilter("failed");
            setPage(1);
          }}
        >
          Failed
        </Button>
      </div>
      <div className="space-y-10">
        {currentTasks.data.length > 0 ? (
          currentTasks.data.map(
            (task) =>
              task.status !== "deleted" && (
                <TaskPreview key={task.id} task={task} />
              ),
          )
        ) : loading ? (
          <>
            <Skeleton className="max-w-7xl mx-auto h-[10rem] rounded-3xl border-2" />
            <Skeleton className="max-w-7xl mx-auto h-[10rem] rounded-3xl border-2" />
          </>
        ) : (
          <NotFoundAlert
            title="No tasks found!"
            description="Try changing the filters above."
          />
        )}
        {!loading && currentTasks.pagination?.next_page && (
          <ArrowBigDownDash
            className="size-10 mx-auto cursor-pointer animate-bounce"
            onClick={handleNextPageClick}
          />
        )}
      </div>
    </div>
  );
}
