import {
  ArrowBigDownDash,
  CalendarIcon,
  CheckCircleIcon,
  CirclePlus,
  OctagonX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import NotFoundAlert from "@/components/ui/not-found";
import Time from "@/components/ui/time";
import { SITE_PAGES } from "@/configs/routes";
import { getTaskList } from "@/lib/api";
import { handleError } from "@/lib/error";
import { ResponseObject, TaskResponse } from "@/types/api.types";
import { getTaskKindColor } from "@/utils/colors";

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
    <div className="space-y-4">
      <Link href={SITE_PAGES.CREATE_TASK}>
        <Button className="w-full py-8">
          <CirclePlus className="size-9 mr-2 my-4" />
          <p className="text-xl font-bold">Create Task</p>
        </Button>
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
  const username = task.createdBy?.username ?? "anonymous";
  const kindColor = getTaskKindColor(task.kind);

  return (
    <Card
      className="max-w-7xl mx-auto relative cursor-pointer"
      onClick={() => setLocation(SITE_PAGES.VIEW_TASK.replace(":id", task.id))}
    >
      <div className=" px-6 py-4 md:flex grid gap-2 justify-center md:justify-between items-center text-sm">
        <div className="flex items-center justify-center space-x-2">
          <Avatar>
            <AvatarFallback>
              {`${username[0].toUpperCase()}${username[1].toUpperCase()}`}
            </AvatarFallback>
          </Avatar>
          <span>{username}</span>
        </div>
        <div className="flex items-center justify-center">
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <Time timestamp={new Date(task.createdAt)} />
        </div>
        <div className="flex items-center justify-center">
          <Badge variant="outline" className={kindColor}>
            {task.kind}
          </Badge>
        </div>
      </div>
      <CardContent className="space-y-4">
        <CardTitle className="text-2xl font-bold">{task.title}</CardTitle>
        <p className="line-clamp-2">{task.details}</p>

        <div className="flex items-center">
          <CheckCircleIcon className="mr-1 h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="ml-1">
            {task.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
