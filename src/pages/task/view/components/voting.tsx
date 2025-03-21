import { CircleAlert, Vote } from "lucide-react";
import { useCallback, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

export default function VotingPopup({
  userVotingRights,
  onVoteConfirm,
  enabled,
}: {
  userVotingRights: number;
  onVoteConfirm: (voteAmount: number) => void;
  enabled: boolean;
}) {
  const [voteAmount, setVoteAmount] = useState(0);
  const [votePercentage, setVotePercentage] = useState(0);
  const [open, setOpen] = useState(false);

  const handleVotePercentageChange = useCallback(
    (value: number[]) => {
      const percentage = Math.round(value[0]);
      setVotePercentage(percentage);
      setVoteAmount(Math.floor(userVotingRights * (percentage / 100)));
    },
    [userVotingRights],
  );

  const handleVoteAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const amount = Math.min(Number(e.target.value), userVotingRights);
      setVoteAmount(amount);
      setVotePercentage(Math.round((amount / userVotingRights) * 100));
    },
    [userVotingRights],
  );

  const setQuickChoice = useCallback(
    (percentage: number) => {
      setVotePercentage(percentage);
      setVoteAmount(Math.floor(userVotingRights * (percentage / 100)));
    },
    [userVotingRights],
  );

  const handleConfirm = useCallback(() => {
    onVoteConfirm(voteAmount);
    setVoteAmount(0);
    setVotePercentage(0);
    setOpen(false);
  }, [voteAmount, onVoteConfirm]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button>
          <Vote />
          <p className="mx-1">Vote</p>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-secondary max-w-md">
        {!enabled ? (
          <Alert className="max-w-lg mx-auto">
            <CircleAlert className="size-5" />
            <AlertTitle>Insufficient Voting Rights!</AlertTitle>
            <AlertDescription>
              Please contribute to the task to gain voting rights.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="py-4 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Your available votes for this task:
                </span>
                <span className="text-lg font-bold">{userVotingRights}</span>
              </div>
              <div>
                <label
                  htmlFor="myVote"
                  className="block text-sm font-medium mb-1"
                >
                  My Vote
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="myVote"
                    type="number"
                    value={voteAmount}
                    onChange={handleVoteAmountChange}
                    max={userVotingRights}
                    min={0}
                    className="w-32"
                  />
                  <span className="text-sm">votes</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">
                  Percentage of available votes
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
                {[5, 10, 25, 50, 75, 100].map((percent) => (
                  <Button
                    key={percent}
                    size="sm"
                    onClick={() => setQuickChoice(percent)}
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
            </div>
            <Button
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleConfirm}
              disabled={voteAmount === 0}
            >
              {voteAmount === 0 ? "Vote cannot be 0" : "Confirm Vote"}
            </Button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
