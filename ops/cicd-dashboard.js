#!/usr/bin/env node
/**
 * Eventio CI/CD ops dashboard
 * Serves a management UI for deploy status, health, and deep-links.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const PORT = Number(process.env.CICD_DASH_PORT || 3020);
const LOG_DIR = process.env.EVENTIO_LOG_DIR || "/tmp/eventio";
const REPO = process.env.EVENTIO_GITHUB_REPO || "csikjsce/eventio-3.0";
const APP_URL = process.env.EVENTIO_APP_URL || "https://eventio.somaiya.edu";

function readTrim(file) {
  try {
    return fs.readFileSync(file, "utf8").trim();
  } catch {
    return null;
  }
}

function probe(url, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const lib = url.startsWith("https") ? require("https") : require("http");
    const req = lib.get(url, { timeout: timeoutMs, rejectUnauthorized: false }, (res) => {
      res.resume();
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
    });
    req.on("error", () => resolve({ ok: false, status: 0 }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, status: 0 });
    });
  });
}

function runnerHint() {
  return new Promise((resolve) => {
    execFile("bash", ["-lc", "pgrep -af 'actions-runner|Runner.Listener' | head -5"], { timeout: 3000 }, (err, stdout) => {
      const lines = (stdout || "").trim().split("\n").filter(Boolean);
      resolve({ running: lines.length > 0, processes: lines.slice(0, 5) });
    });
  });
}

async function collectStatus() {
  const lastGood = readTrim(path.join(LOG_DIR, "last-good.sha"));
  const lastDeployed = readTrim(path.join(LOG_DIR, "last-deployed.sha"));
  const lastFailure = readTrim(path.join(LOG_DIR, "last-deploy-failure.txt"));
  const lastLog = (() => {
    try {
      const raw = fs.readFileSync(path.join(LOG_DIR, "last-deploy.log"), "utf8");
      return raw.trim().split("\n").slice(-40).join("\n");
    } catch {
      return null;
    }
  })();

  const checks = await Promise.all([
    probe(`${APP_URL}/api/v1/health`),
    probe(`${APP_URL}/login`),
    probe(`${APP_URL}/council/login`),
    probe(`${APP_URL}/faculty/login`),
    probe("http://127.0.0.1:3500/api/v1/health"),
    probe("http://127.0.0.1:4173/login"),
    probe("http://127.0.0.1:4174/council/login"),
    probe("http://127.0.0.1:4175/faculty/login"),
  ]);

  const labels = [
    "public-api",
    "public-student",
    "public-council",
    "public-faculty",
    "local-api",
    "local-student",
    "local-council",
    "local-faculty",
  ];

  const health = Object.fromEntries(labels.map((k, i) => [k, checks[i]]));
  const runner = await runnerHint();

  return {
    generatedAt: new Date().toISOString(),
    repo: REPO,
    appUrl: APP_URL,
    lastGood,
    lastDeployed,
    inSync: Boolean(lastGood && lastDeployed && lastGood === lastDeployed),
    lastFailure,
    lastLog,
    health,
    runner,
    links: {
      actions: `https://github.com/${REPO}/actions`,
      deployWorkflow: `https://github.com/${REPO}/actions/workflows/coolify-redeploy.yml`,
      ciWorkflow: `https://github.com/${REPO}/actions/workflows/ci.yml`,
      environments: `https://github.com/${REPO}/settings/environments`,
      deployments: `https://github.com/${REPO}/deployments`,
      grafana: "https://grafana.arnabbhowmik.in",
      prometheus: "https://prometheus.arnabbhowmik.in",
      alerts: "https://alerts.arnabbhowmik.in",
      coolify: "https://coolify.arnabbhowmik.in",
      app: APP_URL,
    },
  };
}

function htmlPage(data) {
  const badge = (ok) =>
    ok
      ? `<span class="pill ok">up</span>`
      : `<span class="pill bad">down</span>`;

  const healthRows = Object.entries(data.health)
    .map(
      ([name, h]) =>
        `<tr><td>${name}</td><td>${badge(h.ok)}</td><td class="mono">${h.status || "—"}</td></tr>`
    )
    .join("");

  const short = (sha) => (sha ? sha.slice(0, 7) : "—");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Eventio CI/CD Control</title>
  <meta http-equiv="refresh" content="30" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #0f1419;
      --panel: #171d25;
      --line: #2a3441;
      --text: #e8eef5;
      --muted: #93a0b0;
      --ok: #3ecf8e;
      --bad: #ff6b6b;
      --accent: #c9a227;
      --link: #7eb6ff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "IBM Plex Sans", system-ui, sans-serif;
      background:
        radial-gradient(1200px 600px at 10% -10%, #1c2736 0%, transparent 55%),
        radial-gradient(900px 500px at 100% 0%, #1a2218 0%, transparent 50%),
        var(--bg);
      color: var(--text);
      min-height: 100vh;
    }
    main { max-width: 1100px; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
    header { margin-bottom: 2rem; }
    .brand {
      font-size: 0.8rem; letter-spacing: 0.14em; text-transform: uppercase;
      color: var(--accent); font-weight: 600; margin-bottom: 0.5rem;
    }
    h1 { font-size: clamp(1.8rem, 3vw, 2.4rem); margin: 0 0 0.4rem; font-weight: 600; }
    .sub { color: var(--muted); margin: 0; max-width: 42rem; line-height: 1.5; }
    .grid { display: grid; gap: 1rem; grid-template-columns: repeat(12, 1fr); }
    .card {
      background: color-mix(in srgb, var(--panel) 92%, black);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 1.1rem 1.2rem;
    }
    .span-4 { grid-column: span 4; }
    .span-6 { grid-column: span 6; }
    .span-8 { grid-column: span 8; }
    .span-12 { grid-column: span 12; }
    @media (max-width: 860px) {
      .span-4, .span-6, .span-8, .span-12 { grid-column: span 12; }
    }
    h2 { font-size: 0.95rem; margin: 0 0 0.85rem; color: var(--muted); font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; }
    .stat { font-size: 1.45rem; font-family: "IBM Plex Mono", monospace; font-weight: 500; }
    .muted { color: var(--muted); font-size: 0.9rem; }
    .mono { font-family: "IBM Plex Mono", monospace; font-size: 0.85rem; }
    .pill {
      display: inline-block; border-radius: 999px; padding: 0.15rem 0.55rem;
      font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
    }
    .pill.ok { background: color-mix(in srgb, var(--ok) 20%, transparent); color: var(--ok); }
    .pill.bad { background: color-mix(in srgb, var(--bad) 20%, transparent); color: var(--bad); }
    .pill.warn { background: color-mix(in srgb, var(--accent) 20%, transparent); color: var(--accent); }
    table { width: 100%; border-collapse: collapse; }
    td, th { text-align: left; padding: 0.45rem 0; border-bottom: 1px solid var(--line); font-size: 0.92rem; }
    a { color: var(--link); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .links { display: flex; flex-wrap: wrap; gap: 0.55rem; }
    .links a {
      border: 1px solid var(--line); background: #121820; color: var(--text);
      padding: 0.55rem 0.8rem; border-radius: 10px; font-size: 0.9rem;
    }
    .links a:hover { border-color: var(--accent); text-decoration: none; }
    pre {
      margin: 0; white-space: pre-wrap; word-break: break-word;
      background: #0c1015; border: 1px solid var(--line); border-radius: 10px;
      padding: 0.85rem; max-height: 280px; overflow: auto;
      font-family: "IBM Plex Mono", monospace; font-size: 0.78rem; color: #c7d2de;
    }
    footer { margin-top: 1.25rem; color: var(--muted); font-size: 0.8rem; }
  </style>
</head>
<body>
  <main>
    <header>
      <div class="brand">Eventio · Delivery Control</div>
      <h1>CI/CD Management</h1>
      <p class="sub">Deploy state, health gates, runner status, and links into GitHub Actions + observability.</p>
    </header>

    <div class="grid">
      <section class="card span-4">
        <h2>Last good</h2>
        <div class="stat">${short(data.lastGood)}</div>
        <p class="muted mono">${data.lastGood || "not set"}</p>
      </section>
      <section class="card span-4">
        <h2>Last deployed</h2>
        <div class="stat">${short(data.lastDeployed)}</div>
        <p class="muted mono">${data.lastDeployed || "not set"}</p>
      </section>
      <section class="card span-4">
        <h2>Sync</h2>
        <div>${data.inSync ? '<span class="pill ok">in sync</span>' : '<span class="pill warn">drift</span>'}</div>
        <p class="muted" style="margin-top:0.7rem">Runner: ${
          data.runner.running
            ? '<span class="pill ok">detected</span>'
            : '<span class="pill bad">not detected</span>'
        }</p>
      </section>

      <section class="card span-6">
        <h2>Service health</h2>
        <table>
          <thead><tr><th>Check</th><th>State</th><th>Code</th></tr></thead>
          <tbody>${healthRows}</tbody>
        </table>
      </section>

      <section class="card span-6">
        <h2>Control plane (no SSH)</h2>
        <div class="links">
          <button id="redeployBtn" type="button" style="border:1px solid var(--accent);background:#1a1810;color:var(--text);padding:0.55rem 0.8rem;border-radius:10px;font-size:0.9rem;cursor:pointer">Redeploy now</button>
          <a href="${data.links.coolify}" target="_blank" rel="noreferrer">Coolify UI</a>
          <a href="${data.links.deployWorkflow}" target="_blank" rel="noreferrer">Auto-deploy workflow</a>
          <a href="${data.links.ciWorkflow}" target="_blank" rel="noreferrer">CI workflow</a>
          <a href="${data.links.actions}" target="_blank" rel="noreferrer">All Actions</a>
          <a href="${data.links.app}" target="_blank" rel="noreferrer">Production app</a>
          <a href="${data.links.grafana}" target="_blank" rel="noreferrer">Grafana</a>
          <a href="${data.links.prometheus}" target="_blank" rel="noreferrer">Prometheus</a>
          <a href="${data.links.alerts}" target="_blank" rel="noreferrer">Alerts</a>
        </div>
        <p class="muted" id="redeployMsg" style="margin-top:1rem">Use <b>Redeploy now</b> (UI) or push to <b>main</b> (automatic). Teammates never need server SSH.</p>
        <script>
          const btn = document.getElementById('redeployBtn');
          const msg = document.getElementById('redeployMsg');
          btn?.addEventListener('click', async () => {
            btn.disabled = true; msg.textContent = 'Starting redeploy…';
            try {
              const r = await fetch('/api/redeploy', { method: 'POST' });
              const j = await r.json();
              msg.textContent = r.ok ? ('Accepted: ' + (j.status || 'ok') + ' — watch Coolify / this page') : ('Failed: ' + (j.error || r.status));
            } catch (e) {
              msg.textContent = 'Failed: ' + e;
            }
            btn.disabled = false;
          });
        </script>
      </section>

      <section class="card span-12">
        <h2>Latest deploy log (tail)</h2>
        <pre>${(data.lastLog || "No deploy log yet.").replace(/[<>&]/g, (c) => ({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]))}</pre>
      </section>

      ${
        data.lastFailure
          ? `<section class="card span-12"><h2>Last failure</h2><pre>${data.lastFailure
              .replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]))}</pre></section>`
          : ""
      }
    </div>

    <footer>Generated ${data.generatedAt} · auto-refresh 30s · repo ${data.repo}</footer>
  </main>
</body>
</html>`;
}

function loadHookSecret() {
  try {
    const raw = fs.readFileSync("/vm-storage/projects/eventio-3.0/deploy/hook.env", "utf8");
    const line = raw.split("\n").find((l) => l.startsWith("DEPLOY_HOOK_SECRET="));
    if (!line) return null;
    return line.split("=", 2)[1].trim().replace(/^['"]|['"]$/g, "");
  } catch {
    return null;
  }
}

function triggerRedeploy() {
  return new Promise((resolve) => {
    const secret = loadHookSecret();
    if (!secret) {
      resolve({ ok: false, status: 500, body: { error: "deploy hook secret missing" } });
      return;
    }
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: 3099,
        path: "/redeploy",
        method: "POST",
        headers: { "X-Deploy-Secret": secret, "Content-Type": "application/json" },
        timeout: 10000,
      },
      (r) => {
        let data = "";
        r.on("data", (c) => (data += c));
        r.on("end", () => {
          let body = {};
          try {
            body = JSON.parse(data || "{}");
          } catch {
            body = { raw: data };
          }
          resolve({ ok: r.statusCode >= 200 && r.statusCode < 300, status: r.statusCode, body });
        });
      }
    );
    req.on("error", (e) => resolve({ ok: false, status: 502, body: { error: String(e) } }));
    req.end("{}");
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/api/status" || req.url?.startsWith("/api/status?")) {
      const data = await collectStatus();
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
      res.end(JSON.stringify(data, null, 2));
      return;
    }
    if (req.method === "POST" && (req.url === "/api/redeploy" || req.url?.startsWith("/api/redeploy?"))) {
      const result = await triggerRedeploy();
      res.writeHead(result.ok ? 202 : result.status || 500, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(result.body));
      return;
    }
    if (req.url === "/" || req.url?.startsWith("/?")) {
      const data = await collectStatus();
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      res.end(htmlPage(data));
      return;
    }
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }
    res.writeHead(404).end("Not found");
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(String(err && err.stack ? err.stack : err));
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Eventio CI/CD dashboard on :${PORT}`);
});
