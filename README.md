This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on AWS Amplify

This project is configured for deployment on [AWS Amplify](https://aws.amazon.com/amplify/).

### Prerequisites

- Node.js 20 (specified in `.nvmrc`)
- AWS account with Amplify access

### Environment Variables

Add the following environment variables in the Amplify Console under **Environment variables**:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID |

Optional variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_BASE_URL` | API base URL (defaults to `https://api.biogance.com/endpoint`) |
| `NEXT_PUBLIC_MEDIA_URL` | Media/CDN base URL (defaults to `https://d18f57oyxifcsh.cloudfront.net/`) |

See `.env.example` for a template.

### Deployment Steps

1. Push this repository to your Git provider (GitHub, GitLab, Bitbucket, etc.).
2. In the [Amplify Console](https://console.aws.amazon.com/amplify/home), choose **Create new app**.
3. Connect your repository and select the branch to deploy.
4. Amplify will automatically detect `amplify.yml` and run:
   - `npm ci`
   - `npm run build`
5. Once the build completes, Amplify will provide a deployment URL.

### Build Configuration

The build is configured in `amplify.yml`:

- Uses Node.js 20
- Runs `npm ci` during the pre-build phase
- Runs `npm run build` during the build phase
- Deploys the `.next` output directory
- Caches `node_modules` and `.next/cache` for faster subsequent builds
