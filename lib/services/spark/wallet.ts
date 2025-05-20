// https://docs.spark.money/wallet/developer-guide/create-first-wallet

import {
  SparkWallet as SparkWalletBase,
  getLatestDepositTxId,
} from "@buildonspark/spark-sdk";
import { NETWORK, USD_ISSUER_WALLET } from "../constants";
import { bech32m } from "bech32";
import prisma from "@/lib/prisma";
import { getIssuerWallet } from "./issuer";
import { createPaymentIntent } from "../stripe";
import { User } from "@prisma/client";
type TransferrableCurrency = "BTC" | "USD" | "EUR";

interface TransferProps {
  destination: string; // BTC address, Lightning invoice, or Spark address
  destinationType: "sparkAddress" | "btcAddress" | "lightningInvoice";
  amount: number;
  destinationCurrency: TransferrableCurrency;
  memo: string;
}

// POSTHACK: implement
const placeholderBitcoinPriceCents = 10312000;
// USD <> BTC
export const convert = ({
  sourceCurrency,

  sourceAmount, // sats or cents
}: {
  sourceCurrency: TransferrableCurrency;
  sourceAmount: number;
}): number => {
  // 100 000 000 sats => 10300000 cents
  if (sourceCurrency === "BTC") {
    return Math.floor(
      (sourceAmount * placeholderBitcoinPriceCents) / 100_000_000
    );
  }
  // 10300000 cents => 100 000 000 sats
  return Math.floor(
    (sourceAmount * 100_000_000) / placeholderBitcoinPriceCents
  );
};

export const executeSparkXtransfer = async ({
  sparkAddress,
  amount,
  currency,
  memo,
  requestingUserId,
  destinationUserId,
  sendingSparkWalletMnemonic,
  sendingUser,
}: {
  sparkAddress: string;
  amount: number;
  currency: TransferrableCurrency;
  memo: string;
  requestingUserId: string;
  destinationUserId: string;
  sendingSparkWalletMnemonic: string;
  sendingUser: User;
}) => {
  let receivingSparkAddress = sparkAddress;
  const amountSmallestUnit = parseInt(
    (currency === "BTC" ? amount : amount / 10000).toString()
  );
  console.log({ amountSmallestUnit });
  // Create transfer record
  const transfer = await prisma.transfer.create({
    data: {
      requestingUserId,
      receivingUserId: destinationUserId,
      receivingCurrency: currency,
      receivingAmount: amountSmallestUnit,
      destinationCurrency: currency,
      destinationAmount: amountSmallestUnit,
      memo,
      receivingSparkAddress,
      status: "PENDING",
    },
  });

  let receivingUser;
  if (destinationUserId) {
    receivingUser = await prisma.user.findUnique({
      where: { id: destinationUserId },
      include: { sparkWallet: true },
    });
    if (receivingUser?.sparkWallet) {
      receivingSparkAddress = receivingUser.sparkWallet.address;
    }
  }

  const sendingWallet = await getSparkWallet(sendingSparkWalletMnemonic);
  if (currency === "USD") {
    const { tokenBalances } = await sendingWallet.getBalance();
    const usdBalance = tokenBalances.get(
      USD_ISSUER_WALLET.tokenPubKey!
    )?.balance;
    const amountCents = Math.floor(Number(usdBalance) / 10000);
    console.log({
      amountCents,
      amountSmallestUnit,
    });
    if (amountCents >= amountSmallestUnit) {
      console.log("Transferring from wallet");
      await sendingWallet.transferTokens({
        tokenPublicKey: USD_ISSUER_WALLET.tokenPubKey!,
        tokenAmount: BigInt(amountSmallestUnit * 10000),
        receiverSparkAddress: receivingSparkAddress,
      });
      await prisma.transfer.update({
        where: { id: transfer.id },
        data: { status: "COMPLETED" },
      });

      return transfer;
    } else {
      console.log("Transferring from bank");
      await createPaymentIntent({
        amountCents: amountSmallestUnit,
        currency: sendingUser.region === "US" ? "usd" : "eur",
        paymentMethodId: sendingUser.stripePaymentId!,
        customerId: sendingUser.stripeCustomerId!,
      });
      const usdIssuerWallet = await getIssuerWallet(
        USD_ISSUER_WALLET.mnemonic!
      );

      const mintAmount = BigInt(amount);
      const mintedResult = await usdIssuerWallet.mintTokens(mintAmount);

      console.log("Minted result:", mintedResult);
      await usdIssuerWallet.transferTokens({
        tokenPublicKey: USD_ISSUER_WALLET.tokenPubKey!,
        tokenAmount: mintAmount,
        receiverSparkAddress: receivingSparkAddress,
      });
      await prisma.transfer.update({
        where: { id: transfer.id },
        data: { status: "COMPLETED" },
      });
    }
    return transfer;
  } else {
    await sendingWallet.transfer({
      amountSats: amountSmallestUnit,
      receiverSparkAddress: receivingSparkAddress,
    });

    await prisma.transfer.update({
      where: { id: transfer.id },
      data: { status: "COMPLETED" },
    });

    return transfer;
  }
};

