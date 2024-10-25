import {
  CalendarIcon,
  CircleSlash,
  CoinsIcon,
  Copy,
  TrophyIcon,
  WalletIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "wouter";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Time from "@/components/ui/time";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getTaskById } from "@/lib/api";
import { handleError } from "@/lib/error";
import SubmissionSection from "@/pages/task/view/submissions";
import { TaskResponse } from "@/types/api.types";
import { getTaskKindColor } from "@/utils/colors";

export default function TaskViewPage() {
  const [task, setTask] = useState<TaskResponse>();
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const taskId = params.id;

  useEffect(() => {
    let ignore = false;

    async function fetchTask() {
      setLoading(true);
      try {
        if (taskId !== undefined) {
          const response = await getTaskById(taskId);
          if (!ignore && response.data) {
            setTask(response.data);
          }
        }
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    }
    void fetchTask();

    return () => {
      ignore = true;
    };
  }, [taskId]);

  if (loading) {
    return <Loading />;
  }

  if (!task) {
    return (
      <Alert className="max-w-lg mx-auto">
        <CircleSlash className="size-5" />
        <AlertTitle>Task not found!</AlertTitle>
        <AlertDescription>
          Please check the task ID and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen space-y-4">
      <TaskDisplay task={task} />
      <SubmissionSection taskId={task.id} />
    </div>
  );
}

function TaskDisplay({ task }: { task: TaskResponse }) {
  const username = task.createdBy?.username ?? "anonymous";
  const kindColor = getTaskKindColor(task.kind);

  return (
    <Card className="max-w-7xl mx-auto relative">
      <div className="absolute top-4 right-4">
        <Badge variant="outline" className={kindColor}>
          {task.kind}
        </Badge>
      </div>
      <CardHeader>
        <div className="space-y-2">
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
      </CardHeader>
      <CardContent className="space-y-4">
        <CardTitle className="text-2xl font-bold">{task.title}</CardTitle>
        <p>{task.details}</p>

        {/* <div className="flex items-center">
          <CheckCircleIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">Status:</span>
          <Badge variant="outline" className="ml-2">
            {task.status}
          </Badge>
        </div> */}
      </CardContent>
      <div className="border-t border px-6 py-4 md:flex grid gap-2 justify-center md:justify-between items-center">
        <div className="flex items-center justify-center">
          <WalletIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Address:</span>
          <span className="ml-2 font-mono text-sm">
            {task.depositAddress
              ? `${task.depositAddress.slice(0, 5)}...${task.depositAddress.slice(-5)}`
              : "no wallet found"}
          </span>
          {task.depositAddress && (
            <CopyAddressButton address={task.depositAddress} />
          )}
        </div>
        <Badge variant="secondary" className="flex items-center justify-center">
          <CoinsIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-lg">Funds:</span>
          <span className="ml-2 text-lg">
            {`${task.fundsRaised.toLocaleString()} kin`}
          </span>
        </Badge>
        <div className="flex items-center justify-center">
          <TrophyIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Max Winners:</span>
          <span className="ml-2 text-sm">{task.maxWinners}</span>
        </div>
      </div>
    </Card>
  );
}

function CopyAddressButton({ address }: { address: string }) {
  const [clipboardCopyTooltip, setClipboardCopyTooltip] =
    useState("Copy to Clipboard");

  function clickHandler() {
    navigator.clipboard
      .writeText(address)
      .then(() => setClipboardCopyTooltip("Copied"))
      .catch(() => setClipboardCopyTooltip("Failed to Copy"))
      .finally(() => {
        setTimeout(() => {
          setClipboardCopyTooltip("Copy to Clipboard");
        }, 5000);
      });
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <Copy
            className="h-4 w-4 ml-1 text-muted-foreground"
            onClick={clickHandler}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{clipboardCopyTooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
