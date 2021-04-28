# Github application utility for TIL

This is the folder for the future support for Github app. This code will be removed from this repository,
given that __blog repo__ should be different to __application repo__ in the future.

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