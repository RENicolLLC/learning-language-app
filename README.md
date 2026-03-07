# Language Learning App (American English Focus)

This project is a Next.js app that teaches practical **American English** for
international learners. Lessons are organized by level and include
vocabulary, dialogue, quizzes, and writing practice.

## What the app includes

- Level-based learning paths:
  - Beginner
  - Intermediate
  - Advanced
- American English teaching focus:
  - Common U.S. phrases
  - Everyday conversation patterns
  - U.S. pronunciation notes (for example, flap "t")
- Interactive practice in each lesson:
  - Multiple-choice quiz
  - Fill-in writing checks with instant feedback
- Progress and learning tools:
  - Browser-based lesson progress save (including scores)
  - Cloud progress sync (when signed in) for cross-device learning
  - Placement test that recommends a level automatically
  - Built-in American pronunciation playback using browser speech
  - Speaking evaluation with transcript scoring + feedback
  - Spaced-repetition review deck with SM-2 scheduling
  - Daily streak and XP tracking

## Routes

- `/` - Home page
- `/about` - Program overview
- `/learn` - Level selection
- `/learn/[level]` - Lesson list for a level
- `/learn/[level]/[lesson]` - Interactive lesson experience
- `/review` - Spaced repetition daily review cards

## Getting started

### Node.js requirement

- Node.js **20+** is required.
- If you use `nvm`, run:

```bash
nvm install 20
nvm use 20
```

1. Install dependencies:

```bash
npm install
```

2. Set environment variables (copy and edit):

```bash
cp .env.example .env.local
```

3. Initialize the database:

```bash
npm run db:push
```

4. Run the development server:

```bash
npm run dev
```

5. Open:

```text
http://localhost:3000
```

## Auth (optional)

The project includes NextAuth setup with GitHub provider. If you want sign-in
to fully work, set:

- `GITHUB_ID`
- `GITHUB_SECRET`

in your environment configuration.

To sync learning data across devices, users should sign in with GitHub. If not
signed in, the app still works with local device-only progress.
