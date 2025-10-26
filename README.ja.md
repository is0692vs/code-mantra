# Code Mantra

[English](./README.md) | [日本語](./README.ja.md)

VS Code でカスタマイズ可能な通知によるプログラミング原則のリマインダー拡張機能。

## 機能

- **複数のトリガー**: ファイル保存時、編集中、ファイルオープン時、フォーカス時に通知
- **カスタマイズ可能なファイルタイプ**: 25 種類以上のプログラミング言語をサポート
- **除外パターン**: グロブパターンで特定のファイル/ディレクトリを除外
- **編集トリガーのデバウンス**: 指定した遅延後に通知を表示（デフォルト 5 秒）
- **レート制限**: 短時間に過度な通知を防止（最小 3 秒間隔）
- **設定駆動**: VS Code 設定で完全にカスタマイズ可能

## 設定方法

### VS Code 設定 UI を使用する方法（推奨）

1. VS Code 設定を開く：
   - **Windows/Linux**: `Ctrl+,` またはファイル → 設定 → 設定
   - **macOS**: `Cmd+,` または Code → 設定 → 設定
2. 検索ボックスで「Code Mantra」を検索
3. チェックボックス、テキスト入力、ドロップダウンを使用して設定：
   - **有効/無効**: メインスイッチをトグル
   - **トリガー**: 各トリガータイプのチェックボックスで有効/無効を切り替え
   - **編集遅延**: 遅延スライダーを調整（1000-10000 ミリ秒）
   - **ファイルタイプ**: リストから言語 ID を追加/削除
   - **除外パターン**: 除外するファイルのグロブパターンを追加

### settings.json を使用する方法（上級者向け）

または、`settings.json`を直接編集することもできます：

```json
{
  "codeMantra.enabled": true,
  "codeMantra.triggers": {
    "onSave": {
      "enabled": true
    },
    "onEdit": {
      "enabled": true,
      "delay": 5000
    },
    "onOpen": {
      "enabled": false
    },
    "onFocus": {
      "enabled": false
    }
  },
  "codeMantra.fileTypes": ["typescript", "javascript", "python", "rust", "go"],
  "codeMantra.excludePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**"
  ]
}
```

## トリガータイプ

| トリガー       | タイミング                     | 推奨用途                                                             |
| -------------- | ------------------------------ | -------------------------------------------------------------------- |
| **onSave** ✅  | ファイル保存時                 | ほとんどのユーザーに推奨。コードをコミットする前のリマインダーに最適 |
| **onEdit** ⏱️  | 編集中（遅延あり）             | 積極的なリマインダー用。デバウンスされているため邪魔になりません     |
| **onOpen** 📂  | ファイルを開いたとき           | ファイルの作業開始時にリマインダーを取得                             |
| **onFocus** 🎯 | エディタがフォーカスを得たとき | ファイルやウィンドウを切り替えるときにリマインダーを取得             |

### トリガー設定の詳細

```json
{
  "codeMantra.triggers": {
    "onSave": {
      "enabled": true // ファイル保存時に通知を表示
    },
    "onEdit": {
      "enabled": true,
      "delay": 5000 // 編集停止後5秒待ってから通知（最小1000ミリ秒）
    },
    "onOpen": {
      "enabled": false // ファイルを開いたときの通知を無効
    },
    "onFocus": {
      "enabled": false // エディタのフォーカス時の通知を無効
    }
  }
}
```

## ファイルタイプ

次の言語 ID をサポート：

```json
{
  "codeMantra.fileTypes": [
    "typescript",
    "javascript",
    "typescriptreact",
    "javascriptreact",
    "python",
    "rust",
    "go",
    "java",
    "csharp",
    "cpp",
    "c",
    "ruby",
    "php",
    "swift",
    "kotlin",
    "dart",
    "html",
    "css",
    "scss",
    "sass",
    "less",
    "vue",
    "svelte",
    "yaml",
    "json",
    "markdown",
    "mdx"
  ]
}
```

**使用可能な言語 ID:**

- **Web 開発**: `typescript`, `javascript`, `html`, `css`, `scss`, `vue`, `svelte`
- **システムプログラミング**: `rust`, `go`, `c`, `cpp`, `csharp`
- **モバイル開発**: `swift`, `kotlin`, `dart`
- **汎用**: `python`, `java`, `ruby`, `php`
- **設定/データ**: `yaml`, `json`
- **ドキュメント**: `markdown`, `mdx`

必要に応じてこのリストから言語を追加または削除できます。

## 除外パターン

グロブパターンを使用してファイルやディレクトリを除外：

```json
{
  "codeMantra.excludePatterns": [
    "**/node_modules/**", // node_modulesを除外
    "**/dist/**", // ビルド出力を除外
    "**/build/**", // ビルドディレクトリを除外
    "**/.git/**", // Gitディレクトリを除外
    "**/*.test.ts", // テストファイルを除外
    "**/vendor/**" // ベンダーディレクトリを除外
  ]
}
```

**グロブパターン構文:**

