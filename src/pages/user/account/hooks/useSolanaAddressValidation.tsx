import { useCallback, useEffect, useState } from "react";
import { UseFormGetFieldState, UseFormSetError } from "react-hook-form";

import { validateSolanaAddress } from "@/lib/api";
import { SolanaAddressType } from "@/types/misc.types";

export function useSolanaAddressValidation(
  depositAddressInput: string,
  getFieldState: UseFormGetFieldState<{
    depositAddress: string;
  }>,
  setError: UseFormSetError<{
    depositAddress: string;
  }>,
  depositAddress: string | null,
) {
  const [addressType, setAddressType] = useState<
    SolanaAddressType | null | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { isDirty, invalid } = getFieldState("depositAddress");

  // when address changes, ask the backend if it exists
  const callback = useCallback(() => {
    async function checkAddress(address: string) {
      const { data } = await validateSolanaAddress(address);
      setAddressType(data.type);
      if (data.type === null) {
        setError("depositAddress", {
          type: "manual",
          message: "Address not found!",
        });
      }
    }

    const { invalid, error } = getFieldState("depositAddress");

    if (
      depositAddressInput !== "" &&
      !invalid &&
      error === undefined &&
      depositAddressInput !== depositAddress
    ) {
      checkAddress(depositAddressInput).catch((err) => {
        setError("depositAddress", {
          type: "500",
          message: err instanceof Error ? err.message : String(err),
        });
      });
    }

    if (depositAddressInput === "") {
      setAddressType(undefined);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositAddressInput, depositAddress]);

  // use a debounce effect with a delay to ignore input when user is typing
  useEffect(() => {
    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      callback();
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [callback]);

  return { addressType, isLoading, isDirty, invalid, setAddressType };
}
