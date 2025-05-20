import prisma from "../../lib/prisma";
import {
  generateTaprootAddress,
  generateSnapshot,
  verifyTransaction,
} from "../../lib/services/proof/merkle";

const runScript = async () => {
  // await generateTaprootAddress();

  // Generate a new snapshot and broadcast it (we use testnet for this for now)
  // const snapshot = await generateSnapshot(true);
  // console.log("Snapshot Generated");

  // Once block is confirmed, you can verify the transaction
  await verifyTransaction(
    "6137554ca2c87793fb69e566fe6c2c92e45740218f47c923b958e5b4beaedc1a"
  );
};

runScript()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
