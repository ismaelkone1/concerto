const { OpenAI } = require('openai');
const path = require('path');
const fs = require('fs');
const YAML = require('yaml');

// Load environment variables from engine/.env
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const entry = line.split('=');
    if (entry.length >= 2) {
      const key = entry[0].trim();
      const value = entry.slice(1).join('=').trim();
      process.env[key] = value;
    }
  });
}

const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || path.resolve(__dirname, '../../../workspace');
const PROJECTS_DIR = path.join(WORKSPACE_ROOT, 'projects');

class ChatService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.AI_API_KEY,
      baseURL: "https://api.xiaomimimo.com/v1"
    });
    
    this.architectProfilePath = path.resolve(__dirname, '../../../../maestros/core/architect.md');
  }

  async getArchitectProfile() {
    if (fs.existsSync(this.architectProfilePath)) {
      return fs.readFileSync(this.architectProfilePath, 'utf8');
    }
    return "You are a senior system architect helping the user design an application.";
  }

  async chat(projectId, messages) {
    const projectPath = path.join(PROJECTS_DIR, projectId);
    const localMasterPath = path.join(projectPath, '.concerto/prompts/conception/prompts/master-architect.md');
    
    let profile = "You are a senior system architect helping the user design an application.";
    if (fs.existsSync(localMasterPath)) {
      profile = fs.readFileSync(localMasterPath, 'utf8');
    }

    // Shadow Hunter System Instructions
    const systemPrompt = `
${profile}

## CONTEXT: PROJECT ${projectId}
You are currently in the CONCEPTION phase. 

## THE SHADOW HUNTER PROTOCOL
- NEVER guess an architectural detail. If a requirement is vague, ask for clarification.
- Identify "Shadow Areas": performance bottlenecks, security risks, state management complexity, or API ambiguity.
- Treat the user as a senior developer. Use technical terminology (Hexagonal, CQRS, Observability, etc.) without over-explaining.
- If the user provides a command (starts with /), respond specifically to that domain.

## TOOLS
- create_specification: Use this to commit a formal technical decision to a .md file in /specs.
- update_prompt: Use this to modify a calibration file in /prompts (e.g., database.md, api.md).
- Format: <function_calls><fn name="update_prompt"><arg name="filename">filename.md</arg><arg name="content">Full content of the prompt</arg></fn></function_calls>
`;

    // Handle Slash Commands (Pre-processing)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user' && lastMessage.content.startsWith('/')) {
      const command = lastMessage.content.split(' ')[0].toLowerCase();
      if (command === '/back') {
        lastMessage.content = `[COMMAND: FOCUS BACKEND] ${lastMessage.content.replace('/back', '')}. Analyze the backend architecture, data flow, and services.`;
      } else if (command === '/front') {
        lastMessage.content = `[COMMAND: FOCUS FRONTEND] ${lastMessage.content.replace('/front', '')}. Analyze the UI/UX components, state management, and user flows.`;
      } else if (command === '/db') {
        lastMessage.content = `[COMMAND: FOCUS DATABASE] ${lastMessage.content.replace('/db', '')}. Analyze the schema, relations, and data persistence strategy.`;
      }
    }

    const response = await this.client.chat.completions.create({
      model: "mimo-v2-pro",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      temperature: 0.2,
    });

    let assistantMessage = response.choices[0].message;
    let content = assistantMessage.content || "";

    if (content.includes('<function_calls>')) {
      await this.handleTools(projectId, content);
      assistantMessage.content += `\n\n*[System: Architectural artifact synchronized]*`;
    }

    return assistantMessage;
  }

  async handleTools(projectId, content) {
    const fnRegex = /<fn\s+name=["']([^"']+)["']>([\s\S]*?)<\/fn>/g;
    let match;
    let results = "";

    while ((match = fnRegex.exec(content)) !== null) {
      const toolName = match[1];
      const argsContent = match[2];
      const args = {};
      
      const argRegex = /<arg\s+name=["']([^"']+)["']>([\s\S]*?)<\/arg>/g;
      let argMatch;
      while ((argMatch = argRegex.exec(argsContent)) !== null) {
        args[argMatch[1]] = argMatch[2].trim();
      }

      if (toolName === 'create_specification') {
        const spec = await this.createSpec(projectId, args);
        results += `Spec ${spec.id} created. `;
      } else if (toolName === 'update_prompt') {
        await this.updatePrompt(projectId, args);
        results += `Prompt ${args.filename} updated. `;
      }
    }
    return results;
  }

  async updatePrompt(projectId, data) {
    const projectPath = path.join(PROJECTS_DIR, projectId);
    const phase = 'conception'; 
    const promptPath = path.join(projectPath, '.concerto/prompts', phase, 'prompts', data.filename);
    
    const dir = path.dirname(promptPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(promptPath, data.content, 'utf8');
    return { success: true };
  }

  async createSpec(projectId, data) {
    const projectPath = path.join(PROJECTS_DIR, projectId);
    const specsDir = path.join(projectPath, '.concerto', 'specs');
    
    if (!fs.existsSync(specsDir)) {
      fs.mkdirSync(specsDir, { recursive: true });
    }

    const id = `SPEC-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const filename = `${id}-${data.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    const filepath = path.join(specsDir, filename);

    const frontmatter = {
      id,
      title: data.title,
      phase: 'conception',
      status: 'draft',
      version: '1.0',
      created: new Date().toISOString().split('T')[0],
      priority: 'medium',
    };

    const criteriaList = (data.criteria || '').split(',').map(c => c.trim()).filter(Boolean);
    
    const body = `---
${YAML.stringify(frontmatter)}---

# Spécification: ${data.title}

## Description
${data.description || ''}

## Critères d'Acceptation
${criteriaList.map(c => `- [ ] ${c}`).join('\n')}

---
*Généré par l'Architecte Concerto pour le projet ${projectId}*
`;

    fs.writeFileSync(filepath, body, 'utf8');
    return { id, path: filepath };
  }
}

const chatService = new ChatService();
module.exports = { chatService };
