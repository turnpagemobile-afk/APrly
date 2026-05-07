FROM node:24-slim AS base

# Встановлюємо системні залежності для нативних модулів
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# 1. Копіюємо файли монорепозиторію
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.json tsconfig.base.json ./

# 2. Копіюємо package.json усіх пакетів для кешування залежностей
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/aprly/package.json ./artifacts/aprly/
COPY lib/db/package.json ./lib/db/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/integrations-openai-ai-server/package.json ./lib/integrations-openai-ai-server/
COPY lib/integrations-openai-ai-react/package.json ./lib/integrations-openai-ai-react/

# 3. Встановлюємо залежності
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 4. Копіюємо весь код
COPY . .

# 5. Генеруємо типи та білдимо необхідні ліби (ігноруємо помилки типізації)
RUN pnpm run typecheck:libs || true

EXPOSE 5000
EXPOSE 5173

CMD ["pnpm", "run", "dev"]