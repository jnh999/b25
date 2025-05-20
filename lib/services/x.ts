import { Client } from "twitter-api-sdk";

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN || "";
const client = new Client(TWITTER_BEARER_TOKEN);

const getXBioByUsername = async (username: string) => {
  const user = await client.users.findUserByUsername(username, {
    "user.fields": ["description"],
  });
  return user.data?.description;
};

export { getXBioByUsername };
