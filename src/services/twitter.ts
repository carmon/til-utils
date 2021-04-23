import Twitter from 'twitter-lite';
import { TwitterConfig } from "../types";

export default async ({ access_token, consumer }: TwitterConfig) => {
  const app = new Twitter({
    consumer_key: consumer.key,
    consumer_secret: consumer.secret,
    access_token_key: access_token.key,
    access_token_secret: access_token.secret
  });

  await app.get("account/verify_credentials");

  return {
    tweet: async (status: string) => 
      await app.post("statuses/update", { status }),
  };
}