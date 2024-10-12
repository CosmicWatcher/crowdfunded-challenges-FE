import { AlertCircle, Frown } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SITE_PAGES } from "@/configs/routes";
import { Button } from "@/components/ui/button";

export function MainErrorFallback() {
  return (
    <Alert variant="destructive">
      <AlertCircle className="size-5" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Ooooops, something went wrong <Frown className="inline size-5" />
      </AlertDescription>
      <br></br>
      <AlertDescription>
        <Button onClick={() => window.location.assign(SITE_PAGES.HOME)}>
          Go Back Home!
        </Button>
      </AlertDescription>
    </Alert>
  );
}
