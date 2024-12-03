import { Kin } from "@code-wallet/currency";
import { CoinsIcon, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

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
  const [isClickable, setIsClickable] = useState(false);
  const [amount, setAmount] = useState(0.01);
  const authUserId = useUserId();
  const [_location, setLocation] = useLocation();
  const [fundingText, setFundingText] = useState("");

  useEffect(() => {
    setIsClickable(
      taskStatus === "active" &&
        (taskKind !== "personal" || authUserId === taskCreatorId),
    );
  }, [authUserId, taskCreatorId, taskKind, taskStatus]);

  useEffect(() => {
    if (!authUserId) {
      setFundingText("Login to contribute");
    } else if (!isClickable) {
      setFundingText("");
    } else {
      setFundingText("Click to contribute");
    }
  }, [authUserId, isClickable]);

  const p = <p>{fundingText}</p>;

  function handleConfirm() {
    setOpen(false);
    handleFundConfirm(amount);
  }

  function handleOpenChange(open: boolean) {
    if (!authUserId) {
      setLocation(SITE_PAGES.AUTH.LOGIN);
    } else if (!isClickable) {
      return;
    }
    setOpen(open);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          className={`flex items-center justify-center p-8 rounded-2xl animate-funding 
            bg-gradient-to-tr from-sky-500 from-20% via-rose-800 via-50% to-indigo-500 to-80% ${
              !isClickable ? "hover:cursor-default" : "md:-translate-x-9"
            }`}
        >
          <CoinsIcon className="size-8 mx-2 text-yellow-300 animate-pulse" />
          <div className="flex flex-col mr-5">
            <p className="text-xl">{`${totalFunds.toLocaleString(undefined, { minimumFractionDigits: Number(Kin.decimals) })} Kin`}</p>
            {p}
          </div>
        </Button>
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
