import { useCallback, useMemo, useState } from "react";

export default function useVoting() {
  const [openSolutionId, setOpenSolutionId] = useState<number | null>(null);
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

      //   setSolutions((prev) =>
      //     prev.map((solution) =>
      //       solution.id === currentVotingSolutionId
      //         ? {
      //             ...solution,
      //             fundsCommitted:
      //               solution.fundsCommitted + voteAmount * voteValue,
      //             votesReceived: solution.votesReceived + voteAmount,
      //           }
      //         : solution,
      //     ),
      //   );
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

  const totalVotesReceived = useMemo(() => {
    return initialVotingRights - totalVotesAvailable;
  }, [totalVotesAvailable]);

  return {
    openVoteDialog,
    votingDialogOpen,
    setVotingDialogOpen,
    errorDialogOpen,
    setErrorDialogOpen,
    handleVoteConfirm,
    totalVotesAvailable,
    totalVotesReceived,
  };
}
