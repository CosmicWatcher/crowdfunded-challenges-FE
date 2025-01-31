import { CalendarIcon, Copy, TrophyIcon, WalletIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "wouter";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { OverallMetric, UserMetric } from "@/components/ui/metrics";
import NotFoundAlert from "@/components/ui/not-found";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Time from "@/components/ui/time";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NO_USERNAME } from "@/configs/constants";
import { useUserId } from "@/hooks/useUserId";
import { endTask, getTaskById } from "@/lib/api";
import { handleError } from "@/lib/error";
import { notifySuccess } from "@/lib/notification";
import FundingPopup from "@/pages/task/view/components/funding";
import SolutionCreator from "@/pages/task/view/components/solution-create";
import SolutionsList from "@/pages/task/view/components/solution-view";
import {
  SolutionResponse,
  TaskResponse,
  UserResponse,
} from "@/types/api.types";
import { TaskKind, TaskStatus } from "@/types/misc.types";
import { getTaskKindColor, getTaskStatusColor } from "@/utils/colors";

export default function TaskViewPage() {
  const [task, setTask] = useState<TaskResponse>();
  const [loading, setLoading] = useState(true);
  const [userVotingRights, setUserVotingRights] = useState<number | null>(null);
  const [totalFunds, setTotalFunds] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [userTotalFunds, setUserTotalFunds] = useState(0);
  const [userTotalVotes, setUserTotalVotes] = useState(0);
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
            updateUserVotingRights(
              response.data.metrics.user?.votingRights ?? null,
            );
            setTotalFunds(response.data.metrics.overall.totalFunds);
            setTotalVotes(response.data.metrics.overall.totalVotes);
            setUserTotalFunds(response.data.metrics.user?.totalFunds ?? 0);
            setUserTotalVotes(response.data.metrics.user?.totalVotes ?? 0);
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

  function handleEndTask(isSuccess: boolean) {
    async function func() {
      try {
        if (task) {
          const res = await toast.promise(endTask(task.id, isSuccess), {
            pending: "Ending task...",
            success: "Task Has Ended",
          });
          if (res.message) notifySuccess(res.message);
          setTask(res.data);
        }
      } catch (err) {
        handleError(err, "Ending task failed!");
      }
    }
    void func();
  }

  function updateUserVotingRights(newRights: number | null) {
    setUserVotingRights(newRights);
  }

  function updateVoteCounts(newVotes: number) {
    setTotalVotes((prev) => prev + newVotes);
    setUserTotalVotes((prev) => prev + newVotes);
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
      <TaskDisplay
        taskId={task.id}
        createdBy={task.createdBy}
        title={task.title}
        details={task.details}
        kind={task.kind}
        status={task.status}
        depositAddress={task.depositAddress}
        createdAt={task.createdAt}
        endedAt={task.endedAt}
        maxWinners={task.maxWinners}
        totalFunds={totalFunds}
        totalVotes={totalVotes}
        userTotalFunds={userTotalFunds}
        userTotalVotes={userTotalVotes}
        userVotingRights={userVotingRights}
        handleEndTask={handleEndTask}
      />
      <SolutionSection
        taskId={task.id}
        taskKind={task.kind}
        taskStatus={task.status}
        taskCreatorId={task.createdBy?.id ?? ""}
        userVotingRights={userVotingRights}
        updateUserVotingRights={updateUserVotingRights}
        updateVoteCounts={updateVoteCounts}
      />
    </div>
  );
}

