import { execSync, execFileSync } from "child_process";
import { log } from "./logger";

// Build a clean env without CLAUDECODE so the CLI doesn't refuse to start
// when invoked from within a Claude Code session.
const cleanEnv = { ...process.env };
delete cleanEnv.CLAUDECODE;

interface ClaudeRequest {
  prompt: string;
  systemPrompt?: string;
  jsonMode?: boolean;
  maxTokens?: number;
}

interface ClaudeResponse {
  text: string;
  parsed: unknown | null;
}

/**
 * Invoke Claude via the CLI tool (`claude --print`).
 * Requires Claude CLI installed and authenticated (Claude Max subscription).
 */
export function askClaude(request: ClaudeRequest): ClaudeResponse {
  const { prompt, systemPrompt, jsonMode = false } = request;

  let fullPrompt = prompt;
  if (jsonMode) {
    fullPrompt += "\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, no code fences.";
  }

  try {
    // Use claude CLI with --print for non-interactive single-shot output
    const args = ["--print", "-p", fullPrompt];

    if (systemPrompt) {
      args.push("--system-prompt", systemPrompt);
    }

    const result = execFileSync("claude", args, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024, // 10MB
      timeout: 300_000, // 5 minutes
      stdio: ["pipe", "pipe", "pipe"],
      env: cleanEnv,
    });

    const text = result.trim();

    let parsed: unknown | null = null;
    if (jsonMode) {
      try {
        // Strip any markdown code fences if Claude added them
        const cleaned = text
          .replace(/^```json\s*\n?/m, "")
          .replace(/^```\s*\n?/m, "")
          .replace(/\n?```\s*$/m, "")
          .trim();
        parsed = JSON.parse(cleaned);
      } catch {
        log.warn("Failed to parse Claude JSON response, returning raw text");
      }
    }

    return { text, parsed };
  } catch (err: any) {
    const message = err.stderr?.toString() || err.message || "Unknown error";
    log.error(`Claude CLI failed: ${message}`);
    throw new Error(`Claude CLI invocation failed: ${message}`);
  }
}

/**
 * Ask Claude to analyze images using vision.
 * Sends image file paths as arguments.
 */
export function askClaudeVision(
  prompt: string,
  imagePaths: string[],
): ClaudeResponse {
  const imageArgs = imagePaths.flatMap((p) => ["--file", p]);

  try {
    const args = ["--print", "-p", prompt, ...imageArgs];
    args.push("--allowedTools", "none");

    const result = execFileSync("claude", args, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
      timeout: 180_000, // 3 minutes for vision
      stdio: ["pipe", "pipe", "pipe"],
      env: cleanEnv,
    });

    const text = result.trim();

    let parsed: unknown | null = null;
    try {
      const cleaned = text
        .replace(/^```json\s*\n?/m, "")
        .replace(/^```\s*\n?/m, "")
        .replace(/\n?```\s*$/m, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Vision responses may not always be JSON
    }

    return { text, parsed };
  } catch (err: any) {
    const message = err.stderr?.toString() || err.message || "Unknown error";
    log.error(`Claude vision failed: ${message}`);
    throw new Error(`Claude vision invocation failed: ${message}`);
  }
}
