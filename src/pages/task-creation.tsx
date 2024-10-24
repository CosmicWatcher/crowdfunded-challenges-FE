import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { FORM_LIMITS } from "@/configs/constants";
import { SITE_PAGES } from "@/configs/routes";
import { createTask } from "@/lib/api";
import { handleError } from "@/lib/error";
import { notifyInfo, notifySuccess } from "@/lib/notification";
import { getUserSession } from "@/lib/supabase";
import { TASK_KIND } from "@/types/task.types";
import { getTaskKindColor } from "@/utils/colors";

const taskCreationFormSchema = z.object({
  title: z
    .string()
    .min(FORM_LIMITS.TASK_CREATION.TITLE.MIN, {
      message: `Title must be at least ${FORM_LIMITS.TASK_CREATION.TITLE.MIN} characters`,
    })
    .max(FORM_LIMITS.TASK_CREATION.TITLE.MAX, {
      message: `Title must be less than ${FORM_LIMITS.TASK_CREATION.TITLE.MAX} characters`,
    }),
  description: z.string().max(FORM_LIMITS.TASK_CREATION.DESCRIPTION.MAX, {
    message: `Description must be less than ${FORM_LIMITS.TASK_CREATION.DESCRIPTION.MAX} characters`,
  }),
  maxWinners: z.number(),
});
export type TaskCreationForm = z.infer<typeof taskCreationFormSchema>;

export default function TaskCreationPage() {
  const [taskKind, setTaskKind] = useState<TASK_KIND>("community");
  const [_location, setLocation] = useLocation();
  const [isAuthenticated, setAuthenticated] = useState<undefined | boolean>(
    undefined,
  );
  const taskKindRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ignore = false;

    async function checkAuth() {
      try {
        const session = await getUserSession();
        if (!ignore) {
          if (!session) {
            notifyInfo("Please login to continue!");
            setLocation(SITE_PAGES.LOGIN);
          } else setAuthenticated(true);
        }
      } catch (err) {
        handleError(err);
      }
    }
    void checkAuth();

    return () => {
      ignore = true;
    };
  }, [setLocation]);

  const form = useForm<TaskCreationForm>({
    resolver: zodResolver(taskCreationFormSchema),
    defaultValues: {
      title: "",
      description: "",
      maxWinners: FORM_LIMITS.TASK_CREATION.MAX_WINNERS.MIN,
    },
  });

  async function onSubmit(values: TaskCreationForm) {
    try {
      await createTask(values, taskKind);
      notifySuccess("Task successfully created");
      setLocation(SITE_PAGES.TASKS);
    } catch (err) {
      handleError(err, "Task creation failed");
    }
  }

  const handleTaskKindChange = (newTaskKind: TASK_KIND) => {
    setTaskKind(newTaskKind);
  };

  useEffect(() => {
    if (taskKindRef.current) {
      taskKindRef.current.style.transform =
        taskKind === "community" ? "translateX(0)" : "translateX(100%)";
    }
  }, [taskKind]);

  const kindColor = getTaskKindColor(taskKind);
  const communityTextColor =
    taskKind === "community" ? "text-foreground" : "text-muted-foreground";
  const personalTextColor =
    taskKind === "personal" ? "text-foreground" : "text-muted-foreground";

  return isAuthenticated === undefined ? null : (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="taskKind-toggle"
                  className="block text-center mb-2"
                >
                  Choose the Task Type
                </Label>
                <div className="relative w-64 h-10 mx-auto bg-gray-200 rounded-full">
                  <div
                    ref={taskKindRef}
                    className={`absolute top-1 left-1 w-[calc(50%-4px)] h-8 rounded-full transition-all duration-300 ease-in-out ${
                      kindColor
                    }`}
                  ></div>
                  <div className="absolute inset-0 flex">
                    <button
                      type="button"
                      onClick={() => handleTaskKindChange("community")}
                      className={`flex-1 z-10 rounded-l-full ${communityTextColor}`}
                      aria-pressed={taskKind === "community"}
                    >
                      Community
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTaskKindChange("personal")}
                      className={`flex-1 z-10 rounded-r-full ${personalTextColor}`}
                      aria-pressed={taskKind === "personal"}
                    >
                      Personal
                    </button>
                  </div>
                </div>
              </div>
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter task details and the criteria that the submissions must meet"
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="maxWinners"
                  render={({ field: { value, onChange } }) => (
                    <FormItem>
                      <FormLabel>Maximum Number of Winners: {value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={FORM_LIMITS.TASK_CREATION.MAX_WINNERS.MIN}
                          max={FORM_LIMITS.TASK_CREATION.MAX_WINNERS.MAX}
                          step={1}
                          defaultValue={[value]}
                          onValueChange={(vals) => onChange(vals[0])}
                          className="w-full"
                          // {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
