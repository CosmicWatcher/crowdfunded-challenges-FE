import { useEffect } from "react";
import { useLocation, useParams } from "wouter";

import { SITE_PAGES } from "@/configs/routes";
import { verifyCodeLogin } from "@/lib/api";
import { handleError } from "@/lib/error";
import { notifySuccess } from "@/lib/notification";
import { isUserLoggedIn, saveCodeLoginSession } from "@/utils/auth";

export function CodeLoginSuccessPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const intentId = params.id;

  useEffect(() => {
    // hide the intent id from the url
    history.replaceState(
      {},
      "null",
      SITE_PAGES.AUTH.CODE_LOGIN.replace("/:id", ""),
    );

    async function verifyLogin() {
      const isLoggedIn = await isUserLoggedIn();
      if (isLoggedIn) {
        console.log("already logged in");
        setLocation(SITE_PAGES.HOME);
      } else {
        if (intentId) {
          try {
            const res = await verifyCodeLogin(intentId);
            saveCodeLoginSession(JSON.stringify(res.data));
            notifySuccess("Successfully logged in");
            setLocation(SITE_PAGES.HOME);
          } catch (err) {
            handleError(err, "Login failed");
            setLocation(SITE_PAGES.HOME);
          }
        }
      }
    }
    void verifyLogin();
  }, [intentId, setLocation]);

  return null;
}
