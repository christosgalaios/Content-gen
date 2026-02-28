const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
} as const;

function timestamp(): string {
  return new Date().toISOString().slice(11, 19);
}

export const log = {
  info(msg: string) {
    console.log(`${COLORS.dim}[${timestamp()}]${COLORS.reset} ${COLORS.blue}INFO${COLORS.reset}  ${msg}`);
  },

  success(msg: string) {
    console.log(`${COLORS.dim}[${timestamp()}]${COLORS.reset} ${COLORS.green}OK${COLORS.reset}    ${msg}`);
  },

  warn(msg: string) {
    console.log(`${COLORS.dim}[${timestamp()}]${COLORS.reset} ${COLORS.yellow}WARN${COLORS.reset}  ${msg}`);
  },

  error(msg: string) {
    console.error(`${COLORS.dim}[${timestamp()}]${COLORS.reset} ${COLORS.red}ERR${COLORS.reset}   ${msg}`);
  },

  stage(name: string) {
    console.log(
      `\n${COLORS.bright}${COLORS.magenta}━━━ STAGE: ${name.toUpperCase()} ━━━${COLORS.reset}\n`
    );
  },

  progress(current: number, total: number, label: string) {
    const pct = Math.round((current / total) * 100);
    const bar = "█".repeat(Math.round(pct / 5)) + "░".repeat(20 - Math.round(pct / 5));
    process.stdout.write(
      `\r${COLORS.dim}[${timestamp()}]${COLORS.reset} ${COLORS.cyan}${bar}${COLORS.reset} ${pct}% ${label}`
    );
    if (current === total) console.log(); // newline when done
  },

  divider() {
    console.log(`${COLORS.dim}${"─".repeat(60)}${COLORS.reset}`);
  },
};
