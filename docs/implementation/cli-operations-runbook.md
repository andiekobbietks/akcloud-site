# AKTOps CLI operations runbook

This runbook is for operating the AKTOps static website and Decap CMS from Windows PowerShell. Commands are shown one at a time, with the expected result and the reason for running them.

> **Important distinction:** Decap is the browser-based content editor at `/admin/`. The CLI is for cloning the repository, inspecting changes, testing locally, creating branches, deploying previews and recovering from mistakes. You do not need to run a CMS server or database.

## 1. What you need

- Windows 10/11 with PowerShell
- Git for Windows
- A GitHub account with access to `andiekobbietks/akcloud-site`
- A Netlify account with access to the AKTOps site
- Node.js LTS and npm (needed by Netlify CLI)

Check what is installed:

```powershell
git --version
node --version
npm --version
```

If a command is not recognised, install Git for Windows or Node.js LTS, close PowerShell, open a new PowerShell window and repeat the checks.

## 2. Install and sign in to Netlify CLI

Install the Netlify command-line tool globally:

```powershell
npm install --global netlify-cli
netlify --version
```

Authenticate the CLI with your Netlify account:

```powershell
netlify login
```

A browser window opens. Sign in and authorise the CLI. This authorises your local CLI session; it does **not** configure Decap's GitHub OAuth provider.

## 3. Clone the website repository

Choose a working folder, for example your Documents folder:

```powershell
Set-Location $HOME\Documents
git clone https://github.com/andiekobbietks/akcloud-site.git
Set-Location .\akcloud-site
```

If the repository is private, Git may ask you to authenticate. Use the Git Credential Manager/browser sign-in flow. Do not paste a GitHub personal access token into a command, README, script or chat.

Confirm that you are in the correct repository:

```powershell
git remote -v
git status
git branch --show-current
```

Expected remote: `https://github.com/andiekobbietks/akcloud-site.git`. The default production branch is currently `master`.

## 4. Link this local folder to the Netlify site

Run:

```powershell
netlify status
netlify link
```

When prompted, choose the existing AKTOps website site, currently displayed under the legacy Netlify hostname `akcloud.netlify.app`. Linking writes local site metadata under `.netlify/`; it does not change the live website.

Check the link:

```powershell
netlify status
```

If Netlify says the folder is already linked to the correct site, do not link it again.

## 5. Start a local preview

Run this from the repository root:

```powershell
netlify dev
```

Open the local URL printed by the CLI, normally `http://localhost:8888`. Stop the server with **Ctrl+C**.

This is useful for checking the static site and Netlify development behaviour before deployment. Decap's GitHub login is expected to be tested on the deployed HTTPS site after OAuth is configured. A working local preview does not prove that production CMS authentication works.

## 6. Configure Decap authentication once

The current `admin/config.yml` uses the Decap `github` backend. It points to this repository and uses Netlify's OAuth service. The OAuth provider must be configured in the Netlify dashboard before editors can sign in.

1. Open GitHub **Settings → Developer settings → OAuth Apps** and register a new OAuth App.
2. Set **Application name** to something recognisable, such as `AKTOps Decap CMS`.
3. Set **Homepage URL** to `https://akcloud.netlify.app` (the current deployed hostname).
4. Set **Authorization callback URL** exactly to `https://api.netlify.com/auth/done`.
5. Register the app. Copy the **Client ID** and generate/copy the **Client secret**.
6. In Netlify, open the AKTOps site, then **Project configuration → Access & security → OAuth → Authentication providers**.
7. Choose **Install provider**, select **GitHub**, and enter the Client ID and Client secret. Save/enable the provider.
8. Keep the Client secret in Netlify only. Never commit it, add it to `admin/config.yml`, expose it in JavaScript, or put it in a `.env` file that is committed.
9. Check repository access: with the current direct GitHub backend, each CMS editor needs GitHub write access to this repository. Give that access only to trusted editors.

The callback URL and Netlify provider steps follow Decap's GitHub backend guidance. If the Netlify dashboard labels move, use the Netlify site's Access & security / OAuth settings rather than creating a different callback URL.

### Test the CMS

1. Deploy the current site (steps 10–11 below) if the latest admin files are not live.
2. Visit `https://akcloud.netlify.app/admin/`.
3. Sign in using an authorised GitHub account.
4. Open **Website content → Homepage**.
5. Change one short piece of copy, then save it as a draft.
6. In GitHub, confirm Decap created the expected editorial branch / pull request. Review the diff before publishing.
7. Publish through Decap's editorial workflow, then wait for the Netlify production deploy.
8. Refresh the public homepage and confirm the changed copy appears.
9. Upload a small, optimised test image in an Insight draft and confirm the file appears under `assets/uploads/`. Delete the test image through a reviewed Git change if it is not wanted.

If sign-in fails, check the Netlify OAuth provider, callback URL, repository permissions and browser pop-up blocking. Do not work around authentication by putting a personal access token in the frontend.

## 7. Understand the content files

