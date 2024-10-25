import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";

const mainTask = {
  id: "task1",
  title: "Improve City Park Facilities",
  description:
    "We're looking for innovative solutions to enhance our city park facilities and make them more accessible and enjoyable for all residents.",
};

const initialSolutions = [
  {
    id: 1,
    title: "Smart Lighting System",
    description: "Install solar-powered smart lighting throughout the park",
    fundsCommitted: 0,
    votesReceived: 0,
  },
  {
    id: 2,
    title: "Inclusive Playground",
    description:
      "Build a fully accessible playground for children of all abilities",
    fundsCommitted: 0,
    votesReceived: 0,
  },
  {
    id: 3,
    title: "Community Garden",
    description: "Create a community garden with educational programs",
    fundsCommitted: 0,
    votesReceived: 0,
  },
  {
    id: 4,
    title: "Fitness Trail",
    description: "Develop a fitness trail with outdoor exercise equipment",
    fundsCommitted: 0,
    votesReceived: 0,
  },
  {
    id: 5,
    title: "Art Installation",
    description: "Commission local artists for interactive art installations",
    fundsCommitted: 0,
    votesReceived: 0,
  },
];

export default function SolutionList() {
  const [openSolutionId, setOpenSolutionId] = useState<number | null>(null);
  const [voteAmount, setVoteAmount] = useState(0);
  const [solutions, setSolutions] = useState(initialSolutions);
  const [votingDialogOpen, setVotingDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [votedSolutions, setVotedSolutions] = useState<number[]>([]);
  const [currentVotingSolutionId, setCurrentVotingSolutionId] = useState<
    number | null
  >(null);

  const initialVotingRights = 1000;
  const [totalVotesAvailable, setTotalVotesAvailable] =
    useState(initialVotingRights);
  const voteValue = 1; // Each vote is worth 1 fund unit

  const handleVoteChange = useCallback((value: number[]) => {
    setVoteAmount(value[0]);
  }, []);

  const handleVoteConfirm = useCallback(() => {
    if (currentVotingSolutionId === null) return;

    setSolutions((prev) =>
      prev.map((solution) =>
        solution.id === currentVotingSolutionId
          ? {
              ...solution,
              fundsCommitted: solution.fundsCommitted + voteAmount * voteValue,
              votesReceived: solution.votesReceived + voteAmount,
            }
          : solution,
      ),
    );
    setTotalVotesAvailable((prev) => prev - voteAmount);
    setVotedSolutions((prev) => [...prev, currentVotingSolutionId]);
    setVoteAmount(0);
    setVotingDialogOpen(false);
    setCurrentVotingSolutionId(null);
  }, [currentVotingSolutionId, voteAmount, voteValue]);

  const openVoteDialog = useCallback(
    (solutionId: number) => {
      if (totalVotesAvailable === 0) {
        setErrorDialogOpen(true);
      } else {
        setCurrentVotingSolutionId(solutionId);
        setVotingDialogOpen(true);
      }
    },
    [totalVotesAvailable],
  );

  const sortedSolutions = useMemo(() => {
    return [...solutions].sort((a, b) => b.fundsCommitted - a.fundsCommitted);
  }, [solutions]);

  const totalVotesReceived = useMemo(() => {
    return initialVotingRights - totalVotesAvailable;
  }, [totalVotesAvailable]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="mb-8 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardTitle className="text-2xl font-bold">{mainTask.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600 mb-6">{mainTask.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Total Votes Available
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {totalVotesAvailable}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Total Votes Received
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {totalVotesReceived}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* <ScrollArea className="h-[600px] w-full rounded-md border"> */}
      <div className="flex flex-col gap-4">
        {sortedSolutions.map((solution, index) => (
          <div
            key={solution.id}
            className={`mb-4 p-4 rounded-lg text-white flex justify-between items-center ${index === 0 && solution.fundsCommitted > 0 ? "bg-green-600" : "bg-black"}`}
          >
            <div className="flex-grow">
              <h3 className="text-lg font-semibold">
                {solution.title}
                {index === 0 &&
                  solution.fundsCommitted > 0 &&
                  " (Top Solution)"}
              </h3>
              <p className="mt-2">{solution.description}</p>
              <div className="mt-4 flex items-center">
                <Button
                  variant="outline"
                  className={`${index === 0 && solution.fundsCommitted > 0 ? "bg-white text-green-600 hover:bg-gray-100" : "bg-blue-600 text-white hover:bg-blue-700"} disabled:opacity-50`}
                  disabled={votedSolutions.includes(solution.id)}
                  onClick={() => openVoteDialog(solution.id)}
                >
                  {votedSolutions.includes(solution.id) ? "Voted" : "Vote"}
                </Button>
                <button
                  onClick={() =>
                    setOpenSolutionId(
                      openSolutionId === solution.id ? null : solution.id,
                    )
                  }
                  className="ml-4 text-gray-400 hover:text-white transition-colors"
                >
                  {openSolutionId === solution.id ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  )}
                </button>
              </div>
              {openSolutionId === solution.id && (
                <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                  <p>Votes received: {solution.votesReceived}</p>
                  <p>Total funds committed: {solution.fundsCommitted}</p>
                </div>
              )}
            </div>
            <Badge
              variant="secondary"
              className={`text-2xl font-bold px-4 py-2 ${index === 0 && solution.fundsCommitted > 0 ? "bg-white text-green-600" : "bg-green-600 text-white"}`}
            >
              {solution.fundsCommitted}
            </Badge>
          </div>
        ))}
      </div>
      {/* </ScrollArea> */}

      <Dialog open={votingDialogOpen} onOpenChange={setVotingDialogOpen}>
        <DialogContent className="bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>
              Vote for{" "}
              {solutions.find((s) => s.id === currentVotingSolutionId)?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p>Amount of voting to dedicate: {voteAmount}</p>
            <p>Total votes available: {totalVotesAvailable}</p>
            <p>
              Votes received by this solution:{" "}
              {solutions.find((s) => s.id === currentVotingSolutionId)
                ?.votesReceived ?? 0}
            </p>
            <div>
              <p className="mb-2">Select your voting amount:</p>
              <Slider
                value={[voteAmount]}
                onValueChange={handleVoteChange}
                max={totalVotesAvailable}
                step={1}
              />
              <div className="mt-2 flex justify-between items-center">
                <span>{voteAmount} votes</span>
                <span>{voteAmount * voteValue} to be committed</span>
              </div>
            </div>
          </div>
          <Button className="mt-4 w-full" onClick={handleVoteConfirm}>
            Confirm Vote
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent className="bg-black text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error
            </DialogTitle>
          </DialogHeader>
          <p>
            You don&apos;t have enough votes to contribute to this solution.
          </p>
          <Button className="mt-4" onClick={() => setErrorDialogOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
