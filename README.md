# til-utils: transform any github repository in a static blog

`til-utils` is a Github application that aims to turn any Github repository into a static blog.

---
**NOTE**

After [checking out](https://github.community/t/create-repo-from-template-repo-using-a-github-app/177504) that the github app API does not support creating a repository from a template yet, I decided to split this current state of the code and make a new branch using the oauth app API, this will affect the planned user flow of the app, so there could
be more differences in code in the future. Thanks for understanding.

---

## Webhooks

Current webhooks listen for PUSH events. 

Whenever `PUSH event` happens, the first action will be to check target **blog repo** config (that is, `config.json` file
in the root folder of the repositoty). For more information check `installation` folder.

When that config is loaded, events will check if a post where added to `editing` branch or `production`.

If `editing`:
- Use github app API to regenerate `dates.json` file and push it in a commit to branch
- Make a pull request from `editing` to `production`

If `production`:
- Make a twitter notification for each added post

## Next steps

- Generate a handler for a github app installation hook