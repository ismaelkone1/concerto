---
title: "CONCERTO - Implementation Quick Start"
date: "2026-04-18"
version: "1.0"
---

# 🚀 Quick Start - Implementation Phase

## Foundation Complete ✅

The CONCERTO framework is now ready for implementation. All configuration, prompts, maestros, and workflows are in place.

## 📍 Current Status

**What's Ready:**
- ✅ Framework structure complete
- ✅ Spec Kit tracking system in place
- ✅ 4 Maestros defined (Backend Dev, Frontend Dev, QA Tester, Reviewer)
- ✅ Example workflows documented
- ✅ Prompts for each role ready
- ✅ First spec (SPEC-001) defined

**What's Next:**
- 🟡 Implement SPEC-001: Dev Page Frontend (Starting now)
- 🔵 Create backend APIs (SPEC-010, 011, 012)
- 🔵 Implement remaining frontend pages (SPEC-002, 003)

## 🎯 How to Proceed

### Option 1: Immediate Implementation (Recommended)

**Start with SPEC-001 : Dev Page Frontend**

1. **Read the specification**
   ```bash
   cat concerto-config/spec/SPEC-001-dev-page.md
   ```

2. **Use the frontend developer prompt**
   ```bash
   cat concerto-config/dev/prompts/implement-feature-frontend.md
   ```

3. **Follow the workflow**
   ```bash
   cat workflows/new-feature.md
   # Follow "Phase 2: Développement → 2.3 Assigner au Frontend Developer"
   ```

4. **Track progress**
   ```bash
   # Edit concerto-config/spec/TRACKING.md
   # Update SPEC-001: progress to 25%, 50%, 75%, 100%
   ```

### Option 2: Add More Specs First

If you want to define the full scope before starting implementation:

1. **Create new specs for missing areas**
   ```bash
   # Example: Backend API spec
   cp concerto-config/base/templates/spec-template.md \
      concerto-config/spec/SPEC-010-task-runner-api.md
   ```

2. **Define dependencies**
   ```bash
   # Edit SPEC-001: add "related: ['SPEC-010']"
   # Edit TRACKING.md: add to dependency graph
   ```

3. **Map maestros to specs**
   ```bash
   # Edit each SPEC: set proper owner
   # Update TRACKING.md: assign to correct row
   ```

### Option 3: Customize Framework First

If you want to modify the framework structure before starting implementation:

```bash
# Add a new phase
cat docs/EXTENDING.md  # Read "Adding a New Phase"

# Create a new maestro
mkdir maestros/custom
cat > maestros/custom/new-maestro.md << 'EOF'
---
id: "new-maestro"
name: "Role Name"
phase: "dev"
---
# ...
EOF

# Create a new workflow
cat > workflows/custom-workflow.md << 'EOF'
---
id: "WF-CUSTOM"
title: "Custom Workflow"
---
# ...
EOF
```

## 📊 Project Timeline

### Week 1 (Apr 18-20)
- ⏳ SPEC-001: Dev Page Frontend
- ⏳ SPEC-010: Task Runner API (definition)

**Deliverables:**
- Dev Page UI with components
- Task API OpenAPI spec

### Week 2 (Apr 21-23)
- SPEC-002, 003: Test/Deploy Pages
- SPEC-010, 011, 012: Backend APIs implementation

**Deliverables:**
- All 3 frontend pages complete
- All 3 backend APIs functional

### Week 3 (Apr 24-30)
- Testing & Deployment
- Production release

**Deliverables:**
- 80%+ test coverage
- Production deployment ready

## 🔄 Workflow for Each Spec

### 1. Create/Approve Spec
- Create `SPEC-XXX-name.md` in `concerto-config/spec/`
- Fill YAML frontmatter
- Set `status: approved` when ready

### 2. Update TRACKING.md
- Add row to appropriate table
- Set status to `in-progress`
- Link to maestro assignment

### 3. Assign Maestro
- Reference the proper prompt from `concerto-config/{phase}/prompts/`
- Use maestro profile from `maestros/{category}/{role}.md`
- Brief with full spec + prompt

