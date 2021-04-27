# Github APP utility for TIL

This is the folder for the future support for Github app. This code will be removed from this repository,
given that __blog repo__ should be different to __application repo__ in the future.

## Webhook app with github & twitter services

Current implementation is a daemon node app. APP listens a request call from a github app webhook. If push event happens on given `repo`, `branch` and `folder`, app checks
for files added to folders and interprets them as **posts**, then apps gets that file path content from same repository and reads first line of file, as title. That `title`
is inserted into a status notification throw a twitter app service.

### Goals

1) ~~Github app listens for a push, if a file `./blog/posts/*.md` was added then triggers nexts steps~~ 
2) ~~App uses a bot to make a PR in branch with `dates.json` updated~~
3) Bot merges PR __See 'Twitter post' section below__
4) Branch must not be a vercel buildable environment
5) Bot then merges to **main** branch, and that triggers vercel build with dates OK

### Previously on this problem...

Creator folder right now has a bash script (`./creator/get-dates.sh`), that generates a file called
`dates.json` in the same folder, containing a map with keys as post filenames (i.e. `imgs-1.md`) and
[RFC2822 style dates](https://tools.ietf.org/html/rfc2822#section-3.3) as values. This dates are needed 
to sort the posts by time **of posting** a.k.a. time in git that file last modified and committed. In
order to make this work, the file must be regenerated __every time a commit includes a new post__. This 
can be solver with a git pre-commit hook, but that will only work for git users :sob:. 

Previous approaches were made (see [old branch](https://github.com/carmon/til/tree/old)), but failed
due to asking too much for a vercel instance (to really know when original files were created, bad take).

The source of truth must be the github API, in getting to know when a file was first added to a repo, or
**at least** sort it by last modified as the bash/git solution does. A github action would not suffice in
this case.