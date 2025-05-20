/**
 * merkle.ts
 *
 * Merkle Proof‑of‑Reserves logic for:
 *   • Spark‑ledger liabilities
 *   • Stripe Balance reserves
 *   • Bitcoin OP_RETURN anchor (testnet4 or mainnet)
 *
 * It generates a snapshot of the liabilities and reserves,
 * and verifies a transaction against the snapshot.
 *
 * The snapshot is written to the ./snapshots directory.
 *
 * The snapshot is verified by the verifyTransaction function.
 *
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import { MerkleTree } from "merkletreejs";
import crypto from "crypto";
import * as bitcoin from "bitcoinjs-lib";
// import { getSparkWallet } from "../spark";
import { getStripeBalance } from "../stripe";
import {
  EUR_ISSUER_WALLET,
  TESTNET_TAPROOT_WALLET,
  USD_ISSUER_WALLET,
} from "../constants";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";
import { getSparkWallet } from "../spark";

// Initialize ECC library for bitcoinjs-lib
bitcoin.initEccLib(ecc);

const prisma = new PrismaClient();

const ECPair = ECPairFactory(ecc);
// Docs: https://mempool.space/testnet4/docs/api/rest#post-transaction
const MEMPOOL_API = "https://mempool.space/testnet4/api";

// ---------- helper utils ----------
const sha256 = (data: Buffer | string) =>
  crypto.createHash("sha256").update(data).digest();

function toHex(buf: Buffer) {
  return buf.toString("hex");
}

// ---------- 1. fetch liabilities ----------
async function fetchLiabilityRows() {
  const sparkWallets = await prisma.sparkWallet.findMany();
  const liabilities: {
    user_id: string;
    token_code: string;
    balance: string;
  }[] = [];
  for (const sparkWalletFromDB of sparkWallets) {
    const sparkWallet = await getSparkWallet(sparkWalletFromDB.mnemonic);

    const { tokenBalances } = await sparkWallet.getBalance();
    const usdBalance =
      tokenBalances.get(USD_ISSUER_WALLET.tokenPubKey!)?.balance.toString() ??
      "0";
    const eurBalance =
      tokenBalances.get(EUR_ISSUER_WALLET.tokenPubKey!)?.balance.toString() ??
      "0";
    liabilities.push({
      user_id: sparkWalletFromDB.userId,
      token_code: "USD",
      balance: usdBalance,
    });
    liabilities.push({
      user_id: sparkWalletFromDB.userId,
      token_code: "EUR",
      balance: eurBalance,
    });
  }

  return liabilities;
}

// ---------- 2. hash liabilities w/ nonce ----------
function hashLiabilities(
  rows: { user_id: string; token_code: string; balance: string }[]
) {
  type Leaf = { raw: string; hash: Buffer };
  const leaves: Leaf[] = [];

  rows.forEach((r) => {
    // *** IMPORTANT *** : store or email this nonce to the user if
    // you want them to self‑verify later.
    const nonce = crypto.randomBytes(16).toString("hex");
    const raw = `${r.user_id}:${nonce}:${r.token_code}:${r.balance}`;
    leaves.push({ raw, hash: sha256(raw) });
  });
  return leaves;
}

// ---------- 3. fetch & hash Stripe reserves ----------
async function reserveLeaf() {
  const stripeBalance = await getStripeBalance();
  const canon = JSON.stringify(stripeBalance); // canonicalise if you care about key‑order
  return { raw: canon, hash: sha256(canon) };
}

// ---------- 4. build Merkle tree ----------
function buildTree(hashes: Buffer[]) {
  // double‑SHA leaves to match Bitcoin block style (optional)
  const tree = new MerkleTree(hashes, sha256, { sort: true });
  return tree;
}

// ---------- 5. anchor root on Bitcoin ----------
async function broadcastOpReturn(root: Buffer, broadcast: boolean = true) {
  // Get UTXOs from Mempool API
  const utxosResponse = await fetch(
    `${MEMPOOL_API}/address/${TESTNET_TAPROOT_WALLET.address}/utxo`
  );
  const utxos = await utxosResponse.json();
  console.log("Available UTXOs:", utxos);

  if (!utxos.length) throw new Error("No UTXOs to spend!");

  const utxo = utxos[0];
  console.log("Selected UTXO:", utxo);

  // Use the key pair from TESTNET_TAPROOT_WALLET
  const keyPair = ECPair.fromWIF(
    TESTNET_TAPROOT_WALLET.privateKey,
    bitcoin.networks.testnet
  );

  console.log("\nKey Pair Details:");
  console.log("-------------------");
  console.log("Private Key (WIF):", TESTNET_TAPROOT_WALLET.privateKey);
  console.log("Public Key:", Buffer.from(keyPair.publicKey).toString("hex"));
  console.log(
    "X-only Public Key:",
    Buffer.from(keyPair.publicKey.slice(1, 33)).toString("hex")
  );

  // Create Taproot payment
  const payment = bitcoin.payments.p2tr({
    pubkey: Buffer.from(keyPair.publicKey.slice(1, 33)), // Use x-only pubkey (32 bytes)
    network: bitcoin.networks.testnet,
  });

  console.log("\nPayment Details:");
  console.log("-------------------");
  console.log("Address:", payment.address);
  console.log("Output Script:", payment.output?.toString("hex"));

  // Create signer for Taproot
  const signer = {
    publicKey: Buffer.from(keyPair.publicKey.slice(1, 33)),
    sign: (hash: Buffer) => {
      console.log("\nSigning Details:");
      console.log("-------------------");
      console.log("Hash to sign:", hash.toString("hex"));
      const signature = Buffer.from(keyPair.signSchnorr(hash));
      console.log("Generated signature:", signature.toString("hex"));
      return signature;
    },
    signSchnorr: (hash: Buffer) => {
      console.log("\nSchnorr Signing Details:");
      console.log("-------------------");
      console.log("Hash to sign:", hash.toString("hex"));
      const signature = Buffer.from(keyPair.signSchnorr(hash));
      console.log("Generated signature:", signature.toString("hex"));
      return signature;
    },
  };

  // Get current fee rates
  const feeRatesResponse = await fetch(`${MEMPOOL_API}/v1/fees/recommended`);
  const feeRates = await feeRatesResponse.json();
  const feeRate = Math.max(feeRates.fastestFee, 2); // Ensure at least 2 sats/vbyte
  console.log("Current fee rate:", feeRate, "sats/vbyte");

  const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet });

  // Get transaction details for the UTXO
  const txDetailsResponse = await fetch(`${MEMPOOL_API}/tx/${utxo.txid}/hex`);
  const txDetails = await txDetailsResponse.text();
  const tx = bitcoin.Transaction.fromHex(txDetails);
  const output = tx.outs[utxo.vout];
  console.log("Previous output script:", output.script.toString("hex"));

  // Add input with RBF enabled
  psbt.addInput({
    hash: utxo.txid,
    index: utxo.vout,
    witnessUtxo: {
      script: payment.output!,
      value: utxo.value,
    },
    tapInternalKey: Buffer.from(keyPair.publicKey.slice(1, 33)),
    sequence: 0xfffffffd, // Enable RBF
  });

  // Estimate transaction size with buffer
  const estimatedSize = 150; // Base size for Taproot tx with OP_RETURN
  const estimatedFee = Math.ceil(estimatedSize * feeRate * 1.1); // Add 10% buffer
  console.log("Estimated fee:", estimatedFee, "sats");

  // a) Change back to wallet (using Taproot address)
  psbt.addOutput({
    address: payment.address!,
    value: utxo.value - estimatedFee,
  });

  // b) OP_RETURN with Merkle root (32 bytes)
  const opReturn = bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, root]);
  psbt.addOutput({ script: opReturn, value: 0 });

  console.log("\nTransaction Details:");
  console.log("-------------------");
  console.log("Input:", {
    txid: utxo.txid,
    vout: utxo.vout,
    amount: `${utxo.value} sats (${utxo.value / 100000000} BTC)`,
  });

  const outputs = psbt.txOutputs;
  console.log("\nOutputs:");
  outputs.forEach((output, i) => {
    if (output.address) {
      console.log(`Output ${i} (Change):`, {
        address: output.address,
        amount: `${output.value} sats (${output.value / 100000000} BTC)`,
      });
    } else {
      console.log(`Output ${i} (OP_RETURN):`, {
        script: output.script.toString("hex"),
        merkleRoot: root.toString("hex"),
        amount: `${output.value} sats`,
      });
    }
  });

  console.log("\nFees:", {
    inputAmount: utxo.value,
    outputAmount: outputs.reduce((sum, out) => sum + out.value, 0),
    fee: `${estimatedFee} sats`,
    feeRate: `${feeRate} sats/vbyte`,
    rbfEnabled: true,
  });

  console.log("\nPSBT before signing:", psbt.toBase64());
  psbt.signInput(0, signer).finalizeAllInputs();
  console.log("PSBT after signing:", psbt.toBase64());

  const txHex = psbt.extractTransaction().toHex();
  console.log("\nFinal transaction hex:", txHex);

  // Broadcast using Mempool API
  if (broadcast) {
    const broadcastResponse = await fetch(`${MEMPOOL_API}/tx`, {
      method: "POST",
      body: txHex,
    });
    const txid = await broadcastResponse.text();
    return txid;
  } else {
    return "txid_placeholder"; // For testing
  }
}

// ---------- 6. write artefacts ----------
function writeArtefacts(
  snapshotId: string,
  leaves: { raw: string; hash: Buffer }[],
  reserve: { raw: string; hash: Buffer },
  root: Buffer,
  txid: string
) {
  fs.mkdirSync(`./snapshots/${snapshotId}`, { recursive: true });
  fs.writeFileSync(
    `./snapshots/${snapshotId}/liabilities.csv`,
    "leaf_hash,raw\n" +
      leaves.map((l) => `${toHex(l.hash)},${l.raw}`).join("\n")
  );
  fs.writeFileSync(
    `./snapshots/${snapshotId}/stripe_balance.json`,
    reserve.raw
  );
  fs.writeFileSync(
    `./snapshots/${snapshotId}/root.txt`,
    JSON.stringify({ merkle_root: toHex(root), bitcoin_txid: txid }, null, 2)
  );
}

async function getBalance(address: string): Promise<number> {
  const utxosResponse = await fetch(`${MEMPOOL_API}/address/${address}/utxo`);
  const utxos = await utxosResponse.json();

  const balance = utxos.reduce(
    (sum: number, utxo: { value: number }) => sum + utxo.value,
    0
  );
  console.log(
    `Balance for ${address}: ${balance} sats (${balance / 100000000} BTC)`
  );
  return balance;
}

async function verifyTransaction(txid: string) {
  console.log("\nVerifying transaction:", txid);
  console.log("-------------------");

  // Get transaction details from Mempool API
  const txResponse = await fetch(`${MEMPOOL_API}/tx/${txid}`);
  const tx = await txResponse.json();

  // Get transaction hex to decode OP_RETURN
  const txHexResponse = await fetch(`${MEMPOOL_API}/tx/${txid}/hex`);
  const txHex = await txHexResponse.text();
  const decodedTx = bitcoin.Transaction.fromHex(txHex);
  console.log("Decoded transaction:", decodedTx);

  // Find matching snapshot
  const snapshots = fs.readdirSync("./snapshots");
  let matchingSnapshot = null;
  let snapshotData = null;
  let liabilityLeaves: { raw: string; hash: Buffer }[] = [];
  let reserveLeaf: { raw: string; hash: Buffer } | null = null;

  for (const snapshot of snapshots) {
    try {
      const rootData = JSON.parse(
        fs.readFileSync(`./snapshots/${snapshot}/root.txt`, "utf8")
      );
      if (rootData.bitcoin_txid === txid) {
        matchingSnapshot = snapshot;
        snapshotData = rootData;
        break;
      }
    } catch (e) {
      console.error("Error reading snapshot:", e);
      continue;
    }
  }

  console.log("Transaction Details:");
  console.log("-------------------");
  console.log("Status:", {
    confirmed: tx.status.confirmed,
    blockHeight: tx.status.block_height,
    blockTime: tx.status.block_time
      ? new Date(tx.status.block_time * 1000).toISOString()
      : "N/A",
  });

  console.log("\nInputs:");
  tx.vin.forEach((input: any, i: number) => {
    console.log(`Input ${i}:`, {
      txid: input.txid,
      vout: input.vout,
      value: `${input.prevout.value} sats (${
        input.prevout.value / 100000000
      } BTC)`,
    });
  });

  console.log("\nOutputs:");
  tx.vout.forEach((output: any, i: number) => {
    if (output.scriptpubkey_type === "op_return") {
      // Extract merkle root from OP_RETURN
      const opReturnScript = bitcoin.script.decompile(
        Buffer.from(output.scriptpubkey, "hex")
      );
      if (opReturnScript && opReturnScript[1]) {
        const merkleRoot = Buffer.from(opReturnScript[1] as Buffer).toString(
          "hex"
        );
        console.log(`Output ${i} (OP_RETURN):`, {
          merkleRoot,
          script: output.scriptpubkey,
          matchesSnapshot: snapshotData
            ? merkleRoot === snapshotData.merkle_root
            : "No snapshot found",
        });
      }
    } else {
      console.log(`Output ${i}:`, {
        address: output.scriptpubkey_address,
        amount: `${output.value} sats (${output.value / 100000000} BTC)`,
        type: output.scriptpubkey_type,
      });
    }
  });

  console.log("\nFees:", {
    totalInput: tx.vin.reduce(
      (sum: number, input: any) => sum + input.prevout.value,
      0
    ),
    totalOutput: tx.vout.reduce(
      (sum: number, output: any) => sum + output.value,
      0
    ),
    fee: `${tx.fee} sats`,
  });

  if (matchingSnapshot) {
    console.log("\nSnapshot Verification:");
    console.log("-------------------");
    console.log("Found matching snapshot:", matchingSnapshot);
    console.log("Snapshot data:", snapshotData);

    // Verify liabilities file exists and rebuild merkle tree
    const liabilitiesPath = `./snapshots/${matchingSnapshot}/liabilities.csv`;
    if (fs.existsSync(liabilitiesPath)) {
      const liabilities = fs.readFileSync(liabilitiesPath, "utf8");
      const rows = liabilities.split("\n").slice(1); // Skip header
      console.log("\nLiability entries:", rows.length);

      // Rebuild liability leaves
      liabilityLeaves = rows.map((row) => {
        const [hash, raw] = row.split(",");
        return { raw, hash: Buffer.from(hash, "hex") };
      });
    }

    // Verify stripe balance file exists and add to merkle tree
    const stripePath = `./snapshots/${matchingSnapshot}/stripe_balance.json`;
    if (fs.existsSync(stripePath)) {
      const stripeBalance = JSON.parse(fs.readFileSync(stripePath, "utf8"));
      console.log("\nStripe balance:", stripeBalance);
      reserveLeaf = {
        raw: JSON.stringify(stripeBalance),
        hash: sha256(JSON.stringify(stripeBalance)),
      };
    }

    // Rebuild merkle tree
    if (liabilityLeaves.length > 0 && reserveLeaf) {
      const allHashes = [
        ...liabilityLeaves.map((l) => l.hash),
        reserveLeaf.hash,
      ];
      const tree = buildTree(allHashes);
      const rebuiltRoot = tree.getRoot();
      const rebuiltRootHex = toHex(rebuiltRoot);

      // Get merkle root from OP_RETURN
      const opReturnOutput = tx.vout.find(
        (o: any) => o.scriptpubkey_type === "op_return"
      );
      const opReturnScript = bitcoin.script.decompile(
        Buffer.from(opReturnOutput.scriptpubkey, "hex")
      );
      const txMerkleRoot =
        opReturnScript && opReturnScript[1]
          ? Buffer.from(opReturnScript[1] as Buffer).toString("hex")
          : null;

      console.log("\nMerkle Tree Validation:");
      console.log("-------------------");
      console.log("Rebuilt root:", rebuiltRootHex);
      console.log("Stored root:", snapshotData.merkle_root);
      console.log("OP_RETURN root:", txMerkleRoot);
      console.log("\nValidation Results:");
      console.log("-------------------");
      console.log("Roots match:", {
        rebuiltVsStored: rebuiltRootHex === snapshotData.merkle_root,
        rebuiltVsTx: rebuiltRootHex === txMerkleRoot,
        storedVsTx: snapshotData.merkle_root === txMerkleRoot,
      });

      // Verify each leaf
      console.log("\nLeaf Verification:");
      console.log("-------------------");
      liabilityLeaves.forEach((leaf, i) => {
        const proof = tree.getProof(leaf.hash);
        const verified = tree.verify(proof, leaf.hash, rebuiltRoot);
        console.log(`Liability ${i + 1}:`, {
          raw: leaf.raw,
          verified,
        });
      });

      if (reserveLeaf) {
        const proof = tree.getProof(reserveLeaf.hash);
        const verified = tree.verify(proof, reserveLeaf.hash, rebuiltRoot);
        console.log("Stripe Reserve:", {
          raw: reserveLeaf.raw,
          verified,
        });
      }
    } else {
      console.log("\nWarning: Could not rebuild merkle tree - missing data");
    }
  } else {
    console.log("\nNo matching snapshot found for this transaction");
  }

  const snapshotValidationComplete =
    !!matchingSnapshot && liabilityLeaves.length > 0 && !!reserveLeaf;

  const isValid = !!tx.status.confirmed && snapshotValidationComplete;

  const validationResult = {
    confirmed: tx.status.confirmed,
    blockHeight: tx.status.block_height,
    merkleRoot: tx.vout.find((o: any) => o.scriptpubkey_type === "op_return")
      ?.scriptpubkey,
    snapshotFound: !!matchingSnapshot,
    snapshotId: matchingSnapshot,
    snapshotValidationComplete,
    isValid: !!tx.status.confirmed && snapshotValidationComplete,
  };
  console.log(validationResult);

  console.log("Is valid:", isValid);
  if (isValid) {
    console.log("Transaction is valid 🎉");
  } else {
    console.log("Transaction is invalid 🚫");
  }

  return validationResult;
}

async function generateTaprootAddress() {
  // Create new Taproot key pair
  const keyPair = ECPair.makeRandom({ network: bitcoin.networks.testnet });

  // Create Taproot payment
  const payment = bitcoin.payments.p2tr({
    pubkey: Buffer.from(keyPair.publicKey.slice(1, 33)), // Use x-only pubkey (32 bytes)
    network: bitcoin.networks.testnet,
  });

  console.log("\nNew Taproot Wallet:");
  console.log("-------------------");
  console.log("Private Key (WIF):", keyPair.toWIF());
  console.log("Public Key:", Buffer.from(keyPair.publicKey).toString("hex"));
  console.log("Address:", payment.address);

  return {
    keyPair,
    address: payment.address,
  };
}

// Example usage:
// const { keyPair, address } = await generateTaprootAddress();
// ---------- main orchestrator ----------
const generateSnapshot = async (broadcast: boolean = true) => {
  const snapshotId = new Date().toISOString().split("T")[0]; // e.g., 2025‑05‑12
  console.log("Snapshot ID:", snapshotId);

  // Check balance before proceeding
  const balance = await getBalance(TESTNET_TAPROOT_WALLET.address);
  console.log("TBTC4 Wallet Balance:", balance);
  //   return;
  if (balance < 500) {
    throw new Error("Insufficient balance to cover fees");
  }

  // 1‑2
  const liabilityRows = await fetchLiabilityRows();
  console.log("Liability rows generated:", liabilityRows.length);
  const liabilityLeaves = hashLiabilities(liabilityRows);
  console.log("Liability leaves generated:", liabilityLeaves.length);

  // 3
  const reserve = await reserveLeaf();
  console.log("Reserve leaf generated:", reserve.raw);

  // 4
  const allHashes = [...liabilityLeaves.map((l) => l.hash), reserve.hash];
  const tree = buildTree(allHashes);
  const root = tree.getRoot();
  console.log("Merkle root generated:", toHex(root));

  // 5
  const txid = await broadcastOpReturn(root, broadcast);
  console.log("Anchored root in tx:", txid);

  // 6
  writeArtefacts(snapshotId, liabilityLeaves, reserve, root, txid);
  console.log("Snapshot written to ./snapshots/" + snapshotId);
};

export { generateTaprootAddress, generateSnapshot, verifyTransaction };
