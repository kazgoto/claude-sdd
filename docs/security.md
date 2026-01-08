# Security Guidelines

This document outlines security considerations and validation logic for the Spec-Driven Development system.

## Path Validation

### Overview

All path configurations in `spec-config.json` must be validated to prevent directory traversal attacks and ensure paths remain within the project directory.

### Validation Rules

1. **Relative Paths Only**: Absolute paths (starting with `/`) are not allowed
2. **No Directory Traversal**: Paths containing `..` are rejected
3. **Trailing Slash Required**: All directory paths must end with `/`
4. **Within Project Root**: Paths must resolve to subdirectories of the project root

### Implementation Example

Add this validation logic to skills that read `spec-config.json`:

```bash
# Path validation function
validate_path() {
    local path="$1"
    local path_type="$2"  # "specs" or "steering"

    # Check for absolute path
    if [[ "$path" =~ ^/ ]]; then
        echo "❌ Error: Absolute paths are not allowed in $path_type path: $path" >&2
        echo "   Use relative paths like '.spec/' instead of '/spec/'" >&2
        return 1
    fi

    # Check for directory traversal
    if [[ "$path" =~ \.\. ]]; then
        echo "❌ Error: Directory traversal detected in $path_type path: $path" >&2
        echo "   Paths cannot contain '..' for security reasons" >&2
        return 1
    fi

    # Check for trailing slash
    if [[ ! "$path" =~ /$ ]]; then
        echo "⚠️  Warning: $path_type path should end with '/': $path" >&2
        echo "   Auto-correcting to: $path/" >&2
        path="$path/"
    fi

    # Verify path resolves within project
    local resolved_path
    resolved_path="$(cd "$(dirname "$path")" 2>/dev/null && pwd)"
    local project_root
    project_root="$(pwd)"
    
    if [[ ! "$resolved_path" =~ ^"$project_root" ]]; then
        echo "❌ Error: $path_type path resolves outside project directory" >&2
        echo "   Path: $path → $resolved_path" >&2
        echo "   Project root: $project_root" >&2
        return 1
    fi

    return 0
}

# Usage example in skill definition
CONFIG_FILE=".claude/spec-config.json"

if [ -f "$CONFIG_FILE" ]; then
    SPECS_DIR=$(cat "$CONFIG_FILE" | grep -o '"specs": *"[^"]*"' | cut -d'"' -f4)
    STEERING_DIR=$(cat "$CONFIG_FILE" | grep -o '"steering": *"[^"]*"' | cut -d'"' -f4)
    
    # Validate paths
    if ! validate_path "$SPECS_DIR" "specs"; then
        echo "⚠️  Falling back to default specs path: .spec/" >&2
        SPECS_DIR=".spec/"
    fi
    
    if ! validate_path "$STEERING_DIR" "steering"; then
        echo "⚠️  Falling back to default steering path: .spec-steering/" >&2
        STEERING_DIR=".spec-steering/"
    fi
else
    # Default paths when no config exists
    SPECS_DIR=".spec/"
    STEERING_DIR=".spec-steering/"
fi
```

### Error Messages

**Absolute Path:**
```
❌ Error: Absolute paths are not allowed in specs path: /home/user/specs/
   Use relative paths like '.spec/' instead of '/spec/'
```

**Directory Traversal:**
```
❌ Error: Directory traversal detected in specs path: ../../malicious/
   Paths cannot contain '..' for security reasons
```

**Missing Trailing Slash:**
```
⚠️  Warning: specs path should end with '/': .spec
   Auto-correcting to: .spec/
```

---

## Feature Name Sanitization

### Overview

User-provided feature names (from `/spec:init` arguments) must be sanitized to prevent command injection and ensure valid filesystem paths.

### Sanitization Rules

1. **Allowed Characters**: Only lowercase alphanumeric, hyphens (`-`), and underscores (`_`)
2. **Case Normalization**: Convert uppercase to lowercase
3. **Special Character Replacement**: Replace disallowed characters with hyphens
4. **Length Limit**: Maximum 100 characters
5. **No Leading/Trailing Hyphens**: Trim hyphens from start and end

### Implementation Example

Add this sanitization logic to `/spec:init` and `/spec:init-issue`:

