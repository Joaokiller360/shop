# 🛒 Shop JBSkylens

> Tienda e-commerce construida con [EverShop](https://evershop.io/) - Una plataforma de comercio electrónico moderna, rápida y extensible.

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)
![EverShop](https://img.shields.io/badge/EverShop-2.1.1-FF6B6B?style=flat-square)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Requisitos](#-requisitos)
- [Instalación Local](#-instalación-local)
- [Despliegue con Docker](#-despliegue-con-docker)
- [Despliegue en Dokploy](#-despliegue-en-dokploy)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Temas](#-temas)
- [Extensiones](#-extensiones)
- [Scripts Disponibles](#-scripts-disponibles)
- [Contribuir](#-contribuir)

## ✨ Características

- 🎨 **Tema personalizado "Model"** - Diseño moderno con Tailwind CSS y DaisyUI
- 🌍 **Multi-idioma** - Soporte para español incluido
- 📧 **Notificaciones por email** - Integración con Resend
- 🔌 **Extensible** - Sistema de extensiones y temas
- 🐳 **Docker Ready** - Listo para contenedores
- ⚡ **Alto rendimiento** - Construido con React y GraphQL

## 📦 Requisitos

### Desarrollo Local
- **Node.js** 20.x o superior
- **PostgreSQL** 15.x o superior
- **npm** o **yarn**

### Docker
- **Docker** 20.10+
- **Docker Compose** v2.0+

## 🚀 Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/shop-jbskylens.git
cd shop-jbskylens
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env con tus configuraciones
```

### 4. Configurar la base de datos

Asegúrate de tener PostgreSQL corriendo y ejecuta:

```bash
npm run setup
```

### 5. Crear usuario administrador

```bash
npm run user:create
```

### 6. Iniciar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🐳 Despliegue con Docker

### Usando Docker Compose (Recomendado)

```bash
# Copiar variables de entorno
cp .env.example .env

# Construir e iniciar todos los servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f app
```

### Solo Docker

```bash
# Construir imagen
docker build -t shop-jbskylens .

# Ejecutar contenedor
docker run -d \
  --name shop-jbskylens \
  -p 3000:3000 \
  -e DB_HOST=tu_host_postgres \
  -e DB_PORT=5432 \
  -e DB_NAME=evershop \
  -e DB_USER=postgres \
  -e DB_PASSWORD=tu_password \
  shop-jbskylens
```

## 🚀 Despliegue en Dokploy

[Dokploy](https://dokploy.com/) es una plataforma de despliegue auto-hospedada alternativa a Vercel/Netlify. Sigue estos pasos para desplegar:

### Paso 1: Preparar el repositorio

1. Sube tu código a GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/shop-jbskylens.git
git push -u origin main
```

### Paso 2: Configurar en Dokploy

1. **Accede a tu panel de Dokploy** en `https://tu-dominio-dokploy`

2. **Crear nuevo proyecto:**
   - Click en **"Create Project"**
   - Nombre: `shop-jbskylens`

3. **Agregar servicio de aplicación:**
   - En el proyecto, click en **"+ Add Service"** → **"Application"**
   - Selecciona **"GitHub"** como proveedor
   - Conecta tu repositorio `shop-jbskylens`
   - Rama: `main`

4. **Configurar Build:**
   - **Build Type:** `Dockerfile`
   - **Dockerfile Path:** `./Dockerfile`
   - **Port:** `3000`

5. **Agregar servicio de base de datos:**
   - Click en **"+ Add Service"** → **"Database"** → **"PostgreSQL"**
   - Nombre: `shop-jbskylens-db`
   - Versión: `15`
   - Anota las credenciales generadas

### Paso 3: Configurar Variables de Entorno

En la configuración de tu aplicación en Dokploy, agrega:

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DB_HOST` | `shop-jbskylens-db` (nombre del servicio de BD) |
| `DB_PORT` | `5432` |
| `DB_NAME` | `evershop` |
| `DB_USER` | (usuario de la BD) |
| `DB_PASSWORD` | (password de la BD) |
| `RESEND_API_KEY` | (tu API key de Resend) |

### Paso 4: Configurar Red Interna

1. Ve a **"Networking"** en tu aplicación
2. Asegúrate que la aplicación y la base de datos estén en la misma red interna

### Paso 5: Configurar Dominio (Opcional)

1. Ve a **"Domains"** en tu aplicación
2. Agrega tu dominio personalizado
3. Habilita **HTTPS** con Let's Encrypt

### Paso 6: Desplegar

1. Click en **"Deploy"**
2. Espera a que la construcción termine
3. Una vez desplegado, accede a tu tienda en el dominio configurado

### Paso 7: Configuración inicial post-despliegue

Después del primer despliegue, necesitas crear el usuario administrador:

```bash
# Conectar al contenedor en Dokploy
# Ve a la pestaña "Terminal" de tu servicio y ejecuta:
npm run user:create
```

## ⚙️ Configuración

### Archivos de configuración

```
config/
├── config.json     # Configuración de producción
└── default.json    # Configuración por defecto
```

### Configuraciones principales

```json
{
  "shop": {
    "language": "es",
    "currency": "USD"
  },
  "system": {
    "theme": "model",
    "extensions": [...]
  }
}
```

## 📁 Estructura del Proyecto

```
shop-jbskylens/
├── config/              # Configuraciones de la aplicación
├── extensions/          # Extensiones personalizadas
│   └── sample/          # Extensión de ejemplo
├── media/               # Archivos multimedia (productos, etc.)
├── public/              # Archivos públicos estáticos
├── themes/              # Temas de la tienda
│   ├── model/           # Tema principal activo
│   ├── sample/          # Tema de ejemplo
│   └── test/            # Tema de pruebas
├── translations/        # Archivos de traducción
│   └── es/              # Traducciones al español
├── Dockerfile           # Configuración de Docker
├── docker-compose.yml   # Orquestación de contenedores
└── package.json         # Dependencias del proyecto
```

## 🎨 Temas

El proyecto incluye varios temas:

| Tema | Descripción | Estado |
|------|-------------|--------|
| `model` | Tema principal con Tailwind CSS y DaisyUI | ✅ Activo |
| `sample` | Tema de ejemplo básico | Disponible |
| `test` | Tema para pruebas | Desarrollo |

### Comandos de temas

```bash
# Crear nuevo tema
npm run theme:create

# Construir tema
npm run theme:build

# Activar tema
npm run theme:active
```

## 🔌 Extensiones

### Extensiones incluidas

- **sample** - Extensión de ejemplo con API, GraphQL, páginas y crons
- **@evershop/resend** - Integración con Resend para emails

### Crear extensión

Las extensiones se ubican en `extensions/` y pueden incluir:
- APIs REST (`api/`)
- Resolvers GraphQL (`graphql/`)
- Páginas (`pages/`)
- Cron jobs (`crons/`)
- Subscribers (`subscribers/`)

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia en modo desarrollo |
| `npm run build` | Construye para producción |
| `npm start` | Inicia en producción |
| `npm run setup` | Configura la base de datos |
| `npm run seed` | Carga datos de ejemplo |
| `npm run user:create` | Crea usuario administrador |
| `npm run theme:create` | Crea nuevo tema |
| `npm run theme:build` | Construye tema activo |
| `npm run theme:active` | Activa un tema |

## 🔒 Seguridad

- Las credenciales sensibles deben configurarse como variables de entorno
- El contenedor Docker corre con usuario no-root
- Se incluye health check para monitoreo

## 🐛 Solución de Problemas

### Error de conexión a base de datos

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps

# Ver logs de la base de datos
docker-compose logs postgres
```

### Error en build de Docker

```bash
# Limpiar caché y reconstruir
docker-compose build --no-cache
```

### Aplicación no inicia

```bash
# Ver logs de la aplicación
docker-compose logs -f app
```

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.

---

**Desarrollado con ❤️ por JB Skylens**
