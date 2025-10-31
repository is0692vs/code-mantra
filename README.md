# Code Mantra

[![Version](https://img.shields.io/visual-studio-marketplace/v/hirokimukai.code-mantra?style=flat-square&label=VS%20Code%20Marketplace&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=hirokimukai.code-mantra)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/hirokimukai.code-mantra?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=hirokimukai.code-mantra)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/hirokimukai.code-mantra?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=hirokimukai.code-mantra)
[![License](https://img.shields.io/github/license/is0692vs/code-mantra?style=flat-square)](./LICENSE)

[English](./README.md) | [日本語](./README.ja.md)

> Remind yourself of programming principles with customizable notifications in VS Code.

Code Mantra helps you build better coding habits by showing timely reminders of programming principles while you code. Whether you're a beginner learning best practices or an experienced developer who wants gentle nudges to maintain code quality, Code Mantra keeps important principles top of mind.

<!-- TODO: Add demo GIF or screenshot here -->
<!-- ![Code Mantra in action](./images/demo.gif) -->

## ✨ Features

### 🔔 Multiple Trigger Types

Show notifications when you need them:

- **On Save** (recommended) - Get reminders before committing changes
- **On Edit** - Gentle nudges while coding with configurable debouncing
- **On Open** - Start each file with a principle reminder
- **On Focus** - Get refreshed when switching between files

### ⏰ Time-Based Notifications

Stay healthy and productive with periodic reminders:

- **Work Break Reminders** - Regular intervals to step away from your screen
- **Pomodoro Timer** - Built-in 25-minute work session support
- **Custom Timers** - Create your own interval patterns
- **Auto-Reset** - Optionally reset timers on file save or focus events

### 🎯 Smart Targeting

- **25+ Programming Languages** - Support for all major languages
- **Glob Pattern Exclusions** - Easily ignore node_modules, dist, and other directories
- **Custom File Patterns** - Target specific file types with your own rules
- **Rate Limiting** - Automatic spam prevention (minimum 3-second intervals)

### 🧭 Trigger Management Panel

Manage every reminder visually from the dedicated **Code Mantra** activity bar panel:

- **Tree View Overview** - See all active triggers grouped by type at a glance
- **Inline Actions** - Edit, enable/disable, reorder, or delete without leaving the panel
- **Quick Add** - Use the ➕ button or command palette (`Code Mantra: Add Trigger`) to create new rules with guided validation
- **One-Click Refresh** - Keep the list in sync after manual `settings.json` edits using the 🔄 action

### 📚 Built-in Wisdom

Pre-configured reminders from "The Pragmatic Programmer":

- **ETC** - Easier To Change?
- **DRY** - Don't Repeat Yourself
- **Add Your Own** - Fully customizable message system

## 🚀 Quick Start

1. **Install the extension** from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=hirokimukai.code-mantra)

2. **Start coding** - Code Mantra works out of the box with sensible defaults!

3. **Customize (optional)** - Open VS Code Settings (`Ctrl/Cmd + ,`) and search for "Code Mantra" to personalize your experience

### First-Time Setup

By default, Code Mantra will show reminders when you **save files** in any supported programming language. This is the recommended setting for most users.

To enable additional features:

- ⏰ **Enable time-based notifications** for work break reminders
- ✏️ **Enable edit triggers** for real-time coding reminders
- 🎨 **Customize messages** to match your coding philosophy

## 🙌 Join the Community

- ⭐ **Star the repo** to help more developers discover Code Mantra
- 🐞 **Report issues** with reproduction steps so we can fix problems fast
- 💡 **Request features** or share workflows that would make the extension better
- 🤝 **Open pull requests**—we love collaborating on improvements
- 📝 **Leave a Marketplace review** once Code Mantra boosts your habits

## Usage

### Default Behavior

When you save a file, Code Mantra will randomly show one of the configured principle reminders:

- "ETC? (Easier To Change?)" - Is your code easy to change?
- "DRY? (Don't Repeat Yourself)" - Are you avoiding repetition?

### Manage Triggers Visually

1. Open the **Code Mantra** item in the VS Code activity bar.
2. Use the **Triggers** tree view to see every configured rule and timer.
3. Hover over a trigger to reveal inline actions for edit, toggle, move, or delete.
4. Click the **Add Trigger** button to launch guided dialogs with input validation.

### Run a Test Notification

Open the Command Palette and run `Code Mantra: Test Notification` to preview how toasts will appear in your editor.

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

| Trigger              | When it fires                      | Recommended use                                               |
| -------------------- | ---------------------------------- | ------------------------------------------------------------- |
| `onSave`             | After saving a file                | Best default option before committing changes.                |
| `onEdit`             | While editing (after a delay)      | Gentle nudges without interrupting flow thanks to debouncing. |
| `onOpen`             | As soon as a file opens            | Kick off work with a reminder when you start editing.         |
| `onFocus`            | When the editor gains focus        | Helpful when switching between files or windows.              |
| `onCreate`           | When a new file is created         | Ask clarifying questions about file naming and structure.     |
| `onDelete`           | When a file is deleted             | Remind about dependencies and related cleanup tasks.          |
| `onLargeDelete`      | When deleting many lines at once   | Alert when making significant deletions (configurable lines). |
| `onFileSizeExceeded` | When a file grows beyond threshold | Remind to refactor when files become too large.               |

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
      "trigger": "onCreate",
      "message": "Is the file name clear and descriptive?",
      "filePattern": "**/*.{ts,js}"
    },
    {
      "trigger": "onDelete",
      "message": "Have you checked related dependencies?",
      "filePattern": "**/*"
    },
    {
      "trigger": "onLargeDelete",
      "message": "Big deletion - Did you really want to remove all that?",
      "filePattern": "**/*.{ts,js,tsx,jsx}",
      "deletionThreshold": 100
    },
    {
      "trigger": "onFileSizeExceeded",
      "message": "This file is getting large - Consider refactoring.",
      "filePattern": "**/*.{ts,js,tsx,jsx}",
      "lineSizeThreshold": 300
    }
  ]
}
```

| Property            | Purpose                                                                               | Notes                                                    |
| ------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `trigger`           | Matches one of the available trigger types                                            | Determines when the notification shows.                  |
| `message`           | Text shown in the notification toast.                                                 | Keep it short and actionable.                            |
| `filePattern`       | Optional glob to scope the rule.                                                      | Example: `**/*.md` (defaults to all files when omitted). |
| `deletionThreshold` | For `onLargeDelete`: minimum number of lines to trigger (default: 100)                | Range: 1-10000 lines                                     |
| `lineSizeThreshold` | For `onFileSizeExceeded`: line count threshold to trigger notification (default: 300) | Range: 1-10000 lines                                     |

### Time-Based Notifications

Code Mantra can show notifications at regular time intervals to remind you to take breaks or follow the Pomodoro Technique:

```json
{
  "codeMantra.timeBasedNotifications": {
    "enabled": true,
    "intervals": [
      {
        "duration": 50,
        "message": "💡 Time to take a break! Step away from your screen.",
        "type": "workBreak",
        "enabled": true
      },
      {
        "duration": 25,
        "message": "🍅 Pomodoro complete! Take a short break.",
        "type": "pomodoro",
        "enabled": false
      }
    ],
    "resetOn": ["save"]
  }
}
```

**Features:**

- ⏰ **Multiple Timers**: Run multiple independent timers simultaneously
- 🔄 **Auto-Reset**: Optionally reset timers on specific events (save, focus)
- 🍅 **Pomodoro Support**: Built-in support for Pomodoro Technique (25 min intervals)
- 💼 **Work Break Reminders**: Long-form work session reminders (50 min default)
- 🎨 **Custom Intervals**: Define your own timing patterns

**Timer Types:**

| Type        | Description                      | Typical Duration |
| ----------- | -------------------------------- | ---------------- |
| `workBreak` | Standard work break reminder     | 50 minutes       |
| `pomodoro`  | Pomodoro Technique timer         | 25 minutes       |
| `custom`    | Your own custom interval pattern | 1-120 minutes    |

**Reset Events:**

- `save`: Reset all timers when you save a file (keeps you in flow)
- `focus`: Reset all timers when the editor gains focus

**Tip:** Enable `resetOn: ["save"]` to avoid interruptions during deep work sessions. Your timers will automatically restart each time you save, keeping you in the zone!

## Installation

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for "Code Mantra"
4. Click Install

## 🛠 Troubleshooting

1. **Reset your settings**

- Open `Preferences: Open Settings (JSON)` from the Command Palette
- Remove any `codeMantra.*` entries to return to the defaults
- Save the file and reload VS Code (`Developer: Reload Window`)

2. **Reinstall the extension**

- Uninstall Code Mantra from the Extensions view
- Close all VS Code windows, then reinstall from the Marketplace listing

3. **Still stuck? Open an issue**

- Create a new ticket at [github.com/is0692vs/code-mantra/issues](https://github.com/is0692vs/code-mantra/issues)
- Include your VS Code version, Code Mantra version, relevant `settings.json` snippet, and any log output

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

## 🗺️ Roadmap

- [x] Add extension icon (128x128 PNG)
- [x] Time-based notifications with multiple timers
- [x] Auto-reset timers on events
- [ ] Add demo GIF to README
- [ ] Support more file types
- [ ] Custom notification sounds
- [ ] Statistics dashboard (track your coding habits)
- [ ] Dark/light mode icons
- [ ] AI-powered principle suggestions

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs** - [Open an issue](https://github.com/is0692vs/code-mantra/issues) with detailed information
2. **Suggest Features** - Share your ideas for new features or improvements
3. **Submit Pull Requests** - Fix bugs or implement new features

### Development Setup

```bash
# Clone the repository
git clone https://github.com/is0692vs/code-mantra.git
cd code-mantra

# Install dependencies
npm install

# Run in debug mode
# Press F5 in VS Code to launch Extension Development Host

# Run tests
npm test
```

### Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

## 💡 Inspiration

Inspired by "The Pragmatic Programmer" by David Thomas and Andrew Hunt.

## 🙏 Acknowledgments

- Thanks to all contributors who help make Code Mantra better
- Special thanks to the VS Code extension community for best practices and guidance

---

**Enjoying Code Mantra?** Consider [leaving a review](https://marketplace.visualstudio.com/items?itemName=hirokimukai.code-mantra&ssr=false#review-details) or [starring the repo](https://github.com/is0692vs/code-mantra)! ⭐
