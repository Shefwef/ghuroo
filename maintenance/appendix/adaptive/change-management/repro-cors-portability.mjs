// Functional, DB-free reproduction of AM-01 (see 02-adaptive-maintenance.md
// section, and MAINTENANCE_REPORT.md Part B). Spins up two minimal Express
// servers replicating (a) the original hardcoded single-origin CORS config
// and (b) the new ALLOWED_ORIGINS-driven config, then makes real HTTP
// requests with different Origin headers against both to prove:
//   1. Existing behaviour is unchanged when ALLOWED_ORIGINS is unset.
//   2. A new deployment origin (e.g. a custom domain) is rejected by the old
//      code and accepted by the new code once ALLOWED_ORIGINS is set.
//
// Run: node maintenance/appendix/adaptive/change-management/repro-cors-portability.mjs
import express from "express";
import cors from "cors";
import http from "http";

function startOldServer(port) {
  const app = express();
  app.use(
    cors({
      origin: ["https://ghuroo.onrender.com"], // hardcoded, pre-AM-01
      credentials: true,
    })
  );
  app.get("/api/ping", (req, res) => res.json({ ok: true }));
  return app.listen(port);
}

function startNewServer(port, allowedOriginsEnv) {
  const app = express();
  const defaultOrigins = ["https://ghuroo.onrender.com"];
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(",").map((o) => o.trim())
    : defaultOrigins;
  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.get("/api/ping", (req, res) => res.json({ ok: true }));
  return app.listen(port);
}

function requestWithOrigin(port, origin) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: "127.0.0.1", port, path: "/api/ping", method: "GET", headers: { Origin: origin } },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () =>
          resolve({
            status: res.statusCode,
            allowOrigin: res.headers["access-control-allow-origin"] || null,
          })
        );
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function main() {
  const originsToTry = [
    "https://ghuroo.onrender.com", // existing prod origin - must keep working
    "https://ghuroo.app",          // hypothetical new custom domain
  ];

  console.log("=== OLD config: hardcoded single origin ===");
  const oldServer = startOldServer(4101);
  for (const origin of originsToTry) {
    const r = await requestWithOrigin(4101, origin);
    console.log(
      `  Origin: ${origin.padEnd(28)} -> access-control-allow-origin: ${r.allowOrigin ?? "(absent = blocked by browser CORS)"}`
    );
  }
  oldServer.close();

  console.log("\n=== NEW config: ALLOWED_ORIGINS unset (must match old behaviour) ===");
  const newServerDefault = startNewServer(4102, undefined);
  for (const origin of originsToTry) {
    const r = await requestWithOrigin(4102, origin);
    console.log(
      `  Origin: ${origin.padEnd(28)} -> access-control-allow-origin: ${r.allowOrigin ?? "(absent = blocked by browser CORS)"}`
    );
  }
  newServerDefault.close();

  console.log("\n=== NEW config: ALLOWED_ORIGINS=https://ghuroo.onrender.com,https://ghuroo.app ===");
  const newServerConfigured = startNewServer(
    4103,
    "https://ghuroo.onrender.com,https://ghuroo.app"
  );
  for (const origin of originsToTry) {
    const r = await requestWithOrigin(4103, origin);
    console.log(
      `  Origin: ${origin.padEnd(28)} -> access-control-allow-origin: ${r.allowOrigin ?? "(absent = blocked by browser CORS)"}`
    );
  }
  newServerConfigured.close();
}

main();
