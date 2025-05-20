import { SparkIssuer } from "@prisma/client";

export const getPublishableIssuer = (issuer: SparkIssuer) => {
  return {
    tokenPubKey: issuer.tokenPubKey,
    tokenName: issuer.tokenName,
    tokenTicker: issuer.tokenTicker,
    decimals: issuer.decimals,
    maxSupply:
      Number(issuer.maxSupply) === 0 ? "unlimited" : Number(issuer.maxSupply),
    isFreezable: issuer.isFreezable,
    isXVerified: issuer.isXVerified,
    websiteUrl: issuer.websiteUrl,
    isWebsiteVerified: issuer.isWebsiteVerified,
    announcementTx: issuer.announcementTx,
    xHandle: issuer.xHandle,
    iconUrl: issuer.iconUrl,
  };
};
