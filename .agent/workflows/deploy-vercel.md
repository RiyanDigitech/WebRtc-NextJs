---
description: How to deploy Next.js Client on Vercel from a monorepo structure
---

If you are getting a 404 error after deploying, follow these exact steps in your Vercel Dashboard:

1.  **Select Project**: Navigate to your project in Vercel.
2.  **Settings > General**:
    -   Locate the **Root Directory** setting.
    -   Click **Edit** and select the `client` folder.
    -   Click **Save**. This tells Vercel that your Next.js application is inside the `client` directory.

3.  **Settings > Environment Variables**:
    -   Add a new variable: `NEXT_PUBLIC_API_URL`.
    -   Value: `https://your-backend-url.com` (Your deployed server URL).
    -   *Note: If you haven't deployed your server yet, the client won't be able to chat or call.*

4.  **Re-deploy**:
    -   Go to the **Deployments** tab.
    -   Click the three dots (`...`) on the latest deployment and select **Redeploy**.

### Summary of Fixes:
- **Dynamic URLs**: I have updated the code to use `NEXT_PUBLIC_API_URL`.
- **Root Directory**: Next.js is inside the `client/` folder, so Vercel needs to know to look there instead of the root of your project.
