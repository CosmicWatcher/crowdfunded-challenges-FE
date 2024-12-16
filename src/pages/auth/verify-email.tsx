import { MailWarning } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SITE_PAGES } from "@/configs/routes";
import { getUserSession } from "@/lib/supabase";

export default function VerifyEmailPage() {
  const [_location, setLocation] = useLocation();
  const [isAuthenticated, setAuthenticated] = useState<undefined | boolean>(
    undefined,
  );

  useEffect(() => {
    async function checkAuth() {
      const session = await getUserSession();
      if (!session) setAuthenticated(false);
      else setLocation(SITE_PAGES.ACCOUNT);
    }
    checkAuth().catch((err) =>
      console.log(new Date().toLocaleString(), "Error checking auth:", err),
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