| What you want to edit | Where it lives | How it reaches the site |
|---|---|---|
| Homepage title, description and selected hero/about copy | `content/homepage.json` | The homepage fetches this static JSON and applies the matching fields |
| Insight article | `content/insights/*.md` | Decap stores Markdown with frontmatter in Git |
| Uploaded images | `assets/uploads/` | Decap writes the file to the repository; use its generated public path in content |
| CMS field definitions | `admin/config.yml` | Defines the fields and collections visible in the editor |
| CMS application shell | `admin/index.html` | Loads the Decap application at `/admin/` |

Do not rename JSON keys in `content/homepage.json` unless you also update the matching field in `admin/config.yml` and the corresponding `data-cms` marker / homepage code in `index.html`.

## 8. Everyday Git CLI workflow

Use a branch for code, configuration or documentation changes. Decap's editorial workflow manages content drafts through its own Git workflow; these commands are for your own repository work.

Start from an up-to-date `master`:

```powershell
git switch master
git pull --ff-only origin master
git switch -c docs/my-change
```

Replace `docs/my-change` with a short descriptive branch name, for example `content/spring-service-update` or `fix/homepage-copy`.

Inspect the working tree:

```powershell
git status
git diff
git diff --check
```

- `git status` shows changed, new and staged files.
- `git diff` shows unstaged edits.
- `git diff --check` catches whitespace errors before committing.

Stage only the files you intend to include:

```powershell
git add README.md docs/implementation/decap-cms.md
git diff --cached
git commit -m "docs: clarify Decap CMS operations"
git push --set-upstream origin docs/my-change
```

Change the `git add` paths and commit message to match your work. Review `git diff --cached` before committing: it is the final check of exactly what will enter the commit.

Open a pull request on GitHub from your branch into `master`. Review the changed files and automated checks before merging. Do not push routine experiments directly to `master`.

## 9. Validate content before committing

Validate the homepage JSON using PowerShell:

```powershell
Get-Content .\content\homepage.json -Raw | ConvertFrom-Json | Out-Null
if ($?) { Write-Host "Homepage JSON is valid" }
```

Check for whitespace errors and inspect the exact changes:

```powershell
git diff --check
git diff -- .\content\homepage.json
```

For a new Insight, confirm the Markdown file has the expected frontmatter fields (title, date, description) and a body. Preview the article text carefully; a valid Markdown file can still contain broken links or incorrect information.

## 10. Deploy a preview (not production)

After committing your changes, deploy a draft to Netlify:

```powershell
netlify deploy
```

The CLI prints a **Deploy URL**. Open that URL and test the page. A draft deploy does not replace the production site.

If the CLI asks to link a site, return to section 4 and select the existing AKTOps site. Do not create a new Netlify site by accident.

## 11. Publish to production

Only publish after reviewing the diff, testing the preview, and confirming that the intended changes are ready:

```powershell
netlify deploy --prod
```

This command updates the production deployment. It is not a substitute for Git review: make sure the intended commit is already pushed to the repository and that your Netlify production deploy is building the expected branch.

For the normal Git-connected workflow, merging a reviewed pull request into `master` should trigger the site's configured production build/deploy. Prefer that workflow; use `netlify deploy --prod` for an intentional manual deployment when you understand which local files are being published.

## 12. Recover from mistakes safely

### Discard an uncommitted edit to one file

First inspect it:

```powershell
git diff -- .\content\homepage.json
```

If you are certain you want to discard only that file's uncommitted changes:

```powershell
git restore -- .\content\homepage.json
```

**Warning:** `git restore` discards local edits to that file. Do not run it if you need those edits.

### Undo a committed change without rewriting shared history

Find the commit:

```powershell
git log --oneline -10
```

Create a new commit that reverses the selected commit:

```powershell
git revert <commit-sha>
git push
```

Replace `<commit-sha>` with the real commit ID. Resolve any conflicts, run checks, and use a pull request if the repository requires review. Prefer `git revert` over `git reset --hard` for changes already pushed to a shared branch.

### Return to the production branch

```powershell
git switch master
git pull --ff-only origin master
git status
```

## 13. Useful commands at a glance

| Command | Purpose |
|---|---|
| `git status` | Show current branch and working-tree changes |
| `git pull --ff-only origin master` | Update local master without creating a merge commit |
| `git switch -c name` | Create and switch to a new branch |
| `git diff` | Review local unstaged edits |
| `git diff --check` | Check whitespace errors |
| `git add path` | Stage selected files |
| `git diff --cached` | Review staged changes |
| `git commit -m "message"` | Save a local commit |
| `git push -u origin branch` | Push a branch and set its upstream |
| `netlify status` | Show the linked Netlify site/account |
| `netlify dev` | Run the local Netlify development server |
| `netlify deploy` | Create a draft deploy |
| `netlify deploy --prod` | Publish a manual production deploy |

## 14. Security and operating boundaries

- Never commit GitHub tokens, OAuth client secrets, passwords, private keys or production database credentials.
- Do not put secrets in `admin/config.yml`, `index.html`, public environment variables or content files.
- Keep the GitHub repository write-access list small. The current GitHub backend requires editor write access.
- Review content and uploaded files before publication. Do not upload personal, confidential or client data into public website media.
- The Decap admin is a static frontend; the OAuth provider is still required for secure GitHub authentication.
- The site has no CMS database. Git history is the content audit trail.
- Odoo is a separate planned service. Do not place Odoo credentials or database connectivity in the static website or Decap CMS.
