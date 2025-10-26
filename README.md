# Code Mantra

[English](./README.md) | [日本語](./README.ja.md)

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

### Using VS Code Settings UI (Recommended)

1. Open VS Code Settings:
   - **Windows/Linux**: `Ctrl+,` or File → Preferences → Settings
   - **macOS**: `Cmd+,` or Code → Settings → Settings
2. Search for "Code Mantra" in the search box
3. Configure options using checkboxes, text inputs, and dropdowns:
   - **Enable/Disable**: Toggle the main switch
   - **Triggers**: Use checkboxes to enable/disable each trigger type
   - **Edit Delay**: Adjust the delay slider (1000-10000ms)
   - **File Types**: Add/remove language IDs from the list
   - **Exclude Patterns**: Add glob patterns to exclude files

### Using settings.json (Advanced)

Alternatively, you can edit `settings.json` directly:

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

| Trigger   | When it fires                 | Recommended use                                               |
| --------- | ----------------------------- | ------------------------------------------------------------- |
| `onSave`  | After saving a file           | Best default option before committing changes.                |
| `onEdit`  | While editing (after a delay) | Gentle nudges without interrupting flow thanks to debouncing. |
| `onOpen`  | As soon as a file opens       | Kick off work with a reminder when you start editing.         |
| `onFocus` | When the editor gains focus   | Helpful when switching between files or windows.              |

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
    "rust",
    "markdown"
  ]
}
```

**Supported Language IDs:**

- Web: `typescript`, `javascript`, `html`, `css`, `scss`, `vue`, `svelte`
- Systems: `rust`, `go`, `c`, `cpp`, `csharp`
- Mobile: `swift`, `kotlin`, `dart`
- General: `python`, `java`, `ruby`, `php`
- Data: `yaml`, `json`
- Docs: `markdown`, `mdx`

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

| Property      | Purpose                                                 | Notes                                                    |
| ------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| `trigger`     | Matches one of `onSave`, `onEdit`, `onOpen`, `onFocus`. | Aligns with the triggers table above.                    |
| `message`     | Text shown in the notification toast.                   | Keep it short and actionable.                            |
| `filePattern` | Optional glob to scope the rule.                        | Example: `**/*.md` (defaults to all files when omitted). |

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
