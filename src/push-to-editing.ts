import { BlogConfig, GithubService } from "./types";

const getFilename = (p: string): string => p.substring(p.lastIndexOf('/') + 1);

export default async (
  github: GithubService,
  { datesFile, editing, production }: BlogConfig,
  posts: string[],
) => {
  // Get source branch ref
  const sourceRefSha = await github.getRef(editing);
  console.log(`sourceRefSha ${sourceRefSha}`);
  
  // Reduce all added posts to date strings (ISO-8601, see https://docs.github.com/en/graphql/reference/scalars#datetime)
  const dates = (await Promise.all(
    posts.map(async path => ({ [getFilename(path)]: await github.getFileDate(editing, path) }))
  )).reduce((p, c) => ({ ...p, ...c }));
  console.log(`dates ${dates}`);


  // Get dates.json from branch
  const json = await github.getBlobText(editing, datesFile);
  console.log(`json ${json}`);
  
  // Merged dates object
  const obj = { ...JSON.parse(json), ...dates };
  console.log(`obj ${obj}`);
  
  // Create blob, tree and commit
  const blobSha = await github.createBlob(JSON.stringify(obj));
  console.log(`blobSha ${blobSha}`);
  
  const treeSha = await github.createTree(datesFile, blobSha, sourceRefSha);
  console.log(`treeSha ${treeSha}`);

  const commitSha = await github.createCommit(
    `Publish ${datesFile} after ${posts.length > 1 
        ? posts.slice(0, posts.length - 1).join(', ') + ' and ' + posts[posts.length - 1]
        : posts[0]
    }.`.replace('\n', ' '), 
    treeSha,
    sourceRefSha,
  );
  console.log(`commitSha ${commitSha}`);
  
  // Add commit to ref and create a PR
  await github.updateRef(editing, commitSha);
  console.log('github.updateRef');

  return await github.createPR(editing, production);
};