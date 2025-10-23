import type { Metadata } from 'next'
import { ArrowRight, TrendingUp, Target, Zap, BarChart3, Sparkles, Calendar, Clock, CheckCircle, Repeat } from 'lucide-react'
import Footer from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'X Content Consistency Playbook for Operators | Social Fox',
  description: 'Build a repeatable X posting habit with playbooks, planner, and automation.'
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
              <span>Consistency Playbook</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-orange-600 bg-clip-text text-transparent leading-tight">
              Consistency on X, without the burnout
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Operators win with repeatable systems. Social Fox turns your ideas into a weekly publishing rhythm with playbooks, prompts, and a calendar that keeps you shipping.
            </p>
            
            <div className="mb-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-2xl blur-xl" />
              <img 
                src="/twitter-image.jpeg" 
                alt="Consistency on X" 
                className="relative w-full max-w-3xl mx-auto rounded-2xl shadow-2xl border border-white/20" 
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/sign-up" 
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
              Build your weekly X cadence
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="#features" 
                className="inline-flex items-center gap-2 px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                See how it works
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-orange-600 bg-clip-text text-transparent">
                Build a system that ships consistently
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Replace one-off inspiration with a weekly system built for operators.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group relative p-8 rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20 dark:border-orange-800/50 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Repeat className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">Weekly Cadence Engine</h3>
                  <p className="text-muted-foreground leading-relaxed">Lock a posting rhythm that compounds growth—no more feast-or-famine content.</p>
                </div>
              </div>
              
              <div className="group relative p-8 rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">Proven Playbooks</h3>
                  <p className="text-muted-foreground leading-relaxed">Plug-and-play prompts for hooks, intros, and CTAs to publish fast and well.</p>
                </div>
              </div>
              
              <div className="group relative p-8 rounded-2xl border border-green-200/50 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">Planner + Calendar</h3>
                  <p className="text-muted-foreground leading-relaxed">Map the week, batch drafts, and schedule in one focused view.</p>
                </div>
              </div>
              
              <div className="group relative p-8 rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">Automation Nudges</h3>
                  <p className="text-muted-foreground leading-relaxed">Smart reminders and status checks so nothing slips through.</p>
                </div>
              </div>
              
              <div className="group relative p-8 rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20 dark:border-orange-800/50 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 hover:shadow-lg md:col-span-2 lg:col-span-1">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-6 h-6 text-white" />
            </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">Track Your Streak</h3>
                  <p className="text-muted-foreground leading-relaxed">See consistency metrics and win the game of daily outputs.</p>
            </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-orange-600 bg-clip-text text-transparent">
                Ship on schedule, without guesswork
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Consistency compounds. Social Fox replaces one-off inspiration with a weekly system built for operators.
            </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="group relative p-8 rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50/30 to-transparent dark:from-orange-950/10 dark:border-orange-800/50 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">What you'll run each week</h3>
                  </div>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span>Monday: Idea sweep and hook drafts</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Midweek: Thread build and singles from the thread</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Friday: Schedule and QA</span>
                    </li>
            </ul>
                </div>
              </div>
              
              <div className="group relative p-8 rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-950/10 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Why it works</h3>
                  </div>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Clear cadence and templates reduce decision fatigue</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span>Automation and reminders keep drafts moving</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Streak tracking turns momentum into a habit</span>
                    </li>
            </ul>
                </div>
              </div>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-950/20 dark:to-blue-950/20 border border-orange-200/50 dark:border-orange-800/50">
              <p className="text-lg font-semibold text-foreground">
                Outcome: steady, high-signal posting that builds trust, reach, and demand.
              </p>
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
              <span>Ready to get consistent?</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-orange-600 bg-clip-text text-transparent">
              Ready to get consistent?
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Open the planner, follow the play, hit publish.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a 
                href="/sign-up" 
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
              Build your weekly X cadence
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="/playbooks" 
                className="inline-flex items-center gap-2 px-6 py-3 text-muted-foreground hover:text-foreground transition-colors border border-muted-foreground/20 hover:border-muted-foreground/40 rounded-lg"
              >
                Explore all playbooks
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


