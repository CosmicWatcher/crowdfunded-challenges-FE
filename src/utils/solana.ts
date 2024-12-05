import {
  Connection,
  PublicKey,
  SystemProgram,
  clusterApiUrl,
} from "@solana/web3.js";

import { SOLANA_RPC } from "@/configs/env";
import { SolanaAddressType } from "@/types/misc.types";

const solanaConn = new Connection(clusterApiUrl(SOLANA_RPC));

export async function validateSolanaAddress(
  address: string,
): Promise<SolanaAddressType | null> {
  const accountInfo = await solanaConn.getAccountInfo(new PublicKey(address));

  if (accountInfo === null) {
    return null;
  }
  if (accountInfo.owner.toBase58() === SystemProgram.programId.toBase58()) {
    return "solana";
  } else {
    return "token";
  }
}
