import { useEffect, useState } from "react";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { SITE_PAGES } from "@/configs/routes";
import { handleError } from "@/lib/error";
import Profile from "@/pages/user/account/components/profile";
import { isUserLoggedIn } from "@/utils/auth";

export default function UserAccountPage() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setAuthenticated] = useState<boolean>();
  const [page, setPage] = useState<"stats" | "profile">("profile");

  useEffect(() => {
    async function checkAuth() {
      try {
        const isLoggedIn = await isUserLoggedIn();
        if (isLoggedIn) {
          setAuthenticated(true);
        } else {
          sessionStorage.setItem("previousLocation", window.location.pathname);
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
      <div className="flex items-center justify-center bg-background gap-4 p-4 rounded-full border-2 self-center w-full max-w-md mx-auto">
        <Button
          variant={page === "profile" ? "default" : "secondary"}
          className="text-lg"
          onClick={() => setPage("profile")}
        >
          Profile
        </Button>
        <Button
          variant="secondary"
          className="text-lg"
          onClick={() => setLocation(SITE_PAGES.AUTH.UPDATE_PASSWORD)}
        >
          Update Password
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
  return <div className="text-center">Coming Soon</div>;
}
