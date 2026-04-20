/**
 * File Manager - Handles read/write operations for .md files
 * Supports: Specs, Prompts, Maestros, Workflows
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';

const CONFIG_ROOT = path.join(process.cwd(), '..', 'concerto-config');
const MAESTROS_ROOT = path.join(process.cwd(), '..', 'maestros');
const WORKFLOWS_ROOT = path.join(process.cwd(), '..', 'workflows');

interface FileMetadata {
  id: string;
  title?: string;
  filename: string;
  path: string;
  content: string;
  frontmatter: Record<string, any>;
  modified: string;
}

/**
 * Parse YAML frontmatter from markdown
 */
export function parseFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
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
  const frontmatter = yaml.parse(frontmatterStr) || {};
  const body = lines.slice(endIndex + 1).join('\n');

  return { frontmatter, body };
}

/**
 * Create YAML frontmatter string
 */
export function createFrontmatter(data: Record<string, any>): string {
  return `---\n${yaml.stringify(data)}---`;
}

/**
 * Write file with frontmatter + body
 */
export async function writeMarkdownFile(
  filepath: string,
  frontmatter: Record<string, any>,
  body: string
): Promise<void> {
  const content = `${createFrontmatter(frontmatter)}\n${body}`;
  await fs.writeFile(filepath, content, 'utf-8');
}

/**
 * Read markdown file with metadata
 */
export async function readMarkdownFile(filepath: string): Promise<FileMetadata> {
  const content = await fs.readFile(filepath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);
  const stat = await fs.stat(filepath);
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

/**
 * List files in directory
 */
export async function listMarkdownFiles(dirPath: string): Promise<FileMetadata[]> {
  try {
    const files = await fs.readdir(dirPath, { recursive: true });
    const mdFiles = files
      .filter((f) => typeof f === 'string' && f.endsWith('.md'))
      .sort();

    const results: FileMetadata[] = [];
    for (const file of mdFiles) {
      const fullPath = path.join(dirPath, file as string);
      try {
        const metadata = await readMarkdownFile(fullPath);
        results.push(metadata);
      } catch (err) {
        console.warn(`Skipping invalid file ${fullPath}:`, err);
      }
    }
    return results;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

/**
 * Ensure directory exists
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw err;
    }
  }
}

/**
 * Delete a file
 */
export async function deleteFile(filepath: string): Promise<void> {
  await fs.unlink(filepath);
}

/**
 * File managers for each type
 */

export const specsManager = {
  async list(): Promise<FileMetadata[]> {
    return listMarkdownFiles(path.join(CONFIG_ROOT, 'spec'));
  },

  async get(id: string): Promise<FileMetadata> {
    const files = await this.list();
    const file = files.find((f) => f.id === id);
    if (!file) throw new Error(`Spec ${id} not found`);
    return readMarkdownFile(file.path);
  },

  async create(data: {
    title: string;
    phase: string;
    owner: string;
    priority?: string;
    description?: string;
    criteria?: string[];
  }): Promise<FileMetadata> {
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

  async update(id: string, data: Partial<Record<string, any>>): Promise<FileMetadata> {
    const file = await this.get(id);
    const { frontmatter, body } = parseFrontmatter(file.content);

    Object.assign(frontmatter, data);
    frontmatter.modified = new Date().toISOString().split('T')[0];

    await writeMarkdownFile(file.path, frontmatter, body);
    return readMarkdownFile(file.path);
  },

  async delete(id: string): Promise<void> {
    const file = await this.get(id);
    await deleteFile(file.path);
  },
};

export const promptsManager = {
  async list(): Promise<FileMetadata[]> {
    const phases = ['dev', 'test', 'deploy'];
    const allPrompts: FileMetadata[] = [];

    for (const phase of phases) {
      const promptsDir = path.join(CONFIG_ROOT, phase, 'prompts');
      const prompts = await listMarkdownFiles(promptsDir);
      allPrompts.push(...prompts);
    }

    return allPrompts;
  },

  async listByPhase(phase: string): Promise<FileMetadata[]> {
    const promptsDir = path.join(CONFIG_ROOT, phase, 'prompts');
    return listMarkdownFiles(promptsDir);
  },

  async listByRole(role: string): Promise<FileMetadata[]> {
    const files = await this.list();
    return files.filter((f) => f.frontmatter.role?.toLowerCase() === role.toLowerCase());
  },

  async get(id: string): Promise<FileMetadata> {
    const files = await this.list();
    const file = files.find((f) => f.id === id || f.filename.replace('.md', '') === id);
    if (!file) throw new Error(`Prompt ${id} not found`);
    return readMarkdownFile(file.path);
  },

  async create(data: {
    filename: string;
    phase: string;
    role: string;
    action: string;
    version?: string;
    triggers?: string[];
    body: string;
  }): Promise<FileMetadata> {
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

  async update(id: string, data: Partial<Record<string, any>>): Promise<FileMetadata> {
    const file = await this.get(id);
    const { frontmatter, body } = parseFrontmatter(file.content);

    Object.assign(frontmatter, data);

    await writeMarkdownFile(file.path, frontmatter, body);
    return readMarkdownFile(file.path);
  },

  async delete(id: string): Promise<void> {
    const file = await this.get(id);
    await deleteFile(file.path);
  },
};

export const maestrosManager = {
  async list(): Promise<FileMetadata[]> {
    return listMarkdownFiles(MAESTROS_ROOT);
  },

  async listByPhase(phase: string): Promise<FileMetadata[]> {
    const files = await this.list();
    return files.filter((f) => f.frontmatter.phase === phase);
  },

  async get(id: string): Promise<FileMetadata> {
    const files = await this.list();
    const file = files.find((f) => f.id === id);
    if (!file) throw new Error(`Maestro ${id} not found`);
    return readMarkdownFile(file.path);
  },

  async create(data: {
    name: string;
    phase: string;
    category: string;
    expertise: string[];
    version?: string;
    body: string;
  }): Promise<FileMetadata> {
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

  async update(id: string, data: Partial<Record<string, any>>): Promise<FileMetadata> {
    const file = await this.get(id);
    const { frontmatter, body } = parseFrontmatter(file.content);

    Object.assign(frontmatter, data);

    await writeMarkdownFile(file.path, frontmatter, body);
    return readMarkdownFile(file.path);
  },

  async delete(id: string): Promise<void> {
    const file = await this.get(id);
    await deleteFile(file.path);
  },
};

export const workflowsManager = {
  async list(): Promise<FileMetadata[]> {
    return listMarkdownFiles(WORKFLOWS_ROOT);
  },

  async get(id: string): Promise<FileMetadata> {
    const files = await this.list();
    const file = files.find((f) => f.id === id);
    if (!file) throw new Error(`Workflow ${id} not found`);
    return readMarkdownFile(file.path);
  },

  async create(data: {
    filename: string;
    title: string;
    version?: string;
    body: string;
  }): Promise<FileMetadata> {
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

  async update(id: string, data: Partial<Record<string, any>>): Promise<FileMetadata> {
    const file = await this.get(id);
    const { frontmatter, body } = parseFrontmatter(file.content);

    Object.assign(frontmatter, data);

    await writeMarkdownFile(file.path, frontmatter, body);
    return readMarkdownFile(file.path);
  },

  async delete(id: string): Promise<void> {
    const file = await this.get(id);
    await deleteFile(file.path);
  },
};
