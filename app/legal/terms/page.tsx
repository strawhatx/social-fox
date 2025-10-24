import type { Metadata } from 'next'
import { ArrowRight, FileText, Shield, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react'
import Navigation from '@/components/landing/navigation'
import Footer from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'Terms of Service | Social Fox',
  description: 'The terms and conditions for using Social Fox.'
}

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navigation />
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 rounded-full px-4 py-2 text-sm font-medium text-orange-700 dark:text-orange-300 mb-8">
              <FileText className="w-4 h-4" />
              <span>Terms of Service</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-orange-600 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              By using Social Fox, you agree to these terms. Simple, clear, and fair.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="group relative p-8 rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50/30 to-transparent dark:from-orange-950/10 dark:border-orange-800/50 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Acceptable Use</h2>
                  </div>
                  <p className="text-muted-foreground">
                    Use Social Fox in compliance with applicable laws and platform policies.
                  </p>
                </div>
              </div>
              
              <div className="group relative p-8 rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-950/10 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Subscriptions</h2>
                  </div>
                  <p className="text-muted-foreground">
                    Fees, renewals, and cancellations are handled via our billing provider.
                  </p>
                </div>
              </div>
              
              <div className="group relative p-8 rounded-2xl border border-green-200/50 bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-950/10 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Liability</h2>
                  </div>
                  <p className="text-muted-foreground">
                    Social Fox is provided "as is" without warranties. Our liability is limited to the maximum extent permitted by law.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-950/20 dark:to-blue-950/20 border border-orange-200/50 dark:border-orange-800/50">
              <p className="text-lg font-semibold text-foreground mb-4">
                Questions about our terms?
              </p>
              <p className="text-muted-foreground mb-6">
                We're here to help clarify anything.
              </p>
              <a 
                href="mailto:support@socialfox.dev" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Contact Support
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


