import { Router, type IRouter } from "express";
import net from "node:net";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// Infra diagnostic: is the database reachable from THIS host, and does a real
// query work? Reports the raw TCP result separately from the SQL result so a
// blocked outbound port is distinguishable from bad credentials. Returns
// hostname + error codes/messages only — never credentials.
router.get("/healthz/db", async (_req, res) => {
  const report: Record<string, unknown> = {};
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    res.status(500).json({ error: "DATABASE_URL is not set" });
    return;
  }

  let host = "";
  let port = 5432;
  try {
    const u = new URL(raw);
    host = u.hostname;
    port = u.port ? Number(u.port) : 5432;
    report.host = host;
    report.port = port;
  } catch {
    res.status(500).json({ error: "DATABASE_URL is not a valid URL" });
    return;
  }

  report.tcp = await new Promise<string>((resolve) => {
    const started = Date.now();
    const sock = net.connect({ host, port });
    let settled = false;
    const done = (result: string) => {
      if (settled) return;
      settled = true;
      sock.destroy();
      resolve(`${result} (${Date.now() - started}ms)`);
    };
    sock.setTimeout(8000, () => done("timeout"));
    sock.once("connect", () => done("ok"));
    sock.once("error", (e: NodeJS.ErrnoException) =>
      done(`error:${e.code ?? e.message}`),
    );
  });

  try {
    const timeout = new Promise((_resolve, reject) => {
      setTimeout(() => reject(new Error("query timeout after 9s")), 9000);
    });
    await Promise.race([pool.query("select 1 as ok"), timeout]);
    report.query = "ok";
  } catch (e) {
    report.query = "failed";
    // Walk the cause chain — drizzle/pg wrap the real error.
    const chain: string[] = [];
    let cur: unknown = e;
    for (let i = 0; i < 5 && cur instanceof Error; i++) {
      const code = (cur as NodeJS.ErrnoException).code;
      chain.push(
        `${cur.constructor.name}${code ? `[${code}]` : ""}: ${cur.message.slice(0, 160)}`,
      );
      cur = cur.cause;
    }
    report.queryError = chain;
  }

  res.json(report);
});

export default router;
