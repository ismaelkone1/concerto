const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

/**
 * File Manager - Node.js version for config files
 */

const CONFIG_ROOT = path.resolve(__dirname, '../../../../concerto-config');
const MAESTROS_ROOT = path.resolve(__dirname, '../../../../maestros');
const WORKFLOWS_ROOT = path.resolve(__dirname, '../../../../workflows');

function parseFrontmatter(content) {
  const lines = content.split('\n');
  if (lines[0] !== '---') {
    return { frontmatter: {}, body: content };
  }

  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    throw new Error('Invalid frontmatter: closing --- not found');
  }

  const frontmatterStr = lines.slice(1, endIndex).join('\n');
  const frontmatter = YAML.parse(frontmatterStr) || {};
  const body = lines.slice(endIndex + 1).join('\n');

  return { frontmatter, body };
}

function createFrontmatter(data) {
  return `---\n${YAML.stringify(data)}---`;
}

async function writeMarkdownFile(filepath, frontmatter, body) {
  const content = `${createFrontmatter(frontmatter)}\n${body}`;
  await fs.promises.writeFile(filepath, content, 'utf-8');
}

async function readMarkdownFile(filepath) {
  const content = await fs.promises.readFile(filepath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);
  const stat = await fs.promises.stat(filepath);
  const filename = path.basename(filepath);
  const id = frontmatter.id || filename.replace('.md', '');

  return {
    id,
    title: frontmatter.title,
    filename,
    path: filepath,
    content,
    frontmatter,
    modified: stat.mtime.toISOString(),
  };
}

async function listMarkdownFiles(dirPath) {
  try {
    const files = await fs.promises.readdir(dirPath, { recursive: true });
    const mdFiles = files
      .filter((f) => typeof f === 'string' && f.endsWith('.md'))
      .sort();

    const results = [];
    for (const file of mdFiles) {
      const fullPath = path.join(dirPath, file);
      try {
        const metadata = await readMarkdownFile(fullPath);
        results.push(metadata);
      } catch (err) {
        console.warn(`Skipping invalid file ${fullPath}:`, err.message);
      }
    }
    return results;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

async function ensureDir(dirPath) {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
}

const specsManager = {
  async list() {
    return listMarkdownFiles(path.join(CONFIG_ROOT, 'spec'));
  },

  async get(id) {
    const files = await this.list();
    const file = files.find((f) => f.id === id);
    if (!file) throw new Error(`Spec ${id} not found`);
    return readMarkdownFile(file.path);
  },

  async create(data) {
    const id = `SPEC-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const filename = `${id}-${data.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    const filepath = path.join(CONFIG_ROOT, 'spec', filename);

    const frontmatter = {
      id,
      title: data.title,
      phase: data.phase,
      status: 'draft',
      version: '1.0',
      created: new Date().toISOString().split('T')[0],
      owner: data.owner,
      priority: data.priority || 'medium',
    };

    const body = `# Spécification: ${data.title}\n\n## Description\n${data.description || ''}\n\n## Critères d'Acceptation\n${(data.criteria || []).map((c) => `- [ ] ${c}`).join('\n')}\n`;

    await ensureDir(path.dirname(filepath));
    await writeMarkdownFile(filepath, frontmatter, body);

    return readMarkdownFile(filepath);
  },

  async update(id, data) {
    const file = await this.get(id);
    const { frontmatter, body } = parseFrontmatter(file.content);

    Object.assign(frontmatter, data);
    frontmatter.modified = new Date().toISOString().split('T')[0];

    await writeMarkdownFile(file.path, frontmatter, body);
    return readMarkdownFile(file.path);
  },

  async delete(id) {
    const file = await this.get(id);
    await fs.promises.unlink(file.path);
  },
};

const promptsManager = {
  async list() {
    const phases = ['dev', 'test', 'deploy'];
    const allPrompts = [];

    for (const phase of phases) {
      const promptsDir = path.join(CONFIG_ROOT, phase, 'prompts');
      const prompts = await listMarkdownFiles(promptsDir);
      allPrompts.push(...prompts);
    }

    return allPrompts;
  },

  async get(id) {
    const files = await this.list();
    const file = files.find((f) => f.id === id || f.filename.replace('.md', '') === id);
    if (!file) throw new Error(`Prompt ${id} not found`);
    return readMarkdownFile(file.path);
  },

  async create(data) {
    const filepath = path.join(CONFIG_ROOT, data.phase, 'prompts', `${data.filename}.md`);

    const frontmatter = {
      role: data.role,
      phase: data.phase,
      action: data.action,
      version: data.version || '1.0',
      triggers: data.triggers || [],
    };

    await ensureDir(path.dirname(filepath));
    await writeMarkdownFile(filepath, frontmatter, data.body);

    return readMarkdownFile(filepath);
  },

  async update(id, data) {
    const file = await this.get(id);
    const { frontmatter, body } = parseFrontmatter(file.content);

    Object.assign(frontmatter, data);

    await writeMarkdownFile(file.path, frontmatter, body);
    return readMarkdownFile(file.path);
  },

  async delete(id) {
    const file = await this.get(id);
    await fs.promises.unlink(file.path);
  },
};

const maestrosManager = {
  async list() {
    return listMarkdownFiles(MAESTROS_ROOT);
  },

  async get(id) {
    const files = await this.list();
    const file = files.find((f) => f.id === id);
    if (!file) throw new Error(`Maestro ${id} not found`);
    return readMarkdownFile(file.path);
  },

  async create(data) {
    const id = data.name.toLowerCase().replace(/\s+/g, '-');
    const filepath = path.join(MAESTROS_ROOT, data.category, `${id}.md`);

    const frontmatter = {
      id,
      name: data.name,
      phase: data.phase,
      expertise: data.expertise,
      version: data.version || '1.0',
      created: new Date().toISOString().split('T')[0],
    };

    await ensureDir(path.dirname(filepath));
    await writeMarkdownFile(filepath, frontmatter, data.body);

    return readMarkdownFile(filepath);
  },

  async update(id, data) {
    const file = await this.get(id);
    const { frontmatter, body } = parseFrontmatter(file.content);

    Object.assign(frontmatter, data);

    await writeMarkdownFile(file.path, frontmatter, body);
    return readMarkdownFile(file.path);
  },

  async delete(id) {
    const file = await this.get(id);
    await fs.promises.unlink(file.path);
  },
};

const workflowsManager = {
  async list() {
    return listMarkdownFiles(WORKFLOWS_ROOT);
  },

  async get(id) {
    const files = await this.list();
    const file = files.find((f) => f.id === id);
    if (!file) throw new Error(`Workflow ${id} not found`);
    return readMarkdownFile(file.path);
  },

  async create(data) {
    const filepath = path.join(WORKFLOWS_ROOT, `${data.filename}.md`);
    const id = data.filename.toUpperCase().replace(/-/g, '_');

    const frontmatter = {
      id,
      title: data.title,
      version: data.version || '1.0',
      created: new Date().toISOString().split('T')[0],
    };

    await ensureDir(path.dirname(filepath));
    await writeMarkdownFile(filepath, frontmatter, data.body);

    return readMarkdownFile(filepath);
  },

  async update(id, data) {
    const file = await this.get(id);
    const { frontmatter, body } = parseFrontmatter(file.content);

    Object.assign(frontmatter, data);

    await writeMarkdownFile(file.path, frontmatter, body);
    return readMarkdownFile(file.path);
  },

  async delete(id) {
    const file = await this.get(id);
    await fs.promises.unlink(file.path);
  },
};

module.exports = {
  specsManager,
  promptsManager,
  maestrosManager,
  workflowsManager,
};
