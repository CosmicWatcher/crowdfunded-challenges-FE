import { elements } from "@code-wallet/elements";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { APP_URL } from "@/configs/env";
import { SITE_PAGES } from "@/configs/routes";
import { createCodeWalletLoginIntent } from "@/lib/api";
import { handleError } from "@/lib/error";
import { notifySuccess } from "@/lib/notification";
import { forgotPassword, getUserSession, login } from "@/lib/supabase";

export function LoginPage() {
  const [_location, setLocation] = useLocation();
  const [isAuthenticated, setAuthenticated] = useState<undefined | boolean>(
    undefined,
  );
  const previousLocation = useRef(
    sessionStorage.getItem("previousLocation") ?? SITE_PAGES.TASKS.LIST,
  );
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("previousLocation"))
      sessionStorage.removeItem("previousLocation");
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await getUserSession();
        if (!session) setAuthenticated(false);
        else setLocation(previousLocation.current);
      } catch (err) {
        handleError(err);
      }
    }
    void checkAuth();
  }, [previousLocation, setLocation]);

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
      setLocation(previousLocation.current);
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
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <ForgotPassword />
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Password"
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
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

    function createCodeButton() {
      if (ignore) return;

      try {
        const { button } = elements.create("button", {
          mode: "login",

          login: {
            verifier: "DrAjE1JnYCttMubZ63vFejjTXbEkx5TtXFTS8DNtkUhY",
            domain: "kinquest.app",
          },

          confirmParams: {
            success: {
              url: `http://localhost:8090/code-wallet/login/success/{{INTENT_ID}}`,
            },
            cancel: { url: `http://localhost:8090${SITE_PAGES.HOME}` },
          },
        });
        if (codeElement.current && button !== undefined) {
          button.on("invoke", async () => {
            const res = await createCodeWalletLoginIntent();
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

function ForgotPassword() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      await forgotPassword(values.email);
      notifySuccess("Reset instructions sent to email");
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" type="button">
          Forgot Password?
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we&apos;ll send you instructions to
            reset your password. Make sure to check your spam folder.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit(onSubmit)(e);
            }}
          >
            <div className="grid gap-4 py-4">
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
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Instructions"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
