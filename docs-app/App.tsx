import React, { useState, useCallback, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import {
  renderMediaOnWeb,
  canRenderMediaOnWeb,
} from "@remotion/web-renderer";
import {
  REGISTRY,
  getAvailableComps,
  getCompId,
  getPlatformConfig,
  rankCompositions,
  type Platform,
  type FieldDef,
  type CompositionEntry,
} from "./compositions";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const FPS = 30;

const PLATFORM_LABELS: Record<Platform, string> = {
  tiktok: "TikTok / Reels",
  "instagram-stories": "Instagram Story",
  "instagram-posts": "Instagram Post",
};

const PLATFORM_INFO: Record<Platform, string> = {
  tiktok: "9:16 vertical \u00b7 1080\u00d71920 \u00b7 10-15s",
  "instagram-stories": "9:16 vertical \u00b7 1080\u00d71920 \u00b7 10s",
  "instagram-posts": "1:1 square \u00b7 1080\u00d71080 \u00b7 10s",
};

const SUGGESTIONS = [
  { label: "Speed friending promo", text: "promote upcoming speed friending event" },
  { label: "POV moving to Bristol", text: "pov hook about moving to Bristol and finding friends" },
  { label: "Event countdown", text: "countdown for this weekend hiking event" },
  { label: "Testimonial", text: "member testimonial social proof review" },
  { label: "Stats showcase", text: "stats showcase milestone growth community numbers" },
  { label: "Quiz / Poll", text: "quiz poll engagement which event should we run next" },
  { label: "Weekly recap", text: "weekly recap highlights of this week events" },
  { label: "Before / After", text: "before after transformation joining the group" },
];

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------
export const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [intent, setIntent] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [ranked, setRanked] = useState<ReturnType<typeof rankCompositions>>([]);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [analysisLines, setAnalysisLines] = useState<string[]>([]);
  const [analysisReady, setAnalysisReady] = useState(false);

  // Render state
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const playerRef = useRef<PlayerRef>(null);

  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------
  const goTo = useCallback((s: number) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const restart = useCallback(() => {
    setStep(1);
    setPlatform(null);
    setIntent("");
    setPicked(null);
    setRanked([]);
    setFormValues({});
    setAnalysisLines([]);
    setAnalysisReady(false);
    setRendering(false);
    setRenderProgress(0);
    setRenderError(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
  }, [downloadUrl]);

  // -----------------------------------------------------------------------
  // Step 1: Platform
  // -----------------------------------------------------------------------
  const pickPlatform = useCallback(
    (p: Platform) => {
      setPlatform(p);
      setTimeout(() => goTo(2), 150);
    },
    [goTo]
  );

  // -----------------------------------------------------------------------
  // Step 2 → 3: Analysis
  // -----------------------------------------------------------------------
  const analyze = useCallback(() => {
    if (!intent.trim() || !platform) return;
    goTo(3);
    setAnalysisReady(false);
    setAnalysisLines([]);

    const results = rankCompositions(intent, platform);
    setRanked(results);

    const available = getAvailableComps(platform);
    const lines: Array<{ delay: number; text: string }> = [
      { delay: 200, text: `> Platform: ${PLATFORM_LABELS[platform]}` },
      { delay: 500, text: `> Intent: "${intent}"` },
      { delay: 900, text: `\u2713 Scored ${available.length} compositions` },
    ];

    if (results.length > 1) {
      lines.push({ delay: 1300, text: `i Runner-up: ${results[1].id} (score ${results[1].score})` });
    }

    if (results.length > 0) {
      const best = results[0];
      lines.push({ delay: 1700, text: `\u2713 Best match: ${best.id} (score ${best.score})` });
      if (best.entry.needsPhotos) {
        lines.push({ delay: 2000, text: `i This composition needs photo assets` });
      }
      lines.push({
        delay: 2200,
        text: "---",
      });
    } else {
      lines.push({ delay: 1500, text: "i No strong match. Try being more specific." });
    }

    lines.forEach((l) => {
      setTimeout(() => {
        setAnalysisLines((prev) => [...prev, l.text]);
      }, l.delay);
    });

    // After analysis, set picked + form defaults
    if (results.length > 0) {
      const best = results[0];
      setTimeout(() => {
        setPicked(best.baseName);
        const entry = REGISTRY[best.baseName];
        const defaults: Record<string, unknown> = {};
        entry.fields.forEach((f) => {
          defaults[f.key] = JSON.parse(JSON.stringify(f.default));
        });
        setFormValues(defaults);
        setAnalysisReady(true);
      }, 2400);
    }
  }, [intent, platform, goTo]);

  // -----------------------------------------------------------------------
  // Form updates
  // -----------------------------------------------------------------------
  const updateField = useCallback((key: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateArrayItem = useCallback((key: string, index: number, value: string) => {
    setFormValues((prev) => {
      const arr = [...(prev[key] as string[])];
      arr[index] = value;
      return { ...prev, [key]: arr };
    });
  }, []);

  const removeArrayItem = useCallback((key: string, index: number) => {
    setFormValues((prev) => {
      const arr = [...(prev[key] as string[])];
      arr.splice(index, 1);
      return { ...prev, [key]: arr };
    });
  }, []);

  const addArrayItem = useCallback((key: string) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: [...(prev[key] as string[]), ""],
    }));
  }, []);

  const updateStatItem = useCallback((key: string, index: number, prop: string, value: unknown) => {
    setFormValues((prev) => {
      const arr = [...(prev[key] as Array<Record<string, unknown>>)];
      arr[index] = { ...arr[index], [prop]: value };
      return { ...prev, [key]: arr };
    });
  }, []);

  const removeStatItem = useCallback((key: string, index: number) => {
    setFormValues((prev) => {
      const arr = [...(prev[key] as Array<Record<string, unknown>>)];
      arr.splice(index, 1);
      return { ...prev, [key]: arr };
    });
  }, []);

  const addStatItem = useCallback((key: string) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: [...(prev[key] as unknown[]), { value: 0, suffix: "", label: "" }],
    }));
  }, []);

  const updateEventItem = useCallback((key: string, index: number, prop: string, value: unknown) => {
    setFormValues((prev) => {
      const arr = [...(prev[key] as Array<Record<string, unknown>>)];
      arr[index] = { ...arr[index], [prop]: value };
      return { ...prev, [key]: arr };
    });
  }, []);

  const removeEventItem = useCallback((key: string, index: number) => {
    setFormValues((prev) => {
      const arr = [...(prev[key] as Array<Record<string, unknown>>)];
      arr.splice(index, 1);
      return { ...prev, [key]: arr };
    });
  }, []);

  const addEventItem = useCallback((key: string) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: [...(prev[key] as unknown[]), { name: "", attendees: 0 }],
    }));
  }, []);

  // -----------------------------------------------------------------------
  // Step 4: Render in browser
  // -----------------------------------------------------------------------
  const startRender = useCallback(async () => {
    if (!picked || !platform) return;

    const entry = REGISTRY[picked];
    const config = getPlatformConfig(picked, platform);
    if (!entry || !config) return;

    setRendering(true);
    setRenderProgress(0);
    setRenderError(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    goTo(4);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      // Pre-flight check
      const check = await canRenderMediaOnWeb({
        width: config.width,
        height: config.height,
        container: "mp4",
      });

      if (!check.canRender) {
        setRenderError(
          "Your browser doesn't support in-browser rendering. Use Chrome 94+ for best results. " +
            (check.issues?.map((i: { message: string }) => i.message).join("; ") || "")
        );
        setRendering(false);
        return;
      }

      const { getBlob } = await renderMediaOnWeb({
        composition: {
          component: entry.component,
          durationInFrames: config.durationInFrames,
          fps: FPS,
          width: config.width,
          height: config.height,
          id: getCompId(picked, platform) || picked,
          calculateMetadata: null,
        },
        inputProps: formValues,
        container: "mp4",
        onProgress: ({ renderedFrames, encodedFrames }) => {
          setRenderProgress(renderedFrames / config.durationInFrames);
        },
        signal: abort.signal,
      });

      const blob = await getBlob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") {
        setRenderError("Render cancelled.");
      } else {
        setRenderError(`Render failed: ${(err as Error).message}`);
      }
    } finally {
      setRendering(false);
      abortRef.current = null;
    }
  }, [picked, platform, formValues, goTo, downloadUrl]);

  const cancelRender = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // -----------------------------------------------------------------------
  // Build props for output / command
  // -----------------------------------------------------------------------
  const buildCleanProps = useCallback(() => {
    if (!picked) return {};
    const entry = REGISTRY[picked];
    const props: Record<string, unknown> = {};
    entry.fields.forEach((f) => {
      const val = formValues[f.key];
      if (f.type === "array" && Array.isArray(val) && val.length === 0 && !f.required) return;
      props[f.key] = val;
    });
    return props;
  }, [picked, formValues]);

  // -----------------------------------------------------------------------
  // Current composition info
  // -----------------------------------------------------------------------
  const compId = picked && platform ? getCompId(picked, platform) : null;
  const compConfig = picked && platform ? getPlatformConfig(picked, platform) : null;
  const compEntry = picked ? REGISTRY[picked] : null;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-brand-light">
      {/* Header */}
      <header className="bg-brand-dark text-white px-6 py-3 flex items-center gap-3">
        <h1 className="text-lg font-bold">Socialise</h1>
        <span className="bg-brand-primary text-white text-xs font-semibold px-3 py-0.5 rounded-full">
          Video Generator
        </span>
        <button
          onClick={restart}
          className="ml-auto text-xs border border-white/20 rounded-md px-4 py-1.5 hover:bg-white/10 transition"
        >
          New Video
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-8">
        {/* Step dots */}
        <div className="flex gap-1 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s < step ? "bg-green-500" : s === step ? "bg-brand-primary" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* ============== STEP 1: Platform ============== */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-7 animate-fade-up">
            <h2 className="text-xl font-bold mb-1">Where are you posting?</h2>
            <p className="text-sm text-gray-500 mb-6">Pick the platform for this video.</p>
            <div className="grid grid-cols-3 gap-3">
              {(["tiktok", "instagram-stories", "instagram-posts"] as Platform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => pickPlatform(p)}
                  className={`p-5 border-2 rounded-xl text-center transition hover:border-brand-primary hover:shadow-md ${
                    platform === p ? "border-brand-primary bg-orange-50" : "border-gray-200"
                  }`}
                >
                  <div className="font-semibold">{PLATFORM_LABELS[p]}</div>
                  <div className="text-xs text-gray-500 mt-1">{PLATFORM_INFO[p]}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============== STEP 2: Describe ============== */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-7 animate-fade-up">
            <h2 className="text-xl font-bold mb-1">What's the video about?</h2>
            <p className="text-sm text-gray-500 mb-5">
              Describe what you want. Be specific — mention the event, topic, or vibe.
            </p>
            <input
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 placeholder:text-gray-300"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              placeholder='e.g. "countdown for Saturday hiking event at Leigh Woods"'
              autoFocus
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => { setIntent(s.text); }}
                  className="px-3 py-1 border border-gray-200 rounded-full text-xs text-gray-500 hover:border-brand-primary hover:text-brand-primary transition"
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={analyze}
                disabled={!intent.trim()}
                className="px-7 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-[#e55a2b] disabled:opacity-40 transition"
              >
                Analyze & Pick
              </button>
              <button onClick={() => goTo(1)} className="px-5 py-3 border-2 border-gray-200 rounded-lg text-sm hover:border-gray-400 transition">
                Back
              </button>
            </div>
          </div>
        )}

        {/* ============== STEP 3: Analysis + Preview + Form ============== */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-up">
            {/* Analysis log */}
            <div className="bg-white rounded-xl border border-gray-200 p-7">
              <h2 className="text-xl font-bold mb-4">
                {analysisReady ? "Analysis complete" : "Analyzing your request..."}
              </h2>
              <div className="bg-brand-dark rounded-xl p-5 font-mono text-sm text-lime-400 leading-relaxed min-h-[100px]">
                {analysisLines.map((line, i) => (
                  <div key={i} className={line === "---" ? "text-gray-600" : ""}>
                    {line}
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              {analysisReady && picked && compEntry && (
                <div className="mt-5 border-2 border-brand-primary rounded-xl p-5 bg-orange-50">
                  <h3 className="text-lg font-bold text-brand-primary">{compId}</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-3">{compEntry.desc}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        compEntry.engagementTier === "high"
                          ? "bg-amber-100 text-amber-800"
                          : compEntry.engagementTier === "medium"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {compEntry.engagementTier} engagement
                    </span>
                    {compEntry.needsPhotos && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-400 text-white">
                        Needs Photos
                      </span>
                    )}
                  </div>
                  {ranked.length > 1 && (
                    <p className="text-xs text-gray-400 mt-3">
                      Also considered: {ranked.slice(1, 4).map((r) => r.id).join(", ")}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Preview + Form side by side */}
            {analysisReady && picked && compConfig && compEntry && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Live Preview */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Live Preview
                  </h2>
                  <div className="flex justify-center">
                    <div
                      style={{
                        width: compConfig.width > compConfig.height ? 340 : 200,
                        aspectRatio: `${compConfig.width}/${compConfig.height}`,
                      }}
                      className="rounded-lg overflow-hidden shadow-lg border border-gray-200"
                    >
                      <Player
                        ref={playerRef}
                        component={compEntry.component}
                        inputProps={formValues}
                        durationInFrames={compConfig.durationInFrames}
                        fps={FPS}
                        compositionWidth={compConfig.width}
                        compositionHeight={compConfig.height}
                        style={{ width: "100%" }}
                        controls
                        autoPlay
                        loop
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    {compConfig.width}&times;{compConfig.height} &middot;{" "}
                    {(compConfig.durationInFrames / FPS).toFixed(1)}s &middot; {FPS}fps
                  </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Customize
                  </h2>
                  <p className="text-xs text-gray-400 mb-4">
                    Edit props below. The preview updates live.
                  </p>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {compEntry.fields.map((field) => (
                      <FormField
                        key={field.key}
                        field={field}
                        value={formValues[field.key]}
                        onChange={(v) => updateField(field.key, v)}
                        onArrayUpdate={(i, v) => updateArrayItem(field.key, i, v)}
                        onArrayRemove={(i) => removeArrayItem(field.key, i)}
                        onArrayAdd={() => addArrayItem(field.key)}
                        onStatUpdate={(i, p, v) => updateStatItem(field.key, i, p, v)}
                        onStatRemove={(i) => removeStatItem(field.key, i)}
                        onStatAdd={() => addStatItem(field.key)}
                        onEventUpdate={(i, p, v) => updateEventItem(field.key, i, p, v)}
                        onEventRemove={(i) => removeEventItem(field.key, i)}
                        onEventAdd={() => addEventItem(field.key)}
                      />
                    ))}
                  </div>

                  <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
                    <button
                      onClick={startRender}
                      className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-[#e55a2b] transition"
                    >
                      Render MP4 in Browser
                    </button>
                    <button
                      onClick={() => goTo(2)}
                      className="px-4 py-3 border-2 border-gray-200 rounded-lg text-sm hover:border-gray-400 transition"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============== STEP 4: Rendering / Download ============== */}
        {step === 4 && (
          <div className="bg-white rounded-xl border border-gray-200 p-7 animate-fade-up">
            {rendering ? (
              <>
                <h2 className="text-xl font-bold mb-2">Rendering on your device...</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Your browser is encoding {compId} frame by frame using WebCodecs. This may take a moment.
                </p>
                {/* Progress bar */}
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all duration-300"
                    style={{ width: `${Math.round(renderProgress * 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  {Math.round(renderProgress * 100)}% &middot;{" "}
                  {compConfig
                    ? `${Math.round(renderProgress * compConfig.durationInFrames)}/${compConfig.durationInFrames} frames`
                    : ""}
                </p>
                <button
                  onClick={cancelRender}
                  className="px-5 py-2 border-2 border-gray-200 rounded-lg text-sm hover:border-red-400 hover:text-red-500 transition"
                >
                  Cancel
                </button>
              </>
            ) : renderError ? (
              <>
                <h2 className="text-xl font-bold text-red-500 mb-2">Render Failed</h2>
                <p className="text-sm text-gray-600 mb-6">{renderError}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => goTo(3)}
                    className="px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-[#e55a2b] transition"
                  >
                    Back to Editor
                  </button>
                  <FallbackCopyCommand
                    compId={compId}
                    props={buildCleanProps()}
                  />
                </div>
              </>
            ) : downloadUrl ? (
              <>
                <h2 className="text-xl font-bold mb-2">Your video is ready!</h2>
                <p className="text-sm text-gray-500 mb-6">
                  {compId} rendered successfully in your browser. No server needed.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <a
                    href={downloadUrl}
                    download={`${compId?.toLowerCase().replace(/[^a-z0-9]/g, "-")}.mp4`}
                    className="inline-flex px-7 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-[#e55a2b] transition"
                  >
                    Download MP4
                  </a>
                  <button
                    onClick={restart}
                    className="px-6 py-3 border-2 border-gray-200 rounded-lg font-semibold hover:border-gray-400 transition"
                  >
                    Make Another
                  </button>
                </div>
                {/* Also show the CLI command as fallback */}
                <details className="mt-6">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                    CLI render command (for higher quality)
                  </summary>
                  <CliCommand compId={compId} props={buildCleanProps()} />
                </details>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-400">
        <strong>The Super Socializers</strong> — Bristol, Bath, Cardiff & Somerset
        <br />
        <a href="https://www.meetup.com/the-super-socializers-uk/" target="_blank" className="text-brand-secondary hover:underline">
          Meetup
        </a>
        {" \u00b7 "}
        <a href="https://www.tiktok.com/@supersocializers" target="_blank" className="text-brand-secondary hover:underline">
          TikTok
        </a>
        {" \u00b7 "}
        <a href="https://www.instagram.com/the_super_socializers/" target="_blank" className="text-brand-secondary hover:underline">
          Instagram
        </a>
        {" \u00b7 "}
        <a href="https://github.com/christosgalaios/Content-gen" target="_blank" className="text-brand-secondary hover:underline">
          GitHub
        </a>
      </footer>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Form Field component
// ---------------------------------------------------------------------------
const FormField: React.FC<{
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  onArrayUpdate: (i: number, v: string) => void;
  onArrayRemove: (i: number) => void;
  onArrayAdd: () => void;
  onStatUpdate: (i: number, p: string, v: unknown) => void;
  onStatRemove: (i: number) => void;
  onStatAdd: () => void;
  onEventUpdate: (i: number, p: string, v: unknown) => void;
  onEventRemove: (i: number) => void;
  onEventAdd: () => void;
}> = ({ field, value, onChange, onArrayUpdate, onArrayRemove, onArrayAdd, onStatUpdate, onStatRemove, onStatAdd, onEventUpdate, onEventRemove, onEventAdd }) => {
  const inputClass = "w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20";

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {field.label}{field.required && " *"}
      </label>

      {field.type === "text" && (
        <input className={inputClass} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      )}

      {field.type === "textarea" && (
        <textarea className={`${inputClass} min-h-[70px] resize-y`} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      )}

      {field.type === "number" && (
        <input className={inputClass} type="number" value={value as number ?? ""} onChange={(e) => onChange(Number(e.target.value))} />
      )}

      {field.type === "color" && (
        <div className="flex gap-2 items-center">
          <input type="color" value={String(value ?? "#000")} onChange={(e) => onChange(e.target.value)} className="w-10 h-9 p-0.5 border border-gray-200 rounded-lg cursor-pointer" />
          <input className={`flex-1 ${inputClass}`} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
        </div>
      )}

      {field.type === "select" && (
        <select className={inputClass} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {field.opts?.map((o) => <option key={o}>{o}</option>)}
        </select>
      )}

      {field.type === "array" && (
        <>
          <div className="space-y-1">
            {(value as string[] ?? []).map((v, i) => (
              <div key={i} className="flex gap-1.5">
                <input className={`flex-1 ${inputClass}`} value={v} onChange={(e) => onArrayUpdate(i, e.target.value)} />
                <button onClick={() => onArrayRemove(i)} className="px-2.5 border border-gray-200 rounded-lg text-red-400 hover:bg-red-50 text-xs">x</button>
              </div>
            ))}
          </div>
          <button onClick={onArrayAdd} className="w-full mt-1 py-1.5 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-brand-primary hover:text-brand-primary transition">+ Add</button>
        </>
      )}

      {field.type === "stats" && (
        <>
          <div className="grid grid-cols-[1fr_60px_1fr_28px] gap-1 text-[10px] text-gray-400 mb-1">
            <span>Value</span><span>Suffix</span><span>Label</span><span />
          </div>
          {(value as Array<{ value: number; suffix: string; label: string }> ?? []).map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_60px_1fr_28px] gap-1 mb-1">
              <input className={inputClass} type="number" value={s.value} onChange={(e) => onStatUpdate(i, "value", Number(e.target.value))} />
              <input className={inputClass} value={s.suffix} onChange={(e) => onStatUpdate(i, "suffix", e.target.value)} />
              <input className={inputClass} value={s.label} onChange={(e) => onStatUpdate(i, "label", e.target.value)} />
              <button onClick={() => onStatRemove(i)} className="border border-gray-200 rounded-lg text-red-400 hover:bg-red-50 text-xs">x</button>
            </div>
          ))}
          <button onClick={onStatAdd} className="w-full mt-1 py-1.5 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-brand-primary hover:text-brand-primary transition">+ Add stat</button>
        </>
      )}

      {field.type === "events" && (
        <>
          <div className="grid grid-cols-[1fr_70px_28px] gap-1 text-[10px] text-gray-400 mb-1">
            <span>Name</span><span>Attendees</span><span />
          </div>
          {(value as Array<{ name: string; attendees: number }> ?? []).map((e, i) => (
            <div key={i} className="grid grid-cols-[1fr_70px_28px] gap-1 mb-1">
              <input className={inputClass} value={e.name} onChange={(ev) => onEventUpdate(i, "name", ev.target.value)} />
              <input className={inputClass} type="number" value={e.attendees ?? ""} onChange={(ev) => onEventUpdate(i, "attendees", Number(ev.target.value))} />
              <button onClick={() => onEventRemove(i)} className="border border-gray-200 rounded-lg text-red-400 hover:bg-red-50 text-xs">x</button>
            </div>
          ))}
          <button onClick={onEventAdd} className="w-full mt-1 py-1.5 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-brand-primary hover:text-brand-primary transition">+ Add event</button>
        </>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// CLI command output (fallback + details)
// ---------------------------------------------------------------------------
const CliCommand: React.FC<{ compId: string | null; props: Record<string, unknown> }> = ({
  compId,
  props,
}) => {
  const [copied, setCopied] = useState(false);
  if (!compId) return null;
  const propsInline = JSON.stringify(props).replace(/'/g, "'\\''");
  const filename = compId.toLowerCase().replace(/[^a-z0-9]/g, "-") + ".mp4";
  const cmd = `npx remotion render ${compId} out/${filename} --props='${propsInline}'`;

  return (
    <div className="mt-3 relative">
      <pre className="bg-brand-dark text-lime-400 p-4 rounded-lg text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
        {cmd}
      </pre>
      <button
        onClick={() => {
          navigator.clipboard.writeText(cmd);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className={`absolute top-2 right-2 text-xs px-2 py-1 rounded border ${
          copied ? "text-green-400 border-green-400" : "text-gray-500 border-gray-600 hover:text-white"
        }`}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
};

const FallbackCopyCommand: React.FC<{ compId: string | null; props: Record<string, unknown> }> = ({
  compId,
  props,
}) => {
  if (!compId) return null;
  const propsInline = JSON.stringify(props).replace(/'/g, "'\\''");
  const filename = compId.toLowerCase().replace(/[^a-z0-9]/g, "-") + ".mp4";
  const cmd = `npx remotion render ${compId} out/${filename} --props='${propsInline}'`;

  return (
    <button
      onClick={() => navigator.clipboard.writeText(cmd)}
      className="px-5 py-3 border-2 border-gray-200 rounded-lg text-sm hover:border-gray-400 transition"
      title="Copy CLI command to render locally instead"
    >
      Copy CLI Command
    </button>
  );
};
