import { CalendarIcon, Copy, TrophyIcon, WalletIcon } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "wouter";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import NotFoundAlert from "@/components/ui/not-found";
import Time from "@/components/ui/time";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fundTask, getTaskById } from "@/lib/api";
import { handleError } from "@/lib/error";
import FundingPopup from "@/pages/task/view/components/funding";
import SolutionCreator from "@/pages/task/view/components/solution-create";
import SolutionsList from "@/pages/task/view/components/solution-view";
import { SolutionResponse, TaskResponse } from "@/types/api.types";
import { getTaskKindColor } from "@/utils/colors";

export default function TaskViewPage() {
  const [task, setTask] = useState<TaskResponse>();
  const [loading, setLoading] = useState(true);
  const [userVotingRights, setUserVotingRights] = useState<number | null>(null);
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
            setUserVotingRights(
              response.data.metrics.user?.votingRights ?? null,
            );
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

  function handleFundConfirm(amount: number) {
    async function func() {
      try {
        if (task) {
          const res = await toast.promise(fundTask(task.id, amount), {
            pending: "Funding task...",
            success: "Funding successful",
          });
          if (res) {
            setUserVotingRights(res.data.metrics.user?.votingRights ?? null);
            setTask(res.data);
          }
        }
      } catch (err) {
        handleError(err, "Funding failed!");
      }
    }
    void func();
  }

  if (loading) {
    return <Loading />;
  }

  if (!task) {
    return (
      <NotFoundAlert
        title="Task not found!"
        description="Please check the task ID and try again."
      />
    );
  }

  return (
    <div className="min-h-screen space-y-4">
      <TaskDisplay task={task} handleFundConfirm={handleFundConfirm} />
      <SolutionSection
        taskId={task.id}
        userVotingRights={userVotingRights}
        setUserVotingRights={setUserVotingRights}
      />
    </div>
  );
}

function TaskDisplay({
  task,
  handleFundConfirm,
}: {
  task: TaskResponse;
  handleFundConfirm: (amount: number) => void;
}) {
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
        <FundingPopup
          totalFunds={task.metrics.overall.totalFunds}
          depositAddress={task.depositAddress}
          handleFundConfirm={handleFundConfirm}
        />
        <div className="flex items-center justify-center">
          <TrophyIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Max Winners:</span>
          <span className="ml-2 text-sm">{task.maxWinners}</span>
        </div>
      </div>
      <TaskMetrics metrics={task.metrics} />
    </Card>
  );
}

function TaskMetrics({ metrics }: { metrics: TaskResponse["metrics"] }) {
  return (
    <div className="flex justify-between">
      <div className="bg-secondary-foreground max-w-1/2 p-2 m-4 rounded-xl shadow-md">
        <h3 className="text-sm font-medium text-secondary mb-1">
          Your Available Votes
        </h3>
        <p className="text-3xl font-bold text-primary">
          {metrics.user?.votingRights ?? 0}
        </p>
      </div>
    </div>
  );
}

function CopyAddressButton({ address }: { address: string }) {
  const [clipboardCopyTooltip, setClipboardCopyTooltip] =
    useState("Copy to Clipboard");
  const [open, setOpen] = useState(false);

  function clickHandler() {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        setOpen(true);
        setClipboardCopyTooltip("Copied");
        setTimeout(() => {
          setOpen(false);
          setTimeout(() => {
            setClipboardCopyTooltip("Copy to Clipboard");
          }, 3000);
        }, 1000);
      })
      .catch(() => setClipboardCopyTooltip("Failed to Copy"));
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger>
          <Copy
            className="h-4 w-4 ml-1 text-muted-foreground"
            onClick={clickHandler}
            onTouchStart={clickHandler}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{clipboardCopyTooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SolutionSection({
  taskId,
  userVotingRights,
  setUserVotingRights,
}: {
  taskId: TaskResponse["id"];
  userVotingRights: number | null;
  setUserVotingRights: Dispatch<SetStateAction<number | null>>;
}) {
  const [newSolution, setNewSolution] = useState<SolutionResponse | null>(null);
  return (
    <>
      <SolutionCreator taskId={taskId} setNewSolution={setNewSolution} />
      <SolutionsList
        taskId={taskId}
        newSolution={newSolution}
        userVotingRights={userVotingRights}
        setUserVotingRights={setUserVotingRights}
      />
    </>
  );
}
