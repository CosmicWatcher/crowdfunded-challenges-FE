import { useCallback, useEffect, useState } from "react";
import { UseFormGetFieldState, UseFormSetError } from "react-hook-form";

import { checkUsernameExists } from "@/lib/api";

export default function useUsernameCheck(
  usernameInput: string,
  getFieldState: UseFormGetFieldState<{
    username: string;
  }>,
  setError: UseFormSetError<{
    username: string;
  }>,
  username: string | null,
) {
  const [usernameExists, setUsernameExists] = useState<boolean | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(false);
  const { isDirty, invalid } = getFieldState("username");

  // when username changes, ask the backend if it exists
  const callback = useCallback(() => {
    async function checkUsername(username: string) {
      const exists = await checkUsernameExists(username);
      setUsernameExists(exists);
      if (exists) {
        setError("username", {
          type: "manual",
          message: "Username already exists",
        });
      }
    }

    const { invalid, error } = getFieldState("username");

    if (
      usernameInput !== "" &&
      !invalid &&
      error === undefined &&
      usernameInput !== username
    ) {
      checkUsername(usernameInput).catch((err: Error) => {
        setError("username", {
          type: "500",
          message: "Username check failed: " + err.message,
        });
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usernameInput, username]);

  // use a debounce effect with a delay to ignore input when user is typing
  useEffect(() => {
    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      callback();
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [callback]);

  return { usernameExists, isLoading, isDirty, invalid, setUsernameExists };
}
