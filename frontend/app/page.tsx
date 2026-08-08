'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Loader2, Star, AlertTriangle, Lightbulb, ArrowLeft, ArrowRight, Sparkles, CircleDot } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AppInfo {
  app_name: string;
  developer: string;
  app_id: number;
  icon_url?: string;
}

interface AnalysisData {
  total_reviews: number;
  average_rating: number;
  rating_distribution: { [key: string]: number };
  overall_sentiment: string;
  key_issues: string[];
  feature_requests: string[];
}

// Rating bars run cool → warm as score rises, so the chart reads before you even look at the axis.
const RATING_COLORS: { [key: string]: string } = {
  '1': '#F2755A',
  '2': '#F0925A',
  '3': '#E8B84B',
  '4': '#8FD19E',
  '5': '#5EEAD4',
};

// Positions the sentiment word on a 0–100 gauge without needing the backend to send a score.
const SENTIMENT_POSITION: { [key: string]: number } = {
  негативний: 12,
  негативно: 12,
  змішаний: 50,
  нейтральний: 50,
  позитивний: 88,
  positive: 88,
  negative: 12,
  mixed: 50,
  neutral: 50,
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState('');

  // first stage get_id
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoadingApps(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:8000/api/apps/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setApps(data);
    } catch (err) {
      setError('Не вдалося знайти додатки. Перевірте, чи запущений бекенд.');
    } finally {
      setLoadingApps(false);
    }
  };

  // get_reviews
  const handleSelectApp = async (app: AppInfo) => {
    setSelectedApp(app);
    setAnalyzing(true);
    setError('');
    setAnalysisData(null);

    try {
      // A getting reviews
      const collectRes = await fetch(`http://localhost:8000/api/reviews/collect?app_id=${app.app_id}&count=100`);
      const reviews = await collectRes.json();

      if (!Array.isArray(reviews) || reviews.length === 0) {
        throw new Error('Не вдалося зібрати відгуки для цього додатку.');
      }

      // B sending reviews to AI
      const analyzeRes = await fetch('http://localhost:8000/api/reviews/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviews),
      });

      const analysisResult = await analyzeRes.json();
      setAnalysisData(analysisResult);
    } catch (err: any) {
      setError(err.message || 'Сталася помилка під час аналізу.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedApp(null);
    setAnalysisData(null);
    setError('');
  };

  const ratingChartData = analysisData
    ? Object.keys(analysisData.rating_distribution)
        .sort()
        .map((star) => ({ rating: star, count: analysisData.rating_distribution[star] }))
    : [];

  const gaugePosition = analysisData
    ? SENTIMENT_POSITION[analysisData.overall_sentiment?.toLowerCase()] ?? 50
    : 50;

  return (
    <main className="relative min-h-screen bg-[#07080A] text-[#E7E8EA] antialiased selection:bg-[#5EEAD4]/20 selection:text-[#5EEAD4]">
      <BackgroundField />

      {/* Top chrome */}
      <div className="relative border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-gradient-to-br from-[#5EEAD4] to-[#7C9CF2]">
              <CircleDot className="h-3.5 w-3.5 text-[#07080A]" strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-medium text-[#C7C9CE]">Reviews</span>
            {selectedApp && (
              <>
                <span className="text-[13px] text-[#3A3D44]">/</span>
                <span className="text-[13px] text-[#C7C9CE]">{selectedApp.app_name}</span>
              </>
            )}
          </div>
          {/* <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] py-1 pl-2.5 pr-3">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5EEAD4] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#5EEAD4]" />
            </span>
            <span className="text-[11px] font-medium tracking-wide text-[#8B8F98]">AI МОДЕЛЬ АКТИВНА</span>
          </div> */}
        </div>
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-16 md:px-8 md:py-20">
        {!selectedApp && (
          <header className="mb-12 flex flex-col items-center gap-4 text-center">
            {/* <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[11px] font-medium tracking-wide text-[#8B8F98]">
              <Sparkles className="h-3 w-3 text-[#5EEAD4]" strokeWidth={2} />
              <span>AI-АНАЛІТИКА ВІДГУКІВ</span>
            </div> */}
            <h1 className="max-w-lg font-display text-[2.75rem] font-medium leading-[1.08] tracking-[-0.03em] text-white md:text-5xl">
              App Store <span className="text-[#5EEAD4]">Review Intelligence</span>
            </h1>
            <p className="max-w-md text-[15px] leading-relaxed text-[#8B8F98]">
              NLP-пайплайн для трансформації сирих відгуків у продуктові інсайти. Автоматична екстракція критичних багів та feature-реквестів.
            </p>
          </header>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className={`mx-auto mb-4 max-w-lg ${selectedApp ? 'hidden' : ''}`}>
          <div className="group relative flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0D0F12] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all focus-within:border-[#5EEAD4]/30 focus-within:shadow-[0_0_0_4px_rgba(94,234,212,0.06)]">
            <Search className="ml-2.5 h-4 w-4 flex-shrink-0 text-[#5C6069] transition-colors group-focus-within:text-[#5EEAD4]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nebula, Duolingo, Notion…"
              className="w-full bg-transparent py-2 text-[14px] text-[#E7E8EA] placeholder-[#4A4D54] outline-none"
            />
            <button
              type="submit"
              disabled={loadingApps}
              className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#E7E8EA] px-3.5 py-2 text-[13px] font-medium text-[#0A0B0D] transition-all hover:bg-white active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingApps ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <>Шукати<ArrowRight className="h-3.5 w-3.5" /></>}
            </button>
          </div>
        </form>

        {/* Error state */}
        {error && (
          <div className="mx-auto mb-8 max-w-lg animate-[fadeIn_0.2s_ease-out] rounded-lg border border-[#3A2020] bg-[#160F10] px-4 py-3 text-center text-[13px] text-[#F0A5A5]">
            {error}
          </div>
        )}

        {/* App results */}
        {apps.length > 0 && !selectedApp && (
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-2 md:grid-cols-2">
            {apps.map((app, idx) => (
              <button
                key={app.app_id}
                onClick={() => handleSelectApp(app)}
                style={{ animationDelay: `${idx * 40}ms` }}
                className="group flex animate-[fadeInUp_0.35s_ease-out_backwards] items-center gap-3.5 rounded-xl border border-white/[0.06] bg-[#0D0F12] p-3.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all hover:border-white/[0.12] hover:bg-[#111318]"
              >
                {app.icon_url ? (
                  <img src={app.icon_url} alt={app.app_name} className="h-11 w-11 flex-shrink-0 rounded-[10px] border border-white/[0.06] object-cover" />
                ) : (
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] border border-white/[0.06] bg-white/[0.03] text-sm font-semibold text-[#5C6069]">
                    {app.app_name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[13.5px] font-medium text-[#E7E8EA]">{app.app_name}</h3>
                  <p className="truncate text-[12px] text-[#5C6069]">{app.developer}</p>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#3A3D44] transition-all group-hover:translate-x-0.5 group-hover:text-[#5EEAD4]" />
              </button>
            ))}
          </div>
        )}

        {/* Analyzing state — the one place motion is allowed to be expressive */}
        {analyzing && (
          <div className="flex flex-col items-center justify-center gap-5 py-24">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,rgba(94,234,212,0.5),rgba(124,156,242,0.4),transparent_60%)] blur-[6px]" />
              <div className="absolute inset-[3px] rounded-full bg-[#07080A]" />
              <Loader2 className="relative h-6 w-6 animate-spin text-[#5EEAD4]" strokeWidth={2} />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-medium text-[#E7E8EA]">Аналізуємо відгуки {selectedApp?.app_name}</p>
              <p className="mt-1 font-mono text-[12px] text-[#5C6069]">збір → обробка → продуктові інсайти</p>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {analysisData && selectedApp && !analyzing && (
          <div className="animate-[fadeIn_0.3s_ease-out] space-y-3">
            {/* App header */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {selectedApp.icon_url ? (
                  <img src={selectedApp.icon_url} alt={selectedApp.app_name} className="h-14 w-14 rounded-[13px] border border-white/[0.08] object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-[13px] border border-white/[0.08] bg-white/[0.03] text-lg font-semibold text-[#5C6069]">
                    {selectedApp.app_name.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="font-display text-[20px] font-medium tracking-[-0.01em] text-white">{selectedApp.app_name}</h2>
                  <p className="text-[13px] text-[#5C6069]">Звіт за останні {analysisData.total_reviews} відгуків</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[12.5px] font-medium text-[#8B8F98] transition-colors hover:border-white/[0.12] hover:text-[#E7E8EA]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Інший додаток
              </button>
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Card>
                <CardLabel>Середня оцінка</CardLabel>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[28px] font-medium leading-none text-white">
                    <CountUp value={analysisData.average_rating} decimals={2} />
                  </span>
                  <Star className="h-[17px] w-[17px] translate-y-[-1px] fill-[#E8B84B] text-[#E8B84B]" />
                </div>
              </Card>

              <Card>
                <CardLabel>Оброблено відгуків</CardLabel>
                <span className="font-mono text-[28px] font-medium leading-none text-white">
                  <CountUp value={analysisData.total_reviews} />
                </span>
              </Card>

              <Card>
                <CardLabel>Сентимент</CardLabel>
                <div className="mb-2 text-[16px] font-medium capitalize text-white">{analysisData.overall_sentiment}</div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gradient-to-r from-[#F2755A] via-[#E8B84B] to-[#5EEAD4]">
                  <div
                    className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-[#0D0F12] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)] transition-all duration-700"
                    style={{ left: `calc(${gaugePosition}% - 5px)` }}
                  />
                </div>
              </Card>
            </div>

            {/* Chart */}
            <Card className="!p-6">
              <div className="mb-5 flex items-center justify-between">
                <CardLabel>Розподіл оцінок</CardLabel>
                <span className="font-mono text-[11px] text-[#5C6069]">1★ – 5★</span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratingChartData} barCategoryGap="30%">
                    <defs>
                      {Object.entries(RATING_COLORS).map(([star, color]) => (
                        <linearGradient key={star} id={`bar-${star}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={1} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.55} />
                        </linearGradient>
                      ))}
                    </defs>
                    <XAxis
                      dataKey="rating"
                      tickFormatter={(v) => `${v}★`}
                      tick={{ fill: '#5C6069', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fill: '#5C6069', fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ backgroundColor: '#131519', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12.5px' }}
                      labelFormatter={(v) => `${v} зірок`}
                      labelStyle={{ color: '#8B8F98' }}
                      itemStyle={{ color: '#E7E8EA' }}
                    />
                    <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={52}>
                      {ratingChartData.map((entry) => (
                        <Cell key={entry.rating} fill={`url(#bar-${entry.rating})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Insights */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InsightPanel icon={<AlertTriangle className="h-4 w-4" strokeWidth={2} />} title="Критичні проблеми" subtitle="Bugs" tone="danger" items={analysisData.key_issues} />
              <InsightPanel icon={<Lightbulb className="h-4 w-4" strokeWidth={2} />} title="Побажання користувачів" subtitle="Requests" tone="warning" items={analysisData.feature_requests} />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </main>
  );
}

// Faint dual-tone mesh + hairline grid — quiet atmosphere, not the whole show.
function BackgroundField() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full opacity-[0.07] blur-[100px]"
        style={{ background: 'radial-gradient(circle, #5EEAD4, transparent 70%)' }}
      />
      <div
        className="absolute -right-40 top-1/3 h-[480px] w-[480px] rounded-full opacity-[0.06] blur-[100px]"
        style={{ background: 'radial-gradient(circle, #7C9CF2, transparent 70%)' }}
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-white/[0.07] bg-[#0D0F12] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/[0.12] ${className}`}
    >
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[12px] text-[#5C6069]">{children}</div>;
}

// Small count-up so the numbers feel alive on first paint, not just dropped in.
function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number>(0);

  useEffect(() => {
    const duration = 600;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) frame.current = requestAnimationFrame(animate);
    };
    frame.current = requestAnimationFrame(animate);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display.toFixed(decimals)}</>;
}

function InsightPanel({
  icon,
  title,
  subtitle,
  tone,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone: 'danger' | 'warning';
  items: string[];
}) {
  const toneColor = tone === 'danger' ? '#F2755A' : '#E8B84B';
  const markerColor = tone === 'danger' ? 'bg-[#F2755A]' : 'bg-[#E8B84B]';

  return (
    <Card className="!p-6">
      <div className="mb-4 flex items-center gap-2">
        <span style={{ color: toneColor }}>{icon}</span>
        <h3 className="text-[14px] font-medium text-[#E7E8EA]">{title}</h3>
        <span className="ml-auto font-mono text-[10.5px] uppercase tracking-wide text-[#5C6069]">{subtitle}</span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/[0.08] px-3 py-4 text-center text-[12.5px] text-[#5C6069]">
          Нічого не знайдено в цій категорії
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.015] p-3 text-[13px] leading-relaxed text-[#C4C7CE] transition-colors hover:border-white/[0.1]"
            >
              <span className={`mt-[7px] h-1 w-1 flex-shrink-0 rounded-full ${markerColor}`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}