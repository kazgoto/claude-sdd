# Config Directory

This directory contains configuration file schemas and examples for the Spec-Driven Development system.

## Files

- `spec-config.schema.json` - JSON Schema for spec-config.json validation
- `spec-config.example.json` - Example configuration file

## Configuration File (spec-config.json)

Projects using Claude SDD should have a `spec-config.json` file in their `.claude/` directory:

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

## Path Configuration

### Default Paths (New Projects)
- Specifications: `.spec/`
- Steering documents: `.spec-steering/`

### Legacy Paths (Backward Compatibility)
- Specifications: `.kiro/specs/`
- Steering documents: `.kiro/steering/`

Legacy paths are automatically detected during installation. Set `legacyMode: true` to use legacy paths.

## Validation

The JSON Schema validates:
- Version format (semantic versioning)
- Path format (relative paths, no directory traversal)
- Required fields
- Data types

## Security

The configuration file must:
- Use relative paths only (no absolute paths)
- Prohibit directory traversal (`..`)
- Stay within project root directory
