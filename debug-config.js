// Debug script to check VS Code configuration
const fs = require("fs");
const os = require("os");
const path = require("path");

const settingsPath = path.join(
  os.homedir(),
  "Library/Application Support/Code - Insiders/User/settings.json"
);

console.log("Reading settings from:", settingsPath);

try {
  const content = fs.readFileSync(settingsPath, "utf8");
  const lines = content.split("\n");

  let inCodeMantra = false;
  let braceCount = 0;
  const codeMantraLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('"codeMantra')) {
      inCodeMantra = true;
    }

    if (inCodeMantra) {
      codeMantraLines.push(`${i + 1}: ${line}`);

      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;
      braceCount += (line.match(/\[/g) || []).length;
      braceCount -= (line.match(/\]/g) || []).length;

      if (braceCount === 0 && line.includes(",")) {
        inCodeMantra = false;
      }
    }
  }

  console.log("\n=== Code Mantra Configuration ===");
  console.log(codeMantraLines.join("\n"));

  // Try to parse as JSON
  const jsonMatch = content.match(
    /"codeMantra\.[^"]+"\s*:\s*(\{[^}]*\}|\[[^\]]*\]|[^,\n]+)/g
  );
  if (jsonMatch) {
    console.log("\n=== Parsed Values ===");
    jsonMatch.forEach((m) => console.log(m));
  }
} catch (error) {
  console.error("Error reading settings:", error.message);
}
