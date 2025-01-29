import { CalendarIcon } from "lucide-react";
import { useLocation } from "wouter";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { UserMetric } from "@/components/ui/metrics";
import { OverallMetric } from "@/components/ui/metrics";
import Time from "@/components/ui/time";
import { NO_USERNAME } from "@/configs/constants";
import { SITE_PAGES } from "@/configs/routes";
import { TaskResponse } from "@/types/api.types";
import { getTaskKindColor } from "@/utils/colors";
import { getTaskStatusColor } from "@/utils/colors";

export function TaskPreview({ task }: { task: TaskResponse }) {
  const [_location, setLocation] = useLocation();
  const username = task.createdBy?.username ?? NO_USERNAME;
  const kindColor = getTaskKindColor(task.kind);
  const statusColor = getTaskStatusColor(task.status);

  return (
    <Card
      className={`max-w-7xl mx-auto relative cursor-pointer border-2 ${statusColor.background}`}
      onClick={() => setLocation(SITE_PAGES.TASKS.VIEW.replace(":id", task.id))}
    >
      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
        <Badge variant="outline" className={`${kindColor} pb-[0.25rem]`}>
          {task.kind}
        </Badge>
      </div>
      <div className="flex justify-between">
        <div className="space-y-2 p-4">
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
        <div className="flex items-center">
          <OverallMetric
            metric={`${task.metrics.overall.totalFunds.toLocaleString(undefined, { maximumFractionDigits: 0 })} Kin`}
            label="Funds"
            className="mr-1 p-1 px-2 md:mr-2 md:p-2 md:px-4"
          />
          {task.metrics?.user && (
            <UserMetric
              metric={`${task.metrics.user.totalFunds.toLocaleString(undefined, { maximumFractionDigits: 0 })} Kin`}
              label="Your Contribution"
              className="ml-0 p-1 px-2 md:p-2 md:px-4"
            />
          )}
        </div>
      </div>
      <CardContent className="space-y-4">
        <CardTitle className="text-2xl font-bold line-clamp-2 break-words">
          {task.title}
        </CardTitle>
        <p className="line-clamp-2 break-words">{task.details}</p>
      </CardContent>
      {task.status !== "active" && (
        <CardFooter>
          <div className="absolute -left-2 bottom-6 rotate-[30deg]">
            <Badge
              variant="secondary"
              className={`pb-[0.25rem] w-36 justify-center text-sm ring-offset-2 ring-1 ${statusColor.border} ring-secondary-foreground`}
            >
              {task.status}
            </Badge>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
