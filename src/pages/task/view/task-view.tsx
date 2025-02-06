import {
  CalendarIcon,
  Copy,
  Share2Icon,
  TrophyIcon,
  WalletIcon,
} from "lucide-react";
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
import { getTaskById, settleTask } from "@/lib/api";
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
  const [taskId, setTaskId] = useState<string>();
  const [createdBy, setCreatedBy] = useState<UserResponse | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [details, setDetails] = useState<string | null>(null);
  const [kind, setKind] = useState<TaskKind>("community");
  const [status, setStatus] = useState<TaskStatus>("active");
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string>("");
  const [endedAt, setEndedAt] = useState<string | null>(null);
  const [maxWinners, setMaxWinners] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [userVotingRights, setUserVotingRights] = useState<number | null>(null);
  const [totalFunds, setTotalFunds] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [userTotalFunds, setUserTotalFunds] = useState(0);
  const [userTotalVotes, setUserTotalVotes] = useState(0);
  const params = useParams();
  const paramTaskId = params.id;

  useEffect(() => {
    let ignore = false;

    async function fetchTask() {
      setLoading(true);
      try {
        if (paramTaskId !== undefined) {
          const response = await getTaskById(paramTaskId);
          if (!ignore && response.data) {
            const task = response.data;
            setTaskId(task.id);
            setCreatedBy(task.createdBy);
            setTitle(task.title);
            setDetails(task.details);
            setKind(task.kind);
            setStatus(task.status);
            setDepositAddress(task.depositAddress);
            setCreatedAt(task.createdAt);
            setEndedAt(task.endedAt);
            setMaxWinners(task.maxWinners);
            updateUserVotingRights(task.metrics.user?.votingRights ?? null);
            setTotalFunds(task.metrics.overall.totalFunds);
            setTotalVotes(task.metrics.overall.totalVotes);
            setUserTotalFunds(task.metrics.user?.totalFunds ?? 0);
            setUserTotalVotes(task.metrics.user?.totalVotes ?? 0);
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
  }, [paramTaskId]);

  function handleSettleTask(isSuccess: boolean) {
    async function func() {
      try {
        if (taskId) {
          const res = await toast.promise(settleTask(taskId, isSuccess), {
            pending: "Setting task outcome...",
            success: "Task Outcome Set",
          });
          if (res.message) notifySuccess(res.message);
          const task = res.data;
          setTaskId(task.id);
          setCreatedBy(task.createdBy);
          setTitle(task.title);
          setDetails(task.details);
          setKind(task.kind);
          setStatus(task.status);
          setDepositAddress(task.depositAddress);
          setCreatedAt(task.createdAt);
          setEndedAt(task.endedAt);
          setMaxWinners(task.maxWinners);
        }
      } catch (err) {
        handleError(err, "Setting task outcome failed!");
      }
    }
    void func();
  }

  function onTaskEnd() {
    setStatus("ended");
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

  if (!taskId || status === "deleted") {
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
        taskId={taskId}
        createdBy={createdBy}
        title={title}
        details={details}
        kind={kind}
        status={status}
        depositAddress={depositAddress}
        createdAt={createdAt}
        endedAt={endedAt}
        maxWinners={maxWinners}
        totalFunds={totalFunds}
        totalVotes={totalVotes}
        userTotalFunds={userTotalFunds}
        userTotalVotes={userTotalVotes}
        userVotingRights={userVotingRights}
        handleSettleTask={handleSettleTask}
        onTaskEnd={onTaskEnd}
      />
      <SolutionSection
        taskId={taskId}
        taskKind={kind}
        taskStatus={status}
        taskCreatorId={createdBy?.id ?? ""}
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
  handleSettleTask,
  onTaskEnd,
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
  handleSettleTask: (isSuccess: boolean) => void;
  onTaskEnd: () => void;
}) {
  const authUserId = useUserId();
  const username = createdBy?.username ?? NO_USERNAME;
  const kindColor = getTaskKindColor(kind);
  const statusColor = getTaskStatusColor(status);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (endedAt && status === "active") {
      interval = setInterval(() => {
        if (
          endedAt &&
          status === "active" &&
          new Date().getTime() - new Date(endedAt).getTime() > 0
        ) {
          onTaskEnd();
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [endedAt, onTaskEnd, status]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title ?? "Task Details",
          text: `Check out this task: ${title}`,
          url: window.location.href,
        });
      } else {
        // Fallback for desktop or browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      // User cancelled share operation or something went wrong
      console.error("Error sharing:", error);
    }
  };

  return (
    <>
      <Card className={`max-w-7xl mx-auto relative ${statusColor.background}`}>
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
          <Badge variant="outline" className={`${kindColor} py-[0.25rem]`}>
            {kind}
          </Badge>
        </div>
        {status !== "active" && (
          <div className="absolute -left-2 bottom-8 rotate-[30deg]">
            <Badge
              variant="secondary"
              className={`pb-[0.25rem] w-40 justify-center text-sm ring-offset-2 ring-1 ${statusColor.border} ring-secondary-foreground`}
            >
              {status.toUpperCase()}
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
              <Badge
                variant={status === "active" ? "destructive" : "secondary"}
                className={status === "active" ? "text-md" : "text-sm"}
              >
                <p className="mr-1">{status === "active" ? "Ends" : "Ended"}</p>
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
          <div className="flex justify-end gap-6">
            {authUserId === createdBy?.id && status === "ended" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button>Choose Outcome</Button>
                </PopoverTrigger>
                <PopoverContent className="flex justify-between">
                  <Button
                    className="bg-green-700 hover:bg-green-800 w-24"
                    onClick={() => handleSettleTask(true)}
                  >
                    Success
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-24"
                    onClick={() => handleSettleTask(false)}
                  >
                    Fail
                  </Button>
                </PopoverContent>
              </Popover>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => void handleShare()}
              className="rounded-full"
            >
              <Share2Icon className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
        <div className="border-4 px-6 py-4 m-2">
          <div className="md:flex grid gap-2 justify-center md:justify-between items-center">
            <div className="flex items-center justify-center">
              {status === "active" || status === "ended" ? (
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
