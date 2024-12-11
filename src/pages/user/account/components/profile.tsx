import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheckBig, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { updateUserProfileSchema } from "@/configs/schema";
import { getUserAccount, updateUser } from "@/lib/api";
import { handleError } from "@/lib/error";
import { notifySuccess } from "@/lib/notification";
import { useSolanaAddressValidation } from "@/pages/user/account/hooks/useSolanaAddressValidation";
import { useUsernameCheck } from "@/pages/user/account/hooks/useUsernameCheck";

export default function Profile() {
  const [username, setUsername] = useState<string | null>(null);
  const [depositAddress, setDepositAddress] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const res = await getUserAccount();
      setUsername(res.data.username);
      setDepositAddress(res.data.depositAddress ?? null);
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
    values: {
      username: username ?? "",
      depositAddress: depositAddress ?? "",
    },
  });

  const {
    usernameExists,
    isLoading: usernameIsLoading,
    isDirty: usernameIsDirty,
    invalid: usernameInvalid,
    setUsernameExists,
  } = useUsernameCheck(
    form.watch("username"),
    form.getFieldState,
    form.setError,
    username,
  );
  const {
    addressType,
    isLoading: addressIsLoading,
    isDirty: addressIsDirty,
    invalid: addressInvalid,
    setAddressType,
  } = useSolanaAddressValidation(
    form.watch("depositAddress"),
    form.getFieldState,
    form.setError,
    depositAddress,
  );

  async function onSubmit(values: z.infer<typeof updateUserProfileSchema>) {
    try {
      if (
        (usernameExists === false || usernameExists === undefined) &&
        addressType !== null &&
        !usernameIsLoading &&
        !addressIsLoading
      ) {
        const depositAddressInfo =
          form.getFieldState("depositAddress").isDirty && addressType
            ? {
                address: values.depositAddress,
                kind: addressType,
              }
            : undefined;
        const res = await updateUser(
          form.getFieldState("username").isDirty ? values.username : undefined,
          depositAddressInfo,
        );
        setUsername(res.data.username);
        setDepositAddress(res.data.depositAddress ?? null);
        setUsernameExists(undefined);
        setAddressType(undefined);
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
                        {usernameExists === false &&
                          !usernameIsLoading &&
                          !form.getFieldState("username").invalid &&
                          form.getFieldState("username").isDirty && (
                            <CircleCheckBig className="size-5 absolute right-2 top-3 text-green-500" />
                          )}
                        {usernameIsLoading &&
                          usernameIsDirty &&
                          !usernameInvalid && (
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
                      <div className="relative">
                        <Input
                          placeholder="e.g. 262Vo9BwGedpfMF49fc7cmBSRxbyMn87ppGogEfF1Zx9"
                          {...field}
                        />
                        {addressType !== null &&
                          addressType !== undefined &&
                          !addressIsLoading &&
                          !form.getFieldState("depositAddress").invalid &&
                          form.getFieldState("depositAddress").isDirty && (
                            <CircleCheckBig className="size-5 absolute right-2 top-3 text-green-500" />
                          )}
                        {addressIsLoading &&
                          addressIsDirty &&
                          !addressInvalid && (
                            <LoaderCircle className="size-5 absolute right-2 top-3 animate-spin" />
                          )}
                      </div>
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
                  addressType === null ||
                  !form.formState.isValid ||
                  form.getFieldState("username").invalid ||
                  form.getFieldState("depositAddress").invalid ||
                  form.formState.isSubmitting ||
                  usernameIsLoading ||
                  addressIsLoading
                }
              >
                {usernameIsLoading &&
                usernameIsDirty &&
                !usernameInvalid &&
                addressIsLoading &&
                addressIsDirty &&
                !addressInvalid
                  ? "Checking..."
                  : "Update"}
              </Button>
            </div>
          </form>
        </Form>
        {`usernameExists: ${usernameExists}, addressType: ${addressType}, isValid: ${form.formState.isValid}, usernameIsLoading: ${usernameIsLoading}, addressIsLoading: ${addressIsLoading}, addressDirty: ${form.getFieldState("depositAddress").isDirty}, addressInvalid: ${form.getFieldState("depositAddress").invalid}`}
      </CardContent>
    </Card>
  );
}
