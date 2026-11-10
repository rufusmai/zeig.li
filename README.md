<p align="center"><a href="https://zeig.li" target="_blank">
<img src="https://i.imgur.com/8z1VLAP.png">
</a></p>

# 🧷 zeig.li `Url Shortener`

👉 [zeig.li](https://zeig.li)

zeig.li is a tiny URL shortener. Generate short links and get some analytics about their usage.  
[More features](https://github.com/rufusmai/zeig.li/projects/1) are planned!

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).  
It uses the [next static site generation](https://nextjs.org/docs/advanced-features/static-html-export) build target to run lightweight on [Firebase Hosting](https://firebase.google.com/docs/hosting).

The backend is written in Node.js using Typescript and deployed as [Firebase Cloud Functions](https://firebase.google.com/docs/functions).

## 💻 Development

Install the dependencies (Node 24, Yarn 4 via `corepack enable`). The functions are a Yarn project of their own:

```bash
yarn install
yarn --cwd functions install
```

Start the Firebase emulators (auth, database, functions and hosting on port 5050) and the development server:

```bash
yarn --cwd functions build
yarn emulators
# in a second terminal:
yarn dev
```

Now you can edit all pages (`src/app/[locale]/`) and components (`src/components/`).  
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The pages are translated with [next-intl](https://next-intl.dev): the texts live in `messages/de.json` and `messages/en.json`, every page has the locale as prefix (`/de`, `/en`).
A new page also needs its rewrites in `firebase.json`, otherwise Hosting hands the path to the function as a slug.

Learn more about Next.js in the [Next.js Documentation](https://nextjs.org/docs).

You can edit all backend code in the `functions/src/` directory (`yarn --cwd functions watch` rebuilds on change).  
Firebase Cloud Functions are registered in `functions/src/index.ts`. Code used by both sides lives in `src/shared/`.

Before pushing, run the same checks as CI:

```bash
yarn typecheck && yarn lint && yarn format:check
```

Learn more about Firebase in the [Firebase Documentation](https://firebase.google.com/docs/build).

## 💸 Spending cap

The Blaze plan is capped at about 1 € a month. The budget `zeig-ml: max 1 EUR/Monat` (billing account „Rufus Maiwald Einzelgewerbe“, only project `zeig-ml`) mails the billing admins at 50, 90 and 100 % and publishes the month's costs to the Pub/Sub topic `budget-alerts`.
The function `budgetKillSwitch` listens on that topic and unlinks the project from billing once the costs reach the budget. Google reports costs a few hours late, so the bill can still end up slightly above 1 €.

After it fires, every paid service is off, the url shortener included. To bring the site back, link the billing account again in the Firebase console (Usage and billing) and redeploy the functions if they don't come back by themselves.

The function runs as `budget-kill-switch@zeig-ml.iam.gserviceaccount.com`, which holds `roles/billing.projectManager` on the project and `roles/run.invoker` on the `budgetkillswitch` Cloud Run service. Deploy it alone with:

```bash
npx firebase deploy --only functions:budgetKillSwitch
```
