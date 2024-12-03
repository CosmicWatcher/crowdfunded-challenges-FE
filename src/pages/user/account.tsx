import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheckBig, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FORM_LIMITS } from "@/configs/constants";
import { SITE_PAGES } from "@/configs/routes";
import { updateUserProfileSchema } from "@/configs/schema";
import { checkUsernameExists, getUserAccount, updateUser } from "@/lib/api";
import { handleError } from "@/lib/error";
import { notifySuccess } from "@/lib/notification";
import { getUserSession } from "@/lib/supabase";

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

function Profile() {
  const [username, setUsername] = useState("");
  const [depositAddress, setDepositAddress] = useState("");
  const [usernameExists, setUsernameExists] = useState<boolean | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getUser() {
      const res = await getUserAccount();
      setUsername(res.data.username ?? "");
      setDepositAddress(res.data.depositAddress ?? "");
    }
    void getUser();
  }, []);

  const form = useForm<z.infer<typeof updateUserProfileSchema>>({
    mode: "onChange",
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      username: "",
      depositAddress: "",
    },
    values: { username, depositAddress },
  });
  const usernameInput = form.watch("username");
  const { isDirty: usernameIsDirty, invalid: usernameInvalid } =
    form.getFieldState("username");

  // when username changes, ask the backend if it exists
  const callback = useCallback(() => {
    async function checkUsername(username: string) {
      const exists = await checkUsernameExists(username);
      setIsLoading(false);
      setUsernameExists(exists);
      if (exists) {
        form.setError("username", {
          type: "manual",
          message: "Username already exists",
        });
      }
    }

    const { invalid, error } = form.getFieldState("username");

    if (
      usernameInput !== "" &&
      !invalid &&
      error === undefined &&
      usernameInput !== username
    ) {
      checkUsername(usernameInput).catch((err) => {
        handleError(err);
        form.setError("username", {
          type: "500",
          message: "Username check failed",
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
    }, 1000);

    return () => {
      setIsLoading(false);
      clearTimeout(timeoutId);
    };
  }, [callback]);

  async function onSubmit(values: z.infer<typeof updateUserProfileSchema>) {
    try {
      if (usernameExists === false && !isLoading) {
        const res = await updateUser(values);
        setUsername(res.data.username ?? "");
        setDepositAddress(res.data.depositAddress ?? "");
        setUsernameExists(undefined);
        form.reset();
        notifySuccess("Account successfully updated");
      }
    } catch (err) {
      handleError(err, "Account update failed");
      form.setError("root.serverError", { type: "500" });
    }
  }

  return (
    <Card className="max-w-xl mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-xl">Account Information</CardTitle>
        <CardDescription>Update your account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormDescription>
                      {`Choose a Username between ${FORM_LIMITS.ACCOUNT.USERNAME.MIN} and ${FORM_LIMITS.ACCOUNT.USERNAME.MAX} characters`}
                    </FormDescription>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} />
                        {usernameExists === false && !isLoading && (
                          <CircleCheckBig className="size-5 absolute right-2 top-3 text-green-500" />
                        )}
                        {isLoading && usernameIsDirty && !usernameInvalid && (
                          <LoaderCircle className="size-5 absolute right-2 top-3 animate-spin" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="depositAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit Address</FormLabel>
                    <FormDescription>
                      Your Solana account or Kin token address where you want to
                      receive your Kin earnings
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="e.g. 262Vo9BwGedpfMF49fc7cmBSRxbyMn87ppGogEfF1Zx9"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div
              className={`flex justify-evenly transition-all duration-500 ease-in-out ${
                form.formState.isDirty && !form.formState.isSubmitSuccessful
                  ? "opacity-100 max-h-20 mt-8"
                  : "opacity-0 max-h-0 overflow-hidden"
              }`}
            >
              <Button
                type="reset"
                variant="destructive"
                className="w-32"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-32"
                disabled={
                  usernameExists === true ||
                  !form.formState.isValid ||
                  isLoading
                }
              >
                {isLoading && usernameIsDirty && !usernameInvalid
                  ? "Checking..."
                  : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function Stats() {
  return <div>Stats</div>;
}
