# Change Log

All notable changes to the "code-mantra" extension will be documented in this file.

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
