"use client";

import { useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Scores {
  openRate: number;
  spamRisk: number;
  emotionalPull: number;
  clarity: number;
}

interface SubjectResult {
  subject: string;
  scores: Scores;
  overallScore: number;
  tip: string;
}

interface AnalysisResponse {
  results: SubjectResult[];
  winner: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const EMAIL_TYPES = [
  "Newsletter",
  "Sales",
  "Welcome",
  "Re-engagement",
  "Announcement",
];

const DIMENSION_CONFIG: {
  key: keyof Scores;
  label: string;
  color: string;
  inverted?: boolean;
}[] = [
  { key: "openRate", label: "Open Rate", color: "#3b82f6" },
  {
    key: "spamRisk",
    label: "Spam Risk",
    color: "#ef4444",
    inverted: true,
  },
  { key: "emotionalPull", label: "Emotional Pull", color: "#a855f7" },
  { key: "clarity", label: "Clarity", color: "#06b6d4" },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function Home() {
  const [subjects, setSubjects] = useState<string[]>(["", ""]);
  const [emailType, setEmailType] = useState<string>("");
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canAnalyze =
    subjects.filter((s) => s.trim().length > 0).length >= 1 && !loading;

  const updateSubject = (index: number, value: string) => {
    const updated = [...subjects];
    updated[index] = value;
    setSubjects(updated);
  };

  const addSubject = () => {
    if (subjects.length < 5) {
      setSubjects([...subjects, ""]);
    }
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 2) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return;
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const filtered = subjects.filter((s) => s.trim().length > 0);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjects: filtered,
          emailType: emailType || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResults(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [canAnalyze, subjects, emailType]);

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 7) return "bg-green-500/20 border-green-500/30";
    if (score >= 5) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[#262626] bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
              SL
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#ededed] leading-tight">
                SubjectLab
              </h1>
              <p className="text-xs text-[#737373]">
                AI Email Subject Line Tester
              </p>
            </div>
          </div>
          <a
            href="https://github.com/maxilylm/su-subjectlab"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#737373] hover:text-[#ededed] transition-colors flex items-center gap-1.5"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#ededed] mb-3 tracking-tight">
            Test Your Subject Lines
          </h2>
          <p className="text-[#737373] text-lg max-w-2xl mx-auto">
            Enter up to 5 email subject lines and let AI score them on open
            rate, spam risk, emotional pull, and clarity.
          </p>
        </div>

        {/* Subject Line Inputs */}
        <section className="mb-8">
          <div className="space-y-3">
            {subjects.map((subject, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#262626] text-[#737373] text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  placeholder={`Subject line ${i + 1}...`}
                  value={subject}
                  onChange={(e) => updateSubject(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAnalyze();
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-[#262626] bg-[#141414] text-[#ededed] text-sm placeholder:text-[#525252] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
                />
                {subjects.length > 2 && (
                  <button
                    onClick={() => removeSubject(i)}
                    className="w-8 h-8 rounded-lg border border-[#262626] bg-[#141414] text-[#737373] hover:text-red-400 hover:border-red-500/30 flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {subjects.length < 5 && (
            <button
              onClick={addSubject}
              className="mt-3 ml-10 text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add another subject line
            </button>
          )}
        </section>

        {/* Email Type Selector */}
        <section className="mb-10">
          <label className="block text-sm font-medium text-[#a3a3a3] mb-3">
            Email type{" "}
            <span className="text-[#525252] font-normal">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {EMAIL_TYPES.map((type) => (
              <button
                key={type}
                onClick={() =>
                  setEmailType(emailType === type ? "" : type)
                }
                className={`px-4 py-2 rounded-lg text-sm border transition-all cursor-pointer ${
                  emailType === type
                    ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                    : "border-[#262626] bg-[#141414] text-[#737373] hover:border-[#404040] hover:text-[#a3a3a3]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        {/* Analyze Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className={`relative px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 ${
              canAnalyze
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                : "bg-[#262626] text-[#525252] cursor-not-allowed"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : (
              "Analyze Subject Lines"
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4">
            {subjects
              .filter((s) => s.trim())
              .map((_, i) => (
                <div
                  key={i}
                  className="border border-[#262626] bg-[#141414] rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-10 rounded-lg animate-shimmer" />
                    <div className="flex-1">
                      <div className="w-3/4 h-5 rounded animate-shimmer mb-2" />
                      <div className="w-1/2 h-3 rounded animate-shimmer" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="w-full h-4 rounded animate-shimmer" />
                    <div className="w-full h-4 rounded animate-shimmer" />
                    <div className="w-full h-4 rounded animate-shimmer" />
                    <div className="w-full h-4 rounded animate-shimmer" />
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Results */}
        {results && (
          <section>
            <h3 className="text-2xl font-bold text-[#ededed] mb-6 text-center">
              Results
            </h3>
            <div className="space-y-4">
              {results.results.map((result, i) => {
                const isWinner = i === results.winner;
                return (
                  <div
                    key={i}
                    className={`animate-fade-in border rounded-xl overflow-hidden transition-colors ${
                      isWinner
                        ? "border-yellow-500/50 bg-[#141414] animate-pulse-glow"
                        : "border-[#262626] bg-[#141414] hover:border-[#404040]"
                    }`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {/* Card Header */}
                    <div className="px-5 py-4 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isWinner && (
                            <span className="text-xl" title="Winner!">
                              &#x1F3C6;
                            </span>
                          )}
                          <span className="text-xs text-[#737373] font-medium uppercase tracking-wider">
                            {isWinner ? "Winner" : `#${i + 1}`}
                          </span>
                        </div>
                        <p className="text-[#ededed] font-medium text-base truncate">
                          &ldquo;{result.subject}&rdquo;
                        </p>
                      </div>
                      <div
                        className={`flex-shrink-0 w-16 h-16 rounded-xl border flex flex-col items-center justify-center ${getScoreBg(result.overallScore)}`}
                      >
                        <span
                          className={`text-2xl font-bold leading-none ${getScoreColor(result.overallScore)}`}
                        >
                          {result.overallScore}
                        </span>
                        <span className="text-[10px] text-[#737373] mt-0.5">
                          / 10
                        </span>
                      </div>
                    </div>

                    {/* Score Bars */}
                    <div className="px-5 pb-4">
                      <div className="space-y-2.5">
                        {DIMENSION_CONFIG.map((dim) => {
                          const value = result.scores[dim.key];
                          const displayValue = dim.inverted
                            ? 10 - value
                            : value;
                          const barLabel = dim.inverted
                            ? `${value}/10 risk`
                            : `${value}/10`;
                          return (
                            <div key={dim.key}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-[#a3a3a3]">
                                  {dim.label}
                                  {dim.inverted && (
                                    <span className="text-[#525252] ml-1">
                                      (lower is better)
                                    </span>
                                  )}
                                </span>
                                <span className="text-xs text-[#737373] font-mono">
                                  {barLabel}
                                </span>
                              </div>
                              <div className="w-full h-2.5 rounded-full bg-[#262626] overflow-hidden">
                                <div
                                  className="h-full rounded-full animate-bar-grow"
                                  style={{
                                    width: `${displayValue * 10}%`,
                                    backgroundColor: dim.color,
                                    animationDelay: `${i * 100 + 200}ms`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tip */}
                    {result.tip && (
                      <div className="px-5 py-3 border-t border-[#262626]/50 bg-indigo-500/5">
                        <p className="text-xs text-[#a3a3a3]">
                          <span className="text-indigo-400 font-medium">
                            Tip:{" "}
                          </span>
                          {result.tip}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#262626] mt-20">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-xs text-[#525252]">
          Powered by{" "}
          <a
            href="https://groq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#737373] hover:text-[#ededed] transition-colors"
          >
            Groq
          </a>{" "}
          + Llama 3.3 &middot; Scores are AI-generated predictions, not
          guarantees
        </div>
      </footer>
    </div>
  );
}
