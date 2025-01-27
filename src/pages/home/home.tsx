import { CirclePlus } from "lucide-react";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { SITE_PAGES } from "@/configs/routes";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center mt-[15vh] mb-auto">
      <div className="flex flex-col gap-[15vh] w-[80vw] max-w-[400px]">
        <Link href={SITE_PAGES.TASKS.CREATE}>
          <Button className="w-full h-[15vh] min-h-20 animate-glow-border">
            <CirclePlus className="size-9 mr-3 my-4 animate-button-pulse" />
            <p className="text-xl md:text-2xl font-bold">Create Task</p>
          </Button>
        </Link>
        <Link href={SITE_PAGES.TASKS.LIST}>
          <Button className="w-full h-[15vh] min-h-20 animate-glow-border">
            <p className="text-xl md:text-2xl font-bold">View Tasks</p>
          </Button>
        </Link>
      </div>
    </div>
  );
}
