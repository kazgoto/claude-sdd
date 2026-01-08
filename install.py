#!/usr/bin/env python3
"""
Spec-Driven Development System Installer (Python version)
Install slash commands for Claude Code

This is the Python equivalent of install.sh for environments
where Bash is not available (e.g., Windows without WSL).
"""

import json
import shutil
import sys
import tarfile
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import NoReturn
from urllib.request import urlopen


# Configuration
REPO_URL = "https://github.com/kazgoto/claude-sdd"
TARGET_DIR = Path(".claude/commands/spec")
CONFIG_FILE = Path(".claude/spec-config.json")
COMMANDS_SOURCE = Path("commands")


def error_exit(message: str, exit_code: int = 1) -> NoReturn:
    """Print error message and exit with specified code."""
    print(f"❌ Error: {message}", file=sys.stderr)
    sys.exit(exit_code)


def install_from_local() -> None:
    """Install skill files from local commands/ directory."""
    print("📦 Installing from local source...")

    if not COMMANDS_SOURCE.exists():
        error_exit(f"Local source directory not found: {COMMANDS_SOURCE}", 2)

    skill_files = list(COMMANDS_SOURCE.glob("*.md"))
    if not skill_files:
        error_exit(f"No .md files found in {COMMANDS_SOURCE}", 2)

    try:
        for skill_file in skill_files:
            shutil.copy2(skill_file, TARGET_DIR / skill_file.name)
    except (OSError, shutil.Error) as e:
        error_exit(f"Failed to copy skill files: {e}", 2)

    # Verify files were copied
    copied_files = list(TARGET_DIR.glob("*.md"))
    if not copied_files:
        error_exit("No skill files found after copy. Installation failed.", 2)

    print("✓ Copied skill files from local directory")


def install_from_remote() -> None:
    """Install skill files from GitHub repository."""
    print("📥 Installing from remote repository...")
    print(f"   Source: {REPO_URL}")

    archive_url = f"{REPO_URL}/archive/main.tar.gz"

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        archive_path = temp_path / "archive.tar.gz"

        # Download archive
        try:
            with urlopen(archive_url, timeout=30) as response:
                archive_path.write_bytes(response.read())
        except Exception as e:
            error_exit(f"Failed to download from GitHub: {e}. Check network connection.", 4)

        # Extract archive
        try:
            with tarfile.open(archive_path, "r:gz") as tar:
                tar.extractall(temp_path)
        except Exception as e:
            error_exit(f"Failed to extract archive: {e}", 5)

        # Find commands directory in extracted archive
        extracted_dirs = list(temp_path.glob("*/commands"))
        if not extracted_dirs:
            error_exit("Downloaded archive does not contain commands/ directory.", 5)

        commands_dir = extracted_dirs[0]
        skill_files = list(commands_dir.glob("*.md"))
        if not skill_files:
            error_exit("No skill files found in downloaded archive.", 2)

        # Copy skill files
        try:
            for skill_file in skill_files:
                shutil.copy2(skill_file, TARGET_DIR / skill_file.name)
        except (OSError, shutil.Error) as e:
            error_exit(f"Failed to copy skill files: {e}", 2)

    # Verify files were copied
    copied_files = list(TARGET_DIR.glob("*.md"))
    if not copied_files:
        error_exit("No skill files found after download. Installation failed.", 2)

    print("✓ Downloaded and copied skill files from GitHub")


def generate_config(legacy_mode: bool) -> None:
    """Generate spec-config.json file."""
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    if legacy_mode:
        print("⚠️  Detected legacy .kiro/specs/ directory")
        print("   Using compatibility mode with legacy paths")

        config = {
            "$schema": "https://raw.githubusercontent.com/kazgoto/claude-sdd/main/config/spec-config.schema.json",
            "version": "1.0.0",
            "paths": {
                "specs": ".kiro/specs/",
                "steering": ".kiro/steering/"
            },
            "compatibility": {
                "legacyMode": True,
                "warnOnLegacyPaths": True
            },
            "metadata": {
                "installedAt": timestamp,
                "installedFrom": REPO_URL,
                "version": "1.0.0"
            }
        }
        mode_name = "legacy mode"
    else:
        print("📝 Setting up default configuration for new project...")

        config = {
            "$schema": "https://raw.githubusercontent.com/kazgoto/claude-sdd/main/config/spec-config.schema.json",
            "version": "1.0.0",
            "paths": {
                "specs": ".spec/",
                "steering": ".spec-steering/"
            },
            "compatibility": {
                "legacyMode": False,
                "warnOnLegacyPaths": False
            },
            "metadata": {
                "installedAt": timestamp,
                "installedFrom": REPO_URL,
                "version": "1.0.0"
            }
        }
        mode_name = "default"

    # Create .claude directory if needed
    try:
        CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        error_exit(f"Failed to create .claude directory: {e}", 6)

    # Write configuration file
    try:
        with CONFIG_FILE.open("w", encoding="utf-8") as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
            f.write("\n")
    except (OSError, ValueError) as e:
        error_exit(f"Failed to write configuration file: {e}", 7)

    # Verify file was created
    if not CONFIG_FILE.exists():
        error_exit("Configuration file was not created successfully.", 10)

    print(f"✓ Generated {mode_name} configuration")


def print_next_steps() -> None:
    """Print installation success message and next steps."""
    print()
    print("✅ Installation complete!")
    print()
    print("📖 Next steps:")
    print(f"   1. Review configuration in {CONFIG_FILE}")
    print("   2. Run 'claude' to start using /spec:* commands")
    print("   3. Try: /spec:init <project-description>")
    print()
    print("📚 Available commands:")
    print("   /spec:init              - Initialize new specification")
    print("   /spec:init-issue        - Initialize from GitHub Issue")
    print("   /spec:requirements      - Generate requirements document")
    print("   /spec:design            - Create technical design")
    print("   /spec:tasks             - Generate implementation tasks")
    print("   /spec:impl              - Execute tasks with TDD")
    print("   /spec:resume            - Resume from last session")
    print("   /spec:status            - Check progress")
    print("   /spec:steering          - Create/update steering documents")
    print("   /spec:steering-custom   - Create custom steering")
    print("   /spec:validate-design   - Interactive design review")
    print("   /spec:validate-gap      - Analyze implementation gap")
    print()


def main() -> None:
    """Main installation routine."""
    print("🚀 Installing Spec-Driven Development System...")
    print()

    # 1. Create target directory
    try:
        TARGET_DIR.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        error_exit(f"Failed to create directory {TARGET_DIR}: {e}. Check permissions.", 1)

    print(f"✓ Created directory: {TARGET_DIR}")

    # 2. Install skill files
    if COMMANDS_SOURCE.exists():
        install_from_local()
    else:
        install_from_remote()

    # 3. Generate configuration file (only if it doesn't exist)
    if CONFIG_FILE.exists():
        print(f"⚠️  Configuration file already exists: {CONFIG_FILE}")
        print("   Skipping configuration generation to preserve existing settings")
    else:
        # Detect legacy paths
        legacy_mode = Path(".kiro/specs").exists()
        generate_config(legacy_mode)

    # 4. Print success message
    print_next_steps()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n❌ Installation interrupted by user.", file=sys.stderr)
        sys.exit(130)
    except Exception as e:
        error_exit(f"Unexpected error: {e}", 1)
