# Testing Guide

This document outlines testing procedures for the Spec-Driven Development system.

## Test Categories

### 1. Installation Tests

#### 1.1 New Project Installation (Bash)

**Objective**: Verify clean installation in a new project without legacy paths.

**Test Steps**:
```bash
# Create test project
mkdir -p /tmp/test-new-project
cd /tmp/test-new-project
mkdir -p .claude

# Run installer
bash /path/to/claude-sdd/install.sh

# Verify installation
test -d .claude/commands/spec && echo "✅ Commands directory created"
test $(ls .claude/commands/spec/*.md | wc -l) -eq 12 && echo "✅ 12 skill files installed"
test -f .claude/spec-config.json && echo "✅ Config file created"

# Verify config content
cat .claude/spec-config.json | grep '"specs": ".spec/"' && echo "✅ Default specs path"
cat .claude/spec-config.json | grep '"legacyMode": false' && echo "✅ Legacy mode disabled"

# Cleanup
rm -rf /tmp/test-new-project
```

**Expected Results**:
- `.claude/commands/spec/` directory created
- 12 `.md` skill files present
- `spec-config.json` generated with default paths (`.spec/`, `.spec-steering/`)
- `legacyMode: false`
- Exit code: 0

---

#### 1.2 New Project Installation (Python)

**Objective**: Verify Python installer works identically to Bash version.

**Test Steps**:
```bash
# Create test project
mkdir -p /tmp/test-new-project-py
cd /tmp/test-new-project-py
mkdir -p .claude

# Run Python installer
python3 /path/to/claude-sdd/install.py

# Verify (same as 1.1)
test -d .claude/commands/spec && echo "✅ Commands directory created"
test $(ls .claude/commands/spec/*.md | wc -l) -eq 12 && echo "✅ 12 skill files installed"
test -f .claude/spec-config.json && echo "✅ Config file created"

# Cleanup
rm -rf /tmp/test-new-project-py
```

**Expected Results**: Same as 1.1

---

#### 1.3 Legacy Project Installation

**Objective**: Verify installer detects legacy `.kiro/specs/` directory and enables compatibility mode.

**Test Steps**:
```bash
# Create test project with legacy directory
mkdir -p /tmp/test-legacy-project/.kiro/specs
cd /tmp/test-legacy-project
mkdir -p .claude

# Run installer
bash /path/to/claude-sdd/install.sh 2>&1 | tee install.log

# Verify legacy detection
grep -q "Detected legacy .kiro/specs/" install.log && echo "✅ Legacy path detected"

# Verify config content
cat .claude/spec-config.json | grep '"specs": ".kiro/specs/"' && echo "✅ Legacy specs path"
cat .claude/spec-config.json | grep '"legacyMode": true' && echo "✅ Legacy mode enabled"
cat .claude/spec-config.json | grep '"warnOnLegacyPaths": true' && echo "✅ Warnings enabled"

# Cleanup
rm -rf /tmp/test-legacy-project
```

**Expected Results**:
- Warning message displayed about legacy paths
- `spec-config.json` generated with legacy paths (`.kiro/specs/`, `.kiro/steering/`)
- `legacyMode: true`
- `warnOnLegacyPaths: true`
- Exit code: 0

---

#### 1.4 Existing Config Preservation

**Objective**: Verify installer does not overwrite existing configuration.

**Test Steps**:
```bash
# Create test project with existing config
mkdir -p /tmp/test-existing-config/.claude/commands/spec
cd /tmp/test-existing-config

# Create custom config
cat > .claude/spec-config.json << 'EOF'
{
  "version": "1.0.0",
  "paths": {
    "specs": "custom/specs/",
    "steering": "custom/steering/"
  }
}
EOF

# Run installer
bash /path/to/claude-sdd/install.sh 2>&1 | tee install.log

# Verify config not overwritten
grep -q "custom/specs/" .claude/spec-config.json && echo "✅ Custom config preserved"
grep -q "Existing configuration found" install.log && echo "✅ Warning displayed"

# Cleanup
rm -rf /tmp/test-existing-config
```

