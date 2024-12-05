import { useEffect, useState } from "react";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { SITE_PAGES } from "@/configs/routes";
import { handleError } from "@/lib/error";
import { getUserSession } from "@/lib/supabase";
import Profile from "@/pages/user/account/components/profile";

export default function UserAccountPage() {
  const [_location, setLocation] = useLocation();
  const [isAuthenticated, setAuthenticated] = useState<undefined | boolean>(
    undefined,
  );
  const [page, setPage] = useState<"stats" | "profile">("profile");

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await getUserSession();
        if (session) {
          setAuthenticated(true);
        } else {
          setLocation(SITE_PAGES.AUTH.LOGIN);
        }
      } catch (err) {
        handleError(err);
      }
    }
    void checkAuth();
  }, [setLocation]);

  return isAuthenticated === undefined ? null : (
    <>
      <div className="flex items-center justify-center gap-4 p-4 rounded-full border-2 self-center w-full max-w-md mx-auto">
        <Button
          variant={page === "profile" ? "default" : "secondary"}
          className="text-lg"
          onClick={() => setPage("profile")}
        >
          Profile
        </Button>
        <Button
          variant={page === "stats" ? "default" : "secondary"}
          className="text-lg"
          onClick={() => setPage("stats")}
        >
          Stats
        </Button>
      </div>
      {page === "stats" ? <Stats /> : <Profile />}
    </>
  );
}

function Stats() {
  return <div>Stats</div>;
}
