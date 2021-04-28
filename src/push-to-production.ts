import { GithubService, TwitterService } from "./types";

const getTwitterStatus = (title: string) => `New blog post: ${title} in https://til.vercel.app/`;

export default async (
  github: GithubService,
  twitter: TwitterService,
  ref: string,
  posts: string[],
) => {
  ref;
  const titles = await Promise.all(
    posts.map(async (p: string) => (await github.getBlobText('refs/heads/main', p)).split('\n')[0])
  ); // Get first lines of all posts
  
  console.log(titles);
  return await Promise.all(
    titles.map(async t => await twitter.tweet(getTwitterStatus(t)))
  ); // Make a tweet for every title
};