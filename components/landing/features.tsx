'use client';

import Link from 'next/link';
import { Bot, Settings, Clock, CheckCircle, Linkedin, Calendar, Zap, BarChart3, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Calendar,
      title: "30‑Day Content Scheduler / Calendar",
      description: "Plan your month visually, drag & drop posts, never miss a day.",
      color: "orange",
      link: "/calendar"
    },
    {
      icon: Zap,
      title: "AI Rewriter Drafts",
      description: "Rewrite your posts with AI to make them more engaging and viral.",
      color: "blue",
      link: "#"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track which posts are driving followers, replies, and clicks.",
      color: "green",
      link: "#"
    },
    {
      icon: MessageSquare,
      title: "Threads",
      description: "Plan and publish multi‑tweet threads with clean structure and CTAs.",
      color: "purple",
      link: "/features/thread-planner"
    }
  ];
  
  const getColorClasses = (color: string) => {
    const colors = {
      orange: {
        border: "border-orange-200/50 dark:border-orange-800/50",
        bg: "bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20",
        hoverBorder: "hover:border-orange-300 dark:hover:border-orange-700",
        iconBg: "bg-gradient-to-br from-orange-500 to-orange-600",
        text: "text-orange-600 dark:text-orange-400",
        link: "text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
      },
      blue: {
        border: "border-blue-200/50 dark:border-blue-800/50",
        bg: "bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20",
        hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700",
        iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
        text: "text-blue-600 dark:text-blue-400",
        link: "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      },
      green: {
        border: "border-green-200/50 dark:border-green-800/50",
        bg: "bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20",
        hoverBorder: "hover:border-green-300 dark:hover:border-green-700",
        iconBg: "bg-gradient-to-br from-green-500 to-green-600",
        text: "text-green-600 dark:text-green-400",
        link: "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
      },
      purple: {
        border: "border-purple-200/50 dark:border-purple-800/50",
        bg: "bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20",
        hoverBorder: "hover:border-purple-300 dark:hover:border-purple-700",
        iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
        text: "text-purple-600 dark:text-purple-400",
        link: "text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
      }
    };
    return colors[color as keyof typeof colors] || colors.orange;
  };

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 rounded-full px-4 py-2 text-sm font-medium text-orange-700 dark:text-orange-300 mb-8">
            <Sparkles className="w-4 h-4" />
            <span>What you get</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-orange-600 bg-clip-text text-transparent">
            Operator‑first features that drive outcomes
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Plan a 30‑day cadence, generate AI drafts, and learn what works—without context switching.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => {
            const colors = getColorClasses(feature.color);
            const IconComponent = feature.icon;
            
            return (
              <div
                key={index}
                className={`group relative p-8 rounded-2xl border ${colors.border} ${colors.bg} ${colors.hoverBorder} transition-all duration-300 hover:shadow-lg`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="mb-6">
                    <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  {feature.link !== "#" && (
                    <Link href={feature.link} className={`inline-flex items-center gap-2 font-medium ${colors.link} hover:gap-3 transition-all duration-300`}>
                      {index === 0 && "See the calendar"}
                      {index === 1 && "How AI drafts work"}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 md:p-12 text-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/90 to-red-500/90" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">Ready to automate your content?</h3>
            <p className="text-lg mb-8 opacity-90">Join thousands of creators who've streamlined their X presence.</p>
            <a 
              href="/sign-up" 
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Automate My Tweets
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;