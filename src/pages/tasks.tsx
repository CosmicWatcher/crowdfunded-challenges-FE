import { CalendarIcon, CheckCircleIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Time from "@/components/ui/time";
import { Task } from "@/types/task.types";

export default function TasksPage() {
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

  return <TaskCard task={task} />;
}

function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="max-w-3xl mx-auto relative">
      <div className=" px-6 py-4 md:flex grid gap-2 justify-center md:justify-between items-center text-sm">
        <div className="flex items-center justify-center space-x-1">
          <Avatar>
            <AvatarFallback>
              {`${task.username[0].toUpperCase()}${task.username[1].toUpperCase()}`}
            </AvatarFallback>
          </Avatar>
          <span>{task.username}</span>
        </div>
        <div className="flex items-center justify-center">
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <Time timestamp={task.creationDate} />
        </div>
        <div className="flex items-center justify-center">
          <Badge variant="outline" className="bg-blue-500">
            {task.taskKind}
          </Badge>
        </div>
      </div>
      <CardContent className="space-y-4">
        <CardTitle className="text-2xl font-bold">{task.title}</CardTitle>
        <p className="line-clamp-2">{task.description}</p>

        <div className="flex items-center">
          <CheckCircleIcon className="mr-1 h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="ml-1">
            {task.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
