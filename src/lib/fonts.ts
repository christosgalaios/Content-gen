import { loadFont } from "@remotion/google-fonts/Montserrat";

// Load Montserrat with all weights needed for viral video text
const { fontFamily } = loadFont("normal", {
  weights: ["700", "800", "900"],
  subsets: ["latin"],
});

export const FONTS = {
  display: fontFamily,
  body: "Inter, sans-serif",
} as const;
