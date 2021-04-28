import { BlogConfig, GithubService } from "./types";

const getFilename = (p: string): string => p.substring(p.lastIndexOf('/') + 1);

export default async (
  github: GithubService,
  { datesFile, editing, production }: BlogConfig,
  posts: string[],
) => {
  // Get source branch ref
  const sourceRefSha = await github.getRef(editing);
  
  // Reduce all added posts to date strings (ISO-8601, see https://docs.github.com/en/graphql/reference/scalars#datetime)
  const dates = (await Promise.all(
    posts.map(async path => ({ [getFilename(path)]: await github.getFileDate(editing, path) }))
  )).reduce((p, c) => ({ ...p, ...c }));

  // Get dates.json from branch
  const json = await github.getBlobText(editing, datesFile);
  
  // Merged dates object
  const obj = { ...JSON.parse(json), ...dates };
  
  // Create blob, tree and commit
  const blobSha = await github.createFile(JSON.stringify(obj));
  const treeSha = await github.createTree(datesFile, blobSha, sourceRefSha);
  const commitSha = await github.createCommit(
    `${datesFile} after ${posts.length > 1 
        ? posts.slice(0, posts.length - 1).join(', ') + ' and ' + posts[posts.length - 1]
        : posts[0]
    }.`.replace('\n', ' '), 
    sourceRefSha,
    treeSha
  );
  
  // Add commit to ref and create a PR
  await github.updateRef(editing, commitSha);
  return await github.createPR(editing, production);
};