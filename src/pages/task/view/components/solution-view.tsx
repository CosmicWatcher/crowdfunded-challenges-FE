import { ArrowBigDownDash, CalendarIcon, OctagonX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "wouter";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import NotFoundAlert from "@/components/ui/not-found";
import Time from "@/components/ui/time";
import { SITE_PAGES } from "@/configs/routes";
import { getSolutionList, voteForSolution } from "@/lib/api";
import { handleError } from "@/lib/error";
import { getUserSession } from "@/lib/supabase";
import VotingPopup from "@/pages/task/view/components/voting";
import {
  ResponseObject,
  SolutionResponse,
  TaskResponse,
  UserResponse,
} from "@/types/api.types";

export default function SolutionsList({
  taskId,
  newSolution,
  userVotingRights,
  updateUserVotingRights,
  updateVoteCounts,
}: {
  taskId: TaskResponse["id"];
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
                return { ...solution, voteDetails: res.data };
              } else {
                return solution;
              }
            }),
            pagination: prevSolutions.pagination,
          };
        });
        updateUserVotingRights(res.data.userVotingRights);
        updateVoteCounts(amount);
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
        {/* <div className="flex justify-between">
          <div className="bg-secondary-foreground max-w-1/2 p-2 m-4 rounded-xl shadow-md">
            <h3 className="text-sm font-medium text-secondary mb-1">
              Your Available Votes
            </h3>
            <p className="text-3xl font-bold text-primary">
               {voting.totalVotesAvailable}
            </p>
          </div>
          <div className="bg-secondary-foreground max-w-1/2 p-2 m-4 rounded-xl shadow-md">
            <h3 className="text-sm font-medium text-secondary mb-1">
              Total Votes Received
            </h3>
            <p className="text-3xl font-bold text-primary">
              {voting.totalVotesReceived}
            </p>
          </div>
        </div> */}
        <CardContent className="px-1.5">
          <div className="space-y-8">
            {solutions.data.map((solution) => {
              return (
                <SolutionCard
                  key={solution.id}
                  solutionId={solution.id}
                  createdBy={solution.createdBy}
                  createdAt={solution.createdAt}
                  details={solution.details}
                  userVotingRights={userVotingRights}
                  totalVotesByUser={solution.voteDetails.totalVotesByUser}
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
    </>
  );
}

function SolutionCard({
  solutionId,
  createdBy,
  createdAt,
  details,
  userVotingRights,
  totalVotesByUser,
  handleVoteConfirm,
}: {
  solutionId: string;
  createdBy: UserResponse | null;
  createdAt: string;
  details: string | null;
  userVotingRights: number | null;
  totalVotesByUser: number | null;
  handleVoteConfirm: (id: string, amount: number) => void;
}) {
  const [isAuthenticated, setAuthenticated] = useState<boolean>(false);
  const username = createdBy?.username ?? "anonymous";

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await getUserSession();
        if (!session) setAuthenticated(false);
        else setAuthenticated(true);
      } catch (err) {
        handleError(err);
      }
    }
    void checkAuth();
  });

  useEffect(() => {
    if (isAuthenticated && userVotingRights === null) {
      handleError(
        new Error(
          "Failed to fetch your vote data! Please try reloading the page.",
        ),
        undefined,
        false,
      );
    }
  }, [isAuthenticated, userVotingRights]);

  // useEffect(() => {
  //   async function updateVoteDetails() {
  //     try {
  //       const response = await getSolutionVoteDetails(solution.id);
  //       setVoteDetails(response.data);
  //     } catch (err) {
  //       console.error("Failed to update vote details", err);
  //     }
  //   }

  //   if (isAuthenticated) {
  //     const id = setInterval(() => void updateVoteDetails(), 5000);
  //     return () => clearInterval(id);
  //   }
  // }, [solution.id, isAuthenticated, setVoteDetails]);

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
      <CardContent>
        <p className="flex-grow break-words">{details}</p>
      </CardContent>
      <div className="flex justify-center items-center mb-4">
        <div className="flex flex-col">
          {isAuthenticated && (
            <Badge
              variant="secondary"
              className="text-center text-slate-800 p-4 m-2 mr-4 bg-teal-300"
            >
              {`Your Votes: ${totalVotesByUser ?? "?"}`}
            </Badge>
          )}
        </div>
        <div className="m-2 ml-4">
          {isAuthenticated ? (
            <VotingPopup
              userVotingRights={userVotingRights ?? -1}
              onVoteConfirm={(amount) => handleVoteConfirm(solutionId, amount)}
              enabled={userVotingRights !== null && userVotingRights > 0}
            />
          ) : (
            <Button variant="default">
              <Link href={SITE_PAGES.LOGIN}>Please Login to Vote</Link>
            </Button>
          )}
        </div>
      </div>

      {/* <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            You don&apos;t have enough votes to contribute to this solution.
          </DialogDescription>
          <Button className="mt-4" onClick={() => setErrorDialogOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog> */}
    </Card>
  );
}
