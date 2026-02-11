export default function LoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-tactical-card border border-tactical-border rounded-xl p-5 h-32">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-700" />
                            <div className="w-16 h-5 rounded-full bg-slate-700" />
                        </div>
                        <div className="w-20 h-7 rounded bg-slate-700 mb-2" />
                        <div className="w-24 h-3 rounded bg-slate-800" />
                    </div>
                ))}
            </div>

            {/* Chart Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-tactical-card border border-tactical-border rounded-xl p-6 h-80">
                    <div className="w-40 h-5 rounded bg-slate-700 mb-6" />
                    <div className="w-full h-52 rounded bg-slate-800/50" />
                </div>
                <div className="bg-tactical-card border border-tactical-border rounded-xl p-6 h-80">
                    <div className="w-32 h-5 rounded bg-slate-700 mb-4" />
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="w-full h-10 rounded-lg bg-slate-800/50" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
