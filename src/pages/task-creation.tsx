import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useLocation } from "wouter";
import { getUserSession } from "@/lib/supabase";
import { createTask } from "@/lib/api";
import { SITE_PAGES } from "@/configs/routes";
import { handleError } from "@/lib/error";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { notifyInfo, notifySuccess } from "@/lib/notification";
import { FORM_LIMITS, TASK_TYPES } from "@/configs/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
  const [taskType, setTaskType] = useState(TASK_TYPES.COMMUNITY);
  const [_location, setLocation] = useLocation();
  const [isAuthenticated, setAuthenticated] = useState<undefined | boolean>(
    undefined,
  );
  const taskTypeRef = useRef<HTMLDivElement>(null);

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
      await createTask(values, taskType);
      notifySuccess("Task successfully created");
      setLocation(SITE_PAGES.TASKS);
    } catch (err) {
      handleError(err, "Task creation failed");
    }
  }

  const handleTaskTypeChange = (newTaskType: TASK_TYPES) => {
    setTaskType(newTaskType);
  };

  useEffect(() => {
    if (taskTypeRef.current) {
      taskTypeRef.current.style.transform =
        taskType === TASK_TYPES.COMMUNITY
          ? "translateX(0)"
          : "translateX(100%)";
    }
  }, [taskType]);

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
                  htmlFor="taskType-toggle"
                  className="block text-center mb-2"
                >
                  Choose the Task Type
                </Label>
                <div className="relative w-64 h-10 mx-auto bg-gray-200 rounded-full">
                  <div
                    ref={taskTypeRef}
                    className={`absolute top-1 left-1 w-[calc(50%-4px)] h-8 rounded-full transition-all duration-300 ease-in-out ${
                      taskType === TASK_TYPES.COMMUNITY
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }`}
                  ></div>
                  <div className="absolute inset-0 flex">
                    <button
                      type="button"
                      onClick={() => handleTaskTypeChange(TASK_TYPES.COMMUNITY)}
                      className={`flex-1 z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-l-full ${
                        taskType === TASK_TYPES.COMMUNITY
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                      aria-pressed={taskType === TASK_TYPES.COMMUNITY}
                    >
                      Community
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTaskTypeChange(TASK_TYPES.PERSONAL)}
                      className={`flex-1 z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-r-full ${
                        taskType === TASK_TYPES.PERSONAL
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                      aria-pressed={taskType === TASK_TYPES.PERSONAL}
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
