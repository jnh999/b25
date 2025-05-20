// TO run: npx tsx prisma/scripts/sandbox.ts
import { PrismaClient } from "@prisma/client";
import { createStripeCustomer } from "../../lib/services/stripe";
import {
  convert,
  createSparkWallet,
  getSparkWallet,
} from "../../lib/services/spark/wallet";
import {
  createIssuerWallet,
  getAttestationTokenPubkeys,
  getIssuerWallet,
  SparkIssuer,
} from "../../lib/services/spark/issuer";
import {
  USD_ISSUER_WALLET,
  EUR_ISSUER_WALLET,
} from "../../lib/services/constants";
import { getBTCPrice, getEURPrice } from "../../lib/services/coinbase";
import { getXBioByUsername } from "../../lib/services/x";
import { SparkWallet } from "@buildonspark/spark-sdk";

import { determineSendInputType } from "../../lib/services/bitcoin";

const prisma = new PrismaClient();

// const setupSparkWalletForUser = async (userId: string) => {
//   const user = await prisma.user.findFirstOrThrow({
//     where: {
//       id: userId,
//     },
//     include: {
//       sparkWallet: true,
//     },
//   });

//   if (user.sparkWallet) {
//     return;
//   }

//   const { wallet, mnemonic } = await createSparkWallet();
//   if (!mnemonic) {
//     throw new Error("No mnemonic found");
//   }
//   const address = await wallet.getSparkAddress();

//   await prisma.sparkWallet.create({
//     data: {
//       mnemonic,
//       userId: user.id,
//       address,
//     },
//   });
// };

// const setupStripeCustomerForUser = async (userId: string) => {
//   const user = await prisma.user.findFirstOrThrow({
//     where: {
//       id: userId,
//     },
//   });
//   // if (user.stripeCustomerId) {
//   //   return;
//   // }

//   const stripeCustomer = await createStripeCustomer({
//     email: user.email,
//     name: getUserName(user),
//     address: {
//       city: "San Francisco",
//       country: "US",
//       line1: "123 Main St",
//       postal_code: "94101",
//       state: "CA",
//     },
//     // phone: "+1234567890",
//   });

//   console.log(stripeCustomer);

//   await prisma.user.update({
//     data: {
//       stripeCustomerId: stripeCustomer.id,
//     },
//     where: {
//       id: user.id,
//     },
//   });
// };

// const setupProfilePicForUser = async (userId: string) => {
//   await prisma.user.update({
//     data: {
//       profilePicUrl: "jack-ofalltrades.png",
//     },
//     where: {
//       id: userId,
//     },
//   });
// };

// const createSparkIssuer = async () => {
//   await prisma.sparkIssuer.create({
//     data: {
//       announcementTx:
//         "65ec3172594a5a8c6f55117bf931f8fa9d4c571d64da4d89131a30d3d6e420d6",
//       decimals: 6,
//       isFreezable: true,
//       maxSupply: 0,
//       isWebsiteVerified: true,
//       isXVerified: true,
//       mnemonic: USD_ISSUER_WALLET.mnemonic,
//       tokenPubKey: USD_ISSUER_WALLET.tokenPubKey,
//       userId: "cmabhd21n0008w20v7m8moka6",
//       tokenName: "TEST Token",
//       tokenTicker: "TEST",
//     },
//   });
// };

const postDemoCleanup = async () => {
  await prisma.paymentRequest.deleteMany({
    where: {
      status: "PENDING",
    },
  });
  await prisma.transfer.deleteMany({
    where: {
      status: "PENDING",
    },
  });
};

const fundWalletWithUsd = async (mnemonic: string) => {
  const receiverWallet = await getSparkWallet(mnemonic);
  const receiverSparkAddress = await receiverWallet.getSparkAddress();
  console.log(receiverSparkAddress);
  const usdIssuerWallet = await getIssuerWallet(USD_ISSUER_WALLET.mnemonic!);
  // $20
  const mintAmount = BigInt(20000000);
  const mintedResult = await usdIssuerWallet.mintTokens(mintAmount);
  console.log(mintedResult);
  await usdIssuerWallet.transferTokens({
    tokenPublicKey: USD_ISSUER_WALLET.tokenPubKey!,
    tokenAmount: mintAmount,
    receiverSparkAddress,
  });
};

