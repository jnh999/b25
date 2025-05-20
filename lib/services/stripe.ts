// Docs: https://docs.stripe.com/api
import Stripe from "stripe";
const STRIPE_API_KEY = process.env.STRIPE_API_KEY || "";
const stripe = new Stripe(STRIPE_API_KEY);

// https://docs.stripe.com/api/customers/create
export const createStripeCustomer = async ({
  email,
  name,
  address,
  phone,
}: {
  email: string;
  name: string;
  address: {
    city: string;
    country: string;
    line1: string;
    line2?: string;
    postal_code: string;
    state?: string;
  };
  phone?: string;
}) => {
  const stripeCustomer = await stripe.customers.create({
    email,
    name,
    address,
    phone,
  });

  return stripeCustomer;
};

// const customerId = "cus_SGGpABkBMpmcA7";
// const cardPaymentMethodId = "pm_1RL8alKkDsSWJkFwDAhhP3Vp";
// const usBankPaymentMethodId = "pm_1RLAajKkDsSWJkFwdyx9S8XJ";
// const sepaDebitPaymentMethodId = "pm_1RLTF2KkDsSWJkFwiE0rKusm";

// Attach a bank account to a connected account for payouts
// const addBankAccountToConnectedAccount = async ({accountId, bankDetails}) => {
//   try {
//     const externalAccount = await stripe.accounts.createExternalAccount(
//       accountId,
//       {
//         external_account: {
//           object: "bank_account",
//           country: "US",
//           currency: "usd",
//           routing_number: bankDetails.routing_number,
//           account_number: bankDetails.account_number,
//           account_holder_name: bankDetails.account_holder_name,
//           account_holder_type: bankDetails.account_holder_type || "individual",
//         },
//       }
//     );
//     console.log(externalAccount);
//     return externalAccount;
//   } catch (err) {
//     throw err;
//   }
// };

// Create a PaymentIntent for a deposit
// https://docs.stripe.com/api/payment_intents/create
// EUR and USD banks have been set here: https://dashboard.stripe.com/test/settings/payouts
// Test data: https://docs.stripe.com/connect/testing#account-numbers
export const createPaymentIntent = async ({
  amountCents,
  currency,
  paymentMethodId,
  customerId,
}: {
  amountCents: number;
  currency: "usd" | "eur";
  paymentMethodId?: string;
  customerId: string;
}) => {
  const isNewPaymentMethod = !paymentMethodId;
  const isUsd = currency === "usd";

  try {
    const createOpts: Stripe.PaymentIntentCreateParams = {
      amount: amountCents,
      customer: customerId,
      currency: isUsd ? "usd" : "eur",
      statement_descriptor: "Capital21 Deposit",
      statement_descriptor_suffix: "C21",
    };

    if (isUsd) {
      createOpts.payment_method_types = ["us_bank_account"]; // Only show US bank account option
      // createOpts.payment_method_types = ['card']; // Only show card option
    } else {
      // if not usd, then eur
      createOpts.payment_method_types = ["sepa_debit"]; // Only show SEPA debit option
    }

    if (isNewPaymentMethod) {
      createOpts.setup_future_usage = "on_session";
    } else {
      createOpts.off_session = true;
      createOpts.confirm = true;
      createOpts.payment_method = paymentMethodId;
    }

    const paymentIntent = await stripe.paymentIntents.create(createOpts);
    console.log({
      paymentIntentSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

    return paymentIntent;
  } catch (err) {
    throw err;
  }
};

// Get recent settled deposits (charges)
export const getRecentDeposits = async () => {
  try {
    const charges = await stripe.charges.list({ limit: 10 });
    const settled = charges.data
      .filter((charge) => charge.status === "succeeded")
      .map((charge) => ({
        id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        created: new Date(charge.created * 1000).toISOString(),
        payment_method: charge.payment_method,
      }));
    return settled;
  } catch (err) {
    throw err;
  }
};

export const listPaymentMethods = async ({
  customerId,
}: {
  customerId: string;
}) => {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });
  return paymentMethods;
};

// Get account balance (proof of reserves)
export const getStripeBalance = async () => {
  try {
    const balance = await stripe.balance.retrieve();
    return balance;
  } catch (err) {
    throw err;
  }
};

// Create a payout (withdrawal)
export const createStripeWithdrawal = async ({
  amountCents,
  destination,
}: {
  amountCents: number;
  destination: string;
}) => {
  try {
    const payout = await stripe.payouts.create({
      amount: amountCents,
      currency: "usd",
      destination, // e.g., 'ba_123...'
    });
    return payout;
  } catch (err) {
    throw err;
  }
};

// Create a SetupIntent for collecting payment methods
export const createSetupIntent = async ({
  customerId,
  paymentMethodTypes = ["us_bank_account"],
}: {
  customerId: string;
  paymentMethodTypes?: string[];
}) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: paymentMethodTypes,
      usage: "off_session", // Allow the payment method to be used for future payments
    });

    return setupIntent;
  } catch (err) {
    throw err;
  }
};
