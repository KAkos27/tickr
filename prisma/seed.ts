import prisma from "@/lib/prisma";
import "dotenv/config";

export async function main() {
  // Users
  const usersData = [
    { email: "alice@example.com", name: "Alice" },
    { email: "bob@example.com", name: "Bob" },
    { email: "carol@example.com", name: "Carol" },
    { email: "dave@example.com", name: "Dave" },
  ];

  const users: Record<
    string,
    { id: string; email: string; name: string | null }
  > = {};
  for (const u of usersData) {
    const up = await prisma.user.upsert({
      where: { email: u.email },
      create: u,
      update: {},
    });
    users[u.email] = up as { id: string; email: string; name: string | null };
  }

  // Groups
  const groupNames = ["Core Team", "Design Guild"] as const;
  const groups: Partial<
    Record<(typeof groupNames)[number], { id: string; name: string }>
  > = {};
  for (const name of groupNames) {
    const existing = await prisma.group.findFirst({ where: { name } });
    groups[name] = existing ?? (await prisma.group.create({ data: { name } }));
  }

  // Memberships
  const memberships: Array<{
    email: string;
    group: (typeof groupNames)[number];
  }> = [
    { email: "alice@example.com", group: "Core Team" },
    { email: "bob@example.com", group: "Core Team" },
    { email: "carol@example.com", group: "Design Guild" },
    { email: "dave@example.com", group: "Design Guild" },
    // cross-membership
    { email: "alice@example.com", group: "Design Guild" },
  ];
  for (const m of memberships) {
    const user = users[m.email];
    const group = groups[m.group]!;
    await prisma.groupUser.upsert({
      where: { userId_groupId: { userId: user.id, groupId: group.id } },
      create: { userId: user.id, groupId: group.id },
      update: {},
    });
  }

  // Projects per group
  const projectsByGroup: Record<(typeof groupNames)[number], string[]> = {
    "Core Team": ["Q1", "Website Redesign"],
    "Design Guild": ["Brand Refresh", "UX Audit"],
  };

  const projects: Record<
    string,
    { id: string; name: string; groupId: string }
  > = {};
  for (const gName of groupNames) {
    const group = groups[gName]!;
    for (const pName of projectsByGroup[gName]) {
      const key = `${gName}:${pName}`;
      const existing = await prisma.project.findFirst({
        where: { name: pName, groupId: group.id },
      });
      projects[key] =
        existing ??
        (await prisma.project.create({
          data: { name: pName, groupId: group.id },
        }));
    }
  }

  // Tasks
  const tasks = [
    {
      projectKey: "Core Team:Q1",
      title: "Prepare kickoff",
      description: "Agenda and materials",
      createdBy: "alice@example.com",
      assignee: "bob@example.com",
    },
    {
      projectKey: "Core Team:Q1",
      title: "Set up repo",
      description: "Initialize project structure",
      createdBy: "bob@example.com",
      assignee: "alice@example.com",
    },
    {
      projectKey: "Core Team:Website Redesign",
      title: "Audit existing site",
      description: "Gather pain points",
      createdBy: "alice@example.com",
      assignee: "carol@example.com",
    },
    {
      projectKey: "Core Team:Website Redesign",
      title: "Create wireframes",
      description: "Homepage and product pages",
      createdBy: "carol@example.com",
      assignee: "dave@example.com",
    },
    {
      projectKey: "Design Guild:Brand Refresh",
      title: "Color palette proposals",
      description: "Three directions",
      createdBy: "carol@example.com",
      assignee: "alice@example.com",
    },
    {
      projectKey: "Design Guild:Brand Refresh",
      title: "Logo iteration",
      description: "Refine based on feedback",
      createdBy: "dave@example.com",
      assignee: null,
    },
    {
      projectKey: "Design Guild:UX Audit",
      title: "Heuristic evaluation",
      description: "Document findings",
      createdBy: "carol@example.com",
      assignee: "bob@example.com",
    },
    {
      projectKey: "Design Guild:UX Audit",
      title: "Accessibility review",
      description: "WCAG checklist",
      createdBy: "dave@example.com",
      assignee: "alice@example.com",
    },
  ];

  for (const t of tasks) {
    const project = projects[t.projectKey]!;
    const exists = await prisma.task.findFirst({
      where: { title: t.title, projectId: project.id },
    });
    if (!exists) {
      await prisma.task.create({
        data: {
          title: t.title,
          description: t.description ?? undefined,
          projectId: project.id,
          createdById: users[t.createdBy].id,
          assigneeId: t.assignee ? users[t.assignee].id : undefined,
        },
      });
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
