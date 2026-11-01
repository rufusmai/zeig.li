<p align="center"><a href="https://zeig.ml" target="_blank">
<img src="https://i.imgur.com/8z1VLAP.png">
</a></p>

# 🧷 zeig.ml `Url Shortener`

👉 [zeig.ml](https://zeig.ml)

zeig.ml is a tiny URL shortener. Generate short links and get some analytics about their usage.  
[More features](https://github.com/rufusmai/zeig.ml/projects/1) are planned!

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

Now you can edit all pages (`src/app/`) and components (`src/components/`).  
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Learn more about Next.js in the [Next.js Documentation](https://nextjs.org/docs).

You can edit all backend code in the `functions/src/` directory (`yarn --cwd functions watch` rebuilds on change).  
Firebase Cloud Functions are registered in `functions/src/index.ts`. Code used by both sides lives in `src/shared/`.

Before pushing, run the same checks as CI:

```bash
yarn typecheck && yarn lint && yarn format:check
```

Learn more about Firebase in the [Firebase Documentation](https://firebase.google.com/docs/build).
