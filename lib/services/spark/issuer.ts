// https://docs.spark.money/issuing/quick-launch#sdk

import { IssuerSparkWallet as IssuerSparkWalletBase } from "@buildonspark/issuer-sdk";
import { NETWORK } from "../constants";

const createIssuerWallet = async () => {
  const { wallet, mnemonic } = await SparkIssuer.initialize({
    options: {
      network: NETWORK,
    },
  });
  console.log("Issuer mnemonic", mnemonic);

  return {
    wallet,
    mnemonic,
  };
};

const getIssuerWallet = async (mnemonic: string) => {
  const { wallet } = await SparkIssuer.initialize({
    mnemonicOrSeed: mnemonic,
    options: {
      network: NETWORK,
    },
  });

  return wallet;
};

const mintToken = async (token: "usd" | "eur", amount: number) => {
  let issuerWalletMnemonic;
  if (token === "usd") {
    issuerWalletMnemonic = process.env.SPARK_ISSUER_MNEMONIC_USD;
  } else if (token === "eur") {
    issuerWalletMnemonic = process.env.SPARK_ISSUER_MNEMONIC_EUR;
  }
  if (!issuerWalletMnemonic) {
    throw new Error(`Issuer mnemonic not found for ${token}`);
  }

  const issuerWallet = await getIssuerWallet(issuerWalletMnemonic);
  const sparkIssuer = new SparkIssuer(issuerWallet);
  const mintTxid = await sparkIssuer.mintTokens(BigInt(amount));

  return mintTxid;
};

const getAttestationTokenPubkeys = async (domain: string) => {
  const response = await fetch(`${domain}/spark.json`);
  if (!response.ok) {
    return false;
  }
  try {
    const data = await response.json();
    return data.tokenPubkeys;
  } catch (error) {
    console.error("Error getting attestation token pubkeys", error);
    return [];
  }
};

const SparkIssuer = class extends IssuerSparkWalletBase {
  constructor(private readonly issuer: IssuerSparkWalletBase) {
    super();
    Object.assign(this, issuer);
  }

  async getIssuerWalletL1Address() {
    const l1Address = await this.issuer.getTokenL1Address();
    return l1Address;
  }

  async announceToken({
    tokenName,
    tokenTicker,
    decimals = 2,
    isFreezeable = true,
  }: {
    tokenName: string;
    tokenTicker: string;
    decimals: number;
    isFreezeable: boolean;
  }): Promise<string> {
    // Only allow infinite supply for now, for stablecoins
    const maxSupply = BigInt(0);

    const tokenPubkey = await this.issuer.announceTokenL1(
      tokenName,
      tokenTicker,
      decimals,
      maxSupply,
      isFreezeable
    );
    console.log("Token announced", tokenPubkey);

    return tokenPubkey;
  }

  // Just a rename
  async getTokenPublicKey() {
    const tokenPublicKey = await this.issuer.getIdentityPublicKey();

    return tokenPublicKey;
  }

  async getIssuerTokenActivity(
    pageSize: number = 100,
    // @ts-ignore
    cursor: any | undefined,
    // @ts-ignore
    operationTypes: any[]
  ) {
    const tokenActivity = await this.issuer.getIssuerTokenActivity(
      pageSize,
      cursor,
      operationTypes
    );

    return tokenActivity;
  }

  async getIssuerTokenDistribution() {
    const tokenDistribution = await this.issuer.getIssuerTokenDistribution();

    return tokenDistribution;
  }
};

export {
  SparkIssuer,
  createIssuerWallet,
  getIssuerWallet,
  getAttestationTokenPubkeys,
  mintToken,
};
