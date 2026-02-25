# =============================================
# Dockerfile para shop-jbskylens (EverShop)
# =============================================

# Etapa 1: Construcción
FROM node:20 AS builder

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Instalar dependencias
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else npm install; \
  fi

# Copiar todo el código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# =============================================
# Etapa 2: Producción
FROM node:20 AS runner

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 evershop

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Copiar archivos de dependencias
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar aplicación construida
COPY --from=builder /app/.evershop ./.evershop
COPY --from=builder /app/config ./config
COPY --from=builder /app/extensions ./extensions
COPY --from=builder /app/themes ./themes
COPY --from=builder /app/media ./media
COPY --from=builder /app/public ./public
COPY --from=builder /app/translations ./translations

# Establecer permisos
RUN chown -R evershop:nodejs /app

# Cambiar a usuario no-root
USER evershop

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Comando de inicio
CMD ["npm", "start"]
