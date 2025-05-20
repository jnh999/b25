import prisma from "../prisma";

// From Spark SDK (since it's not exported)
export type NetworkType = "MAINNET" | "REGTEST";

// Spark recommends using mainnet for testing given stability
export const NETWORK: NetworkType = "MAINNET";

const usdIssuer = await prisma.sparkIssuer.findUnique({
  where: {
    tokenName: "SparkX USD",
  },
});
export const USD_ISSUER_WALLET = {
  ...usdIssuer,
  sparkAddress:
    "sp1pgss8t9k53dxefsmyf2y2j7km04fj37vwmk5fhj2llkmy6q42ace429t8lr2gf",
  l1Address: "bc1q5f2phrv7dvacs0hkg6ceu0yzjfwujyu3rxcasd",
  tokenSymbol: "USDS",
  tokenDecimals: 6,
};

const eurIssuer = await prisma.sparkIssuer.findUnique({
  where: {
    tokenName: "SparkX USD",
  },
});
export const EUR_ISSUER_WALLET = {
  ...eurIssuer,
  sparkAddress:
    "sp1pgssxvh52cnl3qr6d3up32dk5cjp359jazds30xzhsqrsf460ks80vt3n7ezz7",
  l1Address: "bc1qjjv6nrd7j2z2vuq6ressptjwh7v7xazmrqcgkd",
  tokenSymbol: "EURS",
  tokenDecimals: 6,
};

const TESTNET_TAPROOT_WALLET_PRIVATE_KEY =
  process.env.TESTNET_TAPROOT_WALLET_PRIVATE_KEY || "";
export const TESTNET_TAPROOT_WALLET = {
  privateKey: TESTNET_TAPROOT_WALLET_PRIVATE_KEY,
  publicKeyHex:
    "027c87b0224894f6e576bc7afa768273cf6c59bdb81b0d2cceda7ef931a3218dfa",
  address: "tb1p0jrmqgjgjnmw2a4u0ta8dqnneak9n0dcrvxjenk60munrgep3haq526lxm",
};
