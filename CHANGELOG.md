# Change Log

All notable changes to the "code-mantra" extension will be documented in this file.

## [Unreleased]

### Added

- Time-based notifications feature for interval reminders
- TimerManager class for managing recurring notification timers
- Support for multiple simultaneous timers with independent durations
- Pomodoro Technique timer support (25-minute intervals)
- Work break reminders (50-minute intervals by default)
- Custom timer intervals (1-120 minutes)
- Auto-reset functionality on specific events (save, focus)
- Comprehensive time-based notification configuration schema with table-based UI
- Tests for TimerManager class (5 test cases covering start/stop, multiple timers, reset, disabled timers, and timer restart)

### Improved

- Enhanced documentation with time-based notifications section in README.md and README.ja.md
- Added detailed timer type descriptions and reset event explanations

## [1.0.5] - 2025-10-26

### Added

- Enabled Markdown/MDX in the default `codeMantra.fileTypes` so documentation workflows receive reminders out of the box

### Improved

- Enriched settings schema descriptions with trigger and rule tables for a clearer configuration experience in VS Code

## [1.0.4] - 2025-10-26

### Fixed

- Moved extension icon to repository root and updated manifest so VS Code Marketplace correctly displays the image

## [1.0.3] - 2025-10-26

### Fixed

- Fixed icon image display in VS Code Marketplace (updated .vscodeignore to ensure icon is packaged)
- Ensured all necessary files are included in the marketplace package

### Improved

- Better packaging configuration for release

## [1.0.1] - 2025-01-24

### Added

- Multiple trigger support: onSave, onEdit, onOpen, onFocus
- TriggerManager class for centralized event management
- Configuration options for each trigger type (enabled/disabled, delay)
- Support for 25 programming languages (added: HTML, CSS, SCSS, Sass, Less, Vue, Svelte, Ruby, PHP, Swift, Kotlin, Dart, YAML, JSON)
- Exclude patterns with glob pattern matching
- Smart notifications with rate limiting (3 second minimum interval)
- Comprehensive test suite (9 tests total: 4 TriggerManager tests, 5 extension tests)

### Changed

- Refactored extension.ts to use TriggerManager architecture
- Updated README.md with comprehensive documentation (Features, Triggers, File Types, Exclude Patterns sections)
- Configuration now uses nested triggers object instead of flat structure
- Improved notification logic with debouncing (onEdit) and rate limiting

## [1.0.0] - 2025-10-26

### Changed

- Updated publisher to hirokimukai
- Fixed test suite extension ID references
- Added CI/CD workflows for automated releases
- Added proper permissions to GitHub Actions workflows

## [0.1.0] - 2025-10-25

### Added

- Initial release
- File save notification feature
- Customizable rules via settings
- Default presets: ETC (Easier To Change), DRY (Don't Repeat Yourself)
- Support for TypeScript, JavaScript, Python, Java, Go, Rust, C/C++, C#
- Configuration schema in VS Code settings
- Basic unit tests
- Comprehensive README and documentation
- Extension icon (128x128 PNG)
