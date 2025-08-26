import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Helmet } from 'react-helmet-async';

const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "How does Social Fox automate my GitHub activity into social posts?",
      answer: "Social Fox connects to your GitHub account and monitors your activity (commits, pull requests, releases). When you make changes, our AI analyzes the technical details and converts them into engaging, platform-specific content for Twitter/X and LinkedIn."
    },
    {
      question: "What platforms does Social Fox support?",
      answer: "Currently, Social Fox supports Twitter/X and LinkedIn. Each platform gets optimized content with appropriate hashtags, formatting, and tone for maximum engagement."
    },
    {
      question: "Do I have control over what gets posted?",
      answer: "Absolutely! Social Fox generates ready-to-post content that you can review, edit, and approve before publishing. You decide when and what goes live - we just make the content creation effortless."
    },
    {
      question: "Is Social Fox suitable for indie hackers and solo developers?",
      answer: "Yes! Social Fox is specifically designed for indie hackers, solo founders, and busy developers who want to build in public without spending time crafting social media posts. It's perfect for showcasing your work while you focus on building."
    },
    {
      question: "How much does Social Fox cost?",
      answer: "Social Fox offers a free beta with 15 credits to get started. Each credit generates one social media post. We'll be introducing affordable paid plans as we expand features and platform support."
    },
    {
      question: "What kind of GitHub activity does Social Fox track?",
      answer: "Social Fox tracks commits, pull requests, releases, and other significant repository activity. It focuses on meaningful changes that tell the story of your project's progress."
    },
    {
      question: "Can I customize the tone and style of the generated posts?",
      answer: "Yes! Social Fox allows you to customize the tone (professional, casual, or technical) and formatting to match your personal brand and voice."
    },
    {
      question: "Is my GitHub data secure?",
      answer: "Security is our top priority. We only access the minimal GitHub data needed to generate content, and we follow industry-standard security practices to protect your information."
    }
  ];

  // Generate FAQ structured data for SEO
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about automating your GitHub activity into social media posts.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 px-6"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:no-underline py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pb-6 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? We'd love to help you out.
          </p>
          <a 
            href="mailto:support@socialfox.dev" 
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