const runScript = async () => {
  await postDemoCleanup();
  // await fundWalletWithUsd(MAINNET_SPARK_WALLET_2.mnemonic);
  // const wallet = await createSparkWallet();
  // console.log(wallet);
  // const mnemonic = MAINNET_SPARK_WALLET_2.mnemonic;
  // const wallet = await getSparkWallet(mnemonic);
  // const address = await wallet.getSparkAddress();
  // console.log(address);
  // await wallet.transferTokens({
  //   tokenPublicKey: USD_ISSUER_WALLET.tokenPubKey,
  //   // $5000000
  //   tokenAmount: 5000000000000n,
  //   receiverSparkAddress: USD_ISSUER_WALLET.sparkAddress,
  // });
  // const result = convert({
  //   sourceCurrency: "BTC",
  //   sourceAmount: 100000000,
  // });
  // const result = convert({
  //   sourceCurrency: "USD",
  //   sourceAmount: 10312000,
  // });
  // console.log(result);
  // const result = await wallet.transfer({
  //   receiverSparkAddress: EUR_ISSUER_WALLET.sparkAddress,
  //   amountSats: 10000,
  // });
  // console.log(result);
  // // const transfers = await wallet.getTransfers();
  // // console.log(transfers);
  // const issuerWallet = await getIssuerWallet(EUR_ISSUER_WALLET.mnemonic);
  // await issuerWallet.onTransferClaimed((transferId, updatedata) => {
  //   console.log(transferId, updatedata);
  // });
  // const balance = await issuerWallet.getBalance();
  // console.log(balance);
  // const l1Address = await issuerWallet.getTokenL1Address();
  // console.log(l1Address);
  // const withdraw_result = await issuerWallet.withdraw({
  //   onchainAddress: EUR_ISSUER_WALLET.l1Address,
  //   amountSats: 15000,
  //   exitSpeed: "FAST",
  // });
  // console.log(withdraw_result);
  // console.log(issuerWallet);
  // const balance = await issuerWallet.getTransfers();
  // console.log(balance);
  // const bal = await issuerWallet.getBalance();
  // console.log(bal);
  // issuerWallet.on("transfer:claimed", (transferid, updatedata) => {
  //   console.log(transferid, updatedata);
  // });
  // const token = await issuerWallet.getIssuerTokenInfo();
  // console.log(token);
  // const txid = await issuerWallet.announceTokenL1(
  //   "SparkX EUR",
  //   "EURS",
  //   6,
  //   0n,
  //   true
  // );
  // console.log(txid);
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  // await prisma.sparkWallet.create({
  //   data: {
  //     mnemonic: MAINNET_SPARK_WALLET_2.mnemonic,
  //     userId: "cmart01890001zt0vaz6pvk93",
  //     address: MAINNET_SPARK_WALLET_2.sparkAddress,
  //   },
  // });
  // await prisma.user.update({
  //   where: {
  //     id: "cmarsxv7a0000zt0vifklte5d",
  //   },
  //   data: {
  //     sparkWallet: {
  //       create: {
  //         mnemonic: MAINNET_SPARK_WALLET_3.mnemonic,
  //         address: MAINNET_SPARK_WALLET_3.sparkAddress,
  //       },
  //     },
  //   },
  // });
  // await prisma.sparkIssuer.create({
  //   data: {
  //     mnemonic: EUR_ISSUER_WALLET.mnemonic,
  //     tokenName: EUR_ISSUER_WALLET.tokenName,
  //     tokenTicker: EUR_ISSUER_WALLET.tokenSymbol,
  //     decimals: EUR_ISSUER_WALLET.tokenDecimals,
  //     isFreezable: EUR_ISSUER_WALLET.isFreezable,
  //     isWebsiteVerified: true,
  //     isXVerified: true,
  //   },
  // });
  // await prisma.sparkIssuer.create({
  //   data: {
  //     mnemonic: USD_ISSUER_WALLET.mnemonic,
  //     tokenName: USD_ISSUER_WALLET.tokenName,
  //     tokenTicker: USD_ISSUER_WALLET.tokenSymbol,
  //     decimals: USD_ISSUER_WALLET.tokenDecimals,
  //     isFreezable: USD_ISSUER_WALLET.isFreezable,
  //     isWebsiteVerified: true,
  //     isXVerified: true,
  //   },
  // });
  // await prisma.sparkIssuer.create({
  //   data: {
  //     mnemonic: "",
  //     tokenName: "Terra USD",
  //     tokenTicker: "TUSD",
  //   },
  // });
  // await prisma.sparkIssuer.create({
  //   data: {
  //     mnemonic: "",
  //     tokenName: "Terra EUR",
  //     tokenTicker: "TEUR",
  //   },
  // });
  // await prisma.sparkIssuer.create({
  //   data: {
  //     mnemonic: "",
  //     tokenName: "BitConnect USD",
  //     tokenTicker: "BBU",
  //   },
  // });
  // await prisma.sparkIssuer.create({
  //   data: {
  //     mnemonic: "",
  //     tokenName: "BitConnect EUR",
  //     tokenTicker: "BBE",
  //   },
  // });
  // await prisma.sparkIssuer.create({
  //   data: {
  //     mnemonic: "",
  //     tokenName: "FTX USD",
  //     tokenTicker: "FTXU",
  //   },
  // });
  // await prisma.sparkIssuer.create({
  //   data: {
  //     mnemonic: "",
  //     tokenName: "FTX EUR",
  //     tokenTicker: "FTXE",
  //   },
  // });
  // await prisma.sparkIssuer.create({
  //   data: {
  //     mnemonic: "",
  //     tokenName: "Celsius USD",
  //     tokenTicker: "CUSD",
  //   },
  // });
  // await prisma.sparkIssuer.create({
  //   data: {
  //     mnemonic: "",
  //     tokenName: "Celsius EUR",
  //     tokenTicker: "CEUR",
  //   },
  // });
  // await new Promise((resolve) => setTimeout(resolve, 5000));
};

runScript()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
