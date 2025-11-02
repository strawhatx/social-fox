import type { Metadata } from 'next'
import { ArrowRight, TrendingUp, Target, Zap, BarChart3, Sparkles, CheckCircle, X } from 'lucide-react'
import Navigation from '@/components/landing/navigation'
import Footer from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'Social Fox vs Typefully — Compare Thread Scheduling for Operators',
  description: 'Compare Social Fox and Typefully for thread planning, scheduling, and consistent publishing. See why operators choose Social Fox for repeatable content workflows.'
}

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navigation />
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 rounded-full px-4 py-2 text-sm font-medium text-orange-700 dark:text-orange-300 mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Social Fox vs Typefully — Operator Edition</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-orange-600 bg-clip-text text-transparent leading-tight">
              Both schedule threads. Only one builds systems.
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Run your content operation with clarity, speed, and consistency.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/sign-up" 
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Build your weekly content rhythm.
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="#comparison" 
                className="inline-flex items-center gap-2 px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                See the comparison
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-orange-600 bg-clip-text text-transparent">
                Feature comparison
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See how Social Fox compares to Typefully across key features.
              </p>
            </div>
            
            <div className="overflow-x-auto rounded-2xl border border-orange-200/50 dark:border-orange-800/50 bg-background/50 backdrop-blur-sm">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-950/20 dark:to-blue-950/20">
                  <tr>
                    <th className="p-6 font-semibold text-foreground">Feature</th>
                    <th className="p-6 font-semibold text-orange-600 dark:text-orange-400">Social Fox</th>
                    <th className="p-6 font-semibold text-muted-foreground">Typefully</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-orange-200/30 dark:border-orange-800/30">
                    <td className="p-6 font-medium">Thread Planner / Editor</td>
                    <td className="p-6 text-green-600 dark:text-green-400">Structured editor with hooks, sections, CTA placeholders</td>
                    <td className="p-6 text-muted-foreground">Standard drafting</td>
                  </tr>
                  <tr className="border-t border-orange-200/30 dark:border-orange-800/30">
                    <td className="p-6 font-medium">Content Scheduler / Calendar</td>
                    <td className="p-6 text-green-600 dark:text-green-400">Weekly calendar with batching and queue visibility</td>
                    <td className="p-6 text-muted-foreground">Standard scheduling</td>
                  </tr>
                  <tr className="border-t border-orange-200/30 dark:border-orange-800/30">
                    <td className="p-6 font-medium">Analytics Dashboard</td>
                    <td className="p-6 text-green-600 dark:text-green-400">Post-level insights; future roadmap: cadence & format tracking</td>
                    <td className="p-6 text-muted-foreground">Post-level metrics only</td>
                  </tr>
                  <tr className="border-t border-orange-200/30 dark:border-orange-800/30">
                    <td className="p-6 font-medium">Playbooks & Templates</td>
                    <td className="p-6 text-green-600 dark:text-green-400">Templates for consistent weekly content</td>
                    <td className="p-6 text-muted-foreground">Limited templates</td>
                  </tr>
                  <tr className="border-t border-orange-200/30 dark:border-orange-800/30">
                    <td className="p-6 font-medium">Repurposing</td>
                    <td className="p-6 text-green-600 dark:text-green-400">Quickly turn threads into singles or follow-ups</td>
                    <td className="p-6 text-muted-foreground">Manual repurposing</td>
                  </tr>
                  <tr className="border-t border-orange-200/30 dark:border-orange-800/30">
                    <td className="p-6 font-medium">Operator Focus</td>
                    <td className="p-6 text-green-600 dark:text-green-400">Designed for solo operators and small teams</td>
                    <td className="p-6 text-muted-foreground">General creator tool</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-orange-600 bg-clip-text text-transparent">
                Why operators choose Social Fox
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Three key advantages that make the difference for serious content creators.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group relative p-8 rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50/30 to-transparent dark:from-orange-950/10 dark:border-orange-800/50 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Ship faster</h3>
                  </div>
                  <p className="text-muted-foreground">Reduce decision fatigue with structured editor + calendar</p>
                </div>
              </div>
              
              <div className="group relative p-8 rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-950/10 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Repeatably consistent</h3>
                  </div>
                  <p className="text-muted-foreground">Templates and batching make weekly posting reliable</p>
                </div>
              </div>
              
              <div className="group relative p-8 rounded-2xl border border-green-200/50 bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-950/10 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Scalable workflow</h3>
                  </div>
                  <p className="text-muted-foreground">Plan, draft, schedule in one integrated system</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-orange-500/5 via-background to-blue-500/5 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 rounded-full px-4 py-2 text-sm font-medium text-orange-700 dark:text-orange-300 mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Ready to build your weekly content rhythm?</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-orange-600 bg-clip-text text-transparent">
              Get started with Social Fox today — build your weekly content rhythm.
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Stop juggling tools. Start building a repeatable system that scales with your growth.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a 
                href="/sign-up" 
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="/comparison" 
                className="inline-flex items-center gap-2 px-6 py-3 text-muted-foreground hover:text-foreground transition-colors border border-muted-foreground/20 hover:border-muted-foreground/40 rounded-lg"
              >
                See all comparisons
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}


