import Autoplay from "embla-carousel-autoplay";
import { ArrowBigDownDash, CalendarIcon, OctagonX } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Loading } from "@/components/ui/loading";
import { OverallMetric, UserMetric } from "@/components/ui/metrics";
import NotFoundAlert from "@/components/ui/not-found";
import Time from "@/components/ui/time";
import { NO_USERNAME } from "@/configs/constants";
import { SITE_PAGES } from "@/configs/routes";
import { getFeaturedTasks, getTaskList } from "@/lib/api";
import { handleError } from "@/lib/error";
import { ResponseObject, TaskResponse } from "@/types/api.types";
import { TaskStatus } from "@/types/misc.types";
import { getTaskKindColor, getTaskStatusColor } from "@/utils/colors";

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
          new Date().toLocaleString(),
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
          new Date().toLocaleString(),
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

  if (
    loading &&
    activeTasks.data.length === 0 &&
    successfulTasks.data.length === 0 &&
    failedTasks.data.length === 0
  ) {
    return <Loading />;
  }

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

  if (currentTasks.data.length === 0) {
    return (
      <NotFoundAlert
        title="No tasks available!"
        description="Please check back later."
      />
    );
  }

  return (
    <div>
      <FeaturedSection />
      <div className="flex items-center justify-center gap-4 mt-20 mb-8 p-4 rounded-full border-2 self-center w-full max-w-md mx-auto">
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
        {currentTasks.data.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {loading && <Loading />}
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

function FeaturedSection() {
  const [tasks, setTasks] = useState<TaskResponse[] | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchTasks() {
      try {
        const response = await getFeaturedTasks();
        if (!ignore && response.data) {
          setTasks(response.data);
        }
      } catch (err) {
        handleError(err);
      }
    }
    void fetchTasks();

    return () => {
      ignore = true;
    };
  }, []);

  if (!tasks) {
    return null;
  }

  return (
    // <div className="flex justify-center mx-auto max-w-screen-sm md:max-w-7xl">
    <Card className="rounded-3xl max-w-7xl mx-auto bg-gradient-to-b from-primary/60 to-muted/10 from-0% to-100%">
      <CardHeader>
        <CardTitle className="text-4xl text-center">Featured Tasks</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Carousel
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          className="w-full max-w-fit flex flex-col gap-4 "
        >
          <CarouselContent className="py-4 px-2 flex items-center">
            {tasks.map((task, index) => (
              <CarouselItem
                key={task.id}
                className={index === tasks.length - 1 ? "pr-4" : ""}
              >
                <TaskCard task={task} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-evenly">
            <div className="relative">
              <CarouselPrevious />
            </div>
            <div className="relative">
              <CarouselNext />
            </div>
          </div>
        </Carousel>
      </CardContent>
    </Card>
  );
}

function TaskCard({ task }: { task: TaskResponse }) {
  const [_location, setLocation] = useLocation();
  const username = task.createdBy?.username ?? NO_USERNAME;
  const kindColor = getTaskKindColor(task.kind);
  const statusColor = getTaskStatusColor(task.status);

  return (
    <Card
      className={`max-w-7xl mx-auto relative cursor-pointer border-2 ${statusColor.background}`}
      onClick={() => setLocation(SITE_PAGES.TASKS.VIEW.replace(":id", task.id))}
    >
      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
        <Badge variant="outline" className={`${kindColor} pb-[0.25rem]`}>
          {task.kind}
        </Badge>
      </div>
      <div className="flex justify-between">
        <div className="space-y-2 p-4">
          <div className="flex items-center text-sm">
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <Time timestamp={new Date(task.createdAt)} />
          </div>
          <div className="flex items-center text-sm space-x-2">
            <Avatar>
              <AvatarFallback>
                {`${username[0].toUpperCase()}${username[1].toUpperCase()}`}
              </AvatarFallback>
            </Avatar>
            <span>{username}</span>
          </div>
        </div>
        <div className="flex items-center">
          <OverallMetric
            metric={`${task.metrics.overall.totalFunds.toLocaleString(undefined, { maximumFractionDigits: 0 })} Kin`}
            label="Funds"
            className="mr-1 p-1 px-2 md:mr-2 md:p-2 md:px-4"
          />
          {task.metrics?.user && (
            <UserMetric
              metric={`${task.metrics.user.totalFunds.toLocaleString(undefined, { maximumFractionDigits: 0 })} Kin`}
              label="Your Contribution"
              className="ml-0 p-1 px-2 md:p-2 md:px-4"
            />
          )}
        </div>
      </div>
      <CardContent className="space-y-4">
        <CardTitle className="text-2xl font-bold line-clamp-2 break-words">
          {task.title}
        </CardTitle>
        <p className="line-clamp-2 break-words">{task.details}</p>
      </CardContent>
      {task.status !== "active" && (
        <CardFooter>
          <div className="absolute -left-2 bottom-6 rotate-[30deg]">
            <Badge
              variant="secondary"
              className={`pb-[0.25rem] w-36 justify-center text-sm ring-offset-2 ring-1 ${statusColor.border} ring-secondary-foreground`}
            >
              {task.status}
            </Badge>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