const createSparkWallet = async () => {
  const { wallet, mnemonic } = await SparkWallet.initialize({
    options: {
      network: NETWORK,
    },
  });
  console.log("Spark wallet mnemonic", mnemonic);

  return {
    wallet,
    mnemonic,
  };
};

const getSparkWallet = async (mnemonic: string) => {
  const { wallet } = await SparkWallet.initialize({
    mnemonicOrSeed: mnemonic,
    options: {
      network: NETWORK,
    },
  });

  return new SparkWallet(wallet);
};

export const generateSparkInvoice = ({
  sparkAddress,
  amount,
  destinationCurrency,
  memo,
}: {
  sparkAddress: string;
  amount: number;
  destinationCurrency: "BTC" | string; // BTC or token pubkey
  memo: string;
  // expiration: number
}) => {
  const prefix = "spi";
  const data = {
    sparkAddress,
    amount: amount.toString(),
    destinationCurrency,
    memo,
    // POSTHACK: Invoice expiration
    // expiration
  };

  // Convert data object to Uint8Array
  const dataString = JSON.stringify(data);
  const dataBytes = new TextEncoder().encode(dataString);

  // Encode using bech32m
  const encoded = bech32m.encode(prefix, bech32m.toWords(dataBytes), 1023);
  if (!encoded) {
    throw new Error("Failed to encode invoice data");
  }

  return encoded;
};

