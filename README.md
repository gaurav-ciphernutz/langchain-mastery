# LangChain Mastery

A TypeScript workspace for learning and building LangChain/LangGraph agents,
workflows, tools, and structured-output examples.

## What is inside

- LangGraph lead qualification workflow in `src/workflows/lead-qualification`
- Lead qualifier agent examples in `src/agents/lead-qualifier`
- Playground scripts in `playground`
- Shared LLM, schema, config, and utility modules in `src`

## Prerequisites

- Node.js 20 or newer
- npm
- A Google Generative AI API key

## Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file with your own values:

```bash
GOOGLE_API_KEY=your_google_api_key
NODE_ENV=development
```

Do not commit `.env` files. They are intentionally ignored by git.

## Scripts

```bash
npm run dev          # Watch src/index.ts
npm run graph        # Run the LangGraph playground
npm run playground   # Run the lead qualifier playground
npm run structured   # Run structured output examples
npm run multi-tool   # Run the multi-tool agent playground
npm run typecheck    # Type-check without emitting files
npm run lint         # Run ESLint
npm run lint:fix     # Fix auto-fixable lint issues
npm run format       # Format files with Prettier
npm run format:check # Check formatting
```

## Code Quality

This project uses:

- ESLint for TypeScript and JavaScript linting
- Prettier for formatting
- lint-staged to check only staged files before commits
- Husky to run the pre-commit hook

The pre-commit hook runs `npm run lint-staged`, which formats staged markdown,
JSON, YAML, JavaScript, and TypeScript files and fixes lint issues where
possible.
