import { User } from "@prisma/client";

export const getPublishableUser = (user: User, sparkAddress?: string) => {
  return {
    username: user.username,
    name: user.name,
    profilePicUrl: user.profilePicUrl,
    isPublic: user.isPublic,
    sparkWalletAddress: sparkAddress,
    isXVerified: user.isXVerified,
    xHandle: user.xHandle,
    id: user.id,
  };
};
