import { createDb, agents, companies } from "./packages/db/src/index.ts";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "node:crypto";

async function run() {
  const db = createDb(process.env.DATABASE_URL);
  const companyName = "Sirius's Legacy";
  
  // Find company
  const company = await db.select().from(companies).where(eq(companies.name, companyName)).then(rows => rows[0]);
  if (!company) {
    console.error(`Company "${companyName}" not found`);
    process.exit(1);
  }

  const companyId = company.id;
  console.log(`Found company "${companyName}" (ID: ${companyId})`);

  // Find existing CEO or create new one
  const existingCeo = await db.select().from(agents).where(and(eq(agents.companyId, companyId), eq(agents.role, "ceo"))).then(rows => rows[0]);

  const agentData = {
    name: "CEO",
    role: "ceo",
    title: "Chief Executive Officer",
    status: "active",
    adapterType: "opencode_local",
    adapterConfig: {
      model: "mimo v2 pro free",
      instructionsFilePath: "AGENTS.md" // Default
    },
    permissions: {
      canCreateAgents: true
    },
    updatedAt: new Date()
  };

  if (existingCeo) {
    console.log(`Updating existing CEO (ID: ${existingCeo.id})`);
    await db.update(agents).set(agentData).where(eq(agents.id, existingCeo.id));
  } else {
    const newId = randomUUID();
    console.log(`Creating new CEO (ID: ${newId})`);
    await db.insert(agents).values({
      id: newId,
      companyId,
      ...agentData,
      createdAt: new Date()
    });
  }

  console.log("CEO configuration complete.");
}

run().catch(console.error);
