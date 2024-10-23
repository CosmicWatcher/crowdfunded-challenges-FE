import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarIcon,
  CoinsIcon,
  TrophyIcon,
  Vote,
  WalletIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "wouter";
import { z } from "zod";

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
import { Textarea } from "@/components/ui/textarea";
import Time from "@/components/ui/time";
import { FORM_LIMITS } from "@/configs/constants";
import { SITE_PAGES } from "@/configs/routes";
import { createTaskSubmission } from "@/lib/api";
import { handleError } from "@/lib/error";
import { notifySuccess } from "@/lib/notification";
import { getUserSession } from "@/lib/supabase";
import { Task } from "@/types/task.types";

interface Submission {
  id: number;
  user: string;
  content: string;
  timestamp: Date;
}

export default function TaskViewPage() {
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

  const task: Task = {
    title:
      "Complete a Web3 Task where we need someone to come in and do a thing. if this is you contact us and we will get in touch becuse that is what we do in this business yes sir we do that indeed",
    description:
      "We need someone to develop a smart contract for our new DeFi project. if this sounds good to you make sure to let us know.If you just glance of at these two folder structures you may notice a ton of similarities, but there is one major difference which is the features folder. This features folder is a more elegant way of grouping similar code together and best of all it does not suffer from the same problems as the pages folder from the intermediate folder structure since your features will almost never have mass amounts of overlap between them. Since so many of the folders in this structure are repeats from the intermediate structure, I will only be covering the folders that have changed between these two structures.\n\nhere are the details:\nphone number 800-888-1234\nemail:example@ex.com",
    taskKind: "community",
    status: "active",
    username: "crypto_enthusiast",
    maxWinners: 3,
    fundsRaised: 5000,
    depositAddress: "0x1234...5678",
    creationDate: new Date("2023-05-15T09:00:00Z"),
  };

  return (
    <div className="min-h-screen space-y-4">
      <TaskDisplay task={task} />
      <SubmissionForm taskID="sdfs-sdfsd-sdfsdf-sdfds" />
      <SubmissionsList submissions={submissions} />
    </div>
  );
}

function TaskDisplay({ task }: { task: Task | undefined }) {
  if (!task) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent>
          <p>No task data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto relative">
      <div className="absolute top-4 right-4">
        <Badge variant="outline" className="bg-blue-500">
          {task.taskKind}
        </Badge>
      </div>
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <Time timestamp={task.creationDate} />
          </div>
          <div className="flex items-center text-sm space-x-2">
            <Avatar>
              <AvatarFallback>
                {`${task.username[0].toUpperCase()}${task.username[1].toUpperCase()}`}
              </AvatarFallback>
            </Avatar>
            <span>{task.username}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardTitle className="text-2xl font-bold">{task.title}</CardTitle>
        <p>{task.description}</p>

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
          <span className="ml-2 font-mono text-sm">{task.depositAddress}</span>
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
