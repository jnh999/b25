import prisma from "../prisma";
// import { StripePaymentMethodType, User } from "@prisma/client";

// export const getUserById = async (id: string) => {
//   return await prisma.user.findUnique({
//     where: { id },
//   });
// };

// export const getUserByEmail = async (email: string) => {
//   return await prisma.user.findUnique({
//     where: { email },
//   });
// };

// export const createUser = async (
//   email: string,
//   firstName: string,
//   lastName: string,
//   username: string,
//   password: string
//   //   type: UserType,
// ) => {
//   await prisma.user.create({
//     data: {
//       email,
//       firstName,
//       lastName,
//       username,
//       password,
//       //   type,
//     },
//   });
// };

export const getUserBySparkAddress = async (sparkAddress: string) => {
  const sparkWallet = await prisma.sparkWallet.findUnique({
    where: { address: sparkAddress },
    include: {
      user: true,
    },
  });
  return sparkWallet?.user;
};

export const getIssuerByTokenPubKey = async (tokenPubKey: string) => {
  const issuer = await prisma.sparkIssuer.findUnique({
    where: { tokenPubKey },
  });
  return issuer;
};

// export const validateSparkAddress = async (sparkAddress: string) => {
//   const sparkWallet = await prisma.sparkWallet.update({
//     where: { address: sparkAddress },
//     data: { validated: true },
//   });
//   return sparkWallet;
// };

export const setUserPaymentMethod = async (
  userId: string,
  paymentMethodId: string
) => {
  const userPaymethMethod = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
  });

  if (userPaymethMethod.stripePaymentId) {
    console.log("User already has a payment method");
    return;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      stripePaymentId: paymentMethodId,
    },
  });
  console.log("User payment method added");

  return user;
};
