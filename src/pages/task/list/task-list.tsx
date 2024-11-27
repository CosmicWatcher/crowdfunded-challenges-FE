import {
  ArrowBigDownDash,
  CalendarIcon,
  CirclePlus,
  OctagonX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { OverallMetric, UserMetric } from "@/components/ui/metrics";
import NotFoundAlert from "@/components/ui/not-found";
import Time from "@/components/ui/time";
import { NO_USERNAME } from "@/configs/constants";
import { SITE_PAGES } from "@/configs/routes";
import { getTaskList } from "@/lib/api";
import { handleError } from "@/lib/error";
import { ResponseObject, TaskResponse } from "@/types/api.types";
import { getTaskKindColor, getTaskStatusColor } from "@/utils/colors";

export default function TaskListPage() {
  const [tasks, setTasks] = useState<ResponseObject<TaskResponse[]>>({
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

  function handleNextPageClick() {
    if (tasks.pagination?.next_page && tasks.pagination.next_page !== page) {
      setPage(tasks.pagination.next_page);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function fetchTasks(pageNum: number) {
      setLoading(true);
      try {
        const response = await getTaskList(pageNum);
        if (!ignore && response.data) {
          setTasks((prevTasks) => {
            return {
              data: [...prevTasks.data, ...response.data],
              pagination: response.pagination,
            };
          });
        }
      } catch (err) {
        handleError(err);
        setIsError(true);
      } finally {
        setLoading(false);
      }
    }
    void fetchTasks(page);

    return () => {
      ignore = true;
    };
  }, [page]);

  if (loading && tasks.data.length === 0) {
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

  if (tasks.data.length === 0) {
    return (
      <NotFoundAlert
        title="No tasks available!"
        description="Please check back later."
      />
    );
  }

  return (
    <div className="space-y-10">
      <Link href={SITE_PAGES.CREATE_TASK}>
        <div className="flex justify-center mx-auto">
          <Button className="w-full max-w-7xl py-8">
            <CirclePlus className="size-9 mr-2 my-4" />
            <p className="text-xl font-bold">Create Task</p>
          </Button>
        </div>
      </Link>
      {tasks.data.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
      {loading && <Loading />}
      {!loading && tasks.pagination?.next_page && (
        <ArrowBigDownDash
          className="size-10 mx-auto cursor-pointer animate-bounce"
          onClick={handleNextPageClick}
        />
      )}
    </div>
  );
}

function TaskCard({ task }: { task: TaskResponse }) {
  const [_location, setLocation] = useLocation();
  const username = task.createdBy?.username ?? NO_USERNAME;
  const kindColor = getTaskKindColor(task.kind);
  const statusColor = getTaskStatusColor(task.status);

  return (
    <Card
      className={`max-w-7xl mx-auto relative cursor-pointer ${statusColor.background}`}
      onClick={() => setLocation(SITE_PAGES.VIEW_TASK.replace(":id", task.id))}
    >
      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
        <Badge variant="outline" className={`${kindColor} pb-[0.25rem]`}>
          {task.kind}
        </Badge>
      </div>
      {task.status !== "active" && (
        <div className="absolute right-0 top-8 rotate-[30deg]">
          <Badge
            variant="secondary"
            className={`pb-[0.25rem] w-32 justify-center text-sm ring-offset-2 ring-1 ${statusColor.border} ring-secondary-foreground`}
          >
            {task.status}
          </Badge>
        </div>
      )}
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
      <CardContent className="space-y-4">
        <CardTitle className="text-2xl font-bold line-clamp-2 break-words">
          {task.title}
        </CardTitle>
        <p className="line-clamp-2 break-words">{task.details}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <div className="flex items-center">
          <OverallMetric
            metric={`${task.metrics.overall.totalFunds.toLocaleString()} Kin`}
            label="Total Funds"
          />
          <OverallMetric
            metric={task.metrics.overall.totalVotes.toString()}
            label="Total Solution Votes"
          />
        </div>
        {task.metrics?.user && (
          <div className="flex items-center">
            <UserMetric
              metric={`${task.metrics.user.totalFunds.toLocaleString()} Kin`}
              label="Your Fund Contribution"
            />
            <UserMetric
              metric={task.metrics.user.totalVotes.toString()}
              label="Your Votes Cast"
            />
            <UserMetric
              metric={task.metrics.user.votingRights.toString()}
              label="Your Available Votes"
            />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
