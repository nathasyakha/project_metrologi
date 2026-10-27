import mysql from "mysql2/promise";
import { writeFile } from "node:fs/promises";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL tidak ditemukan");
}

const connection = await mysql.createConnection(url);

try {
  const [tables] = await connection.query(
    "SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'"
  );

  const tableNames = (tables as Record<string, unknown>[])
    .map((row) => Object.values(row)[0])
    .filter(
      (table): table is string =>
        typeof table === "string" && table.length > 0
    );

  const backup: Record<string, unknown> = {};

  for (const table of tableNames) {
    const escaped = `\`${table.replace(/`/g, "``")}\``;

    const [createRows] = await connection.query(
      `SHOW CREATE TABLE ${escaped}`
    );

    const createInfo = (
      createRows as Record<string, unknown>[]
    )[0];

    if (!createInfo) {
      throw new Error(
        `Metadata CREATE TABLE untuk ${table} tidak ditemukan`
      );
    }

    const createKey = Object.keys(createInfo).find(
      (key) => key.toLowerCase() === "create table"
    );

    if (!createKey) {
      throw new Error(
        `Definisi CREATE TABLE untuk ${table} tidak ditemukan`
      );
    }

    const createTable = createInfo[createKey];

    if (typeof createTable !== "string") {
      throw new Error(
        `Definisi CREATE TABLE untuk ${table} bukan string`
      );
    }

    const [rows] = await connection.query(
      `SELECT * FROM ${escaped}`
    );

    backup[table] = {
      createTable,
      rows,
    };

    console.log(
      `Backup ${table}: ${(rows as unknown[]).length} baris`
    );
  }

  const filename = `metrologi_db_backup_${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.json`;

  await writeFile(filename, JSON.stringify(backup, null, 2), {
    mode: 0o600,
  });

  console.log(`Backup selesai: ${filename}`);
} finally {
  await connection.end();
}
