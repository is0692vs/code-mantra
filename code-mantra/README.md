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

## License

MIT

## Inspiration

Inspired by "The Pragmatic Programmer" by David Thomas and Andrew Hunt.
