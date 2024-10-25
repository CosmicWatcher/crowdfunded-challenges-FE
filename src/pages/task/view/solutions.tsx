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
import { solutionFormSchema } from "@/configs/schema";
import { createSolution, getSolutionList } from "@/lib/api";
import { handleError } from "@/lib/error";
import { notifySuccess } from "@/lib/notification";
import { getUserSession } from "@/lib/supabase";
import {
  ResponseObject,
  SolutionResponse,
  TaskResponse,
} from "@/types/api.types";

export default function SolutionSection({
  taskId,
}: {
  taskId: TaskResponse["id"];
}) {
  const [newSolution, setNewSolution] = useState<SolutionResponse | null>(null);
  return (
    <>
      <SolutionForm taskId={taskId} setNewSolution={setNewSolution} />
      <SolutionsList taskId={taskId} newSolution={newSolution} />
    </>
  );
}

function SolutionForm({
  taskId,
  setNewSolution,
}: {
  taskId: TaskResponse["id"];
  setNewSolution: Dispatch<SetStateAction<SolutionResponse | null>>;
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

  const form = useForm<z.infer<typeof solutionFormSchema>>({
    resolver: zodResolver(solutionFormSchema),
    defaultValues: {
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof solutionFormSchema>) {
    try {
      const res = await createSolution(values, taskId);
      notifySuccess("Work successfully submitted");
      if (res) setNewSolution(res.data);
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
                        placeholder="Describe your solution here..."
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

function SolutionsList({
  taskId,
  newSolution,
}: {
  taskId: TaskResponse["id"];
  newSolution: SolutionResponse | null;
}) {
  const [solutions, setSolutions] = useState<
    ResponseObject<SolutionResponse[]>
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
      solutions.pagination?.next_page &&
      solutions.pagination.next_page !== page
    ) {
      setPage(solutions.pagination.next_page);
    }
  }

  useEffect(() => {
    if (newSolution) {
      setSolutions((prevSolutions) => {
        return {
          data: [newSolution, ...prevSolutions.data],
          pagination: prevSolutions.pagination,
        };
      });
    }
  }, [taskId, newSolution]);

  // Fetch solutions based on page number
  useEffect(() => {
    let ignore = false;

    async function fetchSolutions(pageNum: number) {
      setLoading(true);
      try {
        const response = await getSolutionList(taskId, pageNum);
        if (!ignore && response.data) {
          console.log(response.pagination);
          setSolutions((prevSolutions) => {
            // Remove duplicates from prevSolutions
            const filteredPrevSolutions = prevSolutions.data.filter(
              (prevSub) =>
                !response.data.some((newSub) => newSub.id === prevSub.id),
            );
            return {
              data: [...filteredPrevSolutions, ...response.data],
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
    void fetchSolutions(page);

    return () => {
      ignore = true;
    };
  }, [page, taskId]);

  if (loading && solutions.data.length === 0) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Alert className="max-w-lg mx-auto">
        <OctagonX className="size-5" />
        <AlertTitle>Error fetching solutions!</AlertTitle>
        <AlertDescription>Please check back later.</AlertDescription>
      </Alert>
    );
  }

  if (solutions.data.length === 0) {
    return (
      <Alert className="max-w-lg mx-auto">
        <CircleSlash className="size-5" />
        <AlertTitle>No solutions available.</AlertTitle>
        <AlertDescription>Please check back later.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="max-w-7xl mx-auto bg-secondary">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold">Solutions</CardTitle>
      </CardHeader>
      <div className="flex justify-center">
        <div className="bg-secondary-foreground w-1/4 p-2 m-4 rounded-xl shadow-md">
          <h3 className="text-sm font-medium text-secondary mb-1">
            Your Total Available Votes
          </h3>
          <p className="text-3xl font-bold text-primary">
            {/* {totalVotesAvailable} */}
            810
          </p>
        </div>
      </div>
      <CardContent className="px-3">
        <div className="space-y-8">
          {solutions.data.map((solution) => (
            <Solution key={solution.id} solution={solution} />
          ))}
          {loading && <Loading />}
          {!loading && solutions.pagination?.next_page && (
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

function Solution({ solution }: { solution: SolutionResponse }) {
  const username = solution.createdBy?.username ?? "anonymous";

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <Time timestamp={new Date(solution.createdAt)} />
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
        <p>{solution.details}</p>
      </CardContent>
      <div className="rounded-3xl ring-secondary ring-4 ring-offset-primary ring-offset-1 m-2 md:flex grid justify-center md:justify-around items-center">
        <Badge variant="secondary" className="text-center my-4 p-4">
          {`Votes: ${solution.voteCount}`}
        </Badge>
        <Button>
          <Vote />
          <p className="mx-1">Vote</p>
        </Button>
      </div>
    </Card>
  );
}
