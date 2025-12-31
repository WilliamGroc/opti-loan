# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Installer pnpm
RUN npm install -g pnpm

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Copier le code source
COPY . .

# Builder l'application
RUN pnpm build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Installer pnpm
RUN npm install -g pnpm

# Copier les fichiers nécessaires du builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copier les fichiers buildés
COPY --from=builder /app/build ./build
COPY --from=builder /app/src/app.html ./build/

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "-e", "import('./build/index.js').catch(err => console.error(err))"]