function TaskDisplay({
  taskId,
  createdBy,
  title,
  details,
  kind,
  status,
  depositAddress,
  createdAt,
  endedAt,
  maxWinners,
  totalFunds,
  totalVotes,
  userTotalFunds,
  userTotalVotes,
  userVotingRights,
  handleEndTask,
}: {
  taskId: TaskResponse["id"];
  createdBy: UserResponse | null;
  title: string | null;
  details: string | null;
  kind: TaskKind;
  status: TaskStatus;
  depositAddress: string | null;
  createdAt: string;
  endedAt: string | null;
  maxWinners: number;
  totalFunds: number;
  totalVotes: number;
  userTotalFunds: number;
  userTotalVotes: number;
  userVotingRights: number | null;
  handleEndTask: (isSuccess: boolean) => void;
}) {
  const authUserId = useUserId();
  const username = createdBy?.username ?? NO_USERNAME;
  const kindColor = getTaskKindColor(kind);
  const statusColor = getTaskStatusColor(status);

  return (
    <>
      <Card className={`max-w-7xl mx-auto relative ${statusColor.background}`}>
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
          <Badge variant="outline" className={`${kindColor} pb-[0.25rem]`}>
            {kind}
          </Badge>
        </div>
        {status !== "active" && (
          <div className="absolute -left-2 bottom-8 rotate-[30deg]">
            <Badge
              variant="secondary"
              className={`pb-[0.25rem] w-40 justify-center text-sm ring-offset-2 ring-1 ${statusColor.border} ring-secondary-foreground`}
            >
              {status}
            </Badge>
          </div>
        )}
        <CardHeader>
          <div className="flex justify-end pb-4 px-0 mx-0">
            <OverallMetric
              metric={`${totalFunds.toLocaleString(undefined, { maximumFractionDigits: 0 })} Kin`}
              label="Funds"
              className="mr-1"
            />
            {userVotingRights !== null && (
              <div className="flex justify-center">
                <UserMetric
                  metric={`${userTotalFunds.toLocaleString(undefined, { maximumFractionDigits: 0 })} Kin`}
                  label="Your Contribution"
                  className="ml-0 mr-1"
                />
              </div>
            )}
            <OverallMetric
              metric={totalVotes.toString()}
              label="Solution Votes"
              className="mx-0"
            />
          </div>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <Time timestamp={new Date(createdAt)} />
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
            {endedAt && (
              <Badge variant="destructive" className="text-md">
                <p className="mr-1">End</p>
                <Time timestamp={new Date(endedAt)} />
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardTitle className="text-2xl font-bold break-words">
            {title}
          </CardTitle>
          <p className="break-words whitespace-pre-wrap">{details}</p>
          <div className="flex justify-end">
            {authUserId === createdBy?.id && status === "active" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button>End Task</Button>
                </PopoverTrigger>
                <PopoverContent className="flex justify-between">
                  <Button
                    className="bg-green-700 hover:bg-green-800 w-24"
                    onClick={() => handleEndTask(true)}
                  >
                    Success
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-24"
                    onClick={() => handleEndTask(false)}
                  >
                    Fail
                  </Button>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </CardContent>
        <div className="border-4 px-6 py-4 m-2">
          <div className="md:flex grid gap-2 justify-center md:justify-between items-center">
            <div className="flex items-center justify-center">
              {status === "active" ? (
                <>
                  <WalletIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">Address:</span>
                  <span className="ml-2 font-mono text-sm">
                    {depositAddress
                      ? `${depositAddress.slice(0, 5)}...${depositAddress.slice(-5)}`
                      : "no wallet found"}
                  </span>
                  {depositAddress && (
                    <CopyAddressButton address={depositAddress} />
                  )}
                </>
              ) : (
                <span className="w-32"></span>
              )}
            </div>
            <FundingPopup
              totalFunds={totalFunds}
              depositAddress={depositAddress}
              taskCreatorId={createdBy?.id ?? ""}
              taskId={taskId}
              taskKind={kind}
              taskStatus={status}
            />
            <div className="flex items-center justify-center order-first md:order-none">
              <TrophyIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">Max Winners:</span>
              <span className="ml-2 text-sm">{maxWinners}</span>
            </div>
          </div>
          {userVotingRights !== null && (
            <div className="flex justify-center">
              <UserMetric
                metric={`${userTotalFunds.toLocaleString(undefined, { maximumFractionDigits: 0 })} Kin`}
                label="Your Contribution"
                className="mb-0"
              />
            </div>
          )}
        </div>
      </Card>
      {userVotingRights !== null && (
        <div className="sticky top-16 z-10 max-w-7xl mx-auto rounded-full bg-backgroundTransparent">
          <div className="flex justify-evenly">
            <UserMetric
              metric={userVotingRights.toString()}
              label="Your Available Votes"
              className="border-4 ring-offset-2 ring-1 border-cyan-800 ring-offset-cyan-700 ring-cyan-600"
            />
            <UserMetric
              metric={userTotalVotes.toString()}
              label="Your Votes Cast"
              className="border-4 ring-offset-2 ring-1 border-cyan-800 ring-offset-cyan-700 ring-cyan-600"
            />
          </div>
        </div>
      )}
    </>
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
  taskKind,
  taskStatus,
  taskCreatorId,
  userVotingRights,
  updateUserVotingRights,
  updateVoteCounts,
}: {
  taskId: TaskResponse["id"];
  taskKind: TaskResponse["kind"];
  taskStatus: TaskResponse["status"];
  taskCreatorId: NonNullable<TaskResponse["createdBy"]>["id"];
  userVotingRights: number | null;
  updateUserVotingRights: (newRights: number | null) => void;
  updateVoteCounts: (newVotes: number) => void;
}) {
  const [newSolution, setNewSolution] = useState<SolutionResponse | null>(null);
  return (
    <>
      {taskStatus === "active" && (
        <SolutionCreator taskId={taskId} setNewSolution={setNewSolution} />
      )}
      <SolutionsList
        taskId={taskId}
        taskKind={taskKind}
        taskStatus={taskStatus}
        taskCreatorId={taskCreatorId}
        newSolution={newSolution}
        userVotingRights={userVotingRights}
        updateUserVotingRights={updateUserVotingRights}
        updateVoteCounts={updateVoteCounts}
      />
    </>
  );
}
