import { useEffect, useState } from "react";

import { handleError } from "@/lib/error";
import { getAuthUserId } from "@/utils/auth";

export function useUserId() {
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    async function getUserId() {
      try {
        const userId = await getAuthUserId();
        setAuthUserId(userId);
      } catch (err) {
        handleError(err);
      }
    }
    void getUserId();
  });

  return authUserId;
}
