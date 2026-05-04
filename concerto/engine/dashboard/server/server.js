const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { specsManager, promptsManager, maestrosManager, workflowsManager } = require('./fileManager');
const { ProjectManager } = require('./projectManager');
const { chatService } = require('./chatService');

const PORT = 3500;

// Root = current repository root (3 levels up: server/ → dashboard/ → engine/ → concerto/)
const ROOT = path.resolve(__dirname, '../../../');
const LOG_FILE = path.resolve(__dirname, '../../concerto.log');
const TS_NODE = path.resolve(__dirname, '../../node_modules/.bin/ts-node');
const ENTRY = path.resolve(__dirname, '../../src/index.ts');
const GLOBAL_CONFIG_DIR = path.join(ROOT, 'concerto-config');
const PROJECTS_DIR = path.join(ROOT, 'workspace/projects');

function json(res, data, code = 200) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function run(cmd, opts = {}) {
  return new Promise((resolve) => {
    exec(cmd, { cwd: ROOT, ...opts }, (err, stdout, stderr) => {
      resolve({ ok: !err, out: (stdout || '').trim(), err: (stderr || '').trim() });
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = req.url.split('?')[0];

  // ─── LIVE LOGS (SSE) ───────────────────────────────────────────────────────
  if (url === '/logs') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    const send = () => {
      try {
        if (fs.existsSync(LOG_FILE)) res.write(`data: ${JSON.stringify(fs.readFileSync(LOG_FILE, 'utf8'))}\n\n`);
      } catch (_) {}
    };
    send();
    const w = fs.existsSync(LOG_FILE) ? fs.watch(LOG_FILE, send) : null;
    req.on('close', () => w && w.close());
    return;
  }

  // ─── FILE SYSTEM EXPLORER (for targetPath) ──────────────────────────────────
  if (url === '/api/fs/ls') {
    const query = new URL(req.url, `http://${req.headers.host}`).searchParams;
    const target = query.get('path') || '/';
    try {
      if (!fs.existsSync(target)) {
        return json(res, { path: target, files: [], error: 'Path does not exist' });
      }
      const files = fs.readdirSync(target).map(name => {
        try {
          const stats = fs.statSync(path.join(target, name));
          return { name, isDir: stats.isDirectory() };
        } catch { return null; }
      }).filter(Boolean);
      return json(res, { path: target, files });
    } catch (e) {
      console.error(`LS error for ${target}:`, e.message);
      return json(res, { path: target, files: [], error: e.message });
    }
  }

  // ─── NATIVE SYSTEM DIALOG (Zenity) ──────────────────────────────────────────
  if (url === '/api/fs/open-dialog') {
    try {
      const { out, err, ok } = await run('zenity --file-selection --directory --title="Select Project Directory"');
      if (ok && out) {
        return json(res, { path: out.trim() });
      }
      return json(res, { cancelled: true });
    } catch (e) {
      return json(res, { error: e.message }, 500);
    }
  }

  // ─── GLOBAL PROMPTS MANAGEMENT ─────────────────────────────────────────────
  if (url.startsWith('/api/prompts/global')) {
    const match = url.match(/^\/api\/prompts\/global\/([a-z]+)(?:\/([^?]+))?/);
    if (!match) return json(res, { error: 'Invalid endpoint' }, 400);
    
    const [, phase, id] = match;
    const phaseDir = path.join(GLOBAL_CONFIG_DIR, phase, 'prompts');
    
    if (!fs.existsSync(phaseDir)) return json(res, { error: `Phase ${phase} not found` }, 404);

    try {
      if (req.method === 'GET' && !id) {
        const files = fs.readdirSync(phaseDir).filter(f => f.endsWith('.md'));
        return json(res, files.map(f => ({ id: f, name: f })));
      }
      
      if (req.method === 'GET' && id) {
        const p = path.join(phaseDir, id);
        if (!fs.existsSync(p)) return json(res, { error: 'Not found' }, 404);
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(fs.readFileSync(p, 'utf8'));
        return;
      }

      if (req.method === 'PUT' && id) {
        const body = await parseBody(req);
        const p = path.join(phaseDir, id);
        fs.writeFileSync(p, body.content, 'utf8');
        return json(res, { success: true });
      }
    } catch (e) {
      return json(res, { error: e.message }, 500);
    }
  }

  // ─── PROJECT PROMPTS MANAGEMENT ─────────────────────────────────────────────
  if (url.startsWith('/api/projects/') && url.includes('/prompts')) {
    const match = url.match(/^\/api\/projects\/([^/]+)\/prompts\/([a-z]+)(?:\/([^?]+))?/);
    if (!match) return json(res, { error: 'Invalid endpoint' }, 400);
    
    const [, projectId, phase, filename] = match;
    const projectPath = path.join(PROJECTS_DIR, projectId);
    const phaseDir = path.join(projectPath, '.concerto/prompts', phase, 'prompts');
    
    if (!fs.existsSync(phaseDir)) return json(res, { error: `Prompts for phase ${phase} not found in project` }, 404);

    try {
      if (req.method === 'GET' && !filename) {
        const files = fs.readdirSync(phaseDir).filter(f => f.endsWith('.md'));
        return json(res, files.map(f => ({ id: f, name: f })));
      }
      
      if (req.method === 'GET' && filename) {
        const p = path.join(phaseDir, filename);
        if (!fs.existsSync(p)) return json(res, { error: 'Not found' }, 404);
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(fs.readFileSync(p, 'utf8'));
        return;
      }

      if (req.method === 'PUT' && filename) {
        const body = await parseBody(req);
        const p = path.join(phaseDir, filename);
        fs.writeFileSync(p, body.content, 'utf8');
        return json(res, { success: true });
      }
    } catch (e) {
      return json(res, { error: e.message }, 500);
    }
  }
  if (url === '/api/roadmap') {
    const query = new URL(req.url, `http://${req.headers.host}`).searchParams;
    const projectId = query.get('projectId');
    if (!projectId) return json(res, { error: 'projectId is required' }, 400);

    const stepsPath = path.join(ROOT, 'workspace/projects', projectId, '.concerto/specs/steps.md');
    if (!fs.existsSync(stepsPath)) return json(res, { error: 'steps.md not found for this project' }, 404);

    const lines = fs.readFileSync(stepsPath, 'utf8').split('\n');
    const roadmap = [];
    let current = null;
    for (const line of lines) {
      const sm = line.match(/^###\s+(Sprint\s+\d+)\s*:\s*(.*?)(?:\s*\((.*?)\))?$/i);
      if (sm) { current = { id: sm[1], title: sm[2].trim(), status: sm[3] || 'ToDo', tasks: [] }; roadmap.push(current); continue; }
      const tm = line.match(/^\s*-\s*\*\*(Sub-Sprint[\s\d.]+)\*\*\s*:\s*(.*?)(?:\s*\((.*?)\))?$/i);
      if (tm && current) current.tasks.push({ id: tm[1].trim(), title: tm[2].trim(), status: tm[3] || 'ToDo' });
    }
    return json(res, roadmap);
  }

  // ─── GIT STATUS ────────────────────────────────────────────────────────────
  if (url === '/api/git') {
    const [branch, status, log] = await Promise.all([
      run('git branch --show-current'),
      run('git status --short'),
      run('git log --oneline -8')
    ]);
    return json(res, {
      branch: branch.out || 'unknown',
      changes: status.out.split('\n').filter(Boolean).map(l => ({ flag: l.slice(0, 2).trim(), file: l.slice(3) })),
      commits: log.out.split('\n').filter(Boolean).map(l => ({ hash: l.slice(0, 7), msg: l.slice(8) }))
    });
  }

  // ─── GIT ACTIONS ──────────────────────────────────────────────────────────
  if (url === '/api/git/commit' && req.method === 'POST') {
    const { message } = await parseBody(req);
    if (!message) return json(res, { error: 'Message is required' }, 400);
    const r = await run(`git add . && git commit -m "${message.replace(/"/g, '\\"')}"`);
    return json(res, { success: r.ok, out: r.out, err: r.err });
  }

  if (url === '/api/git/push' && req.method === 'POST') {
    const r = await run('git push');
    return json(res, { success: r.ok, out: r.out, err: r.err });
  }

  if (url === '/api/git/pull' && req.method === 'POST') {
    const r = await run('git pull');
    return json(res, { success: r.ok, out: r.out, err: r.err });
  }

  // ─── TASKS / SPECIFICATIONS ───────────────────────────────────────────────
  if (url === '/api/tasks') {
    const trackingPath = path.join(ROOT, 'concerto-config/spec/TRACKING.md');
    if (!fs.existsSync(trackingPath)) return json(res, { error: 'TRACKING.md not found' }, 404);

    const content = fs.readFileSync(trackingPath, 'utf8');
    const tasks = [];
    
    // Simple table parser for SPEC-XXX
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^\|\s*(SPEC-\d+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/);
      if (match) {
        tasks.push({
          id: match[1].trim(),
          title: match[2].trim(),
          phase: match[3].trim(),
          status: match[4].trim().replace(/^[^\s]+\s+/, ''), // Strip emoji if present
          progress: parseInt(match[5].trim()) || 0,
          owner: match[6].trim(),
          start: match[7].trim(),
          due: match[8].trim()
        });
      }
    }
    return json(res, tasks);
  }

  // ─── PROJECT STATS ─────────────────────────────────────────────────────────
  if (url === '/api/stats') {
    const [ts, tsx, js, php, yaml] = await Promise.all([
      run(`find . -name "*.ts" ! -path "*/node_modules/*" ! -path "*/.git/*" | wc -l`),
      run(`find . -name "*.tsx" ! -path "*/node_modules/*" ! -path "*/.git/*" | wc -l`),
      run(`find . -name "*.js" ! -path "*/node_modules/*" ! -path "*/.git/*" | wc -l`),
      run(`find . -name "*.php" ! -path "*/node_modules/*" ! -path "*/.git/*" | wc -l`),
      run(`find . -name "*.yaml" -o -name "*.yml" | grep -v node_modules | wc -l`)
    ]);
    return json(res, {
      ts: parseInt(ts.out) || 0,
      tsx: parseInt(tsx.out) || 0,
      js: parseInt(js.out) || 0,
      php: parseInt(php.out) || 0,
      yaml: parseInt(yaml.out) || 0
    });
  }

  // ─── DOCKER SERVICES ───────────────────────────────────────────────────────
  if (url === '/api/docker') {
    const r = await run('docker compose ps --format json 2>/dev/null || docker-compose ps --format json 2>/dev/null');
    let services = [];
    try {
      // docker compose ps can return one JSON object per line
      services = r.out.split('\n').filter(Boolean).map(line => {
        try { return JSON.parse(line); } catch { return null; }
      }).filter(Boolean);
    } catch (_) {}

    if (!services.length) {
      // Fallback: parse docker-compose.yml for service names
      const dcPath = path.join(ROOT, 'docker-compose.yml');
      if (fs.existsSync(dcPath)) {
        const content = fs.readFileSync(dcPath, 'utf8');
        const names = [...content.matchAll(/^  ([a-z_\-]+):\s*$/gm)].map(m => m[1]);
        services = names.map(n => ({ Name: n, State: 'unknown', Status: 'No data' }));
      }
    }
    return json(res, services);
  }

  // ─── TESTS ─────────────────────────────────────────────────────────────────
  if (url === '/api/tests') {
    const [cypress, unit] = await Promise.all([
      run(`find . -name "*.cy.ts" ! -path "*/node_modules/*" | wc -l`),
      run(`find . -name "*.test.ts" -o -name "*.spec.ts" | grep -v node_modules | wc -l`)
    ]);
    return json(res, {
      e2e: { files: parseInt(cypress.out) || 0 },
      unit: { files: parseInt(unit.out) || 0 }
    });
  }

  // ─── SECURITY (env audit) ──────────────────────────────────────────────────
  if (url === '/api/security') {
    const envFiles = ['.env', '.db.env'];
    const audit = envFiles.map(f => {
      const p = path.join(ROOT, f);
      if (!fs.existsSync(p)) return { file: f, exists: false, keys: [] };
      const content = fs.readFileSync(p, 'utf8');
      const keys = content.split('\n').filter(l => l.includes('=')).map(l => l.split('=')[0].trim());
      return { file: f, exists: true, keys };
    });
    const gitignorePath = path.join(ROOT, '.gitignore');
    const gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
    const protected_ = envFiles.map(f => ({ file: f, protected: gitignore.includes(f) }));
    return json(res, { envFiles: audit, gitignoreProtection: protected_ });
  }

  // ─── ORCHESTRATOR TRIGGER ──────────────────────────────────────────────────
  if (url === '/api/run' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const projectId = data.projectId;
        if (!projectId) return json(res, { error: 'projectId is required' }, 400);

        let cmd = `${TS_NODE} ${ENTRY} --project ${projectId}`;
        if (data.command === 'review_be' || data.action === 'REVIEW_BE') cmd += ' --review-be';
        else if (data.command === 'review_fe' || data.action === 'REVIEW_FE') cmd += ' --review-fe';
        else if (data.command === 'audit_security' || data.action === 'AUDIT_SECURITY') cmd += ' --audit-security';
        else if (data.command === 'fix_bug' || data.action === 'FIX_BUG') cmd += ' --fix-bug';
        else if (data.command === 'optimize_perf' || data.action === 'OPTIMIZE_PERF') cmd += ' --optimize-perf';
        else if (data.command === 'generate_docs' || data.action === 'GENERATE_DOCS') cmd += ' --generate-docs';
        else if (data.action === 'STATUS') cmd += ' --status';
        else if (data.action === 'START') cmd += ' --orchestrate';

        // Passer les params comme env vars ou args
        if (data.scope) cmd += ` --scope "${data.scope}"`;
        if (data.context) cmd += ` --context "${data.context}"`;
        if (data.criteria) cmd += ` --criteria "${data.criteria}"`;
        if (data.feedback) cmd += ` --feedback "${data.feedback}"`;

        exec(cmd, { cwd: ROOT });
        return json(res, { triggered: true, command: data.command || data.action, params: data });
      } catch (e) {
        return json(res, { error: 'Invalid body' }, 400);
      }
    });
    return;
  }

  // ─── CHAT CONCEPTION ───────────────────────────────────────────────────────
  if (url === '/api/chat' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      const projectId = data.projectId || 'concerto-core'; // Default for safety
      const response = await chatService.chat(projectId, data.messages || []);
      return json(res, response);
    } catch (e) {
      console.error('Chat error:', e.message);
      return json(res, { error: e.message }, 500);
    }
  }

  // ─── PROJECT MANAGEMENT ────────────────────────────────────────────────────
  // GET /api/projects - List all projects
  // POST /api/projects - Create new project
  // GET /api/projects/{id} - Get specific project
  // PUT /api/projects/{id} - Update project
  // DELETE /api/projects/{id} - Delete project
  if (url.startsWith('/api/projects')) {
    const match = url.match(/^\/api\/projects(?:\/([^?]+))?/);
    const projectId = match ? match[1] : null;

    try {
      // POST import project (Check this FIRST)
      if (req.method === 'POST' && (projectId === 'import' || url === '/api/projects/import')) {
        try {
          const { path: projectPath } = await parseBody(req);
          const project = ProjectManager.importProject(projectPath);
          return json(res, project, 200);
        } catch (err) {
          console.error('Project import error:', err.message);
          return json(res, { error: err.message }, 400);
        }
      }

      // GET list all projects
      if (req.method === 'GET' && !projectId) {
        const projects = ProjectManager.getAllProjects();
        return json(res, projects);
      }

      // POST create new project
      if (req.method === 'POST' && !projectId) {
        try {
          const data = await parseBody(req);
          const project = ProjectManager.createProject(data);
          return json(res, { projectId: project.id, ...project }, 201);
        } catch (err) {
          console.error('Project creation error:', err.message);
          return json(res, { error: err.message }, 400);
        }
      }

      // GET single project
      if (req.method === 'GET' && projectId) {
        const project = ProjectManager.getProject(projectId);
        if (!project) return json(res, { error: 'Project not found' }, 404);
        return json(res, project);
      }

      // PUT update project
      if (req.method === 'PUT' && projectId) {
        try {
          const data = await parseBody(req);
          const project = ProjectManager.updateProject(projectId, data);
          return json(res, project);
        } catch (err) {
          console.error('Project update error:', err.message);
          return json(res, { error: err.message }, 400);
        }
      }

      // DELETE project
      if (req.method === 'DELETE' && projectId) {
        try {
          const result = ProjectManager.deleteProject(projectId);
          return json(res, result);
        } catch (err) {
          console.error('Project delete error:', err.message);
          return json(res, { error: err.message }, 404);
        }
      }

      return json(res, { error: 'Method not allowed' }, 405);
    } catch (err) {
      console.error('Project route error:', err);
      return json(res, { error: err.message || 'Internal server error' }, 500);
    }
  }

  // ─── CONFIGURATION MANAGEMENT ──────────────────────────────────────────────
  // GET /api/config/{type} - List all items of type
  // GET /api/config/{type}/{id} - Get specific item
  // POST /api/config/{type} - Create new item
  // PUT /api/config/{type}/{id} - Update item
  // DELETE /api/config/{type}/{id} - Delete item
  if (url.startsWith('/api/config/')) {
    const match = url.match(/^\/api\/config\/([a-z]+)(?:\/([^?]+))?/);
    if (!match) return json(res, { error: 'Invalid endpoint' }, 400);

    const [, type, id] = match;
    const managers = {
      specs: specsManager,
      prompts: promptsManager,
      maestros: maestrosManager,
      workflows: workflowsManager,
    };

    const manager = managers[type];
    if (!manager) return json(res, { error: `Unknown type: ${type}` }, 400);

    try {
      // GET list
      if (req.method === 'GET' && !id) {
        const items = await manager.list();
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Total-Count': items.length,
        });
        res.end(JSON.stringify(items));
        return;
      }

      // GET single
      if (req.method === 'GET' && id) {
        const item = await manager.get(id);
        return json(res, item);
      }

      // POST create
      if (req.method === 'POST') {
        try {
          const data = await parseBody(req);
          const item = await manager.create(data);
          return json(res, item, 201);
        } catch (err) {
          console.error('Create error:', err.message);
          return json(res, { error: err.message }, 400);
        }
      }

      // PUT update
      if (req.method === 'PUT' && id) {
        try {
          const data = await parseBody(req);
          const item = await manager.update(id, data);
          return json(res, item);
        } catch (err) {
          console.error('Update error:', err.message);
          return json(res, { error: err.message }, 400);
        }
      }

      // DELETE
      if (req.method === 'DELETE' && id) {
        try {
          await manager.delete(id);
          return json(res, { success: true });
        } catch (err) {
          console.error('Delete error:', err.message);
          return json(res, { error: err.message }, 404);
        }
      }

      return json(res, { error: 'Method not allowed' }, 405);
    } catch (err) {
      console.error('Config route error:', err);
      return json(res, { error: err.message || 'Internal server error' }, 500);
    }
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[CONCERTO] Cockpit running → http://localhost:${PORT}`);
});
