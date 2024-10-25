"use client";

import { AlertCircle, ChevronDown, ChevronUp, User } from "lucide-react";
// import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

const mainTask = {
  id: "task1",
  title: "Improve City Park Facilities",
  description:
    "We're looking for innovative solutions to enhance our city park facilities and make them more accessible and enjoyable for all residents.",
  image: "", // This can be left empty or filled with a user-provided image URL
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

function VotingPopup({
  open,
  onOpenChange,
  totalVotesAvailable,
  onVoteConfirm,
  solutionTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalVotesAvailable: number;
  onVoteConfirm: (voteAmount: number) => void;
  solutionTitle: string;
}) {
  const [voteAmount, setVoteAmount] = useState(0);
  const [votePercentage, setVotePercentage] = useState(0);

  const handleVotePercentageChange = useCallback(
    (value: number[]) => {
      const percentage = Math.round(value[0]);
      setVotePercentage(percentage);
      setVoteAmount(Math.floor(totalVotesAvailable * (percentage / 100)));
    },
    [totalVotesAvailable],
  );

  const handleVoteAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const amount = Math.min(Number(e.target.value), totalVotesAvailable);
      setVoteAmount(amount);
      setVotePercentage(Math.round((amount / totalVotesAvailable) * 100));
    },
    [totalVotesAvailable],
  );

  const setQuickChoice = useCallback(
    (percentage: number) => {
      setVotePercentage(percentage);
      setVoteAmount(Math.floor(totalVotesAvailable * (percentage / 100)));
    },
    [totalVotesAvailable],
  );

  const handleConfirm = useCallback(() => {
    onVoteConfirm(voteAmount);
    setVoteAmount(0);
    setVotePercentage(0);
  }, [voteAmount, onVoteConfirm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Vote for {solutionTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total votes available:</span>
            <span className="text-lg font-bold">{totalVotesAvailable}</span>
          </div>
          <div>
            <label htmlFor="myVote" className="block text-sm font-medium mb-1">
              My Vote
            </label>
            <div className="flex items-center space-x-2">
              <Input
                id="myVote"
                type="number"
                value={voteAmount}
                onChange={handleVoteAmountChange}
                max={totalVotesAvailable}
                min={0}
                className="bg-gray-700 text-white w-24"
              />
              <span className="text-sm">votes</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">
              Percentage of total power
            </p>
            <Slider
              value={[votePercentage]}
              onValueChange={handleVotePercentageChange}
              max={100}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between items-center text-sm">
              <span>{voteAmount} votes</span>
              <span>{votePercentage}%</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 20, 40, 60, 80, 100].map((percent) => (
              <Button
                key={percent}
                size="sm"
                variant="outline"
                onClick={() => setQuickChoice(percent)}
                className="bg-gray-700 text-white hover:bg-gray-600"
              >
                {percent}%
              </Button>
            ))}
          </div>
        </div>
        <Button
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
          onClick={handleConfirm}
        >
          Confirm Vote
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default function SolutionList() {
  const [openSolutionId, setOpenSolutionId] = useState<number | null>(null);
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

  const handleVoteConfirm = useCallback(
    (voteAmount: number) => {
      if (currentVotingSolutionId === null) return;

      setSolutions((prev) =>
        prev.map((solution) =>
          solution.id === currentVotingSolutionId
            ? {
                ...solution,
                fundsCommitted:
                  solution.fundsCommitted + voteAmount * voteValue,
                votesReceived: solution.votesReceived + voteAmount,
              }
            : solution,
        ),
      );
      setTotalVotesAvailable((prev) => prev - voteAmount);
      setVotedSolutions((prev) => [...prev, currentVotingSolutionId]);
      setVotingDialogOpen(false);
      setCurrentVotingSolutionId(null);
    },
    [currentVotingSolutionId, voteValue],
  );

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
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Kin Project</h1>
          <div className="flex items-center space-x-4">
            {/* <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Welcome User X
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Account</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Preferences</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <div className="p-8">
        <Card className="mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardTitle className="text-2xl font-bold">
              {mainTask.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                {/* <Image
                  src={
                    mainTask.image ||
                    "https://source.unsplash.com/random/800x600?park"
                  }
                  alt="Task image"
                  width={400}
                  height={300}
                  className="rounded-lg object-cover w-full h-[300px]"
                /> */}
              </div>
              <div className="md:w-2/3">
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

        <VotingPopup
          open={votingDialogOpen}
          onOpenChange={setVotingDialogOpen}
          totalVotesAvailable={totalVotesAvailable}
          onVoteConfirm={handleVoteConfirm}
          solutionTitle={
            solutions.find((s) => s.id === currentVotingSolutionId)?.title ?? ""
          }
        />

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
    </div>
  );
}
