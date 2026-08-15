# Emmanuel Josh Dinsay Portfolio

A modern, polished single-page portfolio website for an Embedded Systems Engineer and IoT developer.

## Run locally

Open the folder in a browser, or use a simple local server:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy to Vercel

This project is ready for Vercel deployment as a static site.

```bash
vercel --prod
```

If you want to connect the contact form to a live Supabase table, create a table named `portfolio_messages` with columns `name`, `email`, and `message`.
