"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, Camera, CheckCircle2, AlertTriangle, Salad, Pill, Activity, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleTextEffect } from "@/components/ui/interactive-text-particle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { RainbowButton } from "@/components/ui/rainbow-borders-button";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [itemName, setItemName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/health`);
        if (res.ok) {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      } catch (err) {
        setBackendStatus("offline");
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const analyzeImage = async () => {
    if (!file) return;
    if (!itemName.trim()) {
      setError("Please provide the name of the item first before analyzing.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("item_name", itemName);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/analyze-ingredients`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image. Please check if the backend is running and API key is set.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 dark:text-emerald-400";
    if (score >= 50) return "text-amber-500 dark:text-amber-400";
    return "text-rose-500 dark:text-rose-400";
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-200 dark:selection:bg-emerald-800 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 w-full backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-white/20 dark:border-slate-800/50 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Salad className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-800 dark:from-emerald-400 dark:to-teal-500">
              HealthScan
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-xs font-medium border border-slate-200 dark:border-slate-700/50">
              <span className="relative flex h-2.5 w-2.5">
                {backendStatus === "online" && (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </>
                )}
                {backendStatus === "offline" && (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                )}
                {backendStatus === "checking" && (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 animate-pulse"></span>
                )}
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                {backendStatus === "online" ? "System Online" : backendStatus === "offline" ? "Backend Offline" : "Checking..."}
              </span>
            </div>
            <a href="/history" className="px-5 py-2 font-medium text-sm rounded-full bg-slate-200/50 dark:bg-slate-800 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-900 dark:hover:text-emerald-300 transition-all font-semibold">
              Scan History
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <div className="pt-32 pb-16 px-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-12"
        >
          <h1 className="sr-only">Know what you eat.</h1>
          <div className="h-24 md:h-32 w-full mx-auto max-w-4xl cursor-pointer relative" title="Hover over me!">
            <ParticleTextEffect
              text="Know what you eat."
              className=""
              colors={['10b981', '34d399', '059669', '047857']}
              particleDensity={3}
            />
          </div>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto -mt-4">
            Upload a photo of an ingredient label. Our AI instantly analyzes it for healthy nutrients, harsh additives, and hidden allergens.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-10"
        >
          <label className="block text-lg font-semibold mb-3 dark:text-slate-200">What item are you scanning?</label>
          <input 
            type="text" 
            placeholder="e.g. Oreo Cookies, Heinz Tomato Ketchup..." 
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
          />
        </motion.div>

        {/* Upload Section */}
        <AnimatePresence mode="wait">
          {!previewUrl ? (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-2xl mx-auto rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-900/5 dark:shadow-none overflow-hidden transition-all hover:border-emerald-500 hover:shadow-emerald-900/10 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="px-8 py-16 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                  <UploadCloud className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold dark:text-slate-200">Upload your label</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">Click or drag an image here. JPG, PNG supported.</p>
                </div>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 aspect-[4/3] flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className="object-contain w-full h-full" />
                <button 
                  onClick={clearSelection}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!result && (
                <div className="flex justify-center">
                  <RainbowButton 
                    onClick={analyzeImage}
                    disabled={loading}
                    className="group dark:bg-slate-800"
                  >
                    {loading ? (
                      <>
                        <Activity className="w-5 h-5 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Analyze Ingredients
                      </>
                    )}
                  </RainbowButton>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 max-w-2xl mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Results Section */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 space-y-8"
          >
            {/* Score Banner */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col md:flex-row items-center gap-8 border border-white/40 dark:border-slate-800 max-w-4xl mx-auto relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
              
              <div className="shrink-0 text-center">
                <div className={`text-6xl font-black ${getScoreColor(result.health_score)} tracking-tighter`}>
                  {result.health_score}
                  <span className="text-2xl text-slate-400 dark:text-slate-500 font-medium ml-1">/100</span>
                </div>
                <div className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-2">Health Score</div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2 dark:text-slate-100">Verdict</h3>
                <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">{result.explanation}</p>
              </div>
            </div>

            {/* ingredient grids */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              {/* Safe */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-lg border-l-4 border-emerald-500">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Safe Ingredients</h4>
                </div>
                {result.safe_ingredients?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.safe_ingredients.map((item: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full text-sm font-medium border border-emerald-100 dark:border-emerald-800/50 shadow-sm">{item}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 italic text-sm">None detected.</p>
                )}
              </div>

              {/* Moderate */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-lg border-l-4 border-amber-500">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Moderate Ingredients</h4>
                </div>
                {result.moderate_ingredients?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.moderate_ingredients.map((item: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full text-sm font-medium border border-amber-100 dark:border-amber-800/50 shadow-sm">{item}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 italic text-sm">None detected.</p>
                )}
              </div>

              {/* Risky */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-lg border-l-4 border-rose-500">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Risky Ingredients</h4>
                </div>
                {result.risky_ingredients?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.risky_ingredients.map((item: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 rounded-full text-sm font-medium border border-rose-100 dark:border-rose-800/50 shadow-sm">{item}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 italic text-sm">None detected. Great!</p>
                )}
              </div>

              {/* Additives */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-lg border-l-4 border-amber-500">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg">
                    <Pill className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Additives & Colors</h4>
                </div>
                {result.food_colorings_additives?.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {result.food_colorings_additives.map((item: string, i: number) => (
                      <div key={i} className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-100 rounded-xl text-sm border border-amber-100 dark:border-amber-800/50 shadow-sm whitespace-pre-line leading-relaxed">
                        {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 italic text-sm">No harmful additives found.</p>
                )}
              </div>

              {/* Allergens */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-lg border-l-4 border-orange-500">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 rounded-lg">
                    <Salad className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Allergens</h4>
                </div>
                {result.allergens?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.allergens.map((item: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-orange-50 dark:bg-orange-950 text-orange-800 dark:text-orange-300 rounded-full text-sm font-medium border border-orange-100 dark:border-orange-800/50 shadow-sm">{item}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 italic text-sm">No common allergens identified.</p>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
