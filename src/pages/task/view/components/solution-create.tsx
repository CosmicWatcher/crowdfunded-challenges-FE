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
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { SITE_PAGES } from "@/configs/routes";
import { solutionFormSchema } from "@/configs/schema";
import { createSolution } from "@/lib/api";
import { handleError } from "@/lib/error";
import { notifySuccess } from "@/lib/notification";
import { getUserSession } from "@/lib/supabase";
import { SolutionResponse, TaskResponse } from "@/types/api.types";

export default function SolutionCreator({
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
        <CardTitle>Submit Your Solution</CardTitle>
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
