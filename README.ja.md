# Code Mantra

[![Version](https://img.shields.io/visual-studio-marketplace/v/hirokimukai.code-mantra?style=flat-square&label=VS%20Code%20Marketplace&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=hirokimukai.code-mantra)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/hirokimukai.code-mantra?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=hirokimukai.code-mantra)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/hirokimukai.code-mantra?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=hirokimukai.code-mantra)
[![License](https://img.shields.io/github/license/is0692vs/code-mantra?style=flat-square)](./LICENSE)

[English](./README.md) | [日本語](./README.ja.md)

> VS Code でカスタマイズ可能な通知によるプログラミング原則のリマインダー拡張機能。

Code Mantra は、コーディング中にプログラミング原則のタイムリーなリマインダーを表示することで、より良いコーディング習慣の構築を支援します。ベストプラクティスを学んでいる初心者でも、コード品質を維持したい経験豊富な開発者でも、Code Mantra は重要な原則を常に意識できるようにします。

<!-- TODO: デモGIFまたはスクリーンショットを追加 -->
<!-- ![Code Mantra の動作](./images/demo.gif) -->

## ✨ 機能

### 🔔 複数のトリガータイプ

必要なタイミングで通知を表示:

- **保存時**(推奨) - 変更をコミットする前にリマインダーを取得
- **編集時** - 設定可能なデバウンスでコーディング中に優しくリマインド
- **オープン時** - 各ファイルを原則のリマインダーで開始
- **フォーカス時** - ファイル間を切り替えるときにリフレッシュ

### ⏰ 時間ベースの通知

定期的なリマインダーで健康的で生産的に:

- **作業休憩リマインダー** - 画面から離れるための定期的な間隔
- **ポモドーロタイマー** - 25 分作業セッションの組み込みサポート
- **カスタムタイマー** - 独自の間隔パターンを作成
- **自動リセット** - ファイル保存またはフォーカスイベントでタイマーをオプションでリセット

### 🎯 スマートターゲティング

- **25 種類以上のプログラミング言語** - すべての主要言語をサポート
- **グロブパターン除外** - node_modules、dist、その他のディレクトリを簡単に無視
- **カスタムファイルパターン** - 独自のルールで特定のファイルタイプをターゲット
- **レート制限** - 自動スパム防止(最小 3 秒間隔)

### 🧭 トリガーマネジメントパネル

アクティビティバーの **Code Mantra** ビューから、JSON を編集せずにすべてのリマインダーを管理できます。

- **ツリービューの一覧** - トリガーとタイマーを種類ごとに視覚的に整理
- **インライン操作** - 編集・有効化/無効化・並べ替え・削除をその場で実行
- **クイック追加** - ➕ ボタンやコマンドパレット (`Code Mantra: Add Trigger`) からガイド付きダイアログで新規作成
- **ワンクリック更新** - `settings.json` を直接編集した後は 🔄 アクションで一覧を再読み込み

### 📚 組み込みの知恵

「The Pragmatic Programmer」からの事前設定されたリマインダー:

- **ETC** - Easier To Change?(変更しやすいか?)
- **DRY** - Don't Repeat Yourself(繰り返しを避ける)
- **独自追加** - 完全にカスタマイズ可能なメッセージシステム

## 🚀 クイックスタート

1. **拡張機能をインストール** - [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=hirokimukai.code-mantra) から

2. **コーディングを開始** - Code Mantra は適切なデフォルト設定ですぐに動作します!

3. **カスタマイズ(オプション)** - VS Code 設定を開き(`Ctrl/Cmd + ,`)、「Code Mantra」を検索して体験をパーソナライズ

### 初回セットアップ

デフォルトでは、Code Mantra はサポートされているプログラミング言語で**ファイルを保存**したときにリマインダーを表示します。これはほとんどのユーザーに推奨される設定です。

追加機能を有効にするには:

- ⏰ **時間ベースの通知を有効化** - 作業休憩リマインダー用
- ✏️ **編集トリガーを有効化** - リアルタイムのコーディングリマインダー用
- 🎨 **メッセージをカスタマイズ** - コーディング哲学に合わせる

## 🙌 コミュニティに参加しよう

- ⭐ **GitHub でスター** - 多くの開発者に Code Mantra を届けるお手伝いになります
- 🐞 **バグ報告** - 再現手順と一緒に知らせていただけると迅速に対応できます
- 💡 **機能リクエスト** - こんなワークフローが欲しい！という声を歓迎します
- 🤝 **プルリクエスト** - 改善アイデアを一緒に形にしましょう
- 📝 **マーケットプレイスでレビュー** - 気に入っていただけたらレビューで応援してください

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

| トリガー        | タイミング                     | 推奨用途                                                             |
| --------------- | ------------------------------ | -------------------------------------------------------------------- |
| **onSave** ✅   | ファイル保存時                 | ほとんどのユーザーに推奨。コードをコミットする前のリマインダーに最適 |
| **onEdit** ⏱️   | 編集中（遅延あり）             | 積極的なリマインダー用。デバウンスされているため邪魔になりません     |
| **onOpen** 📂   | ファイルを開いたとき           | ファイルの作業開始時にリマインダーを取得                             |
| **onFocus** 🎯  | エディタがフォーカスを得たとき | ファイルやウィンドウを切り替えるときにリマインダーを取得             |
| **onCreate** ➕ | 新しいファイルが作成されたとき | ファイル名やファイル構造について質問する                             |
| **onDelete** 🗑️ | ファイルが削除されたとき       | 関連する依存関係や関連ファイルをチェックするよう促す                 |

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

### ビジュアルでトリガーを管理

1. VS Code のアクティビティバーから **Code Mantra** ビューを開きます。
2. **Triggers** ツリービューに、設定済みのルールとタイマーが一覧表示されます。
3. ホバーするとインラインの編集・有効/無効切り替え・並べ替え・削除ボタンが表示されます。
4. **Add Trigger** ボタンを押すと、バリデーション付きのダイアログから新規ルールを追加できます。

### テスト通知を送る

コマンドパレットで `Code Mantra: Test Notification` を実行すると、実際にどのようにトーストが表示されるか確認できます。

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

## 🛠 トラブルシューティング

1. **設定をリセットする**

- コマンドパレットで `Preferences: Open Settings (JSON)` を開きます
- `codeMantra.` で始まる設定行を削除して保存します
- `Developer: Reload Window` を実行して VS Code を再読み込みします

2. **拡張機能を再インストールする**

- 拡張機能ビューから Code Mantra をアンインストールします
- すべての VS Code ウィンドウを閉じたあと、マーケットプレイスで再インストールします

3. **解決しない場合は Issue を作成する**

- [Issue tracker](https://github.com/is0692vs/code-mantra/issues) に新規 Issue を作成してください
- VS Code / Code Mantra のバージョン、関連する `settings.json` の抜粋、表示されたエラーメッセージやログを添えていただけると助かります

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
      "trigger": "onCreate",
      "message": "ファイル名は明確で説明的ですか？",
      "filePattern": "**/*.{ts,js}"
    },
    {
      "trigger": "onDelete",
      "message": "関連する依存関係をチェックしましたか？",
      "filePattern": "**/*"
    }
  ]
}
```

| プロパティ    | 目的                                                                            | 補足                                          |
| ------------- | ------------------------------------------------------------------------------- | --------------------------------------------- |
| `trigger`     | `onSave` / `onEdit` / `onOpen` / `onFocus` / `onCreate` / `onDelete` のいずれか | 上のトリガーテーブルと合わせて設定            |
| `message`     | 通知に表示するテキスト                                                          | 短く行動を促すメッセージがおすすめ            |
| `filePattern` | 適用するファイルを絞るグロブパターン（任意）                                    | 例: `**/*.md`。未設定の場合は全ファイルに適用 |

## 技術仕様

- **デバウンス**: 編集トリガーは設定可能な遅延でデバウンスされます（デフォルト 5000 ミリ秒、最小 1000 ミリ秒）
- **レート制限**: 過度な通知を防ぐため、通知は最小 3 秒間隔で制限されます
- **トリガーマネージャー**: すべてのトリガータイプの統一イベント管理
- **グロブマッチング**: ファイル除外に`minimatch`ライブラリを使用

## 🗺️ ロードマップ

- [x] 🎨 拡張機能アイコンの追加
- [x] ⏰ 時間ベース通知の実装
- [x] 🔄 時間ベース通知の自動リセット機能
- [ ] 📸 デモスクリーンショット/GIF の追加
- [ ] 🔊 カスタムサウンド通知
- [ ] 📊 統計ダッシュボード
- [ ] 🤖 AI ベースのコンテキスト提案

## 🤝 コントリビューティング

プルリクエスト大歓迎です!主要な変更の場合は、まず issue を開いて変更したい内容を議論してください。

### お手伝いの方法

- 🐛 バグを報告 - [Issue tracker](https://github.com/is0692vs/code-mantra/issues)
- ✨ 機能をリクエスト - 新しいアイデアを共有
- 🌍 翻訳を追加 - より多くの言語でアクセス可能に
- 📖 ドキュメントを改善 - あらゆる改善が役立ちます
- 💻 コードに貢献 - プルリクエストを送信

### 開発セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/is0692vs/code-mantra.git

# 依存関係をインストール
npm install

# 開発モードで実行(F5 を押して拡張機能開発ホストを起動)
```

### ガイドライン

- TypeScript 標準に従う
- 新機能には適切なテストを追加
- コミットメッセージは明確に
- コードをプッシュする前に `npm test` を実行

## 📜 ライセンス

このプロジェクトは [MIT License](./LICENSE) の下でライセンスされています。

## 🙏 謝辞

素晴らしい VS Code コミュニティとオープンソースの貢献者の皆様に感謝します。

---

**Code Mantra は役立ちましたか?** ⭐ [GitHub](https://github.com/is0692vs/code-mantra) でスターをつけるか、[レビュー](https://marketplace.visualstudio.com/items?itemName=hirokimukai.code-mantra&ssr=false#review-details)を書いて改善にご協力ください!
