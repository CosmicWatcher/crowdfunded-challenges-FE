import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarIcon,
  ClipboardIcon,
  CoinsIcon,
  Copy,
  ScrollText,
  TrophyIcon,
  Vote,
  WalletIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "wouter";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Loading } from "@/components/ui/loading";
import { Textarea } from "@/components/ui/textarea";
import Time from "@/components/ui/time";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FORM_LIMITS } from "@/configs/constants";
import { SITE_PAGES } from "@/configs/routes";
import { createTaskSubmission, getTaskById } from "@/lib/api";
import { handleError } from "@/lib/error";
import { notifySuccess } from "@/lib/notification";
import { getUserSession } from "@/lib/supabase";
import { TaskResponse } from "@/types/api.types";
import { getTaskKindColor } from "@/utils/colors";

interface Submission {
  id: number;
  user: string;
  content: string;
  timestamp: Date;
}

export default function TaskViewPage() {
  const [task, setTask] = useState<TaskResponse>();
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const taskID = params.id;
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: 1,
      user: "alice",
      content:
        "Here's my submission for the smart contract. The massive change between these two structures is the features folder. This folder works very similarly to the pages folder from the intermediate structure, but instead of grouping by page we are instead grouping by feature. Already this is easier to understand as a developer since in 90% of cases when you are going to add new code to a project you are either going to implement a new feature, such as adding user accounts, or you are going to modify an existing feature, such as adding the ability to edit todos. This makes working with the code easier since all the code for each feature is collocated in the same place making it easy to update and add to.",
      timestamp: new Date("2023-05-16T10:00:00Z"),
      voteCount: 400,
    },
    {
      id: 2,
      user: "bob",
      content:
        "I've completed the task. Please review my work. The index.js file is then used as a way to expose a public API for everything that is usable outside the feature folder for that given feature. It is common that you will want to have a bunch of code that is private to the specific feature you are working on, but with JS if you create an export in a file it can be used in any other file you want. In larger projects this can become a problem if we only want to expose a few components/methods for our feature which is where the index.js file comes in. This file should export only the code you want to be accessible outside the feature and then every time you use code for this feature in your application you should import it from the index.js file.",
      timestamp: new Date("2023-05-16T11:30:00Z"),
      voteCount: 300,
    },
  ]);

  useEffect(() => {
    let ignore = false;

    async function fetchTask() {
      setLoading(true);
      console.log("fetching task");
      try {
        if (taskID !== undefined) {
          const response = await getTaskById(taskID);
          if (!ignore && response) {
            setTask(response);
          }
        }
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    }
    void fetchTask();

    return () => {
      ignore = true;
    };
  }, [taskID]);

  if (loading) {
    return <Loading />;
  }

  if (!task) {
    return (
      <Alert className="max-w-lg mx-auto">
        <ScrollText className="h-4 w-4" />
        <AlertTitle>Task not found</AlertTitle>
        <AlertDescription>
          Please check the task ID and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen space-y-4">
      <TaskDisplay task={task} />
      <SubmissionForm taskID="sdfs-sdfsd-sdfsdf-sdfds" />
      <SubmissionsList submissions={submissions} />
    </div>
  );
}

function TaskDisplay({ task }: { task: TaskResponse }) {
  const username = task.createdBy?.username ?? "anonymous";
  const kindColor = getTaskKindColor(task.kind);

  return (
    <Card className="max-w-3xl mx-auto relative">
      <div className="absolute top-4 right-4">
        <Badge variant="outline" className={kindColor}>
          {task.kind}
        </Badge>
      </div>
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <Time timestamp={new Date(task.createdAt)} />
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
        <CardTitle className="text-2xl font-bold">{task.title}</CardTitle>
        <p>{task.details}</p>

        {/* <div className="flex items-center">
          <CheckCircleIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">Status:</span>
          <Badge variant="outline" className="ml-2">
            {task.status}
          </Badge>
        </div> */}
      </CardContent>
      <div className="border-t border px-6 py-4 md:flex grid gap-2 justify-center md:justify-between items-center">
        <div className="flex items-center justify-center">
          <WalletIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Address:</span>
          <span className="ml-2 font-mono text-sm">
            {task.depositAddress
              ? `${task.depositAddress.slice(0, 5)}...${task.depositAddress.slice(-5)}`
              : "no wallet found"}
          </span>
          {task.depositAddress && (
            <CopyAddressButton address={task.depositAddress} />
          )}
        </div>
        <Badge variant="secondary" className="flex items-center justify-center">
          <CoinsIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-lg">Funds:</span>
          <span className="ml-2 text-lg">
            {`${task.fundsRaised.toLocaleString()} kin`}
          </span>
        </Badge>
        <div className="flex items-center justify-center">
          <TrophyIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Max Winners:</span>
          <span className="ml-2 text-sm">{task.maxWinners}</span>
        </div>
      </div>
    </Card>
  );
}

function CopyAddressButton({ address }: { address: string }) {
  const [clipboardCopyTooltip, setClipboardCopyTooltip] =
    useState("Copy to Clipboard");

  function clickHandler() {
    navigator.clipboard
      .writeText(address)
      .then(() => setClipboardCopyTooltip("Copied"))
      .catch(() => setClipboardCopyTooltip("Failed to Copy"))
      .finally(() => {
        setTimeout(() => {
          setClipboardCopyTooltip("Copy to Clipboard");
        }, 5000);
      });
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <Copy
            className="h-4 w-4 ml-1 text-muted-foreground"
            onClick={clickHandler}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{clipboardCopyTooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SubmissionForm({ taskID }: { taskID: string }) {
  const [isAuthenticated, setAuthenticated] = useState<undefined | boolean>(
    undefined,
  );

  useEffect(() => {
    let ignore = false;

    async function checkAuth() {
      try {
        const session = await getUserSession();
        if (!ignore) {
          if (!session) setAuthenticated(false);
          else setAuthenticated(true);
        }
      } catch (err) {
        handleError(err);
      }
    }
    void checkAuth();

    return () => {
      ignore = true;
    };
  }, []);

  const formSchema = z.object({
    description: z.string().max(FORM_LIMITS.TASK_SUBMISSION.DESCRIPTION.MAX, {
      message: `Description must be less than ${FORM_LIMITS.TASK_SUBMISSION.DESCRIPTION.MAX} characters`,
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createTaskSubmission(values, taskID);
      notifySuccess("Work successfully submitted");
    } catch (err) {
      handleError(err, "Submission failed");
      form.setError("root.serverError", { type: "500" });
    }
  }

  const { formState, reset } = form;
  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset();
    }
  }, [formState, reset]);

  if (!isAuthenticated) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent>
          <div className="mt-4 text-center text-sm">
            Please{" "}
            <Link href={SITE_PAGES.LOGIN} className="underline">
              Login
            </Link>{" "}
            to submit your work!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Your Work</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your submission here..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

interface Submission {
  id: number;
  user: string;
  content: string;
  timestamp: Date;
  voteCount: number;
}

interface SubmissionsListProps {
  submissions: Submission[];
}

function SubmissionsList({ submissions }: SubmissionsListProps) {
  return (
    <Card className="max-w-3xl mx-auto bg-secondary">
      <CardHeader className="text-center">
        <CardTitle>Submissions</CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <div className="space-y-8">
          {submissions.map((submission) => (
            <Submission key={submission.id} {...submission} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Submission({ user, content, timestamp, voteCount }: Submission) {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <Time timestamp={timestamp} />
          </div>
          <div className="flex items-center text-sm space-x-2">
            <Avatar>
              <AvatarFallback>
                {`${user[0].toUpperCase()}${user[1].toUpperCase()}`}
              </AvatarFallback>
            </Avatar>
            <span>{user}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p>{content}</p>
      </CardContent>
      <CardFooter className="flex justify-around">
        <Badge variant="secondary" className="text-center my-4 p-4">
          {`Votes: ${voteCount}`}
        </Badge>
        <Button>
          <Vote />
          <p className="mx-1">Vote</p>
        </Button>
      </CardFooter>
    </Card>
  );
}
