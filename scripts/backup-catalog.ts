import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "../src/lib/db";

async function main() {
  const [categories, services, serviceConcerns, concerns, settings, blogPosts] = await Promise.all([
    db.category.findMany({ orderBy: { order: "asc" } }),
    db.service.findMany({ orderBy: { name: "asc" } }),
    db.serviceConcern.findMany(),
    db.concern.findMany({ orderBy: { order: "asc" } }),
    db.setting.findMany({ orderBy: { key: "asc" } }),
    db.blogPost.findMany({ orderBy: { slug: "asc" } }),
  ]);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const directory = join(process.cwd(), "backups");
  mkdirSync(directory, { recursive: true });
  const output = join(directory, `catalog-${timestamp}.json`);
  writeFileSync(output, JSON.stringify({ exportedAt: new Date().toISOString(), categories, services, serviceConcerns, concerns, settings, blogPosts }, null, 2));
  console.info(`Catálogo respaldado en ${output}`);
}

main().finally(() => db.$disconnect());
