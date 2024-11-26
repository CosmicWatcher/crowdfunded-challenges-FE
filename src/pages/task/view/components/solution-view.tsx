import { ArrowBigDownDash, CalendarIcon, OctagonX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "wouter";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loading } from "@/components/ui/loading";
import { OverallMetric, UserMetric } from "@/components/ui/metrics";
import NotFoundAlert from "@/components/ui/not-found";
import { ScrollArea } from "@/components/ui/scroll-area";
import Time from "@/components/ui/time";
import { NO_USERNAME } from "@/configs/constants";
import { SITE_PAGES } from "@/configs/routes";
import useUserId from "@/hooks/useUserId";
import { getSolutionList, voteForSolution } from "@/lib/api";
import { handleError } from "@/lib/error";
import VotingPopup from "@/pages/task/view/components/voting";
import {
  ResponseObject,
  SolutionResponse,
  SolutionVoteResponse,
  TaskResponse,
  UserResponse,
} from "@/types/api.types";

export default function SolutionsList({
  taskId,
  taskKind,
  taskStatus,
  taskCreatorId,
  newSolution,
  userVotingRights,
  updateUserVotingRights,
  updateVoteCounts,
}: {
  taskId: TaskResponse["id"];
  taskKind: TaskResponse["kind"];
  taskStatus: TaskResponse["status"];
  taskCreatorId: NonNullable<TaskResponse["createdBy"]>["id"];
  newSolution: SolutionResponse | null;
  userVotingRights: number | null;
  updateUserVotingRights: (newRights: number | null) => void;
  updateVoteCounts: (newVotes: number) => void;
}) {
  const [solutions, setSolutions] = useState<
    ResponseObject<SolutionResponse[]>
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
  const [topSolutions, setTopSolutions] = useState<
    SolutionVoteResponse["topSolutions"]
  >([]);
  const [openDialog, setOpenDialog] = useState(false);

  function handleNextPageClick() {
    if (
      solutions.pagination?.next_page &&
      solutions.pagination.next_page !== page
    ) {
      setPage(solutions.pagination.next_page);
    }
  }

  useEffect(() => {
    if (newSolution) {
      setSolutions((prevSolutions) => {
        return {
          data: [newSolution, ...prevSolutions.data],
          pagination: prevSolutions.pagination,
        };
      });
    }
  }, [taskId, newSolution]);

  // Fetch solutions based on page number
  useEffect(() => {
    let ignore = false;
    async function fetchSolutions(pageNum: number) {
      setLoading(true);
      try {
        const response = await getSolutionList(taskId, pageNum);
        if (!ignore && response.data) {
          setSolutions((prevSolutions) => {
            // Remove duplicates from prevSolutions
            const filteredPrevSolutions = prevSolutions.data.filter(
              (prevSub) =>
                !response.data.some((newSub) => newSub.id === prevSub.id),
            );
            return {
              data: [...filteredPrevSolutions, ...response.data],
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
    void fetchSolutions(page);
    return () => {
      ignore = true;
    };
  }, [page, taskId]);

  function handleVoteConfirm(solutionId: string, amount: number) {
    async function vote() {
      try {
        const res = await toast.promise(voteForSolution(solutionId, amount), {
          pending: "Voting for solution...",
          success: "Vote successfully recorded",
        });
        setSolutions((prevSolutions) => {
          return {
            data: prevSolutions.data.map((solution) => {
              if (solution.id === solutionId) {
                return {
                  ...solution,
                  userVoteMetrics: res.data.userVoteMetrics,
                };
              } else {
                return solution;
              }
            }),
            pagination: prevSolutions.pagination,
          };
        });
        updateUserVotingRights(res.data.userVoteMetrics.votingRights);
        updateVoteCounts(amount);
        setTopSolutions(res.data.topSolutions);
        setOpenDialog(true);
      } catch (err) {
        handleError(err, "Voting failed!");
      }
    }
    void vote();
  }

  if (loading && solutions.data.length === 0) {
    return <Loading />;
  }
  if (isError) {
    return (
      <Alert className="max-w-lg mx-auto">
        <OctagonX className="size-5" />
        <AlertTitle>Error fetching solutions!</AlertTitle>
        <AlertDescription>Please check back later.</AlertDescription>
      </Alert>
    );
  }
  if (solutions.data.length === 0) {
    return (
      <NotFoundAlert
        title="No solutions available."
        description="Please check back later."
      />
    );
  }

  return (
    <>
      <Card className="max-w-7xl mx-auto bg-secondary">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">Solutions</CardTitle>
        </CardHeader>
        <CardContent className="px-1.5">
          <div className="space-y-8">
            {solutions.data.map((solution) => {
              return (
                <SolutionCard
                  key={solution.id}
                  taskKind={taskKind}
                  taskStatus={taskStatus}
                  taskCreatorId={taskCreatorId}
                  solutionId={solution.id}
                  createdBy={solution.createdBy}
                  createdAt={solution.createdAt}
                  title={solution.title}
                  details={solution.details}
                  userVotingRights={userVotingRights}
                  totalVotesByUser={
                    solution.userVoteMetrics?.totalVotes ?? null
                  }
                  handleVoteConfirm={handleVoteConfirm}
                />
              );
            })}
            {loading && <Loading />}
            {!loading && solutions.pagination?.next_page && (
              <ArrowBigDownDash
                className="size-10 mx-auto cursor-pointer animate-bounce"
                onClick={handleNextPageClick}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-secondary rounded-3xl max-w-3xl w-full h-fit max-h-[80vh] px-1 overflow-hidden flex flex-col">
          <DialogHeader className="flex flex-col justify-center items-center">
            <DialogTitle>Top Solutions</DialogTitle>
            <DialogDescription>
              Solutions ranked by total votes received
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="rounded-3xl p-2 bg-primary flex-grow overflow-y-auto">
            <div className="grid gap-2">
              {topSolutions.map((solution, idx) => {
                const username = solution.createdBy?.username ?? NO_USERNAME;
                return (
                  <div key={idx} className="flex justify-between">
                    <Card className="px-3 py-2 space-y-1 w-full">
                      <div className="flex justify-left gap-10">
                        <div className="flex items-center text-sm space-x-2">
                          <Avatar className="size-8">
                            <AvatarFallback>
                              {`${username[0].toUpperCase()}${username[1].toUpperCase()}`}
                            </AvatarFallback>
                          </Avatar>
                          <span>{username}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Time timestamp={new Date(solution.createdAt)} />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold line-clamp-1 break-all mt-2 mb-1">
                          {solution.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-1 break-all">
                          {solution.details}
                        </p>
                      </div>
                    </Card>
                    <div className="flex justify-evenly">
                      <OverallMetric
                        metric={solution.voteCount.toString()}
                        label="Votes"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SolutionCard({
  taskKind,
  taskCreatorId,
  taskStatus,
  solutionId,
  createdBy,
  createdAt,
  title,
  details,
  userVotingRights,
  totalVotesByUser,
  handleVoteConfirm,
}: {
  taskKind: TaskResponse["kind"];
  taskCreatorId: NonNullable<TaskResponse["createdBy"]>["id"];
  taskStatus: TaskResponse["status"];
  solutionId: string;
  createdBy: UserResponse | null;
  createdAt: string;
  title: string | null;
  details: string | null;
  userVotingRights: number | null;
  totalVotesByUser: number | null;
  handleVoteConfirm: (id: string, amount: number) => void;
}) {
  const authUserId = useUserId();
  const username = createdBy?.username ?? NO_USERNAME;

  // useEffect(() => {
  //   if (authUserId && userVotingRights === null) {
  //     handleError(
  //       new Error(
  //         "Failed to fetch your vote data! Please try reloading the page.",
  //       ),
  //       undefined,
  //       false,
  //     );
  //   }
  // }, [authUserId, userVotingRights]);

  let metricElement: JSX.Element | null = null;
  if (authUserId) {
    if (taskKind === "personal") {
      if (authUserId == taskCreatorId) {
        metricElement = (
          <OverallMetric
            metric={totalVotesByUser?.toString() ?? "0"}
            label="Total Votes"
          />
        );
      }
    } else {
      metricElement = (
        <UserMetric
          metric={totalVotesByUser?.toString() ?? "0"}
          label="Your Votes"
        />
      );
    }
  }

  let voteElement: JSX.Element | null = null;
  if (authUserId) {
    if (userVotingRights !== null && taskStatus === "active") {
      if (authUserId === createdBy?.id) {
        voteElement = (
          <Button disabled className="break-words whitespace-pre-wrap">
            Cannot vote for your own solution
          </Button>
        );
      } else {
        voteElement = (
          <VotingPopup
            userVotingRights={userVotingRights ?? -1}
            onVoteConfirm={(amount) => handleVoteConfirm(solutionId, amount)}
            enabled={userVotingRights !== null && userVotingRights > 0}
          />
        );
      }
    }
  } else {
    voteElement = (
      <Button variant="default">
        <Link href={SITE_PAGES.LOGIN}>Please Login to Vote</Link>
      </Button>
    );
  }

  return (
    <Card>
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
        <p className="flex-grow break-words whitespace-pre-wrap">{details}</p>
      </CardContent>
      <div className="flex justify-center items-center mb-4">
        <div className="flex flex-col">{metricElement}</div>
        <div className="m-2 ml-4">{voteElement}</div>
      </div>
    </Card>
  );
}
