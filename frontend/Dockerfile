# Dev image; build context is the repo root so the pnpm workspace lockfile is available.
FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json frontend/
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY frontend frontend

EXPOSE 5173
CMD ["pnpm", "--filter", "@lisan/frontend", "dev", "--host", "0.0.0.0"]
