import type { Metadata } from 'next'
import Image from 'next/image'
import { ArrowRight, TrendingUp, Target, Zap, BarChart3, Sparkles, Calendar, Clock, CheckCircle, MessageSquare } from 'lucide-react'
import Navigation from '@/components/landing/navigation'
import Footer from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'Twitter Analytics — See What Works & Publish Smarter',
  description: 'View Twitter analytics directly inside your content planner. Understand what resonates and make smarter publishing decisions — without complexity.'
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
              <span>📊 Analytics</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-orange-600 bg-clip-text text-transparent leading-tight">
              Clear insights. Better decisions. Zero confusion.
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              You don&apos;t need a PhD in charts — you just want to know what&apos;s landing.<br />
              Social Fox brings your X analytics into a single workspace so you can spot what&apos;s working and repeat it.
            </p>
            
            <div className="mb-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-2xl blur-xl" />
              <Image 
                src="/results/x-post-2.jpeg" 
                alt="Analytics Dashboard" 
                width={1200}
                height={675}
                className="relative w-full max-w-3xl mx-auto rounded-2xl shadow-2xl border border-white/20" 
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/sign-up" 
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                View Your Analytics
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
                See your results where planning happens
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Analytics integrated into your workflow, not buried in separate dashboards.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="group relative p-8 rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20 dark:border-orange-800/50 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">Post Performance View</h3>
                  <p className="text-muted-foreground leading-relaxed">See reach, likes, replies, and reposts — without leaving your content planner.</p>
                </div>
              </div>
              
              <div className="group relative p-8 rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">Thread-by-Thread Stats</h3>
                  <p className="text-muted-foreground leading-relaxed">Understand which ideas resonate so you can build smarter follow-ups.</p>
                </div>
              </div>
              
              <div className="group relative p-8 rounded-2xl border border-green-200/50 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">Calendar Performance Overlay <span className="text-sm text-muted-foreground">(Coming Soon)</span></h3>
                  <p className="text-muted-foreground leading-relaxed">Spot high-signal publishing times and patterns at a glance.</p>
                </div>
              </div>
              
              <div className="group relative p-8 rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">Format Insights <span className="text-sm text-muted-foreground">(Coming Soon)</span></h3>
                  <p className="text-muted-foreground leading-relaxed">See which types of posts earn engagement so you can lean into what converts.</p>
                </div>
              </div>
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
                Why this matters
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Simple benefits that make analytics feel useful, not overwhelming.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="group relative p-8 rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50/30 to-transparent dark:from-orange-950/10 dark:border-orange-800/50 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">No more guessing in different apps</h3>
                  </div>
                  <p className="text-muted-foreground">See what&apos;s working right where you plan your content.</p>
                </div>
              </div>
              
              <div className="group relative p-8 rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-950/10 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Learn from what your audience actually cares about</h3>
                  </div>
                  <p className="text-muted-foreground">Data shows you what resonates, not what you think should work.</p>
                </div>
              </div>
              
              <div className="group relative p-8 rounded-2xl border border-green-200/50 bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-950/10 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Make publishing decisions based on signal — not superstition</h3>
                  </div>
                  <p className="text-muted-foreground">Use real data to guide your content strategy.</p>
                </div>
              </div>
              
              <div className="group relative p-8 rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50/30 to-transparent dark:from-purple-950/10 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Clear data → better content → more growth</h3>
                  </div>
                  <p className="text-muted-foreground">When you know what works, you can do more of it.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Preview Section */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-orange-600 bg-clip-text text-transparent">
                Roadmap Preview <br/><span className="text-lg text-muted-foreground">(transparent & exciting)</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Here&apos;s what we&apos;re building next — and we&apos;re moving fast.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group relative p-8 rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50/30 to-transparent dark:from-orange-950/10 dark:border-orange-800/50 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">AI timing suggestions</h3>
                  </div>
                  <p className="text-muted-foreground">Post when your audience is active</p>
                </div>
              </div>
              
              <div className="group relative p-8 rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-950/10 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Swipe-able post breakdowns</h3>
                  </div>
                  <p className="text-muted-foreground">Learn from your top content</p>
                </div>
              </div>
              
              <div className="group relative p-8 rounded-2xl border border-green-200/50 bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-950/10 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Consistency momentum tracking</h3>
                  </div>
                  <p className="text-muted-foreground">See your publishing rhythm and streaks</p>
                </div>
              </div>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-950/20 dark:to-blue-950/20 border border-orange-200/50 dark:border-orange-800/50 mt-16">
              <p className="text-lg text-muted-foreground">
                <strong className="text-foreground">Yes, this is where we&apos;re headed — and fast.</strong>
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
              <span>Ready to see what&apos;s working?</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-orange-600 bg-clip-text text-transparent">
              View Your Analytics
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Start seeing what resonates with your audience and make smarter content decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a 
                href="/sign-up" 
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                View Your Analytics
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="/features" 
                className="inline-flex items-center gap-2 px-6 py-3 text-muted-foreground hover:text-foreground transition-colors border border-muted-foreground/20 hover:border-muted-foreground/40 rounded-lg"
              >
                Explore All Features
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


