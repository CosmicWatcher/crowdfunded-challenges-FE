import { MailWarning } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SITE_PAGES } from "@/configs/routes";
import { isUserLoggedIn } from "@/utils/auth";

export default function VerifyEmailPage() {
  const [_location, setLocation] = useLocation();
  const [isAuthenticated, setAuthenticated] = useState<undefined | boolean>(
    undefined,
  );

  useEffect(() => {
    async function checkAuth() {
      const isLoggedIn = await isUserLoggedIn();
      if (!isLoggedIn) setAuthenticated(false);
      else setLocation(SITE_PAGES.ACCOUNT);
    }
    checkAuth().catch((err) =>
      console.log(
        `%c ${new Date(Date.now()).toLocaleTimeString()}`,
        "color:CornflowerBlue; font-weight:bold;",
        "Error checking auth:",
        err,
      ),
    );
  }, [setLocation]);

  return isAuthenticated === undefined || isAuthenticated ? null : (
    <Alert className="max-w-lg mx-auto">
      <MailWarning className="size-5" />
      <AlertTitle>Verify your email</AlertTitle>
      <AlertDescription>
        Please check your email for a verification link before you can login
      </AlertDescription>
    </Alert>
  );
}
