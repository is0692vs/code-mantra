# Code Mantra

Remind yourself of programming principles with customizable notifications in VS Code.

## Features

Code Mantra helps you build better coding habits by showing reminders of programming principles.

- 💡 **Multiple Triggers**: Show notifications on save, edit, open, or focus
- 🎯 **Customizable File Types**: Choose which languages to monitor
- 🔧 **Flexible Configuration**: Easy setup via VS Code settings
- 🚫 **Exclude Patterns**: Ignore specific files or directories
- 📚 **Built-in Presets**: Pragmatic Programmer principles (ETC, DRY)
- ⚙️ **Smart Notifications**: Automatic rate limiting to avoid spam

## Usage

### Default Behavior

When you save a file, Code Mantra will randomly show one of the configured principle reminders:

- "ETC? (Easier To Change?)" - Is your code easy to change?
- "DRY? (Don't Repeat Yourself)" - Are you avoiding repetition?

## Configuration

Open VS Code settings (`Ctrl+,` or `Cmd+,`) and search for "Code Mantra".

### Enable/Disable

```json
{
  "codeMantra.enabled": true
}
```

### Triggers

Configure when notifications should appear:

```json
{
  "codeMantra.triggers": {
    "onSave": {
      "enabled": true
    },
    "onEdit": {
      "enabled": false,
      "delay": 5000
    },
    "onOpen": {
      "enabled": false
    },
    "onFocus": {
      "enabled": false
    }
  }
}
```

**Available Triggers:**

- `onSave`: Show notification when saving files (default: enabled)
- `onEdit`: Show notification while editing after a delay (default: disabled, 5 seconds delay)
- `onOpen`: Show notification when opening files (default: disabled)
- `onFocus`: Show notification when editor gains focus (default: disabled)

### File Types

Specify which programming languages to show notifications for:

```json
{
  "codeMantra.fileTypes": [
    "typescript",
    "javascript",
    "python",
    "java",
    "go",
    "rust"
  ]
}
```

**Supported Language IDs:**
TypeScript, JavaScript, Python, Java, Go, Rust, C, C++, C#, HTML, CSS, SCSS, Vue, Ruby, PHP, Swift, Kotlin, Dart, YAML, JSON

### Exclude Patterns

Exclude specific files or directories from notifications:

```json
{
  "codeMantra.excludePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.git/**"
  ]
}
```

### Custom Rules

Add your own rules in `settings.json`:

```json
{
  "codeMantra.rules": [
    {
      "trigger": "onSave",
      "message": "ETC? (Easier To Change?)",
      "filePattern": "**/*.{ts,js,tsx,jsx}"
    },
    {
      "trigger": "onSave",
      "message": "Single Responsibility?",
      "filePattern": "**/*.{ts,js}"
    }
  ]
}
```

## Installation

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for "Code Mantra"
4. Click Install

## Development

```bash
# Install dependencies
npm install

# Run extension in debug mode
# Press F5 in VS Code
```

## Publishing

This project uses GitHub Actions for automated releases and marketplace publishing.

### Release Workflow (GitHub Release Only)

Triggered by `v*` tags (e.g., `v0.1.0`):

```bash
# 1. Update version in package.json and CHANGELOG.md
# 2. Commit changes
git add -A && git commit -m "Release v0.1.0"

# 3. Create and push tag (triggers release.yml)
git tag v0.1.0
git push origin v0.1.0
```

This creates a GitHub Release with the packaged VSIX file.

### Publish Workflow (GitHub Release + Marketplace)

Triggered by `v*-publish` tags (e.g., `v0.1.0-publish`):

```bash
# After creating a GitHub Release with v0.1.0,
# trigger marketplace publish with:
git tag v0.1.0-publish
git push origin v0.1.0-publish
```

This creates a GitHub Release and publishes to VS Code Marketplace.

### Workflows

- **release.yml**: `v*` tags → GitHub Release (VSIX attached)
- **publish.yml**: `v*-publish` tags → GitHub Release + Marketplace publish

## Roadmap

- [x] Add extension icon (128x128 PNG)
- [ ] Add demo GIF to README
- [ ] Support more file types
- [ ] Add custom message frequency settings
- [ ] Dark/light mode icons

## License

MIT

## Inspiration

Inspired by "The Pragmatic Programmer" by David Thomas and Andrew Hunt.
