# Mini PDF Q&A (Minimal)

This is a minimal Next.js app that fulfills the task:
- Upload a PDF -> extract text -> create embeddings -> store vectors
- Ask a question -> retrieve relevant vectors -> answer using OpenAI

Quick start:
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill values.
3. Run: `npm run dev`
4. Visit: http://localhost:3000/login (use APP_PASSWORD), then /