- `**` - 任意の数のディレクトリに一致
- `*` - `/`以外の任意の文字に一致
- `?` - 任意の 1 文字に一致
- `[abc]` - 文字集合に一致
- `{js,ts}` - パターン代替に一致

## 使用方法

1. 拡張機能をインストール
2. VS Code 設定で Code Mantra を設定
3. 通知を表示したいプログラミング言語でファイルを開く
4. 有効なトリガー（保存、編集、オープン、フォーカス）を実行
5. プログラミング原則のリマインダー通知を受け取る

### 時間ベースの通知

Code Mantra は、定期的な時間間隔で通知を表示し、休憩を促したり、ポモドーロテクニックをサポートしたりできます：

```json
{
  "codeMantra.timeBasedNotifications": {
    "enabled": true,
    "intervals": [
      {
        "duration": 50,
        "message": "💡 休憩の時間です！画面から離れましょう。",
        "type": "workBreak",
        "enabled": true
      },
      {
        "duration": 25,
        "message": "🍅 ポモドーロ完了！短い休憩を取りましょう。",
        "type": "pomodoro",
        "enabled": false
      }
    ],
    "resetOn": ["save"]
  }
}
```

**機能:**

- ⏰ **複数のタイマー**: 複数の独立したタイマーを同時実行
- 🔄 **自動リセット**: 特定のイベント（保存、フォーカス）でタイマーをリセット
- 🍅 **ポモドーロサポート**: ポモドーロテクニック用の組み込みサポート（25 分間隔）
- 💼 **作業休憩リマインダー**: 長時間作業セッション用のリマインダー（デフォルト 50 分）
- 🎨 **カスタム間隔**: 独自のタイミングパターンを定義

**タイマータイプ:**

| タイプ      | 説明                         | 一般的な時間 |
| ----------- | ---------------------------- | ------------ |
| `workBreak` | 標準的な作業休憩リマインダー | 50 分        |
| `pomodoro`  | ポモドーロテクニックタイマー | 25 分        |
| `custom`    | カスタム間隔パターン         | 1-120 分     |

**リセットイベント:**

- `save`: ファイル保存時にすべてのタイマーをリセット（フロー状態を維持）
- `focus`: エディタがフォーカスを得たときにすべてのタイマーをリセット

**ヒント:** `resetOn: ["save"]` を有効にすると、深い作業セッション中の中断を回避できます。保存するたびにタイマーが自動的に再スタートし、集中力を維持できます！

## インストール

### VS Code Marketplace から（公開後）

1. VS Code を開く
2. 拡張機能ビューを開く（`Ctrl+Shift+X` または `Cmd+Shift+X`）
3. 「Code Mantra」を検索
4. インストールをクリック

### VSIX から（開発版）

```bash
# リポジトリをクローン
git clone https://github.com/is0692vs/code-mantra.git
cd code-mantra/code-mantra

# 依存関係をインストール
npm install

# 拡張機能をパッケージ化
npx @vscode/vsce package

# インストール
code --install-extension code-mantra-*.vsix
```

## 開発

```bash
# 依存関係をインストール
npm install

# コンパイル
npm run compile

# 監視モード
npm run watch

# テスト実行
npm test

# パッケージ化
npx @vscode/vsce package
```

## カスタムルール（高度な使用方法）

特定のファイルパターンに対してカスタムルールを作成：

```json
{
  "codeMantra.rules": [
    {
      "trigger": "onSave",
      "message": "APIを変更しましたか？ドキュメントを更新してください！",
      "filePattern": "**/api/**/*.ts"
    },
    {
      "trigger": "onEdit",
      "message": "テストを書くことを忘れないでください！",
      "filePattern": "**/*.test.ts"
    }
  ]
}
```

| プロパティ    | 目的                                                        | 補足                                          |
| ------------- | ----------------------------------------------------------- | --------------------------------------------- |
| `trigger`     | `onSave` / `onEdit` / `onOpen` / `onFocus` のいずれかを指定 | 上のトリガーテーブルと合わせて設定            |
| `message`     | 通知に表示するテキスト                                      | 短く行動を促すメッセージがおすすめ            |
| `filePattern` | 適用するファイルを絞るグロブパターン（任意）                | 例: `**/*.md`。未設定の場合は全ファイルに適用 |

## 技術仕様

- **デバウンス**: 編集トリガーは設定可能な遅延でデバウンスされます（デフォルト 5000 ミリ秒、最小 1000 ミリ秒）
- **レート制限**: 過度な通知を防ぐため、通知は最小 3 秒間隔で制限されます
- **トリガーマネージャー**: すべてのトリガータイプの統一イベント管理
- **グロブマッチング**: ファイル除外に`minimatch`ライブラリを使用

## ライセンス

MIT

## 貢献

貢献を歓迎します！問題の報告やプルリクエストの送信は GitHub リポジトリで受け付けています。

## 変更履歴

変更履歴の詳細は[CHANGELOG.md](./CHANGELOG.md)を参照してください。
