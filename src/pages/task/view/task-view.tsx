import { CalendarIcon, Copy, TrophyIcon, WalletIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "wouter";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { OverallMetric, UserMetric } from "@/components/ui/metrics";
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
import {
  SolutionResponse,
  TaskResponse,
  UserResponse,
} from "@/types/api.types";
import { TaskKind } from "@/types/task.types";
import { getTaskKindColor } from "@/utils/colors";
import { NO_USERNAME } from "@/configs/constants";

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

  function handleFundConfirm(amount: number) {
    async function func() {
      try {
        if (task) {
          const res = await toast.promise(fundTask(task.id, amount), {
            pending: "Funding task...",
            success: "Funding successful",
          });
          if (res) {
            setTask(res.data);
            updateUserVotingRights(res.data.metrics.user?.votingRights ?? null);
            setTotalFunds(res.data.metrics.overall.totalFunds);
            setTotalVotes(res.data.metrics.overall.totalVotes);
            setUserTotalFunds(res.data.metrics.user?.totalFunds ?? 0);
            setUserTotalVotes(res.data.metrics.user?.totalVotes ?? 0);
          }
        }
      } catch (err) {
        handleError(err, "Funding failed!");
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
        createdBy={task.createdBy}
        title={task.title}
        details={task.details}
        kind={task.kind}
        depositAddress={task.depositAddress}
        createdAt={task.createdAt}
        maxWinners={task.maxWinners}
        totalFunds={totalFunds}
        totalVotes={totalVotes}
        userTotalFunds={userTotalFunds}
        userTotalVotes={userTotalVotes}
        userVotingRights={userVotingRights}
        handleFundConfirm={handleFundConfirm}
      />
      <SolutionSection
        taskId={task.id}
        userVotingRights={userVotingRights}
        updateUserVotingRights={updateUserVotingRights}
        updateVoteCounts={updateVoteCounts}
      />
    </div>
  );
}

function TaskDisplay({
  createdBy,
  title,
  details,
  kind,
  depositAddress,
  createdAt,
  maxWinners,
  totalFunds,
  totalVotes,
  userTotalFunds,
  userTotalVotes,
  userVotingRights,
  handleFundConfirm,
}: {
  createdBy: UserResponse | null;
  title: string | null;
  details: string | null;
  kind: TaskKind;
  depositAddress: string | null;
  createdAt: string;
  maxWinners: number;
  totalFunds: number;
  totalVotes: number;
  userTotalFunds: number;
  userTotalVotes: number;
  userVotingRights: number | null;
  handleFundConfirm: (amount: number) => void;
}) {
  const username = createdBy?.username ?? NO_USERNAME;
  const kindColor = getTaskKindColor(kind);

  return (
    <>
      <Card className="max-w-7xl mx-auto relative">
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className={kindColor}>
            {kind}
          </Badge>
        </div>
        <CardHeader>
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
        </CardHeader>
        <CardContent className="space-y-4">
          <CardTitle className="text-2xl font-bold break-words">
            {title}
          </CardTitle>
          <p className="break-words">{details}</p>

          {/* <div className="flex items-center">
          <CheckCircleIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">Status:</span>
          <Badge variant="outline" className="ml-2">
            {task.status}
          </Badge>
        </div> */}

          <div className="flex justify-end">
            <OverallMetric
              metric={totalVotes.toString()}
              label="Total Solution Votes"
            />
          </div>
        </CardContent>
        <div className="border-4 px-6 py-4 md:flex grid gap-2 m-2 justify-center md:justify-between items-center">
          <div className="flex items-center justify-center">
            <WalletIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Address:</span>
            <span className="ml-2 font-mono text-sm">
              {depositAddress
                ? `${depositAddress.slice(0, 5)}...${depositAddress.slice(-5)}`
                : "no wallet found"}
            </span>
            {depositAddress && <CopyAddressButton address={depositAddress} />}
          </div>
          <FundingPopup
            totalFunds={totalFunds}
            depositAddress={depositAddress}
            handleFundConfirm={handleFundConfirm}
          />
          <div className="flex items-center justify-center">
            <TrophyIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Max Winners:</span>
            <span className="ml-2 text-sm">{maxWinners}</span>
          </div>
        </div>
      </Card>
      {userVotingRights !== null && (
        <>
          <div className="flex justify-center">
            <UserMetric
              metric={`${userTotalFunds.toString()} Kin`}
              label="Your Fund Contribution"
              className="border-4 ring-offset-2 ring-1 border-cyan-800 ring-offset-cyan-700 ring-cyan-600"
            />
          </div>
          <div className="sticky top-16 z-10 bg-backgroundTransparent">
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
        </>
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
  userVotingRights,
  updateUserVotingRights,
  updateVoteCounts,
}: {
  taskId: TaskResponse["id"];
  userVotingRights: number | null;
  updateUserVotingRights: (newRights: number | null) => void;
  updateVoteCounts: (newVotes: number) => void;
}) {
  const [newSolution, setNewSolution] = useState<SolutionResponse | null>(null);
  return (
    <>
      <SolutionCreator taskId={taskId} setNewSolution={setNewSolution} />
      <SolutionsList
        taskId={taskId}
        newSolution={newSolution}
        userVotingRights={userVotingRights}
        updateUserVotingRights={updateUserVotingRights}
        updateVoteCounts={updateVoteCounts}
      />
    </>
  );
}
