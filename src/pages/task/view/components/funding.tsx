import { CoinsIcon } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NotFoundAlert from "@/components/ui/not-found";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TaskResponse } from "@/types/api.types";

export default function FundingPopup({
  totalFunds,
  depositAddress,
  handleFundConfirm,
}: {
  totalFunds: number;
  depositAddress: TaskResponse["depositAddress"];
  handleFundConfirm: (amount: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0.01);

  function handleConfirm() {
    setOpen(false);
    handleFundConfirm(amount);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Badge
          variant="default"
          className="flex items-center justify-center p-2"
        >
          <CoinsIcon className="size-8 mx-2 text-yellow-300 animate-pulse" />
          <div className="flex flex-col mr-5">
            <p className="text-xl">{`${totalFunds.toLocaleString()} Kin`}</p>
            <p>Click to Contribute</p>
          </div>
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="bg-secondary max-w-md">
        {depositAddress ? (
          <>
            <Input
              id="myFund"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              max={100}
              min={0.01}
              className="w-32"
            />
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
