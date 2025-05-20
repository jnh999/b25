export interface Endpoint {
  method: string;
  path: string;
  description: string;
  queryParams?: { name: string; description: string }[];
  example?: {
    request: string;
    response: string;
  };
}

export const endpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/api/merkle/verify/:txid",
    description:
      "Verifies a Merkle tree attestation transaction. This endpoint checks if a given Bitcoin transaction contains a valid Merkle root that matches our stored snapshot of liabilities and reserves. The verification process includes checking transaction confirmation, matching the Merkle root, and validating all leaves in the tree.",
    queryParams: [
      {
        name: "txid",
        description: "The Bitcoin transaction ID to verify",
      },
    ],
    example: {
      request:
        "/api/merkle/verify/6137554ca2c87793fb69e566fe6c2c92e45740218f47c923b958e5b4beaedc1a",
      response: `{
  "confirmed": true,
  "blockHeight": 123456,
  "merkleRoot": "0x...",
  "snapshotFound": true,
  "snapshotId": "2024-05-19",
  "snapshotValidationComplete": true,
  "isValid": true
}`,
    },
  },
  {
    method: "GET",
    path: "/api/users",
    description:
      "Gets Publishable user data for user directory (username, name, spark address)",
    example: {
      request: "/api/users",
      response: `[
  {
    "id": "user_123",
    "name": "John Doe",
    "username": "johndoe",
    "isXVerified": true,
    "sparkWallet": {
      "address": "sp1pgssyv05t2cs7n65gevy5mr72pgj6sesgggxecysk042ewjas7y35kcv0svd2a"
    }
  },
  {
    "id": "user_456",
    "name": "Jane Smith",
    "username": "janesmith",
    "isXVerified": false,
    "sparkWallet": {
      "address": "sp1pgssyv05t2cs7n65gevy5mr72pgj6sesgggxecysk042ewjas7y35kcv0svd2a"
    }
  }
]`,
    },
  },
  {
    method: "GET",
    path: "/api/users/spark/:spark-address",
    description:
      "Gets User for a given Spark Address, to be used for providing more context for a given Spark public user. Note: requires private transfers to be released to preserver user privacy",
    example: {
      request:
        "/api/users/spark/sp1pgssyv05t2cs7n65gevy5mr72pgj6sesgggxecysk042ewjas7y35kcv0svd2a",
      response: `{
  "id": "user_123",
  "name": "John Doe",
  "username": "johndoe",
  "isXVerified": true,
  "profilePicUrl": "profile.jpg"
}`,
    },
  },
  {
    method: "GET",
    path: "/api/issuers",
    description:
      "Gets Publishable issuer data for user directory (token name, distribution stats etc)",
    example: {
      request: "/api/issuers",
      response: `[
  {
    "id": "issuer_123",
    "tokenName": "Spark USD",
    "tokenTicker": "USD",
    "tokenPubKey": "03acb6a45a6ca61b2254454bd6dbea9947cc76ed44de4affedb2681557719aa8ab",
    "isWebsiteVerified": true,
    "iconUrl": "usd.png"
  }
]`,
    },
  },
  {
    method: "GET",
    path: "/api/issuers/:tokenPubKey",
    description:
      "Gets token data for a provided token pubKey from the issuer directory (token name, distribution stats etc). This is critical for UX (since users don't have access to token data otherwise, just pubkey)",
    example: {
      request:
        "/api/issuers/03acb6a45a6ca61b2254454bd6dbea9947cc76ed44de4affedb2681557719aa8ab",
      response: `{
  "id": "issuer_123",
  "tokenName": "Spark USD",
  "tokenTicker": "USD",
  "tokenPubKey": "03acb6a45a6ca61b2254454bd6dbea9947cc76ed44de4affedb2681557719aa8ab",
  "isWebsiteVerified": true,
  "iconUrl": "usd.png",
  "decimals": 6,
  "maxSupply": "1000000000"
}`,
    },
  },
];
