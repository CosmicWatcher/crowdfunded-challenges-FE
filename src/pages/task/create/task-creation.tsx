import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_TASK_END_DAYS, FORM_LIMITS } from "@/configs/constants";
import { SITE_PAGES } from "@/configs/routes";
import { taskCreationFormSchema } from "@/configs/schema";
import { createTask } from "@/lib/api";
import { handleError } from "@/lib/error";
import { notifyInfo } from "@/lib/notification";
import { cn } from "@/lib/utils";
import { TaskCreationForm, TaskKind } from "@/types/misc.types";
import { isUserLoggedIn } from "@/utils/auth";
import { getTaskKindColor } from "@/utils/colors";

export default function TaskCreationPage() {
  const [taskKind, setTaskKind] = useState<TaskKind>("community");
  const [_location, setLocation] = useLocation();
  const [isAuthenticated, setAuthenticated] = useState<undefined | boolean>(
    undefined,
  );
  const taskKindRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ignore = false;

    async function checkAuth() {
      try {
        const isLoggedIn = await isUserLoggedIn();
        if (!ignore) {
          if (!isLoggedIn) {
            notifyInfo("Please login to continue!");
            sessionStorage.setItem(
              "previousLocation",
              window.location.pathname,
            );
            setLocation(SITE_PAGES.AUTH.LOGIN);
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
      endedAt: addDays(new Date(), DEFAULT_TASK_END_DAYS).toISOString(),
    },
  });

  async function onSubmit(values: TaskCreationForm) {
    try {
      await toast.promise(createTask(values, taskKind), {
        pending: "Submitting task...",
        success: "Task successfully created",
      });
      setLocation(SITE_PAGES.TASKS.LIST);
    } catch (err) {
      handleError(err, "Task creation failed");
      form.setError("root.serverError", { type: "500" });
    }
  }

  const { formState, reset } = form;
  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset();
    }
  }, [formState, reset]);

  const handleTaskKindChange = (newTaskKind: TaskKind) => {
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
    <Card className="w-full max-w-7xl mx-auto my-0">
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
      </CardHeader>
      <Form {...form}>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="taskKind-toggle"
                className="block text-center mb-2"
              >
                Choose the Task Type
              </Label>
              <div className="relative w-64 h-10 mx-auto bg-muted rounded-full">
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
              <div className="flex justify-center">
                {taskKind === "community" ? (
                  <Label
                    htmlFor="taskKind-toggle"
                    className={`text-center rounded-2xl px-4 py-2 w-fit ${kindColor}`}
                  >
                    The
                    <em>
                      <b> COMMUNITY </b>
                    </em>
                    determines the success of the task
                  </Label>
                ) : (
                  // <p
                  //   className={`text-md rounded-2xl px-4 py-2 w-fit ${kindColor}`}
                  // >
                  //   The <em>COMMUNITY</em> determines the success of the task
                  // </p>
                  <Label
                    htmlFor="taskKind-toggle"
                    className={`text-center rounded-2xl px-4 py-2 w-fit ${kindColor}`}
                  >
                    <em>
                      <b>YOU </b>
                    </em>
                    determine the success of the task
                  </Label>
                  // <p className={`text-md ${kindColor}`}>
                  //   <em>You</em> determine the success of the task
                  // </p>
                )}
              </div>
            </div>
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter task details and the criteria that the solutions must meet"
                      className="min-h-48"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endedAt"
              render={({ field: { onChange } }) => (
                <FormItem>
                  <FormLabel className="mr-2">End Date:</FormLabel>
                  <FormControl>
                    <DatePicker onChange={onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="mt-8">
            <Button disabled={formState.isSubmitting} className="w-full">
              {formState.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

function DatePicker({ onChange }: { onChange: (value: string) => void }) {
  const [date, setDate] = useState<Date>(
    addDays(new Date(), DEFAULT_TASK_END_DAYS),
  );

  function handleDateChange(newDate: Date) {
    setDate(newDate);
    onChange(newDate.toISOString());
    // console.log(new Date().toISOString(), newDate.toISOString());
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
        <Select
          onValueChange={(value) => {
            const newDate = addDays(new Date(), parseInt(value));
            handleDateChange(newDate);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Easy Select" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="1">Tomorrow</SelectItem>
            <SelectItem value="3">In 3 days</SelectItem>
            <SelectItem value="7">In a week</SelectItem>
            <SelectItem value="14">In 2 weeks</SelectItem>
          </SelectContent>
        </Select>
        <div className="rounded-md border">
          <Calendar
            mode="single"
            month={date}
            disabled={{ before: addDays(new Date(), 1) }}
            selected={date}
            onSelect={(newDate) => {
              if (newDate) {
                const now = new Date();
                newDate.setHours(
                  now.getHours(),
                  now.getMinutes(),
                  now.getSeconds(),
                  now.getMilliseconds(),
                );
                handleDateChange(newDate);
              }
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
