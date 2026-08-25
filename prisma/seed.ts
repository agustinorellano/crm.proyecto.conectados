import { PrismaClient, ServiceCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SERVICES: { name: string; category: ServiceCategory }[] = [
  // Comunicación Digital
  { name: "Estrategia de comunicación", category: "COMUNICACION_DIGITAL" },
  { name: "Redes sociales", category: "COMUNICACION_DIGITAL" },
  { name: "Community management", category: "COMUNICACION_DIGITAL" },
  { name: "Producción de contenido", category: "COMUNICACION_DIGITAL" },
  { name: "Campañas de comunicación", category: "COMUNICACION_DIGITAL" },
  { name: "Branding", category: "COMUNICACION_DIGITAL" },
  { name: "Comunicación institucional", category: "COMUNICACION_DIGITAL" },
  // Marketing Digital
  { name: "Estrategia digital", category: "MARKETING_DIGITAL" },
  { name: "Performance / Pauta", category: "MARKETING_DIGITAL" },
  { name: "SEO", category: "MARKETING_DIGITAL" },
  { name: "Analítica", category: "MARKETING_DIGITAL" },
  { name: "Email marketing", category: "MARKETING_DIGITAL" },
  // Desarrollo Web
  { name: "Landing pages", category: "DESARROLLO_WEB" },
  { name: "Sitios corporativos", category: "DESARROLLO_WEB" },
  { name: "E-commerce", category: "DESARROLLO_WEB" },
  { name: "Micrositios", category: "DESARROLLO_WEB" },
  { name: "Mantenimiento web", category: "DESARROLLO_WEB" },
  { name: "Optimización web", category: "DESARROLLO_WEB" },
  // Desarrollo y soluciones digitales
  { name: "Automatizaciones", category: "SOLUCIONES_DIGITALES" },
  { name: "Dashboards", category: "SOLUCIONES_DIGITALES" },
  { name: "Herramientas internas", category: "SOLUCIONES_DIGITALES" },
  { name: "CRM", category: "SOLUCIONES_DIGITALES" },
  { name: "Integraciones", category: "SOLUCIONES_DIGITALES" },
  { name: "Soluciones personalizadas", category: "SOLUCIONES_DIGITALES" },
];

async function main() {
  // ── Usuario administrador real ──────────────────────────────────────────
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@conectados.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const firstName = process.env.SEED_ADMIN_FIRST_NAME || "Admin";
  const lastName = process.env.SEED_ADMIN_LAST_NAME || "Conectados";

  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashed,
      firstName,
      lastName,
      role: "ADMIN",
    },
  });
  console.log(`✔ Usuario administrador listo: ${admin.email}`);

  // ── Catálogo de servicios de Conectados (datos reales, no demo) ─────────
  for (const s of SERVICES) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.service.create({ data: s });
    }
  }
  console.log(`✔ Catálogo de servicios cargado (${SERVICES.length})`);

  // ── Datos de demostración (claramente marcados con isDemo: true) ───────
  const seedDemo = process.env.SEED_DEMO !== "false";
  if (seedDemo) {
    const existingDemo = await prisma.client.findFirst({ where: { isDemo: true } });
    if (!existingDemo) {
      const service = await prisma.service.findFirst({ where: { name: "Redes sociales" } });

      const demoClient = await prisma.client.create({
        data: {
          name: "Cliente Demo S.A.",
          industry: "Retail",
          email: "contacto@clientedemo.com",
          phone: "+54 9 11 5555-0000",
          website: "https://clientedemo.com",
          status: "ACTIVO",
          monthlyValue: 150000,
          ownerId: admin.id,
          isDemo: true,
          contacts: {
            create: [
              {
                firstName: "Julieta",
                lastName: "Fernández",
                role: "Marketing Manager",
                email: "julieta@clientedemo.com",
                isPrimary: true,
              },
            ],
          },
          notes: {
            create: [
              {
                authorId: admin.id,
                body: "Este es un cliente de ejemplo para mostrar la interfaz. No representa datos reales.",
              },
            ],
          },
        },
      });

      if (service) {
        await prisma.clientService.create({
          data: { clientId: demoClient.id, serviceId: service.id, monthlyFee: 150000 },
        });
      }

      const demoProject = await prisma.project.create({
        data: {
          clientId: demoClient.id,
          name: "Rediseño de redes sociales (demo)",
          description: "Proyecto de ejemplo para mostrar el flujo de Kanban.",
          priority: "ALTA",
          status: "EN_PROGRESO",
          progress: 40,
          ownerId: admin.id,
          isDemo: true,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          tasks: {
            create: [
              { title: "Brief con el cliente", status: "COMPLETADO", priority: "MEDIA", isDemo: true },
              { title: "Diseño de piezas", status: "EN_PROGRESO", priority: "ALTA", isDemo: true },
              {
                title: "Revisión interna",
                status: "POR_HACER",
                priority: "MEDIA",
                isDemo: true,
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
              },
            ],
          },
        },
      });

      await prisma.deal.create({
        data: {
          clientId: demoClient.id,
          title: "Ampliación de servicio de contenido (demo)",
          stage: "NEGOCIACION",
          value: 80000,
          probability: 70,
          nextAction: "Enviar propuesta actualizada",
          nextActionAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          ownerId: admin.id,
          isDemo: true,
        },
      });

      await prisma.meeting.create({
        data: {
          title: "Reunión mensual de seguimiento (demo)",
          clientId: demoClient.id,
          startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          type: "REUNION",
          ownerId: admin.id,
          isDemo: true,
        },
      });

      await prisma.contentItem.create({
        data: {
          clientId: demoClient.id,
          title: "Post de lanzamiento (demo)",
          platform: "INSTAGRAM",
          status: "PROGRAMADO",
          scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          ownerId: admin.id,
          isDemo: true,
        },
      });

      await prisma.metricValue.createMany({
        data: [
          {
            clientId: demoClient.id,
            platform: "instagram",
            metric: "seguidores",
            value: 12450,
            periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            periodEnd: new Date(),
            isDemo: true,
          },
          {
            clientId: demoClient.id,
            platform: "web",
            metric: "sesiones",
            value: 3200,
            periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            periodEnd: new Date(),
            isDemo: true,
          },
        ],
      });

      await prisma.activity.create({
        data: {
          clientId: demoClient.id,
          projectId: demoProject.id,
          userId: admin.id,
          type: "PROYECTO",
          message: `Proyecto "${demoProject.name}" creado`,
        },
      });

      console.log("✔ Datos de demostración cargados (marcados con isDemo=true)");
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
