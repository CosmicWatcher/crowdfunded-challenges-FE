import Autoplay from "embla-carousel-autoplay";
import { useEffect } from "react";
import { useState } from "react";

import { TaskPreview } from "@/components/layout/task-preview";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { getFeaturedTasks } from "@/lib/api";
import { handleError } from "@/lib/error";
import { TaskResponse } from "@/types/api.types";

export function FeaturedTasks() {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function fetchTasks() {
      try {
        const response = await getFeaturedTasks();
        if (!ignore && response.data) {
          setTasks(response.data);
          setLoading(false);
        }
      } catch (err) {
        handleError(err);
      }
    }
    void fetchTasks();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    // <div className="flex justify-center mx-auto max-w-screen-sm md:max-w-7xl">
    <Card className="rounded-3xl max-w-7xl mx-auto bg-gradient-to-b from-primary/60 to-muted/10 from-0% to-100%">
      <CardHeader>
        <CardTitle className="text-4xl text-center">Featured Tasks</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {tasks.length > 0 ? (
          <Carousel
            plugins={[
              Autoplay({
                delay: 5000,
              }),
            ]}
            className="w-full max-w-fit flex flex-col gap-4 "
          >
            <CarouselContent className="py-4 px-2 flex items-center">
              {tasks.map((task, index) => (
                <CarouselItem
                  key={task.id}
                  className={index === tasks.length - 1 ? "pr-4" : ""}
                >
                  <TaskPreview task={task} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-evenly">
              <div className="relative">
                <CarouselPrevious />
              </div>
              <div className="relative">
                <CarouselNext />
              </div>
            </div>
          </Carousel>
        ) : loading ? (
          <Skeleton className="w-5/6 mx-auto h-[17rem] rounded-3xl" />
        ) : (
          <Alert className="w-fit mx-auto">
            <AlertTitle className="text-2xl">
              No featured tasks found!
            </AlertTitle>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
