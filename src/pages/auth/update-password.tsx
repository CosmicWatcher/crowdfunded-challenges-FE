import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SITE_PAGES } from "@/configs/routes";
import { handleError } from "@/lib/error";
import { notifySuccess } from "@/lib/notification";
import { getUserSession, updatePassword } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const [_location, setLocation] = useLocation();
  const [isAuthenticated, setAuthenticated] = useState<undefined | boolean>(
    undefined,
  );

  useEffect(() => {
    async function checkAuth() {
      const session = await getUserSession();
      if (!session) {
        setAuthenticated(false);
        setLocation(SITE_PAGES.AUTH.LOGIN);
      } else {
        setAuthenticated(true);
      }
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

  const formSchema = z.object({
    password: z.string().min(6, {
      message: "Password must be at least 6 characters",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updatePassword(values.password);
      notifySuccess("Successfully updated password");
      setLocation(SITE_PAGES.ACCOUNT);
    } catch (err) {
      handleError(err, "Password update failed");
    }
  }

  return isAuthenticated === undefined || !isAuthenticated ? null : (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Update Password</CardTitle>
        <CardDescription>
          Enter your new password below to update your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Form {...form}>
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Password"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                Update Password
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
