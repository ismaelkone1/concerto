/**
 * Configuration Management Routes
 * Handles CRUD operations for Specs, Prompts, Maestros, Workflows
 */

import express, { Request, Response } from 'express';
import {
  specsManager,
  promptsManager,
  maestrosManager,
  workflowsManager,
} from './fileManager';

const router = express.Router();

// ============== SPECS ==============

router.get('/specs', async (req: Request, res: Response) => {
  try {
    const specs = await specsManager.list();
    res.header('X-Total-Count', specs.length.toString());
    res.json(specs.map((s) => ({ ...s.frontmatter, id: s.id, path: s.path, modified: s.modified })));
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/specs/:id', async (req: Request, res: Response) => {
  try {
    const spec = await specsManager.get(req.params.id);
    res.json({ ...spec.frontmatter, content: spec.content, path: spec.path });
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

router.post('/specs', async (req: Request, res: Response) => {
  try {
    const { title, phase, owner, priority, description, criteria } = req.body;
    if (!title || !phase || !owner) {
      return res.status(400).json({ error: 'Missing required fields: title, phase, owner' });
    }
    const spec = await specsManager.create({ title, phase, owner, priority, description, criteria });
    res.status(201).json(spec);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.put('/specs/:id', async (req: Request, res: Response) => {
  try {
    const updated = await specsManager.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.delete('/specs/:id', async (req: Request, res: Response) => {
  try {
    await specsManager.delete(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// ============== PROMPTS ==============

router.get('/prompts', async (req: Request, res: Response) => {
  try {
    let prompts = await promptsManager.list();

    if (req.query.phase) {
      prompts = prompts.filter((p) => p.frontmatter.phase === req.query.phase);
    }
    if (req.query.role) {
      prompts = prompts.filter((p) => p.frontmatter.role?.toLowerCase() === (req.query.role as string).toLowerCase());
    }

    res.header('X-Total-Count', prompts.length.toString());
    res.json(prompts.map((p) => ({ ...p.frontmatter, id: p.id, path: p.path, modified: p.modified })));
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/prompts/:id', async (req: Request, res: Response) => {
  try {
    const prompt = await promptsManager.get(req.params.id);
    res.json({ ...prompt.frontmatter, content: prompt.content, path: prompt.path });
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

router.post('/prompts', async (req: Request, res: Response) => {
  try {
    const { filename, phase, role, action, version, triggers, body } = req.body;
    if (!filename || !phase || !role || !action || !body) {
      return res.status(400).json({
        error: 'Missing required fields: filename, phase, role, action, body',
      });
    }
    const prompt = await promptsManager.create({ filename, phase, role, action, version, triggers, body });
    res.status(201).json(prompt);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.put('/prompts/:id', async (req: Request, res: Response) => {
  try {
    const updated = await promptsManager.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.delete('/prompts/:id', async (req: Request, res: Response) => {
  try {
    await promptsManager.delete(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// ============== MAESTROS ==============

router.get('/maestros', async (req: Request, res: Response) => {
  try {
    let maestros = await maestrosManager.list();

    if (req.query.phase) {
      maestros = maestros.filter((m) => m.frontmatter.phase === req.query.phase);
    }

    res.header('X-Total-Count', maestros.length.toString());
    res.json(maestros.map((m) => ({ ...m.frontmatter, path: m.path, modified: m.modified })));
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/maestros/:id', async (req: Request, res: Response) => {
  try {
    const maestro = await maestrosManager.get(req.params.id);
    res.json({ ...maestro.frontmatter, content: maestro.content, path: maestro.path });
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

router.post('/maestros', async (req: Request, res: Response) => {
  try {
    const { name, phase, category, expertise, version, body } = req.body;
    if (!name || !phase || !category || !body) {
      return res.status(400).json({
        error: 'Missing required fields: name, phase, category, body',
      });
    }
    const maestro = await maestrosManager.create({ name, phase, category, expertise, version, body });
    res.status(201).json(maestro);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.put('/maestros/:id', async (req: Request, res: Response) => {
  try {
    const updated = await maestrosManager.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.delete('/maestros/:id', async (req: Request, res: Response) => {
  try {
    await maestrosManager.delete(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// ============== WORKFLOWS ==============

router.get('/workflows', async (req: Request, res: Response) => {
  try {
    const workflows = await workflowsManager.list();
    res.header('X-Total-Count', workflows.length.toString());
    res.json(workflows.map((w) => ({ ...w.frontmatter, id: w.id, path: w.path, modified: w.modified })));
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/workflows/:id', async (req: Request, res: Response) => {
  try {
    const workflow = await workflowsManager.get(req.params.id);
    res.json({ ...workflow.frontmatter, content: workflow.content, path: workflow.path });
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

router.post('/workflows', async (req: Request, res: Response) => {
  try {
    const { filename, title, version, body } = req.body;
    if (!filename || !title || !body) {
      return res.status(400).json({
        error: 'Missing required fields: filename, title, body',
      });
    }
    const workflow = await workflowsManager.create({ filename, title, version, body });
    res.status(201).json(workflow);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.put('/workflows/:id', async (req: Request, res: Response) => {
  try {
    const updated = await workflowsManager.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.delete('/workflows/:id', async (req: Request, res: Response) => {
  try {
    await workflowsManager.delete(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
