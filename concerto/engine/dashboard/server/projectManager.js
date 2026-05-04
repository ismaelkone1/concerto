const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Paths
const ROOT = path.resolve(__dirname, '../../../');
const WORKSPACE_ROOT = path.join(ROOT, 'workspace');
const PROJECTS_DIR = path.join(WORKSPACE_ROOT, 'projects');
const GLOBAL_CONFIG_DIR = path.join(ROOT, 'concerto-config');

// Ensure projects directory exists
if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

class ProjectManager {
  // Initialize Spec-Kit structure
  static initializeSpecKit(projectPath, projectName) {
    const specifyDir = path.join(projectPath, '.specify');
    const memoryDir = path.join(specifyDir, 'memory');
    const templatesDir = path.join(specifyDir, 'templates');
    const specsDir = path.join(projectPath, 'specs');

    [memoryDir, templatesDir, specsDir].forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    // Default Constitution
    const constitutionPath = path.join(memoryDir, 'constitution.md');
    if (!fs.existsSync(constitutionPath)) {
      const constitution = `# 📜 PROJECT CONSTITUTION: ${projectName}

## 1. CORE PRINCIPLES
- **Intent as Truth**: The specifications in \`specs/\` are the primary source of truth.
- **SDD First**: No code implementation without a validated plan.
- **Architectural Integrity**: All changes must respect the defined architecture.

## 2. TECHNICAL STANDARDS
- Preferred Language: To be defined
- Framework: To be defined
- Testing: Mandatory for core logic.

## 3. QUALITY GATES
- All specs must be reviewed by the Architect.
- Plans must include a feasibility analysis.
`;
      fs.writeFileSync(constitutionPath, constitution);
    }

    // Default Templates
    const templates = {
      'spec-template.md': `# 📝 FEATURE SPECIFICATION: [NAME]

## 1. OBJECTIVE
[What are we building?]

## 2. USER STORIES
- As a [user], I want to [action] so that [benefit].

## 3. REQUIREMENTS
- Requirement 1
- Requirement 2

## 4. SUCCESS CRITERIA
- [ ] Criterion 1
`,
      'plan-template.md': `# 📐 TECHNICAL PLAN: [NAME]

## 1. ARCHITECTURE
[System design overview]

## 2. DATA MODELS
[Database or state schema]

## 3. ENDPOINTS / SERVICES
[List of changes]

## 4. RISKS & CONSTRAINTS
[Potential issues]
`,
      'task-template.md': `# 🛠 IMPLEMENTATION TASKS: [NAME]

- [ ] Task 1: [Description]
- [ ] Task 2: [Description]
`
    };

    for (const [filename, content] of Object.entries(templates)) {
      const templatePath = path.join(templatesDir, filename);
      if (!fs.existsSync(templatePath)) {
        fs.writeFileSync(templatePath, content);
      }
    }
  }

  // Get all projects
  static getAllProjects() {
    if (!fs.existsSync(PROJECTS_DIR)) return [];

    return fs.readdirSync(PROJECTS_DIR)
      .filter(name => fs.statSync(path.join(PROJECTS_DIR, name)).isDirectory())
      .map(name => {
        const configPath = path.join(PROJECTS_DIR, name, '.concerto', 'config.json');
        if (fs.existsSync(configPath)) {
          try {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
          } catch {
            return null;
          }
        }
        return null;
      })
      .filter(Boolean);
  }