### 4. Execute
- Follow the workflow from `workflows/`
- Write code/tests/docs
- Commit with format: `[PHASE] action: message`

### 5. Complete
- All criteria in spec met
- Tests passing
- Documentation updated
- Edit spec: `status: completed`
- Update TRACKING.md: progress to 100%

## 📋 Checking Your Work

### Before starting each task
```bash
# 1. Verify spec is clear
cat concerto-config/spec/SPEC-XXX-*.md

# 2. Check maestro assignment
cat maestros/{category}/{role}.md

# 3. Review workflow
cat workflows/new-feature.md

# 4. See current progress
cat concerto-config/spec/TRACKING.md
```

### During implementation
```bash
# Keep TRACKING.md updated with progress
nano concerto-config/spec/TRACKING.md
# Update: progress percentage, status changes

# Commit frequently with proper format
git add .
git commit -m "[dev] feat: add git status card component"

# Check compliance
# - ESLint passing
# - TypeScript strict mode
# - Tests written
```

### After each spec
```bash
# Mark as completed
# Edit SPEC-XXX: status: in-progress → completed
# Edit TRACKING.md: progress to 100%

# Move to next spec
# Update TRACKING.md: change next spec to in-progress
```

## 🎓 Resources

| Resource | Purpose | Time |
|----------|---------|------|
| [README.md](README.md) | Project overview | 5 min |
| [docs/USAGE.md](docs/USAGE.md) | Daily usage guide | 10 min |
| [docs/STRUCTURE.md](docs/STRUCTURE.md) | Architecture details | 20 min |
| [docs/EXTENDING.md](docs/EXTENDING.md) | Customization guide | 30 min |
| [maestros/dev/{role}.md](maestros/dev/) | Role specifications | 10 min |
| [workflows/new-feature.md](workflows/new-feature.md) | Implementation workflow | 15 min |
| [concerto-config/spec/SPEC-001-dev-page.md](concerto-config/spec/SPEC-001-dev-page.md) | Example spec | 10 min |

## ❓ Common Questions

**Q: Which spec should I start with?**  
A: SPEC-001 (Dev Page Frontend) - it's well-defined and doesn't block other work.

**Q: Do I need to implement all specs?**  
A: You can do them in any order, but SPEC-010/011/012 (APIs) should be ready before SPEC-002/003 (pages that use them).

**Q: What if a spec has blockers?**  
A: Mark it `status: blocked` in TRACKING.md with notes. Move to another spec.

**Q: How do I modify a spec once approved?**  
A: Create SPEC-XXX-v2.md or add notes in spec body. Keep history of changes.

**Q: Can I add more maestros?**  
A: Yes! Follow [docs/EXTENDING.md](docs/EXTENDING.md) "Adding a New Maestro".

## 🎯 First Steps (Today)

1. **Read quick overview:**
   ```bash
   cat README.md
   ```

2. **Review first specification:**
   ```bash
   cat concerto-config/spec/SPEC-001-dev-page.md
   ```

3. **Understand the prompt:**
   ```bash
   cat concerto-config/dev/prompts/implement-feature-frontend.md
   ```

4. **Check the workflow:**
   ```bash
   cat workflows/new-feature.md
   ```

5. **Update tracking:**
   ```bash
   nano concerto-config/spec/TRACKING.md
   # Change SPEC-001 status to "in-progress"
   ```

6. **Start implementation:**
   - Follow the prompt
   - Reference the workflow
   - Update status as you progress

## ✍️ Notes

- This foundation is flexible - modify as needed
- Keep TRACKING.md as source of truth
- Maintain spec format for consistency
- Document decisions in spec notes
- Escalate blockers to tech lead

---

**Ready to start?**
```bash
cat concerto-config/spec/SPEC-001-dev-page.md
```

**Have questions?**
- Architecture: See [docs/STRUCTURE.md](docs/STRUCTURE.md)
- Usage: See [docs/USAGE.md](docs/USAGE.md)
- Extending: See [docs/EXTENDING.md](docs/EXTENDING.md)

**Good luck! 🚀**
