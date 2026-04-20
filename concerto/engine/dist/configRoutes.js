"use strict";
/**
 * Configuration Management Routes
 * Handles CRUD operations for Specs, Prompts, Maestros, Workflows
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileManager_1 = require("./fileManager");
const router = express_1.default.Router();
// ============== SPECS ==============
router.get('/specs', async (req, res) => {
    try {
        const specs = await fileManager_1.specsManager.list();
        res.header('X-Total-Count', specs.length.toString());
        res.json(specs.map((s) => ({ ...s.frontmatter, id: s.id, path: s.path, modified: s.modified })));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/specs/:id', async (req, res) => {
    try {
        const spec = await fileManager_1.specsManager.get(req.params.id);
        res.json({ ...spec.frontmatter, content: spec.content, path: spec.path });
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
router.post('/specs', async (req, res) => {
    try {
        const { title, phase, owner, priority, description, criteria } = req.body;
        if (!title || !phase || !owner) {
            return res.status(400).json({ error: 'Missing required fields: title, phase, owner' });
        }
        const spec = await fileManager_1.specsManager.create({ title, phase, owner, priority, description, criteria });
        res.status(201).json(spec);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.put('/specs/:id', async (req, res) => {
    try {
        const updated = await fileManager_1.specsManager.update(req.params.id, req.body);
        res.json(updated);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.delete('/specs/:id', async (req, res) => {
    try {
        await fileManager_1.specsManager.delete(req.params.id);
        res.json({ success: true, id: req.params.id });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// ============== PROMPTS ==============
router.get('/prompts', async (req, res) => {
    try {
        let prompts = await fileManager_1.promptsManager.list();
        if (req.query.phase) {
            prompts = prompts.filter((p) => p.frontmatter.phase === req.query.phase);
        }
        if (req.query.role) {
            prompts = prompts.filter((p) => p.frontmatter.role?.toLowerCase() === req.query.role.toLowerCase());
        }
        res.header('X-Total-Count', prompts.length.toString());
        res.json(prompts.map((p) => ({ ...p.frontmatter, id: p.id, path: p.path, modified: p.modified })));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/prompts/:id', async (req, res) => {
    try {
        const prompt = await fileManager_1.promptsManager.get(req.params.id);
        res.json({ ...prompt.frontmatter, content: prompt.content, path: prompt.path });
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
router.post('/prompts', async (req, res) => {
    try {
        const { filename, phase, role, action, version, triggers, body } = req.body;
        if (!filename || !phase || !role || !action || !body) {
            return res.status(400).json({
                error: 'Missing required fields: filename, phase, role, action, body',
            });
        }
        const prompt = await fileManager_1.promptsManager.create({ filename, phase, role, action, version, triggers, body });
        res.status(201).json(prompt);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.put('/prompts/:id', async (req, res) => {
    try {
        const updated = await fileManager_1.promptsManager.update(req.params.id, req.body);
        res.json(updated);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.delete('/prompts/:id', async (req, res) => {
    try {
        await fileManager_1.promptsManager.delete(req.params.id);
        res.json({ success: true, id: req.params.id });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// ============== MAESTROS ==============
router.get('/maestros', async (req, res) => {
    try {
        let maestros = await fileManager_1.maestrosManager.list();
        if (req.query.phase) {
            maestros = maestros.filter((m) => m.frontmatter.phase === req.query.phase);
        }
        res.header('X-Total-Count', maestros.length.toString());
        res.json(maestros.map((m) => ({ ...m.frontmatter, path: m.path, modified: m.modified })));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/maestros/:id', async (req, res) => {
    try {
        const maestro = await fileManager_1.maestrosManager.get(req.params.id);
        res.json({ ...maestro.frontmatter, content: maestro.content, path: maestro.path });
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
router.post('/maestros', async (req, res) => {
    try {
        const { name, phase, category, expertise, version, body } = req.body;
        if (!name || !phase || !category || !body) {
            return res.status(400).json({
                error: 'Missing required fields: name, phase, category, body',
            });
        }
        const maestro = await fileManager_1.maestrosManager.create({ name, phase, category, expertise, version, body });
        res.status(201).json(maestro);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.put('/maestros/:id', async (req, res) => {
    try {
        const updated = await fileManager_1.maestrosManager.update(req.params.id, req.body);
        res.json(updated);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.delete('/maestros/:id', async (req, res) => {
    try {
        await fileManager_1.maestrosManager.delete(req.params.id);
        res.json({ success: true, id: req.params.id });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// ============== WORKFLOWS ==============
router.get('/workflows', async (req, res) => {
    try {
        const workflows = await fileManager_1.workflowsManager.list();
        res.header('X-Total-Count', workflows.length.toString());
        res.json(workflows.map((w) => ({ ...w.frontmatter, id: w.id, path: w.path, modified: w.modified })));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/workflows/:id', async (req, res) => {
    try {
        const workflow = await fileManager_1.workflowsManager.get(req.params.id);
        res.json({ ...workflow.frontmatter, content: workflow.content, path: workflow.path });
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
router.post('/workflows', async (req, res) => {
    try {
        const { filename, title, version, body } = req.body;
        if (!filename || !title || !body) {
            return res.status(400).json({
                error: 'Missing required fields: filename, title, body',
            });
        }
        const workflow = await fileManager_1.workflowsManager.create({ filename, title, version, body });
        res.status(201).json(workflow);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.put('/workflows/:id', async (req, res) => {
    try {
        const updated = await fileManager_1.workflowsManager.update(req.params.id, req.body);
        res.json(updated);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.delete('/workflows/:id', async (req, res) => {
    try {
        await fileManager_1.workflowsManager.delete(req.params.id);
        res.json({ success: true, id: req.params.id });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.default = router;
