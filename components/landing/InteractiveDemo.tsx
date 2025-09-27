import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, BookOpen, Clock, Zap, Heart, MessageCircle, Repeat2 } from 'lucide-react';

const InteractiveDemo = () => {
  const [selectedLibraryItem, setSelectedLibraryItem] = useState(0);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(0);

  const libraryItems = [
    {
      title: "Product Launch Announcement",
      category: "Launch",
      content: "🚀 Excited to announce our new AI writing assistant! After 6 months of building, we're finally ready to help creators craft authentic content. What do you think?",
      engagement: { likes: 234, comments: 45, reposts: 67 },
      color: "primary"
    },
    {
      title: "Founder Motivation",
      category: "Personal",
      content: "Building in public is scary but rewarding. Today marks 100 days of consistent shipping. The community support has been incredible. Keep building! 💪",
      engagement: { likes: 189, comments: 23, reposts: 34 },
      color: "secondary"
    },
    {
      title: "Feature Update",
      category: "Update",
      content: "New feature alert! 🎉 You can now schedule your posts directly from our dashboard. No more copy-pasting or switching between apps. Simple automation that works.",
      engagement: { likes: 156, comments: 31, reposts: 28 },
      color: "accent"
    }
  ];

  const calendarPosts = [
    {
      time: "9:00 AM",
      day: "Mon",
      date: "Dec 16",
      content: "Monday motivation: Small consistent actions beat sporadic bursts of effort every time. What's your one action today?",
      status: "scheduled",
      platform: "twitter"
    },
    {
      time: "2:00 PM",
      day: "Tue",
      date: "Dec 17",
      content: "Feature spotlight: Our new AI understands your brand voice and maintains consistency across all your content. Try it out!",
      status: "scheduled",
      platform: "twitter"
    },
    {
      time: "11:00 AM",
      day: "Wed",
      date: "Dec 18",
      content: "Behind the scenes: How we built our content AI to understand context and tone. Technical deep-dive coming soon! 🧵",
      status: "draft",
      platform: "twitter"
    },
    {
      time: "4:00 PM",
      day: "Thu",
      date: "Dec 19",
      content: "Community highlight: Thanks to @sarah_builds for the amazing feedback! Your success stories fuel our motivation to keep improving.",
      status: "scheduled",
      platform: "twitter"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            You're ready to go after your first prompt! 🚀
          </h2>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-12 max-w-7xl mx-auto">
          
          {/* Left Column - Library */}
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Build Your Own Library
              </h3>
              <p className="text-muted-foreground">Save and reuse your best-performing content templates</p>
            </div>

            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Content Library</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {libraryItems.length} templates
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  {libraryItems.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 cursor-pointer ${
                        selectedLibraryItem === index ? 'bg-primary/5 border-l-4 border-primary' : ''
                      }`}
                      onClick={() => setSelectedLibraryItem(index)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <Badge variant="outline" className="text-xs mt-1">
                            {item.category}
                          </Badge>
                        </div>
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      
                      {selectedLibraryItem === index && (
                        <div className="mt-4 space-y-3">
                          <div className="bg-background rounded-lg p-3 border">
                            <p className="text-sm leading-relaxed">{item.content}</p>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {item.engagement.likes}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {item.engagement.comments}
                            </div>
                            <div className="flex items-center gap-1">
                              <Repeat2 className="w-3 h-3" />
                              {item.engagement.reposts}
                            </div>
                          </div>
                          <Button size="sm" className="w-full">
                            Use This Template
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Calendar */}
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
                <Calendar className="w-6 h-6 text-secondary" />
                Plan Your Content Schedule
              </h3>
              <p className="text-muted-foreground">Schedule posts and maintain consistent engagement</p>
            </div>

            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">This Week</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    4 posts scheduled
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  {calendarPosts.map((post, index) => (
                    <div
                      key={index}
                      className={`p-4 cursor-pointer ${
                        selectedCalendarDay === index ? 'bg-secondary/5 border-l-4 border-secondary' : ''
                      }`}
                      onClick={() => setSelectedCalendarDay(index)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-xs font-medium text-muted-foreground">{post.day}</div>
                            <div className="text-sm font-bold">{post.date.split(' ')[1]}</div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{post.time}</span>
                              <Badge 
                                variant={post.status === 'scheduled' ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                {post.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {selectedCalendarDay === index && (
                        <div className="mt-4 space-y-3">
                          <div className="bg-background rounded-lg p-3 border">
                            <p className="text-sm leading-relaxed">{post.content}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                                <span className="text-white text-xs font-bold">X</span>
                              </div>
                              <span className="text-xs text-muted-foreground">Twitter</span>
                            </div>
                            <Button size="sm" variant="outline">
                              Edit Post
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <Button className="w-full" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Full Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;