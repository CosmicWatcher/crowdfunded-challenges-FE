import { CircleSlash2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NotFoundAlert({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Alert className="max-w-lg mx-auto">
      <CircleSlash2Icon className="size-5" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