**Expected Results**:
- Existing config file not modified
- Warning message displayed
- Skill files still copied/updated
- Exit code: 0

---

### 2. Command Functionality Tests

#### 2.1 Spec Initialization (`/spec:init`)

**Objective**: Verify `/spec:init` creates correct directory structure and files.

**Prerequisites**:
- Installer completed successfully
- Working in a Claude Code environment

**Test Steps**:
```bash
# Initialize a spec (manual test in Claude Code)
/spec:init Test feature for authentication system

# Verify directory created
test -d .spec/test-feature-for-authentication-system && echo "✅ Spec directory created"

# Verify files created
test -f .spec/test-feature-for-authentication-system/spec.json && echo "✅ spec.json created"
test -f .spec/test-feature-for-authentication-system/requirements.md && echo "✅ requirements.md created"
test -f .spec/test-feature-for-authentication-system/session-state.md && echo "✅ session-state.md created"

# Verify spec.json content
cat .spec/test-feature-for-authentication-system/spec.json | grep '"phase": "initialized"' && echo "✅ Phase set to initialized"
```

**Expected Results**:
- Directory created with sanitized name
- `spec.json`, `requirements.md`, `session-state.md` created
- `spec.json` has correct phase and metadata
- Success message displayed

---

#### 2.2 Requirements Generation (`/spec:requirements`)

**Objective**: Verify `/spec:requirements` generates EARS-formatted requirements.

**Prerequisites**:
- Spec initialized from 2.1

**Test Steps**:
```bash
# Generate requirements (manual test in Claude Code)
/spec:requirements test-feature-for-authentication-system

# Verify requirements.md updated
grep -q "## Functional Requirements" .spec/test-feature-for-authentication-system/requirements.md && echo "✅ Functional requirements section"
grep -q "## Non-Functional Requirements" .spec/test-feature-for-authentication-system/requirements.md && echo "✅ Non-functional requirements section"

# Verify spec.json updated
cat .spec/test-feature-for-authentication-system/spec.json | grep '"phase": "requirements-generated"' && echo "✅ Phase updated"
```

**Expected Results**:
- `requirements.md` populated with EARS format
- Functional and non-functional requirements sections
- `spec.json` phase updated to `requirements-generated`

---

#### 2.3 Design Generation (`/spec:design`)

**Objective**: Verify `/spec:design` creates comprehensive technical design.

**Prerequisites**:
- Requirements generated and approved

**Test Steps**:
```bash
# Generate design (manual test in Claude Code)
/spec:design test-feature-for-authentication-system

# Verify design.md created
test -f .spec/test-feature-for-authentication-system/design.md && echo "✅ design.md created"
grep -q "## アーキテクチャ" .spec/test-feature-for-authentication-system/design.md && echo "✅ Architecture section"
grep -q "## コンポーネントとインターフェース" .spec/test-feature-for-authentication-system/design.md && echo "✅ Components section"

# Verify spec.json updated
cat .spec/test-feature-for-authentication-system/spec.json | grep '"phase": "design-generated"' && echo "✅ Phase updated"
```

**Expected Results**:
- `design.md` created with architecture, components, interfaces
- `spec.json` phase updated to `design-generated`

---

#### 2.4 Task Generation (`/spec:tasks`)

**Objective**: Verify `/spec:tasks` generates implementation tasks.

**Prerequisites**:
- Design generated and approved

**Test Steps**:
```bash
# Generate tasks (manual test in Claude Code)
/spec:tasks test-feature-for-authentication-system

# Verify tasks.md created
test -f .spec/test-feature-for-authentication-system/tasks.md && echo "✅ tasks.md created"
grep -q "- \[ \]" .spec/test-feature-for-authentication-system/tasks.md && echo "✅ Checkbox format"

# Verify spec.json updated
cat .spec/test-feature-for-authentication-system/spec.json | grep '"phase": "tasks-generated"' && echo "✅ Phase updated"
```

