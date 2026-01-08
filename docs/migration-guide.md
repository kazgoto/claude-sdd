# Migration Guide

Complete guide for migrating from legacy `.kiro/` directory structure to the new spec-driven development system.

## Table of Contents

- [Overview](#overview)
- [Migration Scenarios](#migration-scenarios)
- [Pre-Migration Checklist](#pre-migration-checklist)
- [Migration Steps](#migration-steps)
- [Compatibility Mode](#compatibility-mode)
- [Gradual Migration](#gradual-migration)
- [Post-Migration Verification](#post-migration-verification)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedure](#rollback-procedure)

---

## Overview

This guide helps you migrate from the legacy Kiro-style directory structure (`.kiro/specs/`, `.kiro/steering/`) to the new independent spec-driven development system with configurable paths.

### What's Changing?

**Before (Legacy)**:
- Spec files stored in `.kiro/specs/`
- Steering documents in `.kiro/steering/`
- Skill definitions embedded in `.claude/commands/kiro/`
- Hardcoded paths in skill files

**After (New System)**:
- Spec files in configurable directory (default: `.spec/`)
- Steering documents in configurable directory (default: `.spec-steering/`)
- Independent skill definitions in `.claude/commands/spec/`
- Dynamic path resolution via `spec-config.json`

### Why Migrate?

- **Flexibility**: Configure custom directory paths per project
- **Portability**: Install system in any Claude Code project
- **Independence**: No dependency on specific project names or structures
- **Security**: Path validation and input sanitization
- **Maintainability**: Centralized updates from independent repository

---

## Migration Scenarios

### Scenario 1: Keep Legacy Paths (Compatibility Mode)

**Best for**: Existing projects with many active specs

**Outcome**: Continue using `.kiro/` paths with new system

**Effort**: Low (15 minutes)

**Steps**: [See Compatibility Mode](#compatibility-mode)

---

### Scenario 2: Gradual Migration

**Best for**: Projects wanting to transition over time

**Outcome**: New specs use `.spec/`, old specs stay in `.kiro/`

**Effort**: Medium (1-2 hours over multiple sessions)

**Steps**: [See Gradual Migration](#gradual-migration)

---

### Scenario 3: Full Migration

**Best for**: Projects with few specs or clean slate desired

**Outcome**: All specs moved to `.spec/`, `.kiro/` removed

**Effort**: High (2-4 hours depending on number of specs)

**Steps**: [See Migration Steps](#migration-steps)

---

## Pre-Migration Checklist

Before starting migration, complete these checks:

### 1. Backup Your Project

```bash
# Create backup of entire project
tar -czf project-backup-$(date +%Y%m%d).tar.gz .

# Or backup specific directories
cp -r .kiro .kiro.backup
cp -r .claude .claude.backup
```

### 2. Verify Git Status

```bash
# Ensure working directory is clean
git status

# Commit any pending changes
git add .
git commit -m "chore: pre-migration checkpoint"
```

### 3. Document Current State

```bash
# List all active specs
ls -la .kiro/specs/

# Save list for verification later
ls .kiro/specs/ > pre-migration-specs.txt

# Count spec files
echo "Total specs: $(ls .kiro/specs/ | wc -l)"
```

### 4. Test Current System

```bash
# Verify current commands work
/spec:status <feature-name>
/spec:init test-migration-check
```

### 5. Install Prerequisites

```bash
# Ensure git is installed
git --version

# Optional: Install gh CLI for GitHub features
gh --version
```

---

## Migration Steps

### Option A: Compatibility Mode (Recommended for Existing Projects)

This is the **easiest and safest** migration path. Your existing `.kiro/` structure remains unchanged.

#### Step 1: Install New System

```bash
# Navigate to project root
cd /path/to/your/project

# Install from remote repository
curl -fsSL https://raw.githubusercontent.com/kazgoto/claude-sdd/main/install.sh | bash
```

**What happens**:
- Installer detects existing `.kiro/specs/` directory
- Creates `spec-config.json` with `legacyMode: true`
- Sets paths to `.kiro/specs/` and `.kiro/steering/`
- Replaces skill files in `.claude/commands/spec/`

#### Step 2: Verify Installation

```bash
# Check config file
cat .claude/spec-config.json
```

Expected output:
```json
{
  "$schema": "https://raw.githubusercontent.com/kazgoto/claude-sdd/main/config/spec-config.schema.json",
  "version": "1.0.0",
  "paths": {
    "specs": ".kiro/specs/",
    "steering": ".kiro/steering/"
  },
  "compatibility": {
    "legacyMode": true,
    "warnOnLegacyPaths": true
  },
  "metadata": {
    "installedAt": "2026-01-08T10:00:00Z",
    "installedFrom": "https://github.com/kazgoto/claude-sdd",
    "version": "1.0.0"
  }
}
```

#### Step 3: Test Existing Specs

```bash
# List existing specs
ls .kiro/specs/

# Test status command on existing spec
/spec:status <existing-feature-name>

# Test creating new spec
/spec:init Test migration in compatibility mode
```

#### Step 4: Update CLAUDE.md (Optional)

Simplify your project's CLAUDE.md by removing detailed workflow definitions:

**Before**:
```markdown
## Workflow

### Phase 1: Specification Creation
1. `/spec:init [detailed description]` - Initialize spec with detailed project description
2. `/spec:requirements [feature]` - Generate requirements document
... (50+ lines of detailed workflow)
```

**After**:
```markdown
## Workflow

See [.claude/commands/spec/README.md](.claude/commands/spec/README.md) for complete workflow documentation.

### Active Specifications
- Check `.kiro/specs/` for active specifications
- Use `/spec:status [feature-name]` to check progress
```

#### Step 5: Commit Changes

```bash
# Stage new files
git add .claude/commands/spec/ .claude/spec-config.json

# Commit migration
git commit -m "chore: migrate to independent spec-driven development system

- Install claude-sdd v1.0.0 in compatibility mode
- Existing .kiro/specs/ paths preserved
- CLAUDE.md simplified with reference to skill documentation
"
```

**✅ Migration Complete!**

You're now using the new system while keeping your existing directory structure.

---

### Option B: Gradual Migration (New Specs Use New Paths)

Transition over time by creating new specs in `.spec/` while keeping old specs in `.kiro/`.

#### Step 1: Install with Custom Paths

```bash
# Install new system
curl -fsSL https://raw.githubusercontent.com/kazgoto/claude-sdd/main/install.sh | bash
```

#### Step 2: Configure Hybrid Mode

Edit `.claude/spec-config.json`:

```json
{
  "$schema": "https://raw.githubusercontent.com/kazgoto/claude-sdd/main/config/spec-config.schema.json",
  "version": "1.0.0",
  "paths": {
    "specs": ".spec/",
    "steering": ".spec-steering/"
  },
  "compatibility": {
    "legacyMode": false,
    "warnOnLegacyPaths": true
  },
  "metadata": {
    "installedAt": "2026-01-08T10:00:00Z",
    "installedFrom": "https://github.com/kazgoto/claude-sdd",
    "version": "1.0.0"
  }
}
```

#### Step 3: Create Directories

```bash
# Create new directories
mkdir -p .spec .spec-steering

# Copy steering documents (optional)
cp -r .kiro/steering/* .spec-steering/ 2>/dev/null || true
```

#### Step 4: Test New Spec Creation

```bash
# Create spec in new location
/spec:init Test new directory structure

# Verify location
ls -la .spec/test-new-directory-structure/
```

#### Step 5: Migrate Specs Over Time

**For each spec you want to migrate**:

```bash
# Example: Migrate feature "user-authentication"
OLD_SPEC=".kiro/specs/user-authentication"
NEW_SPEC=".spec/user-authentication"

# Copy spec directory
cp -r "$OLD_SPEC" "$NEW_SPEC"

# Update any absolute paths in spec files (if any)
# Test the migrated spec
/spec:status user-authentication

# If successful, remove old spec
rm -rf "$OLD_SPEC"
```

#### Step 6: Update CLAUDE.md Active Specifications

```markdown
## Active Specifications

**New specs** (in .spec/):
- `/spec:status new-feature-name`

**Legacy specs** (in .kiro/specs/):
- Use compatibility mode or migrate manually
```

---

### Option C: Full Migration (Clean Slate)

Move all specs to new directory structure and remove `.kiro/`.

#### Step 1: Install New System

```bash
curl -fsSL https://raw.githubusercontent.com/kazgoto/claude-sdd/main/install.sh | bash
```

#### Step 2: Manually Configure for New Paths

If installer detected `.kiro/`, edit `spec-config.json` to use new paths:

```json
{
  "version": "1.0.0",
  "paths": {
    "specs": ".spec/",
    "steering": ".spec-steering/"
  },
  "compatibility": {
    "legacyMode": false,
    "warnOnLegacyPaths": false
  }
}
```

#### Step 3: Migrate All Specs

```bash
# Create new directories
mkdir -p .spec .spec-steering

# Migrate all specs
cp -r .kiro/specs/* .spec/

# Migrate steering documents
cp -r .kiro/steering/* .spec-steering/
```

#### Step 4: Verify Migration

```bash
# Count specs
echo "Specs in .kiro/specs/: $(ls .kiro/specs/ | wc -l)"
echo "Specs in .spec/: $(ls .spec/ | wc -l)"

# Verify each spec is accessible
for spec in .spec/*/; do
  name=$(basename "$spec")
  echo "Testing $name..."
  /spec:status "$name" || echo "⚠️  Failed: $name"
done
```

#### Step 5: Update CLAUDE.md

**Replace**:
```markdown
### Paths
- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`
- Commands: `.claude/commands/`
```

**With**:
```markdown
### Paths
- Steering: `.spec-steering/`
- Specs: `.spec/`
- Commands: `.claude/commands/`
```

#### Step 6: Archive Legacy Directory

```bash
# Create archive
tar -czf kiro-legacy-$(date +%Y%m%d).tar.gz .kiro

# Move archive to safe location
mv kiro-legacy-*.tar.gz ~/backups/

# Remove .kiro directory
rm -rf .kiro
```

#### Step 7: Commit Full Migration

```bash
git add .claude .spec .spec-steering
git rm -r .kiro
git commit -m "feat: complete migration to independent spec system

- Migrate all specs from .kiro/specs/ to .spec/
- Migrate steering docs from .kiro/steering/ to .spec-steering/
- Install claude-sdd v1.0.0
- Update CLAUDE.md with new paths
- Archive legacy .kiro/ directory
"
```

---

## Compatibility Mode

Compatibility mode allows you to use the new system while keeping existing `.kiro/` paths.

### Enabling Compatibility Mode

**Automatic (during installation)**:
- Installer detects `.kiro/specs/` and enables automatically

**Manual (edit spec-config.json)**:
```json
{
  "paths": {
    "specs": ".kiro/specs/",
    "steering": ".kiro/steering/"
  },
  "compatibility": {
    "legacyMode": true,
    "warnOnLegacyPaths": true
  }
}
```

### Warnings in Compatibility Mode

When `warnOnLegacyPaths: true`, you'll see informational messages:

```
ℹ️  Using legacy path: .kiro/specs/
   Consider migrating to .spec/ for better portability
   See: docs/migration-guide.md
```

### Disabling Warnings

```json
{
  "compatibility": {
    "legacyMode": true,
    "warnOnLegacyPaths": false
  }
}
```

---

## Gradual Migration

### Strategy

1. **Install** new system
2. **Configure** to use `.spec/` for new specs
3. **Keep** old specs in `.kiro/specs/` (read-only)
4. **Migrate** specs one-by-one when convenient
5. **Remove** `.kiro/` when all specs migrated

### Migration Script

Create a helper script for migrating individual specs:

```bash
#!/bin/bash
# migrate-spec.sh - Migrate single spec from .kiro/ to .spec/

SPEC_NAME="$1"
OLD_PATH=".kiro/specs/$SPEC_NAME"
NEW_PATH=".spec/$SPEC_NAME"

if [ ! -d "$OLD_PATH" ]; then
  echo "❌ Spec not found: $OLD_PATH"
  exit 1
fi

if [ -d "$NEW_PATH" ]; then
  echo "⚠️  New path already exists: $NEW_PATH"
  exit 1
fi

# Copy spec directory
echo "📁 Copying $SPEC_NAME..."
cp -r "$OLD_PATH" "$NEW_PATH"

# Verify
if /spec:status "$SPEC_NAME" &>/dev/null; then
  echo "✅ Migration successful: $SPEC_NAME"
  echo "🗑️  Remove old spec? [y/N]"
  read -r confirm
  if [ "$confirm" = "y" ]; then
    rm -rf "$OLD_PATH"
    echo "✅ Old spec removed"
  fi
else
  echo "❌ Migration failed - spec not accessible"
  rm -rf "$NEW_PATH"
  exit 1
fi
```

Usage:
```bash
chmod +x migrate-spec.sh
./migrate-spec.sh user-authentication
```

---

## Post-Migration Verification

### Verification Checklist

After migration, verify everything works:

#### 1. List All Specs

```bash
# New location
ls .spec/

# Compare with pre-migration list
diff pre-migration-specs.txt <(ls .spec/)
```

#### 2. Test Each Spec

```bash
# Test status command
for spec in .spec/*/; do
  name=$(basename "$spec")
  /spec:status "$name"
done
```

#### 3. Test New Spec Creation

```bash
# Create test spec
/spec:init Verification test after migration

# Verify location
ls -la .spec/verification-test-after-migration/

# Clean up
rm -rf .spec/verification-test-after-migration/
```

#### 4. Test All Commands

```bash
# Pick an existing spec
SPEC_NAME="your-existing-spec"

# Test commands
/spec:status "$SPEC_NAME"
/spec:requirements "$SPEC_NAME"  # if not generated yet
/spec:design "$SPEC_NAME"        # if not generated yet
/spec:tasks "$SPEC_NAME"         # if not generated yet
```

#### 5. Verify Steering Documents

```bash
# Check steering location
ls .spec-steering/

# Verify files
cat .spec-steering/structure.md | head -20
cat .spec-steering/tech.md | head -20
cat .spec-steering/product.md | head -20
```

#### 6. Run Tests (if applicable)

```bash
# Run project tests
uv run pytest

# Or npm test, make test, etc.
```

---

## Troubleshooting

### Issue: Spec Not Found After Migration

**Symptom**:
```
❌ Error: Spec directory not found: .spec/feature-name/
```

**Solution**:
1. Verify spec was copied correctly:
   ```bash
   ls -la .spec/feature-name/
   ```
2. Check spec-config.json has correct path:
   ```bash
   cat .claude/spec-config.json | grep specs
   ```
3. Ensure directory name matches exactly (case-sensitive)

---

### Issue: Legacy Path Warnings

**Symptom**:
```
ℹ️  Using legacy path: .kiro/specs/
```

**Solution**:
- This is informational, not an error
- To disable: Set `warnOnLegacyPaths: false` in spec-config.json
- To migrate: Follow [Gradual Migration](#gradual-migration)

---

### Issue: Permission Denied

**Symptom**:
```
❌ Error: Permission denied: .spec/
```

**Solution**:
```bash
# Fix directory permissions
chmod 755 .spec .spec-steering

# Fix file permissions
chmod 644 .spec/*/*.md
chmod 644 .spec/*/spec.json
```

---

### Issue: Skill Commands Not Found

**Symptom**:
```
Command not found: /spec:init
```

**Solution**:
1. Verify installation:
   ```bash
   ls -la .claude/commands/spec/
   ```
2. Reinstall if files missing:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/kazgoto/claude-sdd/main/install.sh | bash
   ```
3. Restart Claude Code

---

### Issue: Configuration File Invalid

**Symptom**:
```
❌ Error: Invalid spec-config.json
```

**Solution**:
1. Validate JSON syntax:
   ```bash
   cat .claude/spec-config.json | python3 -m json.tool
   ```
2. Check against schema:
   ```bash
   # Download schema
   curl -o /tmp/schema.json https://raw.githubusercontent.com/kazgoto/claude-sdd/main/config/spec-config.schema.json

   # Validate (requires jsonschema)
   python3 -c "import json, jsonschema
   with open('.claude/spec-config.json') as f:
       config = json.load(f)
   with open('/tmp/schema.json') as f:
       schema = json.load(f)
   jsonschema.validate(config, schema)
   print('✅ Valid')"
   ```
3. Regenerate if corrupt:
   ```bash
   mv .claude/spec-config.json .claude/spec-config.json.backup
   bash install.sh
   ```

---

## Rollback Procedure

If migration fails or causes issues, rollback using these steps:

### Step 1: Restore from Backup

```bash
# Restore .kiro directory
cp -r .kiro.backup .kiro

# Restore .claude directory
cp -r .claude.backup .claude
```

### Step 2: Verify Restoration

```bash
# Check files restored
ls .kiro/specs/
ls .claude/commands/

# Test original commands
/spec:status <feature-name>
```

### Step 3: Clean Up Failed Migration

```bash
# Remove new directories if created
rm -rf .spec .spec-steering

# Remove new config
rm .claude/spec-config.json
```

### Step 4: Revert Git Commits

```bash
# View recent commits
git log --oneline -5

# Revert migration commit
git revert <commit-hash>

# Or reset to previous commit (destructive)
git reset --hard HEAD~1
```

### Step 5: Report Issue

If rollback was necessary, please report the issue:

1. Go to [GitHub Issues](https://github.com/kazgoto/claude-sdd/issues)
2. Create new issue with:
   - Migration scenario attempted
   - Error messages encountered
   - Steps to reproduce
   - Environment details (OS, Claude Code version)

---

## Best Practices

### Do's ✅

- **Create backups** before migration
- **Test in compatibility mode** first
- **Migrate gradually** for large projects
- **Verify each spec** after migration
- **Commit frequently** during migration
- **Document custom paths** in project README

### Don'ts ❌

- **Don't skip backups** - Always create before migration
- **Don't force migration** - Use compatibility mode if unsure
- **Don't delete .kiro/ immediately** - Archive first
- **Don't modify config manually** - Use installer when possible
- **Don't mix paths** - Be consistent within project

---

## FAQ

### Q: Can I use both .kiro/ and .spec/ simultaneously?

**A**: Not recommended. Choose one of:
- Compatibility mode (keep .kiro/)
- Gradual migration (new in .spec/, old stays in .kiro/)
- Full migration (everything in .spec/)

---

### Q: Will my existing specs break after migration?

**A**: No, if using compatibility mode. The installer automatically detects `.kiro/` and configures legacy paths.

---

### Q: How do I change paths after installation?

**A**: Edit `.claude/spec-config.json`:

```json
{
  "paths": {
    "specs": "custom-specs-dir/",
    "steering": "custom-steering-dir/"
  }
}
```

**Requirements**:
- Must be relative paths
- Must end with `/`
- No `..` traversal
- No absolute paths

---

### Q: Can I use custom directory names?

**A**: Yes! Example:

```json
{
  "paths": {
    "specs": "specifications/",
    "steering": "project-context/"
  }
}
```

---

### Q: What if I have multiple projects?

**A**: Each project can have different paths. Configure per-project in each `.claude/spec-config.json`.

---

### Q: How do I update skill definitions?

**A**: Re-run installer:

```bash
cd /path/to/project
curl -fsSL https://raw.githubusercontent.com/kazgoto/claude-sdd/main/install.sh | bash
```

Installer preserves existing `spec-config.json`.

---

## Next Steps

After successful migration:

1. ✅ Verify all specs accessible
2. ✅ Test spec creation workflow
3. ✅ Update project documentation
4. ✅ Train team on new paths
5. ✅ Archive legacy .kiro/ directory
6. ✅ Commit and push changes

---

## Support

Need help with migration?

- **Documentation**: [README.md](../README.md)
- **Troubleshooting**: [docs/troubleshooting.md](troubleshooting.md)
- **Issues**: [GitHub Issues](https://github.com/kazgoto/claude-sdd/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kazgoto/claude-sdd/discussions)
