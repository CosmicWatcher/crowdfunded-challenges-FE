import { Kin } from "@code-wallet/currency";
import { CoinsIcon, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NotFoundAlert from "@/components/ui/not-found";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SITE_PAGES } from "@/configs/routes";
import useUserId from "@/hooks/useUserId";
import { TaskResponse } from "@/types/api.types";

export default function FundingPopup({
  totalFunds,
  depositAddress,
  taskCreatorId,
  taskKind,
  taskStatus,
  handleFundConfirm,
}: {
  totalFunds: number;
  depositAddress: TaskResponse["depositAddress"];
  taskCreatorId: NonNullable<TaskResponse["createdBy"]>["id"];
  taskKind: TaskResponse["kind"];
  taskStatus: TaskResponse["status"];
  handleFundConfirm: (amount: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0.01);
  const authUserId = useUserId();
  const [_location, setLocation] = useLocation();
  const [fundingText, setFundingText] = useState("");

  useEffect(() => {
    if (!authUserId) {
      setFundingText("Login to contribute");
    } else if (
      (taskKind === "personal" && authUserId !== taskCreatorId) ||
      taskStatus !== "active"
    ) {
      setFundingText("");
    } else {
      setFundingText("Click to contribute");
    }
  }, [authUserId, taskKind, taskCreatorId, taskStatus]);

  const p = <p>{fundingText}</p>;

  function handleConfirm() {
    setOpen(false);
    handleFundConfirm(amount);
  }

  function handleOpenChange(open: boolean) {
    if (!authUserId) {
      setLocation(SITE_PAGES.LOGIN);
    } else if (
      (taskKind === "personal" && authUserId !== taskCreatorId) ||
      taskStatus !== "active"
    ) {
      return;
    }
    setOpen(open);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger>
        <Badge
          variant="default"
          className="flex items-center justify-center p-2"
        >
          <CoinsIcon className="size-8 mx-2 text-yellow-300 animate-pulse" />
          <div className="flex flex-col mr-5">
            <p className="text-xl">{`${totalFunds.toLocaleString(undefined, { minimumFractionDigits: Number(Kin.decimals) })} Kin`}</p>
            {p}
          </div>
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="bg-secondary max-w-md">
        {depositAddress ? (
          <>
            <div className="flex items-center justify-center">
              <DollarSign />
              <Input
                id="myFund"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                max={100}
                step={0.01}
                min={0.01}
                className="w-32 ml-2"
              />
            </div>
            <Button
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleConfirm}
            >
              Fund
            </Button>
          </>
        ) : (
          <NotFoundAlert
            title="No deposit address found!"
            description="Try refreshing the page or contact the administrator."
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