**Expected Results**:
- `tasks.md` created with checkbox format
- Tasks organized in sections
- Requirements traceability included
- `spec.json` phase updated to `tasks-generated`

---

### 3. Path Resolution Tests

#### 3.1 Default Path Resolution

**Objective**: Verify skills use default paths when no config exists.

**Test Steps**:
```bash
# Remove config file
mv .claude/spec-config.json .claude/spec-config.json.bak

# Run /spec:init (manual test)
/spec:init Default path test

# Verify default paths used
test -d .spec/default-path-test && echo "✅ Default .spec/ path used"

# Restore config
mv .claude/spec-config.json.bak .claude/spec-config.json
```

**Expected Results**:
- Spec created in `.spec/` directory (default)
- No error messages

---

#### 3.2 Custom Path Resolution

**Objective**: Verify skills respect custom paths from config.

**Test Steps**:
```bash
# Create custom config
cat > .claude/spec-config.json << 'EOF'
{
  "version": "1.0.0",
  "paths": {
    "specs": "custom/specifications/",
    "steering": "custom/steering/"
  }
}
EOF

# Run /spec:init (manual test)
/spec:init Custom path test

# Verify custom path used
test -d custom/specifications/custom-path-test && echo "✅ Custom path used"

# Restore default config
# ...
```

**Expected Results**:
- Spec created in `custom/specifications/` directory
- Path from config file respected

---

#### 3.3 Legacy Path Resolution

**Objective**: Verify skills detect and use legacy paths with warning.

**Test Steps**:
```bash
# Create legacy directory structure
mkdir -p .kiro/specs .kiro/steering

# Create legacy mode config
cat > .claude/spec-config.json << 'EOF'
{
  "version": "1.0.0",
  "paths": {
    "specs": ".kiro/specs/",
    "steering": ".kiro/steering/"
  },
  "compatibility": {
    "legacyMode": true,
    "warnOnLegacyPaths": true
  }
}
EOF

# Run /spec:init (manual test, capture output)
/spec:init Legacy path test 2>&1 | tee init.log

# Verify legacy path used
test -d .kiro/specs/legacy-path-test && echo "✅ Legacy path used"

# Verify warning displayed
grep -q "Using legacy paths" init.log && echo "✅ Warning displayed"
```

**Expected Results**:
- Spec created in `.kiro/specs/` directory
- Warning message about legacy paths displayed

---

### 4. Security Tests

#### 4.1 Path Traversal Prevention

**Objective**: Verify path validation rejects directory traversal attempts.

**Test Steps**:
```bash
# Create malicious config
cat > .claude/spec-config.json << 'EOF'
{
  "version": "1.0.0",
  "paths": {
    "specs": "../../malicious/",
    "steering": "../../../etc/"
  }
}
EOF

# Run /spec:init (manual test, should fail or use fallback)
/spec:init Traversal test 2>&1 | tee test.log

# Verify rejection or fallback
grep -q "Error.*traversal" test.log && echo "✅ Traversal detected"
# OR
test -d .spec/traversal-test && echo "✅ Fallback to default path"
```

**Expected Results**:
- Either error message about directory traversal
- Or fallback to safe default path (`.spec/`)
- Malicious path not used

---

#### 4.2 Absolute Path Prevention

**Objective**: Verify path validation rejects absolute paths.

**Test Steps**:
```bash
# Create config with absolute path
cat > .claude/spec-config.json << 'EOF'
{
  "version": "1.0.0",
  "paths": {
    "specs": "/tmp/absolute/",
    "steering": "/tmp/steering/"
  }
}
EOF

# Run /spec:init (manual test, should fail or use fallback)
/spec:init Absolute test 2>&1 | tee test.log

# Verify rejection or fallback
grep -q "Error.*absolute" test.log && echo "✅ Absolute path detected"
# OR
test -d .spec/absolute-test && echo "✅ Fallback to default path"
```