```bash
# Feature name sanitization function
sanitize_feature_name() {
    local input="$1"
    local sanitized

    # Convert to lowercase
    sanitized="$(echo "$input" | tr '[:upper:]' '[:lower:]')"
    
    # Replace spaces and special characters with hyphens
    sanitized="$(echo "$sanitized" | sed 's/[^a-z0-9_-]/-/g')"
    
    # Remove consecutive hyphens
    sanitized="$(echo "$sanitized" | sed 's/-\+/-/g')"
    
    # Remove leading and trailing hyphens
    sanitized="$(echo "$sanitized" | sed 's/^-//; s/-$//')"
    
    # Truncate to 100 characters
    sanitized="${sanitized:0:100}"
    
    # Ensure not empty
    if [ -z "$sanitized" ]; then
        sanitized="spec-$(date +%Y%m%d-%H%M%S)"
    fi
    
    echo "$sanitized"
}

# Usage example in /spec:init
USER_INPUT="$ARGUMENTS"

# Sanitize the feature name
FEATURE_NAME=$(sanitize_feature_name "$USER_INPUT")

echo "📝 Sanitized feature name: $FEATURE_NAME"

# Verify uniqueness
if [ -d "${SPECS_DIR}${FEATURE_NAME}" ]; then
    echo "❌ Error: Spec '$FEATURE_NAME' already exists" >&2
    echo "   Try a different name or use: ${FEATURE_NAME}-2" >&2
    exit 1
fi

# Create spec directory
mkdir -p "${SPECS_DIR}${FEATURE_NAME}"
```

### Sanitization Examples

| Input | Output | Reason |
|-------|--------|--------|
| `User Authentication` | `user-authentication` | Spaces → hyphens, lowercase |
| `OAuth2&JWT` | `oauth2-jwt` | Special chars → hyphens |
| `Feature--Name` | `feature-name` | Consecutive hyphens → single |
| `-LeadingHyphen-` | `leadinghyphen` | Trim leading/trailing |
| `Very Long Feature Name That Exceeds...` | `very-long-feature-name-that-exceeds-...` (truncated at 100 chars) | Length limit |
| `!!!Invalid!!!` | `invalid` | Only special chars removed |
| `   ` | `spec-20260108-153000` | Empty input → timestamp |

### Error Messages

**Existing Spec:**
```
❌ Error: Spec 'user-authentication' already exists
   Try a different name or use: user-authentication-2
```

**Empty After Sanitization:**
```
⚠️  Warning: Feature name is empty after sanitization
   Using auto-generated name: spec-20260108-153000
```

---

## Security Best Practices

### For Skill Developers

1. **Never Execute Unsanitized User Input**
   ```bash
   # ❌ WRONG - Command injection risk
   eval "$USER_INPUT"
   
   # ✅ CORRECT - Sanitize first
   SAFE_INPUT=$(sanitize_feature_name "$USER_INPUT")
   ```

2. **Always Validate External Configuration**
   ```bash
   # ❌ WRONG - Trust config blindly
   SPECS_DIR=$(cat config.json | jq -r '.paths.specs')
   
   # ✅ CORRECT - Validate before use
   SPECS_DIR=$(cat config.json | jq -r '.paths.specs')
   validate_path "$SPECS_DIR" "specs" || SPECS_DIR=".spec/"
   ```

3. **Use Quoted Variables in Bash**
   ```bash
   # ❌ WRONG - Word splitting issues
   cd $SPECS_DIR
   
   # ✅ CORRECT - Prevent word splitting
   cd "$SPECS_DIR"
   ```

### For Users

1. **Review `spec-config.json` Before Use**
   - Ensure paths point to intended directories
   - Verify no suspicious paths (e.g., `/etc/`, `../../`)

2. **Use Default Paths When Possible**
   - Default `.spec/` and `.spec-steering/` are safe
   - Custom paths require careful validation

3. **Report Security Issues**
   - Open GitHub Issues for security concerns
   - Do not include exploit code in public issues

---

## Security Checklist

### Configuration File Security

- [ ] Paths are relative (no leading `/`)
- [ ] No directory traversal (`..`)
- [ ] Trailing slash present on all directory paths
- [ ] Paths resolve within project directory
- [ ] No sensitive information in config (API keys, tokens)

### Skill Execution Security

- [ ] User input is sanitized before use
- [ ] Feature names contain only allowed characters
- [ ] File operations use validated paths
- [ ] No `eval` or command substitution with user input
- [ ] Error messages don't leak sensitive information

### File System Security

- [ ] Created files have appropriate permissions (644)
- [ ] Directories have appropriate permissions (755)
- [ ] No world-writable files or directories
- [ ] Spec files remain within `$SPECS_DIR`
- [ ] Steering files remain within `$STEERING_DIR`

---

## Vulnerability Reporting

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** create a public GitHub Issue
2. Email the maintainers directly (see SECURITY.md)
3. Provide detailed reproduction steps
4. Allow 90 days for patch development before public disclosure

Thank you for helping keep the Spec-Driven Development system secure!
