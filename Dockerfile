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
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copier les fichiers buildés statiques
COPY --from=builder /app/build .

# Copier la configuration nginx
RUN echo 'server { listen 80; location / { try_files $uri $uri/ /200.html; } }' > /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 80

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
