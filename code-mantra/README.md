# Code Mantra

Remind yourself of programming principles with customizable notifications in VS Code.

## Features

Code Mantra helps you build better coding habits by showing reminders of programming principles when you save files.

- 💡 Customizable notification rules
- 🎯 File pattern matching (TypeScript, JavaScript, Python, etc.)
- 🔧 Easy configuration via VS Code settings
- 📚 Built-in presets: Pragmatic Programmer principles (ETC, DRY)

## Usage

### Default Behavior

When you save a file, Code Mantra will randomly show one of the configured principle reminders:

- "ETC? (Easier To Change?)" - Is your code easy to change?
- "DRY? (Don't Repeat Yourself)" - Are you avoiding repetition?

### Configuration

Open VS Code settings (`Ctrl+,` or `Cmd+,`) and search for "Code Mantra".

#### Enable/Disable

```json
{
  "codeMantra.enabled": true
}
```

#### Custom Rules

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

#### Supported File Patterns

- TypeScript: `**/*.{ts,tsx}`
- JavaScript: `**/*.{js,jsx}`
- Python: `**/*.py`
- Java: `**/*.java`
- Go: `**/*.go`
- Rust: `**/*.rs`
- C/C++: `**/*.{c,cpp}`
- C#: `**/*.cs`

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

- [ ] Add extension icon (128x128 PNG)
- [ ] Add demo GIF to README
- [ ] Support more file types
- [ ] Add custom message frequency settings
- [ ] Dark/light mode icons

## License

MIT

## Inspiration

Inspired by "The Pragmatic Programmer" by David Thomas and Andrew Hunt.