export const decodeSparkInvoice = (invoice: string) => {
  try {
    const { prefix: hrp, words } = bech32m.decode(invoice, 1023);
    if (hrp !== "spi") {
      throw new Error(`Invalid HRP prefix: ${hrp}`);
    }

    // Convert words back to bytes
    const dataBytes = new Uint8Array(bech32m.fromWords(words));

    // Convert bytes back to string
    const dataString = new TextDecoder().decode(dataBytes);

    // Parse the JSON data
    const data = JSON.parse(dataString);

    // Validate required fields
    const requiredFields = ["sparkAddress", "amount", "destinationCurrency"];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return {
      hrp,
      sparkAddress: data.sparkAddress,
      amount: data.amount,
      destinationCurrency: data.destinationCurrency,
      memo: data.memo || "No description",
      timestamp: Date.now(), // Since we don't store timestamp in the invoice
    };
  } catch (error) {
    throw new Error(
      `Failed to decode invoice: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

const SparkWallet = class extends SparkWalletBase {
  constructor(private readonly wallet: SparkWalletBase) {
    super();
    Object.assign(this, wallet);
  }

  async settleDeposit(depositAddress: string) {
    const result = await getLatestDepositTxId(depositAddress);

    let tx;
    if (result) {
      console.log("Transaction ID: ", result);
      tx = await this.wallet.claimDeposit(result);
    }

    return tx;
  }

  // issuerWallet.on("transfer:claimed", (transferid, updatedata) => {
  //   console.log(transferid, updatedata);
  // });
  async onTransferClaimed(
    callback: (transferId: string, updatedata: any) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      this.wallet.on("transfer:claimed", (transferId, updatedata) => {
        callback(transferId, updatedata);
        resolve();
      });
    });
  }

  // async canPay({
  //   amountToSend,
  //   destinationCurrency,
  // }: {
  //   amountToSend: number;
  //   destinationCurrency: TransferrableCurrency;
  // }): Promise<boolean> {
  //   try {
  //     await this.getSourceCurrency({
  //       amountToSend,
  //       destinationCurrency,
  //     });
  //     return true;
  //   } catch (error) {
  //     console.error("Error checking if can pay", error);
  //     return false;
  //   }
  // }

  // POSTHACK: finish
  // async multiCurrencyTransfer({
  //   destination,
  //   destinationType,
  //   amount,
  //   destinationCurrency,
  // }: TransferProps) {
  //   let transfer: any;
  //   console.log("Transfer", {
  //     sourceAddress: this.getSparkAddress(),
  //     destination,
  //     destinationType,
  //     amount,
  //     destinationCurrency,
  //   });

  //   let sourceCurrency: TransferrableCurrency;
  //   try {
  //     sourceCurrency = await this.getSourceCurrency({
  //       amountToSend: amount,
  //       destinationCurrency,
  //     });
  //   } catch (error) {
  //     console.error("Error getting source currency", error);
  //     throw new Error("Not enough balance");
  //   }

  //   // Spark BTC <> BTC
  //   if (sourceCurrency === "BTC" && destinationType === "btcAddress") {
  //     if (amount < 10000) {
  //       // Spark restriction
  //       throw new Error("Amount must be greater than or equal to 10000 sats");
  //     }

  //     transfer = await this.withdraw({
  //       onchainAddress: destination,
  //       // @ts-ignore - idk if this'll work
  //       exitSpeed: "FAST",
  //       amountSats: amount * 100000000,
  //     });
  //   }

  //   // Spark BTC <> LN
  //   if (sourceCurrency === "BTC" && destinationType === "lightningInvoice") {
  //     transfer = await this.payLightningInvoice({
  //       invoice: destination,
  //       maxFeeSats: 10000,
  //     });
  //   }

  //   // Spark <> Spark
  //   // if BTC<>BTC:
  //   if (sourceCurrency === "BTC" && destinationType === "sparkAddress") {
  //     transfer = await this.transfer({
  //       receiverSparkAddress: destination,
  //       amountSats: amount,
  //     });
  //   }

  //   // if EUR<>EUR:
  //   // if USD<>USD:
  //   if (
  //     (sourceCurrency === "USD" && destinationCurrency === "USD") ||
  //     (sourceCurrency === "EUR" && destinationCurrency === "EUR")
  //   ) {
  //     // POSTHACK: get token public key
  //     const tokenPublicKey = "";
  //     transfer = await this.transferTokens({
  //       receiverSparkAddress: destination,
  //       tokenPublicKey: tokenPublicKey,
  //       // POSTHACK: handle big int better
  //       tokenAmount: BigInt(amount),
  //     });
  //   }

  // if BTC<>USD:
  // if BTC<>EUR:
  // SparkWallet.transfer (source to issuer)
  // Convert (BTC<>fiat)
  // SparkWallet.transferTokens (issuer to receiver)

  // if USD<>BTC:
  // if EUR<>BTC:
  // SparkWallet.transferTokens (source to issuer)
  // Convert (fiat<>BTC)
  // SparkWallet.withdraw or payLightningInvoice (depending on destination type)

  // if USD<>EUR:
  // if EUR<>USD:
  // SparkWallet.transferTokens (source to issuer)
  // Convert (fiat1<>fiat2)
  // SparkWallet.transferTokens (issuer to receiver)

  // POSTHACK: Create DB record to record transfer?
  // Since non-direct transfers need to be recorded

  //   return transfer;
  // }
};

export { SparkWallet, createSparkWallet, getSparkWallet };