**Expected Results**:
- Either error message about absolute paths
- Or fallback to safe default path
- Absolute path not used

---

#### 4.3 Feature Name Sanitization

**Objective**: Verify feature names are properly sanitized.

**Test Steps**:
```bash
# Test various malicious/special character inputs (manual tests)
/spec:init "Test Feature with Spaces"
# Expected: test-feature-with-spaces

/spec:init "Test!@#$%Feature"
# Expected: test-feature

/spec:init "../../malicious"
# Expected: malicious (no traversal)

/spec:init "UPPERCASE_Feature"
# Expected: uppercase-feature

# Verify directories created with sanitized names
test -d .spec/test-feature-with-spaces && echo "✅ Spaces sanitized"
test -d .spec/test-feature && echo "✅ Special chars sanitized"
test -d .spec/malicious && echo "✅ Traversal prevented"
test -d .spec/uppercase-feature && echo "✅ Lowercase conversion"
```

**Expected Results**:
- All feature names sanitized to lowercase alphanumeric + hyphens/underscores
- No directory traversal possible
- No special characters in directory names

---

### 5. Performance Tests

#### 5.1 Installation Speed

**Objective**: Verify installation completes within reasonable time.

**Test Steps**:
```bash
# Measure installation time
time bash install.sh

# Expected: < 5 seconds on modern hardware
```

**Expected Results**:
- Installation completes in < 5 seconds
- No performance regressions

---

#### 5.2 Path Resolution Overhead

**Objective**: Verify path resolution logic has minimal overhead.

**Test Steps**:
```bash
# Create benchmark script
cat > bench_path_resolution.sh << 'EOF'
#!/bin/bash
start=$(date +%s%N)

# Simulate path resolution 100 times
for i in {1..100}; do
  CONFIG_FILE=".claude/spec-config.json"
  if [ -f "$CONFIG_FILE" ]; then
    SPECS_DIR=$(cat "$CONFIG_FILE" | grep -o '"specs": *"[^"]*"' | cut -d'"' -f4)
  fi
done

end=$(date +%s%N)
elapsed=$(( (end - start) / 1000000 ))  # Convert to milliseconds
echo "100 iterations: ${elapsed}ms"
echo "Average per iteration: $((elapsed / 100))ms"
EOF

chmod +x bench_path_resolution.sh
./bench_path_resolution.sh
```

**Expected Results**:
- Average path resolution time < 10ms per iteration
- No significant performance impact on command execution

---

## Test Execution Checklist

### Pre-Release Testing

- [ ] **1.1** New project installation (Bash) ✅
- [ ] **1.2** New project installation (Python) ✅
- [ ] **1.3** Legacy project installation ✅
- [ ] **1.4** Existing config preservation ✅
- [ ] **2.1** `/spec:init` functionality ✅
- [ ] **2.2** `/spec:requirements` functionality ✅
- [ ] **2.3** `/spec:design` functionality ✅
- [ ] **2.4** `/spec:tasks` functionality ✅
- [ ] **3.1** Default path resolution ✅
- [ ] **3.2** Custom path resolution ✅
- [ ] **3.3** Legacy path resolution ✅
- [ ] **4.1** Path traversal prevention ✅
- [ ] **4.2** Absolute path prevention ✅
- [ ] **4.3** Feature name sanitization ✅
- [ ] **5.1** Installation speed < 5s ✅
- [ ] **5.2** Path resolution < 10ms ✅

### Additional Command Tests

- [ ] `/spec:impl` - Execute implementation tasks
- [ ] `/spec:resume` - Resume from session state
- [ ] `/spec:status` - Display spec status
- [ ] `/spec:steering` - Create/update steering docs
- [ ] `/spec:steering-custom` - Create custom steering
- [ ] `/spec:validate-design` - Design validation
- [ ] `/spec:validate-gap` - Implementation gap analysis
- [ ] `/spec:init-issue` - Initialize from GitHub Issue

