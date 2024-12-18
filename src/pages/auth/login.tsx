import { elements } from "@code-wallet/elements";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "wouter";
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
import { createLoginIntent } from "@/lib/api";
import { handleError } from "@/lib/error";
import { notifySuccess } from "@/lib/notification";
import { getUserSession, login } from "@/lib/supabase";

export function LoginPage() {
  const [_location, setLocation] = useLocation();
  const [isAuthenticated, setAuthenticated] = useState<undefined | boolean>(
    undefined,
  );

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await getUserSession();
        if (!session) setAuthenticated(false);
        else setLocation(SITE_PAGES.HOME);
      } catch (err) {
        handleError(err);
      }
    }
    void checkAuth();
  }, [setLocation]);

  const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await login(values.email, values.password);
      notifySuccess("Successfully logged in");
      setLocation(SITE_PAGES.HOME);
    } catch (err) {
      handleError(err, "Login failed");
    }
  }

  return isAuthenticated === undefined ? null : (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Login with Code Wallet <em className="font-bold">OR</em> with your
          email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <CodeWalletLogin />
        </div>
        <div className="grid gap-4 mt-10">
          <Form {...form}>
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                        <Link
                          href="#"
                          className="ml-auto inline-block text-sm underline"
                        >
                          Forgot your password?
                        </Link>
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
                Login
              </Button>
            </form>
          </Form>
          {/* <Button variant="outline" className="w-full">
            Login with Google
            </Button> */}
        </div>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href={SITE_PAGES.AUTH.SIGNUP} className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function CodeWalletLogin() {
  const codeElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ignore = false;

    async function createCodeButton() {
      if (ignore) return;

      try {
        const { button } = elements.create("button", {
          mode: "login",

          login: {
            verifier: "DrAjE1JnYCttMubZ63vFejjTXbEkx5TtXFTS8DNtkUhY",
            domain: "mydomain.local",
          },

          confirmParams: {
            success: { url: `${"mydomain.local"}/success/{{INTENT_ID}}` },
            cancel: { url: `${"mydomain.local"}/` },
          },
        });
        if (codeElement.current && button !== undefined) {
          button.on("invoke", async () => {
            const res = await createLoginIntent();
            const clientSecret = res.data;
            console.log("clientSecret: ", clientSecret);

            // Update the button with the new client secret so that our server
            // can be notified once the payment is complete.
            button.update({ clientSecret });
          });

          button.mount(codeElement.current);
          // codeBtnCreated.current = true;
        } else {
          console.error("codeElement.current is null or undefined");
        }
      } catch (error) {
        console.error("createCodeButton failed: ", error);
      }
    }
    void createCodeButton();

    return () => {
      ignore = true;
    };
  }, []);

  return <div ref={codeElement} />;
}
