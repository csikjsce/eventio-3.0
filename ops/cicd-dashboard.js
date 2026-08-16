#!/usr/bin/env node
/**
 * Eventio delivery board — Jenkins-style view of what is live, build status, and history.
 * Coolify compose services do not show git commits; this board is the source of truth.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const PORT = Number(process.env.CICD_DASH_PORT || 3020);
const LOG_DIR = process.env.EVENTIO_LOG_DIR || "/tmp/eventio";
const REPO = process.env.EVENTIO_GITHUB_REPO || "csikjsce/eventio-3.0";
const APP_URL = process.env.EVENTIO_APP_URL || "https://eventio.somaiya.edu";
const ROOT = "/vm-storage/projects/eventio-3.0";

function readTrim(file) {
  try {
    return fs.readFileSync(file, "utf8").trim();
  } catch {
    return null;
  }
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
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

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: opts.timeout || 8000, cwd: opts.cwd || ROOT, env: { ...process.env, GITHUB_TOKEN: "" } }, (err, stdout, stderr) => {
      resolve({ ok: !err, stdout: (stdout || "").trim(), stderr: (stderr || "").trim() });
    });
  });
}

function hookStatus() {
  return new Promise((resolve) => {
    const req = http.get("http://127.0.0.1:3099/status", { timeout: 2000 }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({ last_status: "unknown", running: false });
        }
      });
    });
    req.on("error", () => resolve({ last_status: "hook-down", running: false }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ last_status: "timeout", running: false });
    });
  });
}

async function collectStatus() {
  const lastGood = readTrim(path.join(LOG_DIR, "last-good.sha"));
  const lastDeployed = readTrim(path.join(LOG_DIR, "last-deployed.sha"));
  const lastFailure = readTrim(path.join(LOG_DIR, "last-deploy-failure.txt"));
  const lastMeta = readJson(path.join(LOG_DIR, "last-deploy.json"), null);
  const history = (() => {
    try {
      return fs
        .readFileSync(path.join(LOG_DIR, "deploy-history.jsonl"), "utf8")
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((l) => JSON.parse(l))
        .reverse()
        .slice(0, 20);
    } catch {
      return [];
    }
  })();

  const logFile = fs.existsSync(path.join(LOG_DIR, "ui-redeploy.log"))
    ? path.join(LOG_DIR, "ui-redeploy.log")
    : path.join(LOG_DIR, "last-deploy.log");
  const lastLog = (() => {
    try {
      return fs.readFileSync(logFile, "utf8").trim().split("\n").slice(-80).join("\n");
    } catch {
      return null;
    }
  })();

  const git = await run("git", ["log", "-1", "--format=%H%n%s%n%an <%ae>%n%ci"]);
  const [headSha, headSubject, headAuthor, headDate] = (git.stdout || "").split("\n");
  const origin = await run("git", ["rev-parse", "origin/main"]);
  const originSha = origin.stdout || "";

  const docker = await run("bash", [
    "-lc",
    "docker ps --filter name=op8cvha6gvpoohoq85lfqgj0 --format '{{.Names}}\t{{.Status}}'",
  ]);
  const containers = docker.stdout
    ? docker.stdout.split("\n").map((line) => {
        const [name, ...rest] = line.split("\t");
        return { name: (name || "").replace(/-op8cvha6gvpoohoq85lfqgj0$/, ""), status: rest.join("\t") };
      })
    : [];

  const ghRuns = await run("gh", [
    "run",
    "list",
    "-R",
    REPO,
    "--limit",
    "8",
    "--json",
    "databaseId,name,displayTitle,conclusion,status,headSha,url,createdAt,event",
  ]);
  let actions = [];
  try {
    actions = JSON.parse(ghRuns.stdout || "[]");
  } catch {
    actions = [];
  }

  const ghDeploys = await run("gh", [
    "api",
    `repos/${REPO}/deployments?environment=production&per_page=8`,
  ]);
  let deployments = [];
  try {
    deployments = JSON.parse(ghDeploys.stdout || "[]").map((d) => ({
      id: d.id,
      sha: d.sha,
      created: d.created_at,
      description: d.description,
      url: `https://github.com/${REPO}/deployments/${d.id}`,
    }));
  } catch {
    deployments = [];
  }

  const checks = await Promise.all([
    probe(`${APP_URL}/api/v1/health`),
    probe(`${APP_URL}/login`),
    probe(`${APP_URL}/council/login`),
    probe(`${APP_URL}/faculty/login`),
  ]);
  const labels = ["public-api", "public-student", "public-council", "public-faculty"];
  const health = Object.fromEntries(labels.map((k, i) => [k, checks[i]]));
  const hook = await hookStatus();

  const liveSha = lastGood || lastDeployed || lastMeta?.sha || "";
  const inSync = Boolean(liveSha && originSha && liveSha === originSha);

  return {
    generatedAt: new Date().toISOString(),
    repo: REPO,
    appUrl: APP_URL,
    lastGood,
    lastDeployed,
    lastMeta,
    history,
    inSync,
    lastFailure,
    lastLog,
    health,
    hook,
    git: { headSha, headSubject, headAuthor, headDate, originSha },
    containers,
    actions,
    deployments,
    links: {
      actions: `https://github.com/${REPO}/actions`,
      deployWorkflow: `https://github.com/${REPO}/actions/workflows/coolify-redeploy.yml`,
      ciWorkflow: `https://github.com/${REPO}/actions/workflows/ci.yml`,
      deployments: `https://github.com/${REPO}/deployments`,
      commits: `https://github.com/${REPO}/commits/main`,
      grafana: "https://grafana.arnabbhowmik.in",
      coolify: "https://coolify.arnabbhowmik.in",
      app: APP_URL,
    },
  };
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function htmlPage(data) {
  const badge = (ok) => (ok ? `<span class="pill ok">up</span>` : `<span class="pill bad">down</span>`);
  const short = (sha) => (sha ? sha.slice(0, 7) : "—");
  const healthRows = Object.entries(data.health)
    .map(([name, h]) => `<tr><td>${esc(name)}</td><td>${badge(h.ok)}</td><td class="mono">${h.status || "—"}</td></tr>`)
    .join("");
  const containerRows = (data.containers || [])
    .map((c) => {
      const ok = /healthy|Up /.test(c.status) && !/unhealthy/.test(c.status);
      return `<tr><td class="mono">${esc(c.name)}</td><td>${ok ? '<span class="pill ok">healthy</span>' : '<span class="pill warn">check</span>'}</td><td class="muted">${esc(c.status)}</td></tr>`;
    })
    .join("") || `<tr><td colspan="3" class="muted">No Coolify containers reported</td></tr>`;

  const live = data.lastMeta || {};
  const liveSha = live.sha || data.lastGood || data.lastDeployed || "";
  const hookRun = data.hook?.running || data.hook?.last_status === "running";
  const statusPill = hookRun
    ? '<span class="pill warn">building</span>'
    : live.status === "success" || data.lastGood
      ? '<span class="pill ok">stable</span>'
      : live.status === "failure"
        ? '<span class="pill bad">failed</span>'
        : '<span class="pill warn">unknown</span>';

  const histRows = (data.history || [])
    .map((h) => {
      const st =
        h.status === "success" ? '<span class="pill ok">success</span>' : h.status === "failure" ? '<span class="pill bad">failed</span>' : `<span class="pill warn">${esc(h.status)}</span>`;
      return `<tr>
        <td class="mono"><a href="https://github.com/${data.repo}/commit/${esc(h.sha)}" target="_blank">${esc(short(h.sha))}</a></td>
        <td>${esc(h.subject)}</td>
        <td class="muted">${esc(h.author)}</td>
        <td>${st}</td>
        <td class="muted mono">${esc(h.finished || h.started || "")}</td>
      </tr>`;
    })
    .join("") || `<tr><td colspan="5" class="muted">No recorded builds yet — next Redeploy will appear here.</td></tr>`;

  const actionRows = (data.actions || [])
    .map((a) => {
      const st = a.conclusion || a.status;
      const pill =
        st === "success"
          ? '<span class="pill ok">success</span>'
          : st === "failure"
            ? '<span class="pill bad">failure</span>'
            : `<span class="pill warn">${esc(st)}</span>`;
      return `<tr>
        <td><a href="${esc(a.url)}" target="_blank">${esc(a.name)}</a></td>
        <td>${esc(a.displayTitle)}</td>
        <td class="mono">${esc(short(a.headSha))}</td>
        <td>${pill}</td>
      </tr>`;
    })
    .join("") || `<tr><td colspan="4" class="muted">Could not load GitHub Actions</td></tr>`;

  const drift = data.inSync
    ? '<span class="pill ok">production = main</span>'
    : `<span class="pill warn">drift</span> <span class="muted">main ${esc(short(data.git.originSha))} vs live ${esc(short(liveSha))}</span>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Eventio builds</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #0f1419; --panel: #171d25; --line: #2a3441; --text: #e8eef5;
      --muted: #93a0b0; --ok: #3ecf8e; --bad: #ff6b6b; --accent: #c9a227; --link: #7eb6ff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0; font-family: "IBM Plex Sans", system-ui, sans-serif; color: var(--text);
      background: radial-gradient(1200px 600px at 10% -10%, #1c2736 0%, transparent 55%), var(--bg);
      min-height: 100vh;
    }
    main { max-width: 1180px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    .brand { font-size: 0.8rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); font-weight: 600; }
    h1 { font-size: clamp(1.6rem, 3vw, 2.2rem); margin: 0.3rem 0 0.4rem; }
    .sub { color: var(--muted); margin: 0 0 1.5rem; max-width: 48rem; line-height: 1.5; }
    .grid { display: grid; gap: 1rem; grid-template-columns: repeat(12, 1fr); }
    .card { background: color-mix(in srgb, var(--panel) 92%, black); border: 1px solid var(--line); border-radius: 14px; padding: 1.1rem 1.2rem; }
    .span-4 { grid-column: span 4; } .span-6 { grid-column: span 6; } .span-8 { grid-column: span 8; } .span-12 { grid-column: span 12; }
    @media (max-width: 900px) { .span-4, .span-6, .span-8, .span-12 { grid-column: span 12; } }
    h2 { font-size: 0.82rem; margin: 0 0 0.85rem; color: var(--muted); font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; }
    .stat { font-size: 1.45rem; font-family: "IBM Plex Mono", monospace; font-weight: 500; }
    .muted { color: var(--muted); font-size: 0.9rem; }
    .mono { font-family: "IBM Plex Mono", monospace; font-size: 0.85rem; }
    .pill { display: inline-block; border-radius: 999px; padding: 0.15rem 0.55rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
    .pill.ok { background: color-mix(in srgb, var(--ok) 20%, transparent); color: var(--ok); }
    .pill.bad { background: color-mix(in srgb, var(--bad) 20%, transparent); color: var(--bad); }
    .pill.warn { background: color-mix(in srgb, var(--accent) 20%, transparent); color: var(--accent); }
    table { width: 100%; border-collapse: collapse; }
    td, th { text-align: left; padding: 0.45rem 0; border-bottom: 1px solid var(--line); font-size: 0.9rem; vertical-align: top; }
    a { color: var(--link); text-decoration: none; } a:hover { text-decoration: underline; }
    .links { display: flex; flex-wrap: wrap; gap: 0.55rem; }
    .links a, button.act {
      border: 1px solid var(--line); background: #121820; color: var(--text);
      padding: 0.55rem 0.8rem; border-radius: 10px; font-size: 0.9rem; cursor: pointer;
    }
    button.act { border-color: var(--accent); background: #1a1810; }
    pre { margin: 0; white-space: pre-wrap; word-break: break-word; background: #0c1015; border: 1px solid var(--line); border-radius: 10px; padding: 0.85rem; max-height: 340px; overflow: auto; font-family: "IBM Plex Mono", monospace; font-size: 0.75rem; color: #c7d2de; }
    footer { margin-top: 1.25rem; color: var(--muted); font-size: 0.8rem; }
  </style>
</head>
<body>
  <main>
    <div class="brand">Eventio · Delivery</div>
    <h1>What’s in production</h1>
    <p class="sub">Coolify shows container health, not git builds. This board is the Jenkins-style view: which commit is live, whether a build is running, and the last console log. Auto-refresh while building.</p>

    <div class="grid">
      <section class="card span-8">
        <h2>Currently deployed</h2>
        <div>${statusPill} ${drift}</div>
        <div class="stat" style="margin-top:0.6rem"><a href="https://github.com/${data.repo}/commit/${esc(liveSha)}" target="_blank">${esc(short(liveSha))}</a></div>
        <p style="margin:0.4rem 0 0">${esc(live.subject || data.git.headSubject || "—")}</p>
        <p class="muted">${esc(live.author || data.git.headAuthor || "")} · ${esc(live.finished || live.started || data.git.headDate || "")}</p>
        <p class="muted mono">main HEAD ${esc(short(data.git.originSha || data.git.headSha))}</p>
      </section>
      <section class="card span-4">
        <h2>Build now</h2>
        <p>${hookRun ? '<span class="pill warn">in progress</span>' : '<span class="pill ok">idle</span>'}</p>
        <p class="muted">Hook: ${esc(data.hook?.last_status || "—")}</p>
        <div class="links" style="margin-top:0.8rem">
          <button id="redeployBtn" class="act" type="button">Redeploy now</button>
        </div>
        <p class="muted" id="redeployMsg" style="margin-top:0.8rem">Push to <b>main</b> also starts a build automatically.</p>
      </section>

      <section class="card span-6">
        <h2>Public health</h2>
        <table><thead><tr><th>Check</th><th>State</th><th>Code</th></tr></thead><tbody>${healthRows}</tbody></table>
      </section>
      <section class="card span-6">
        <h2>Coolify containers</h2>
        <table><thead><tr><th>Service</th><th>State</th><th>Detail</th></tr></thead><tbody>${containerRows}</tbody></table>
      </section>

      <section class="card span-12">
        <h2>Build history (this server)</h2>
        <table>
          <thead><tr><th>Commit</th><th>Change</th><th>Author</th><th>Result</th><th>When</th></tr></thead>
          <tbody>${histRows}</tbody>
        </table>
      </section>

      <section class="card span-12">
        <h2>GitHub Actions</h2>
        <table>
          <thead><tr><th>Workflow</th><th>Title</th><th>SHA</th><th>Result</th></tr></thead>
          <tbody>${actionRows}</tbody>
        </table>
      </section>

      <section class="card span-12">
        <h2>Console (docker build + recreate)</h2>
        <pre>${esc(data.lastLog || "No deploy log yet.")}</pre>
      </section>

      <section class="card span-12">
        <h2>Links</h2>
        <div class="links">
          <a href="${data.links.coolify}" target="_blank">Coolify (containers / logs)</a>
          <a href="${data.links.deployments}" target="_blank">GitHub Deployments</a>
          <a href="${data.links.commits}" target="_blank">Commits on main</a>
          <a href="${data.links.deployWorkflow}" target="_blank">Auto-deploy workflow</a>
          <a href="${data.links.actions}" target="_blank">All Actions</a>
          <a href="${data.links.app}" target="_blank">Production app</a>
          <a href="${data.links.grafana}" target="_blank">Grafana</a>
        </div>
      </section>
      ${
        data.lastFailure
          ? `<section class="card span-12"><h2>Last failure note</h2><pre>${esc(data.lastFailure)}</pre></section>`
          : ""
      }
    </div>
    <footer>Generated ${esc(data.generatedAt)} · repo ${esc(data.repo)}</footer>
  </main>
  <script>
    const building = ${hookRun ? "true" : "false"};
    setTimeout(() => location.reload(), building ? 4000 : 20000);
    const btn = document.getElementById('redeployBtn');
    const msg = document.getElementById('redeployMsg');
    btn?.addEventListener('click', async () => {
      btn.disabled = true; msg.textContent = 'Starting build…';
      try {
        const r = await fetch('/api/redeploy', { method: 'POST' });
        const j = await r.json();
        msg.textContent = r.ok ? ('Accepted: ' + (j.status || 'ok') + ' — this page will show BUILDING') : ('Failed: ' + (j.error || r.status));
        if (r.ok) setTimeout(() => location.reload(), 1500);
      } catch (e) { msg.textContent = 'Failed: ' + e; }
      btn.disabled = false;
    });
  </script>
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
    req.end(JSON.stringify({ source: "cicd-board" }));
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
