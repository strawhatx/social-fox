import type { Metadata } from 'next'
import { ArrowRight, TrendingUp, Target, Zap, BarChart3, Sparkles, CheckCircle, X } from 'lucide-react'
import Footer from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'Social Fox vs Hypefury — Operator‑First X Planner Comparison',
  description: 'See how Social Fox compares to Hypefury on threads, analytics, and automation.'
}

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
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
              <span>Comparison</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-orange-600 bg-clip-text text-transparent leading-tight">
              Social Fox vs Hypefury. Which runs the operation?
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Scheduling is table stakes. Social Fox gives operators playbooks, analytics, and automation to scale outputs with clarity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/sign-up" 
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Switch to an operator-first stack
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
                See how Social Fox compares to Hypefury across key features.
              </p>
            </div>
            
            <div className="overflow-x-auto rounded-2xl border border-orange-200/50 dark:border-orange-800/50 bg-background/50 backdrop-blur-sm">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-950/20 dark:to-blue-950/20">
                  <tr>
                    <th className="p-6 font-semibold text-foreground">Feature</th>
                    <th className="p-6 font-semibold text-orange-600 dark:text-orange-400">Social Fox</th>
                    <th className="p-6 font-semibold text-muted-foreground">Hypefury</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-orange-200/30 dark:border-orange-800/30">
                    <td className="p-6 font-medium">Thread Planner / Editor</td>
                    <td className="p-6 text-green-600 dark:text-green-400">Structured editor with AI scaffolding</td>
                    <td className="p-6 text-muted-foreground">Standard drafting</td>
                  </tr>
                  <tr className="border-t border-orange-200/30 dark:border-orange-800/30">
                    <td className="p-6 font-medium">Content Scheduler / Calendar</td>
                    <td className="p-6 text-green-600 dark:text-green-400">Operator calendar with batching and status</td>
                    <td className="p-6 text-muted-foreground">Basic calendar</td>
                  </tr>
                  <tr className="border-t border-orange-200/30 dark:border-orange-800/30">
                    <td className="p-6 font-medium">Analytics Dashboard</td>
                    <td className="p-6 text-green-600 dark:text-green-400">Format-level insights and consistency metrics</td>
                    <td className="p-6 text-muted-foreground">Post metrics</td>
                  </tr>
                  <tr className="border-t border-orange-200/30 dark:border-orange-800/30">
                    <td className="p-6 font-medium">Automation / AI Workflow</td>
                    <td className="p-6 text-green-600 dark:text-green-400">Playbook automations + AI drafting</td>
                    <td className="p-6 text-muted-foreground">Limited automations</td>
                  </tr>
                  <tr className="border-t border-orange-200/30 dark:border-orange-800/30">
                    <td className="p-6 font-medium">Repurpose & Variants</td>
                    <td className="p-6 text-green-600 dark:text-green-400">One-click singles and variant hooks</td>
                    <td className="p-6 text-muted-foreground">Manual variants</td>
                  </tr>
                  <tr className="border-t border-orange-200/30 dark:border-orange-800/30">
                    <td className="p-6 font-medium">Cadence Coaching</td>
                    <td className="p-6 text-green-600 dark:text-green-400">Streaks, reminders, and goal tracking</td>
                    <td className="p-6 text-muted-foreground">Not emphasized</td>
                  </tr>
                  <tr className="border-t border-orange-200/30 dark:border-orange-800/30">
                    <td className="p-6 font-medium">Operator Focus</td>
                    <td className="p-6 text-green-600 dark:text-green-400">Designed for solo operators and agencies</td>
                    <td className="p-6 text-muted-foreground">General audience</td>
                  </tr>
                  <tr className="border-t border-orange-200/30 dark:border-orange-800/30">
                    <td className="p-6 font-medium">Workflow Speed</td>
                    <td className="p-6 text-green-600 dark:text-green-400">Draft → plan → schedule in one flow</td>
                    <td className="p-6 text-muted-foreground">Multi-step, tool-switched</td>
                  </tr>
                </tbody>
              </table>
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
              <span>Ready to make the switch?</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-orange-600 bg-clip-text text-transparent">
              Hypefury is a scheduler. Social Fox is an operating system for X
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Playbooks, analytics, and automations that compound output and outcomes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a 
                href="/sign-up" 
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get started with Social Fox
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


