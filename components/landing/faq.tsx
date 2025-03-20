"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is TaskMate?",
    answer:
      "TaskMate is a comprehensive productivity tool that combines task management, Pomodoro timer, and mind mapping features in one seamless workspace. It helps you organize tasks, maintain focus, and boost your daily productivity.",
  },
  {
    question: "Is TaskMate free to use?",
    answer:
      "Yes! TaskMate offers a generous free-forever plan that includes all core features. Premium features are available for users who need advanced productivity tools and capabilities.",
  },
  {
    question: "How does the Pomodoro timer work?",
    answer:
      "TaskMate's Pomodoro timer follows the popular time-management method with customizable work and break intervals. The default setting is 25 minutes of focused work followed by 5-minute breaks, but you can adjust these intervals to match your preferred workflow.",
  },
  {
    question: "What makes TaskMate different from other productivity apps?",
    answer:
      "TaskMate stands out by combining essential productivity tools in one intuitive interface, featuring AI-powered suggestions, seamless integration between features, and a clean, distraction-free design focused on enhancing your workflow.",
  },
];

export function FAQ() {
  return (
    <section
      id="faq"
      className="relative pb-24 overflow-hidden bg-background"
      aria-label="FAQ Section"
    >
      <div
        role="presentation"
        className="absolute top-1/4 -left-64 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"
      />
      <div
        role="presentation"
        className="absolute bottom-0 -right-64 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"
      />
      <div className="relative mx-auto max-w-[1260px] px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about TaskMate and how it can help
            improve your productivity.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
