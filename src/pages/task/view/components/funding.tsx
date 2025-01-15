import { CurrencyCode } from "@code-wallet/currency";
import { elements } from "@code-wallet/elements";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NotFoundAlert from "@/components/ui/not-found";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SITE_PAGES } from "@/configs/routes";
import { useUserId } from "@/hooks/useUserId";
import { createTaskFundingIntent } from "@/lib/api";
import { handleError } from "@/lib/error";
import { TaskResponse } from "@/types/api.types";

export default function FundingPopup({
  totalFunds,
  depositAddress,
  taskCreatorId,
  taskId,
  taskKind,
  taskStatus,
}: {
  totalFunds: number;
  depositAddress: TaskResponse["depositAddress"];
  taskCreatorId: NonNullable<TaskResponse["createdBy"]>["id"];
  taskId: TaskResponse["id"];
  taskKind: TaskResponse["kind"];
  taskStatus: TaskResponse["status"];
}) {
  const [open, setOpen] = useState(false);
  const [isClickable, setIsClickable] = useState(false);
  const [amount, setAmount] = useState(0.05);
  const [currency, setCurrency] = useState<CurrencyCode>("usd");
  const authUserId = useUserId();
  const [_location, setLocation] = useLocation();
  const [fundingText, setFundingText] = useState("");
  const codeElement = useRef<HTMLDivElement>(null);
  const [isIntentCreated, setIsIntentCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // prettier-ignore
  const currencies: CurrencyCode[] = [
    // Crypto
        "kin",
    // Fiat
        "aed", "afn", "all", "amd", "ang", "aoa", "ars", "aud", "awg", "azn", "bam",
        "bbd", "bdt", "bgn", "bhd", "bif", "bmd", "bnd", "bob", "brl", "bsd", "btn",
        "bwp", "byn", "bzd", "cad", "cdf", "chf", "clp", "cny", "cop", "crc", "cup",
        "cve", "czk", "djf", "dkk", "dop", "dzd", "egp", "ern", "etb", "eur", "fjd",
        "fkp", "gbp", "gel", "ghs", "gip", "gmd", "gnf", "gtq", "gyd", "hkd", "hnl",
        "hrk", "htg", "huf", "idr", "ils", "inr", "iqd", "irr", "isk", "jmd", "jod",
        "jpy", "kes", "kgs", "khr", "kmf", "kpw", "krw", "kwd", "kyd", "kzt", "lak",
        "lbp", "lkr", "lrd", "lyd", "mad", "mdl", "mga", "mkd", "mmk", "mnt", "mop",
        "mru", "mur", "mvr", "mwk", "mxn", "myr", "mzn", "nad", "ngn", "nio", "nok",
        "npr", "nzd", "omr", "pab", "pen", "pgk", "php", "pkr", "pln", "pyg", "qar",
        "ron", "rsd", "rub", "rwf", "sar", "sbd", "scr", "sdg", "sek", "sgd", "shp",
        "sll", "sos", "srd", "ssp", "stn", "syp", "szl", "thb", "tjs", "tmt", "tnd",
        "top", "try", "ttd", "twd", "tzs", "uah", "ugx", "usd", "uyu", "uzs", "ves",
        "vnd", "vuv", "wst", "xaf", "xcd", "xof", "xpf", "yer", "zar", "zmw"
    ];

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

  function handleConfirm() {
    async function createCodeButton() {
      try {
        setIsLoading(true);

        const res = await createTaskFundingIntent(taskId, amount, currency);
        const { button } = elements.create("button", {
          amount: res.data.amount,
          currency: res.data.currency,
          destination: res.data.destination,
          clientSecret: res.data.clientSecret,
          confirmParams: {
            success: { url: SITE_PAGES.TASKS.VIEW.replace(":id", taskId) },
            cancel: { url: SITE_PAGES.TASKS.VIEW.replace(":id", taskId) },
          },
        });

        setIsLoading(false);
        if (codeElement.current && button !== undefined) {
          button.mount(codeElement.current);
          setIsIntentCreated(true);
        } else {
          throw new Error("Problem creating Code button");
        }
      } catch (reason) {
        handleError(reason);
      }
    }
    void createCodeButton();
  }

  function handleOpenChange(open: boolean) {
    if (!authUserId) {
      setLocation(SITE_PAGES.AUTH.LOGIN);
    } else if (!isClickable) {
      return;
    }
    if (open) {
      setOpen(open);
    }
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
          <img src="/kin_logo.jpg" className="size-8 mr-6" />
          <div className="flex flex-col mr-5">
            <p className="text-xl">{`${totalFunds.toLocaleString(undefined, { maximumFractionDigits: 0 })} Kin`}</p>
            <p>{fundingText}</p>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-secondary max-w-md">
        {depositAddress ? (
          <>
            <div className="flex flex-col items-center justify-center mt-6">
              <h1 className="text-md pb-4 text-center">
                Confirm the amount to prepare Code payment
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Input
                  id="myFund"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  step={0.01}
                  min={0.05}
                  className="w-32"
                  disabled={isIntentCreated}
                />
                <Select
                  value={currency}
                  onValueChange={(value: CurrencyCode) => setCurrency(value)}
                  disabled={isIntentCreated}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-8 mt-4">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setOpen(false);
                    setIsIntentCreated(false);
                  }}
                >
                  <p>Cancel</p>
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleConfirm}
                  disabled={isIntentCreated || isLoading}
                >
                  Confirm Amount
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center pt-4">
              <div ref={codeElement} />
            </div>
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
