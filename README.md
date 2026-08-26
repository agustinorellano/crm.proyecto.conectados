# CRM Conectados — Sistema operativo comercial, proyectos y clientes

Aplicación web **privada e interna** de Conectados: centraliza clientes,
pipeline comercial, proyectos, tareas, calendario, contenido, métricas y
archivos en un solo lugar.

Este repositorio corresponde a la **Fase 1-2** del proyecto: autenticación,
usuarios, dashboard, clientes (perfil 360°), pipeline comercial, proyectos y
tareas. El resto de los módulos (calendario con Google Calendar, contenido,
métricas históricas, Drive/Sheets, automatizaciones) están con una interfaz
base lista para completarse en las próximas fases, tal como se definió en el
brief del proyecto.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **PostgreSQL** + **Prisma 5** como ORM
- **NextAuth** (credenciales: email + contraseña) para autenticación
- **@dnd-kit** para el Kanban de Pipeline y Tareas

## 1. Base de datos (Neon)

El proyecto ya está conectado a un proyecto de **Neon** (`crm-conectados`),
con el schema completo aplicado y datos iniciales cargados (usuario admin +
catálogo de servicios + datos demo marcados `isDemo: true`). Neon expone dos
connection strings por rama:

- **Pooled** (host con `-pooler`) → usarla como `DATABASE_URL` (tráfico normal
  de la app).
- **Directa** (host sin `-pooler`) → usarla como `DATABASE_URL_UNPOOLED` (la
  usa Prisma para migraciones vía `directUrl` en `schema.prisma`).

Podés ver/copiar ambas desde [console.neon.tech](https://console.neon.tech) →
proyecto `crm-conectados` → "Connect".

Si preferís usar otro proveedor (Vercel Postgres, Supabase, etc.), cualquier
Postgres accesible por internet funciona igual — solo necesitás las dos
connection strings.

## 2. Correr el proyecto en local

```bash
npm install
cp .env.example .env   # completar DATABASE_URL, DATABASE_URL_UNPOOLED, NEXTAUTH_SECRET y datos del admin
npx prisma db push     # solo si cambiás el schema; la base ya tiene las tablas creadas
npm run db:seed        # solo si necesitás recrear el usuario admin / catálogo / demo
npm run dev
```

Generar un `NEXTAUTH_SECRET` seguro:

```bash
openssl rand -base64 32
```

La app queda disponible en `http://localhost:3000`. Se redirige
automáticamente a `/login`. Ingresá con el email/contraseña definidos en
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` de tu `.env`.

> Los datos de demostración (`isDemo: true`) son solo para mostrar la
> interfaz funcionando. Podés desactivarlos seteando `SEED_DEMO=false` antes
> de correr el seed, o borrarlos después desde la base de datos.

> **Nota sobre este entorno de desarrollo (Claude Code on the web):** la
> política de red de este sandbox bloquea conexiones TCP directas a Postgres
> (puerto 5432) y a `neon.tech`, así que `prisma db push` / `npm run db:seed`
> no se pueden correr desde acá — el schema y los datos iniciales se
> cargaron usando el MCP server de Neon (que sí puede ejecutar SQL contra la
> base). Esta restricción no aplica en Vercel ni en tu máquina local: ahí
> `db push` y el seed funcionan de forma normal.

## 3. Subir a GitHub

```bash
git init   # si todavía no es un repo
git add -A
git commit -m "CRM Conectados — Fase 1-2"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
git push -u origin main
```

## 4. Deploy en Vercel

1. Entrá a [vercel.com/new](https://vercel.com/new) e importá el repositorio
   de GitHub.
2. Framework Preset: **Next.js** (se detecta automáticamente).
3. En **Environment Variables** cargá (los mismos valores que tenés en tu
   `.env` local, apuntando al proyecto `crm-conectados` de Neon):
   - `DATABASE_URL` → connection string **pooled** de Neon
   - `DATABASE_URL_UNPOOLED` → connection string **directa** de Neon
   - `NEXTAUTH_URL` → la URL que te va a asignar Vercel, por ejemplo
     `https://crm-conectados.vercel.app` (podés actualizarla después del
     primer deploy)
   - `NEXTAUTH_SECRET` → el valor generado con `openssl rand -base64 32`
4. Deploy. Vercel corre `npm run build`, que ya incluye `prisma generate`.
5. La base de Neon **ya tiene el schema y los datos iniciales cargados**
   (usuario admin + catálogo de servicios + demo), así que no hace falta
   correr `db push` ni el seed de nuevo. Si más adelante modificás
   `prisma/schema.prisma`, corré `npx prisma db push` desde tu máquina (o
   cualquier entorno con salida TCP libre) apuntando al `DATABASE_URL_UNPOOLED`
   de producción.

6. Entrá a la URL de Vercel → te redirige a `/login` → ingresá con el usuario
   admin creado en el seed.

### Crear usuarios adicionales del equipo

Por ahora el alta de usuarios se hace corriendo el seed con otras variables,
o directamente con Prisma Studio (`npx prisma studio`) contra la base de
producción, creando un registro en `User` con el rol correspondiente
(`ADMIN`, `COMERCIAL`, `MARKETING`, `PROJECT_MANAGER`, `DESARROLLO`,
`LECTURA`) y una contraseña hasheada con bcrypt. La pantalla de gestión de
usuarios desde la UI está prevista para una próxima fase.

## Estructura del proyecto

```
prisma/schema.prisma   → modelo de datos completo (clientes, contactos,
                          pipeline, proyectos, tareas, reuniones, contenido,
                          métricas, propuestas, notas, archivos, actividad)
prisma/seed.ts         → usuario admin real + catálogo de servicios + demo
src/app/(app)/...      → páginas protegidas (dashboard, clientes, pipeline,
                          proyectos, tareas, calendario, contenido, etc.)
src/app/login          → pantalla de login
src/lib/actions/...    → server actions (crear/actualizar entidades)
src/components/layout  → sidebar, topbar, "+ Nuevo", búsqueda global (Ctrl+K)
```

## Seguridad

- Todas las rutas bajo `src/app/(app)` requieren sesión activa
  (`middleware.ts` redirige a `/login` si no hay sesión).
- Las contraseñas se almacenan hasheadas con bcrypt, nunca en texto plano.
- La sesión se maneja con JWT de NextAuth; cerrar sesión desde el menú de
  usuario invalida el acceso a las rutas privadas.

## Próximas fases (ver brief completo)

3. Calendario + Google Calendar + reuniones avanzadas.
4. Content Calendar completo + Google Drive (carpetas automáticas por
   cliente).
5. Métricas históricas con gráficos de evolución + Reportes exportables.
6. Sincronización con Google Sheets + automatizaciones (onboarding de
   clientes, recordatorios, detección de clientes sin seguimiento).
7. Integraciones avanzadas (Gmail, Meet, Analytics, Search Console,
   Instagram, LinkedIn, TikTok, GitHub, Slack) y asistente de IA interno.
