import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Link } from "wouter";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SITE_PAGES } from "@/configs/routes";
import { solutionFormSchema } from "@/configs/schema";
import { createSolution } from "@/lib/api";
import { handleError } from "@/lib/error";
import { SolutionResponse, TaskResponse } from "@/types/api.types";
import { isUserLoggedIn } from "@/utils/auth";

export default function SolutionCreator({
  taskId,
  setNewSolution,
}: {
  taskId: TaskResponse["id"];
  setNewSolution: Dispatch<SetStateAction<SolutionResponse | null>>;
}) {
  const [isAuthenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    let ignore = false;

    async function checkAuth() {
      try {
        const isLoggedIn = await isUserLoggedIn();
        if (!ignore) {
          if (!isLoggedIn) setAuthenticated(false);
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
      title: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof solutionFormSchema>) {
    try {
      const res = await toast.promise(createSolution(values, taskId), {
        pending: "Submitting your solution...",
        success: "Solution successfully submitted",
      });
      if (res) setNewSolution(res.data);
    } catch (err) {
      handleError(err, "Submission failed!");
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
            <Link href={SITE_PAGES.AUTH.LOGIN} className="underline">
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
        <CardTitle>Submit Your Solution</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
