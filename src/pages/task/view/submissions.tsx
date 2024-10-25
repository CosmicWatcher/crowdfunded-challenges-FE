import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowBigDownDash,
  CalendarIcon,
  CircleSlash,
  OctagonX,
  Vote,
} from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "wouter";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { SITE_PAGES } from "@/configs/routes";
import { submissionFormSchema } from "@/configs/schema";
import { createSubmission, getSubmissionList } from "@/lib/api";
import { handleError } from "@/lib/error";
import { notifySuccess } from "@/lib/notification";
import { getUserSession } from "@/lib/supabase";
import {
  ResponseObject,
  SubmissionResponse,
  TaskResponse,
} from "@/types/api.types";

export default function SubmissionSection({
  taskId,
}: {
  taskId: TaskResponse["id"];
}) {
  const [newSubmission, setNewSubmission] = useState<SubmissionResponse | null>(
    null,
  );
  return (
    <>
      <SubmissionForm taskId={taskId} setNewSubmission={setNewSubmission} />
      <SubmissionsList taskId={taskId} newSubmission={newSubmission} />
    </>
  );
}

function SubmissionForm({
  taskId,
  setNewSubmission,
}: {
  taskId: TaskResponse["id"];
  setNewSubmission: Dispatch<SetStateAction<SubmissionResponse | null>>;
}) {
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

  const form = useForm<z.infer<typeof submissionFormSchema>>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof submissionFormSchema>) {
    try {
      const res = await createSubmission(values, taskId);
      notifySuccess("Work successfully submitted");
      if (res) setNewSubmission(res.data);
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
    <Card className="max-w-7xl mx-auto">
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
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function SubmissionsList({
  taskId,
  newSubmission,
}: {
  taskId: TaskResponse["id"];
  newSubmission: SubmissionResponse | null;
}) {
  const [submissions, setSubmissions] = useState<
    ResponseObject<SubmissionResponse[]>
  >({
    data: [],
    pagination: {
      total_records: 0,
      total_pages: 0,
      current_page: 0,
      prev_page: null,
      next_page: null,
    },
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isError, setIsError] = useState(false);

  function handleNextPageClick() {
    if (
      submissions.pagination?.next_page &&
      submissions.pagination.next_page !== page
    ) {
      setPage(submissions.pagination.next_page);
    }
  }

  useEffect(() => {
    if (newSubmission) {
      setSubmissions((prevSubmissions) => {
        return {
          data: [newSubmission, ...prevSubmissions.data],
          pagination: prevSubmissions.pagination,
        };
      });
    }
  }, [taskId, newSubmission]);

  // Fetch submissions based on page number
  useEffect(() => {
    let ignore = false;

    async function fetchSubmissions(pageNum: number) {
      setLoading(true);
      try {
        const response = await getSubmissionList(taskId, pageNum);
        if (!ignore && response.data) {
          console.log(response.pagination);
          setSubmissions((prevSubmissions) => {
            // Remove duplicates from prevSubmissions
            const filteredPrevSubmissions = prevSubmissions.data.filter(
              (prevSub) =>
                !response.data.some((newSub) => newSub.id === prevSub.id),
            );
            return {
              data: [...filteredPrevSubmissions, ...response.data],
              pagination: response.pagination,
            };
          });
        }
      } catch (err) {
        handleError(err);
        setIsError(true);
      } finally {
        setLoading(false);
      }
    }
    void fetchSubmissions(page);

    return () => {
      ignore = true;
    };
  }, [page, taskId]);

  if (loading && submissions.data.length === 0) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Alert className="max-w-lg mx-auto">
        <OctagonX className="size-5" />
        <AlertTitle>Error fetching submissions!</AlertTitle>
        <AlertDescription>Please check back later.</AlertDescription>
      </Alert>
    );
  }

  if (submissions.data.length === 0) {
    return (
      <Alert className="max-w-lg mx-auto">
        <CircleSlash className="size-5" />
        <AlertTitle>No submissions available.</AlertTitle>
        <AlertDescription>Please check back later.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="max-w-7xl mx-auto bg-secondary">
      <CardHeader className="text-center">
        <CardTitle>Submissions</CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <div className="space-y-8">
          {submissions.data.map((submission) => (
            <Submission key={submission.id} submission={submission} />
          ))}
          {loading && <Loading />}
          {!loading && submissions.pagination?.next_page && (
            <ArrowBigDownDash
              className="size-10 mx-auto cursor-pointer animate-bounce"
              onClick={handleNextPageClick}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Submission({ submission }: { submission: SubmissionResponse }) {
  const username = submission.createdBy?.username ?? "anonymous";

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <Time timestamp={new Date(submission.createdAt)} />
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
      <CardContent>
        <p>{submission.details}</p>
      </CardContent>
      <div className="rounded-3xl ring-secondary ring-4 ring-offset-primary ring-offset-1 m-2 md:flex grid justify-center md:justify-around items-center">
        <Badge variant="secondary" className="text-center my-4 p-4">
          {`Votes: ${submission.voteCount}`}
        </Badge>
        <Button>
          <Vote />
          <p className="mx-1">Vote</p>
        </Button>
      </div>
    </Card>
  );
}
