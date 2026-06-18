import Link from "next/link"
import { Code2, BrainCircuit, Activity, Sparkles } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 selection:bg-violet-500/30">
      {/* Decorative background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-violet-600/20 dark:bg-violet-600/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-emerald-600/20 dark:bg-emerald-600/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-20">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-sm font-medium mb-8 border border-violet-200 dark:border-violet-500/20 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Meet your new AI Coding Mentor</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
            Master algorithms with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-emerald-500 dark:from-violet-400 dark:to-emerald-400">Socratic mentorship</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed max-w-2xl">
            BaseCase doesn't just give you the answer. It guides you to the solution through step-by-step visualizations and real-time interactive mentorship. No spoilers, just learning.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/problems"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-lg transition-all shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] hover:shadow-[0_0_60px_-15px_rgba(124,58,237,0.7)] hover:-translate-y-0.5"
            >
              Explore Problems
            </Link>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-semibold text-lg transition-all"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          <FeatureCard 
            icon={<BrainCircuit className="w-6 h-6 text-violet-500" />}
            title="Socratic Guidance"
            description="Our AI acts like a senior engineer pair programming with you. It asks guiding questions instead of pasting solutions."
          />
          <FeatureCard 
            icon={<Activity className="w-6 h-6 text-emerald-500" />}
            title="Algorithm Visualization"
            description="Watch data structures come alive. BaseCase renders interactive step-by-step visualizers for arrays, trees, and graphs as you chat."
          />
          <FeatureCard 
            icon={<Code2 className="w-6 h-6 text-blue-500" />}
            title="Real-time Code Review"
            description="Get instant feedback on correctness, time complexity, and style. The AI streams code reviews straight into your workspace."
          />
        </div>

        {/* Mock Dashboard / Preview Image */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-950 p-2">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-50/90 dark:to-zinc-950/90 z-10 pointer-events-none" />
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50 rounded-t-xl">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <div className="mx-auto px-4 py-1 rounded bg-white dark:bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              basecase.dev/problem/two-sum
            </div>
          </div>
          <div className="h-[400px] w-full bg-zinc-100 dark:bg-zinc-900/50 rounded-b-xl p-6 font-mono text-sm overflow-hidden relative">
            <div className="text-zinc-400 mb-2">{"// Mentor: What data structure could we use to optimize the lookup time?"}</div>
            <div className="text-violet-500 mb-4">{"function"} <span className="text-blue-500">twoSum</span>{"(nums, target) {"}</div>
            <div className="pl-4 text-emerald-600 dark:text-emerald-400">{"const map = new Map();"}</div>
            <div className="pl-4 text-zinc-600 dark:text-zinc-300 mt-2">{"for (let i = 0; i < nums.length; i++) {"}</div>
            <div className="pl-8 text-zinc-500 mt-1">{"const complement = target - nums[i];"}</div>
            <div className="pl-8 text-zinc-500 mt-1">{"if (map.has(complement)) {"}</div>
            <div className="pl-12 text-zinc-500 mt-1">{"return [map.get(complement), i];"}</div>
            <div className="pl-8 text-zinc-500 mt-1">{"}"}</div>
            <div className="pl-8 text-zinc-500 mt-1">{"map.set(nums[i], i);"}</div>
            <div className="pl-4 text-zinc-600 dark:text-zinc-300 mt-1">{"}"}</div>
            <div className="text-violet-500 mt-2">{"}"}</div>
            
            {/* Fake Visualizer Overlay */}
            <div className="absolute bottom-8 right-8 w-64 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-xl p-4 z-20">
              <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-3 border-b border-zinc-100 dark:border-zinc-700 pb-2">Hash Map Visualizer</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono bg-violet-50 dark:bg-violet-900/20 p-1 rounded">
                  <span className="text-violet-600 dark:text-violet-400">2</span>
                  <span className="text-zinc-600 dark:text-zinc-400">0</span>
                </div>
                <div className="flex justify-between text-xs font-mono p-1">
                  <span className="text-zinc-600 dark:text-zinc-400">7</span>
                  <span className="text-zinc-600 dark:text-zinc-400">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl hover:shadow-lg transition-all group">
      <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  )
}