### Cross-Platform Testing

- [ ] macOS (Intel)
- [ ] macOS (Apple Silicon)
- [ ] Linux (Ubuntu 22.04+)
- [ ] Windows (WSL2)

### Regression Testing

- [ ] Existing specs still load correctly
- [ ] All commands work with legacy paths
- [ ] Migration from `.kiro/` to `.spec/` works
- [ ] No breaking changes in config format

---

## Troubleshooting Failed Tests

### Installation Fails

**Symptom**: `install.sh` exits with error code 1-10

**Diagnosis**:
```bash
# Check permissions
ls -la .claude/

# Check disk space
df -h .

# Check command availability
which curl
which tar
```

**Solution**: See [troubleshooting.md](troubleshooting.md) for detailed solutions.

---

### Command Not Found

**Symptom**: `/spec:*` commands not recognized

**Diagnosis**:
```bash
# Check skill files installed
ls -la .claude/commands/spec/

# Check Claude Code configuration
cat .claude/config.json  # If exists
```

**Solution**: Reinstall or verify `.claude/commands/spec/` directory exists.

---

### Path Resolution Fails

**Symptom**: Specs created in wrong directory

**Diagnosis**:
```bash
# Check config file
cat .claude/spec-config.json

# Validate JSON syntax
cat .claude/spec-config.json | python3 -m json.tool
```

**Solution**: Fix JSON syntax or regenerate config file.

---

## Continuous Integration

### Automated Test Suite (Future)

```yaml
# .github/workflows/test.yml
name: Test Spec-Driven Development System

on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Test Installation (Bash)
        run: |
          mkdir -p test-project/.claude
          cd test-project
          bash ../install.sh
          test $(ls .claude/commands/spec/*.md | wc -l) -eq 12
      
      - name: Test Installation (Python)
        run: |
          mkdir -p test-project-py/.claude
          cd test-project-py
          python3 ../install.py
          test $(ls .claude/commands/spec/*.md | wc -l) -eq 12
      
      - name: Test Legacy Detection
        run: |
          mkdir -p test-legacy/.kiro/specs/.claude
          cd test-legacy
          bash ../install.sh
          grep -q "legacyMode.*true" .claude/spec-config.json
```

---

## Test Results Template

```markdown
# Test Results - [Date]

## Environment
- OS: macOS 14.1 / Ubuntu 22.04 / Windows 11 WSL2
- Shell: bash 5.2 / zsh 5.9
- Python: 3.12.0

## Test Summary
- Total Tests: 24
- Passed: 24
- Failed: 0
- Skipped: 0

## Detailed Results

### Installation Tests
- [x] 1.1 New project (Bash): PASS (2.3s)
- [x] 1.2 New project (Python): PASS (2.1s)
- [x] 1.3 Legacy project: PASS (2.5s)
- [x] 1.4 Config preservation: PASS (2.2s)

### Command Tests
- [x] 2.1 /spec:init: PASS
- [x] 2.2 /spec:requirements: PASS
- [x] 2.3 /spec:design: PASS
- [x] 2.4 /spec:tasks: PASS

### Path Resolution Tests
- [x] 3.1 Default paths: PASS
- [x] 3.2 Custom paths: PASS
- [x] 3.3 Legacy paths: PASS

### Security Tests
- [x] 4.1 Traversal prevention: PASS
- [x] 4.2 Absolute path prevention: PASS
- [x] 4.3 Name sanitization: PASS

### Performance Tests
- [x] 5.1 Installation speed: PASS (avg 2.3s)
- [x] 5.2 Path resolution: PASS (avg 3ms)

## Notes
- All tests executed successfully
- No regressions detected
- Ready for release
```