  // Get single project
  static getProject(projectId) {
    const configPath = path.join(PROJECTS_DIR, projectId, '.concerto', 'config.json');
    if (!fs.existsSync(configPath)) return null;

    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
      return null;
    }
  }

  // Create new project
  static createProject(data) {
    // Validate input
    if (!data.name || typeof data.name !== 'string') {
      throw new Error('Project name is required');
    }

    // Sanitize project name for directory
    const projectDir = data.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    // Choose project path: either custom targetPath or default PROJECTS_DIR
    const projectPath = data.targetPath && path.isAbsolute(data.targetPath) 
      ? data.targetPath 
      : path.join(PROJECTS_DIR, projectDir);

    console.log(`[ProjectManager] Checking project path: ${projectPath}`);

    // Check if project already exists (only if it has a .concerto folder)
    if (fs.existsSync(path.join(projectPath, '.concerto'))) {
      throw new Error(`Project "${projectDir}" already exists in this location`);
    }

    // Create project structure
    const projectId = projectDir;
    const concertoDir = path.join(projectPath, '.concerto');
    const srcDir = path.join(projectPath, 'src');
    const testsDir = path.join(projectPath, 'tests');
    const docsDir = path.join(projectPath, 'docs');

    // Create directories
    [concertoDir, srcDir, testsDir, docsDir].forEach(dir => {
      fs.mkdirSync(dir, { recursive: true });
    });

    // Create subdirectories in .concerto
    const configDirs = [
      'maestros',
      'workflows',
      'specs',
      'prompts',
      'phases'
    ];
    configDirs.forEach(dir => {
      fs.mkdirSync(path.join(concertoDir, dir), { recursive: true });
    });

    // Create project metadata
    const config = {
      id: projectId,
      name: data.name,
      description: data.description || '',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      architecture: data.architecture || 'mvc',
      stack: data.stack || {
        type: 'decoupled',
        backend: data.backend || 'nodejs',
        frontend: data.frontend || 'react'
      },
      database: data.database || 'postgresql',
      targetPath: projectPath,
      dockerized: data.dockerized !== undefined ? data.dockerized : true,
      status: 'active'
    };

    // Write config
    fs.writeFileSync(
      path.join(concertoDir, 'config.json'),
      JSON.stringify(config, null, 2)
    );

    // Create initial phases configuration
    const phasesConfig = {
      phases: [
        { id: 'conception', label: 'Conception', order: 1, status: 'active' },
        { id: 'dev', label: 'Development', order: 2, status: 'active' },
        { id: 'test', label: 'Test', order: 3, status: 'active' },
        { id: 'deploy', label: 'Deployment', order: 4, status: 'active' }
      ]
    };

    // Mirror Global Prompts to Local Project
    const localPromptsPath = path.join(projectPath, '.concerto/prompts');
    
    if (fs.existsSync(GLOBAL_CONFIG_DIR)) {
      console.log(`[ProjectManager] Mirroring prompts from ${GLOBAL_CONFIG_DIR} to ${localPromptsPath}`);
      this.copyRecursiveSync(GLOBAL_CONFIG_DIR, localPromptsPath);
    }

    fs.writeFileSync(
      path.join(concertoDir, 'phases', 'phases.json'),
      JSON.stringify(phasesConfig, null, 2)
    );

    // Create initial steps.md
    const initialSteps = `### Sprint 1 : Initial Setup & Core Logic (ToDo)

- **Sub-Sprint 1.1** : Setup Project Foundation (In progress)
  - Create basic project structure
  - Configure environment variables
  - Initialize database schema
`;

    fs.writeFileSync(
      path.join(concertoDir, 'specs', 'steps.md'),
      initialSteps
    );

    // Create README
    const readme = `# ${data.name}

${data.description ? `${data.description}\n` : ''}
## Stack

- **Architecture**: ${config.architecture}
- **Stack Type**: ${config.stack.type}
${config.stack.type === 'monolith' 
  ? `- **Framework**: ${config.stack.framework}`
  : `- **Backend**: ${config.stack.backend}\n- **Frontend**: ${config.stack.frontend}`}
- **Database**: ${config.database}
- **Dockerized**: ${config.dockerized ? 'Yes' : 'No'}

## Getting Started

1. Install dependencies
2. Setup environment variables
3. Start development server

## Project Structure

\`\`\`
${config.name}/
├── .concerto/              # Concerto configuration
│   ├── config.json         # Project metadata
│   ├── maestros/           # AI roles
│   ├── workflows/          # Workflows
│   ├── specs/              # Specifications
│   └── prompts/            # AI prompts
├── src/                    # Source code
├── tests/                  # Test files
└── docs/                   # Documentation
\`\`\`

---
Generated by CONCERTO - AI Orchestration Framework
`;

    fs.writeFileSync(path.join(projectPath, 'README.md'), readme);

    // Initialize git repository
    const { execSync } = require('child_process');
    try {
      execSync('git init', { cwd: projectPath });
      execSync('git config user.email "concerto@ai.dev"', { cwd: projectPath });
      execSync('git config user.name "Concerto"', { cwd: projectPath });
      execSync('git add .', { cwd: projectPath });
      execSync('git commit -m "Initial commit: Project setup"', { cwd: projectPath });
    } catch (err) {
      console.error('Git initialization failed:', err.message);
      // Don't throw - project can work without git
    }

    // Link external project to PROJECTS_DIR so it appears in the list
    if (!projectPath.startsWith(PROJECTS_DIR)) {
      try {
        const linkPath = path.join(PROJECTS_DIR, projectDir);
        if (!fs.existsSync(linkPath)) {
          console.log(`[ProjectManager] Linking external project ${projectPath} to ${linkPath}`);
          fs.symlinkSync(projectPath, linkPath, 'dir');
        }
      } catch (err) {
        console.error('Failed to link external project:', err.message);
      }
    }

    // Initialize Spec-Kit
    this.initializeSpecKit(projectPath, data.name);

    return config;
  }

  // Import existing project
  static importProject(projectPath) {
    if (!fs.existsSync(projectPath)) {
      throw new Error('Path does not exist');
    }

    const concertoDir = path.join(projectPath, '.concerto');
    const configPath = path.join(concertoDir, 'config.json');

    if (!fs.existsSync(configPath)) {
      throw new Error('This directory is not a Concerto project (no .concerto/config.json found)');
    }

    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (err) {
      throw new Error('Invalid project configuration file');
    }

    const projectId = config.id || config.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const linkPath = path.join(PROJECTS_DIR, projectId);

    if (fs.existsSync(linkPath)) {
      const stats = fs.lstatSync(linkPath);
      if (stats.isSymbolicLink()) {
        const target = fs.readlinkSync(linkPath);
        if (path.resolve(target) === path.resolve(projectPath)) {
          return config;
        }
      }
      throw new Error(`A project with ID "${projectId}" already exists in the workspace`);
    }

    fs.symlinkSync(projectPath, linkPath, 'dir');

    // Ensure Spec-Kit is initialized
    ProjectManager.initializeSpecKit(projectPath, config.name);

    return config;
  }

  // Delete project
  static deleteProject(projectId) {
    const projectPath = path.join(PROJECTS_DIR, projectId);
    if (!fs.existsSync(projectPath)) {
      throw new Error('Project not found');
    }

    fs.rmSync(projectPath, { recursive: true, force: true });
    return { success: true };
  }

  // Update project metadata
  static updateProject(projectId, updates) {
    const configPath = path.join(PROJECTS_DIR, projectId, '.concerto', 'config.json');
    if (!fs.existsSync(configPath)) {
      throw new Error('Project not found');
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const updated = {
      ...config,
      ...updates,
      updated: new Date().toISOString()
    };

    fs.writeFileSync(configPath, JSON.stringify(updated, null, 2));
    return updated;
  }

  // Helper to convert object to YAML string (simple)
  static yamlStringify(obj, indent = 0) {
    let yaml = '';
    const spaces = ' '.repeat(indent);

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        yaml += this.yamlStringify(value, indent + 2);
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach(item => {
          if (typeof item === 'object') {
            yaml += `${spaces}  - `;
            const lines = this.yamlStringify(item, 0).split('\n').filter(Boolean);
            yaml += lines[0].trim() + '\n';
            for (let i = 1; i < lines.length; i++) {
              yaml += `${spaces}    ${lines[i].trim()}\n`;
            }
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        });
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }

    return yaml;
  }
  // Helper to copy directory recursively
  static copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      fs.readdirSync(src).forEach((childItemName) => {
        this.copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

module.exports = { ProjectManager };
