// Brand colors (mirrors tailwind.config.js for use in inline styles)
export const COLORS = {
  primary: "#FF6B35",
  secondary: "#004E89",
  accent: "#F7C948",
  dark: "#1A1A2E",
  light: "#F5F5F5",
  white: "#FFFFFF",
  black: "#000000",
} as const;

// Video dimensions
export const TIKTOK = { width: 1080, height: 1920 } as const;
export const FPS = 30;

// Safe zone: TikTok UI covers edges
export const SAFE_ZONE = {
  horizontal: 54, // 5% of 1080
  top: 192, // 10% of 1920
  bottom: 288, // 15% of 1920
} as const;

// Standard durations in frames (at 30fps)
export const DURATIONS = {
  flash: 4, // ~0.13s
  quickCut: 15, // 0.5s
  shortScene: 30, // 1.0s
  mediumScene: 45, // 1.5s
  longScene: 60, // 2.0s
} as const;

// Font sizes (pixel values for 1080-wide canvas)
export const FONT_SIZES = {
  hookTitle: 96,
  headline: 72,
  body: 56,
  caption: 48,
  small: 36,
} as const;
