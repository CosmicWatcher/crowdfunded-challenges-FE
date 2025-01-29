import { CirclePlus } from "lucide-react";
import { Link } from "wouter";

import { FeaturedTasks } from "@/components/layout/featured-tasks";
import { Button } from "@/components/ui/button";
import { SITE_PAGES } from "@/configs/routes";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <FeaturedTasks />
      <div className="flex flex-col items-center space-y-4">
        <Button className="w-fit p-8 animate-glow-border" asChild>
          <Link href={SITE_PAGES.TASKS.CREATE}>
            <CirclePlus className="size-9 mr-3 my-4 animate-button-pulse" />
            <p className="text-xl md:text-2xl font-bold">Create</p>
          </Link>
        </Button>
        <Button className="w-fit p-8 animate-glow-border" asChild>
          <Link href={SITE_PAGES.TASKS.LIST}>
            <p className="text-xl md:text-2xl font-bold">View All</p>
          </Link>
        </Button>
      </div>
    </div>
  );
}
