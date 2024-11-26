import { useEffect, useState } from "react";

import { handleError } from "@/lib/error";
import { getUserSession } from "@/lib/supabase";

export default function useUserId() {
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    getUserSession()
      .then((session) => {
        if (!session) setAuthUserId(null);
        else setAuthUserId(session.user.id);
      })
      .catch((err) => {
        handleError(err);
      });
  });

  return authUserId;
}
