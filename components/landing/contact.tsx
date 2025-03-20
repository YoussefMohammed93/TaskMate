"use client";

import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useForm } from "@formspree/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Send, Mail, User, MessageSquare } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function ContactUs() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [state, formspreeHandleSubmit] = useForm("xaneqlqz");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await formspreeHandleSubmit(e);

      if (state.succeeded) {
        setFormData({ name: "", email: "", message: "" });

        toast.success("Message sent successfully!", {
          description: "We'll get back to you within 24 hours.",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to send message", {
        description: "Please try again later.",
      });
    }
  };

  return (
    <section
      id="contact"
      className="relative pb-20 overflow-hidden bg-background"
      aria-label="Contact Us Section"
    >
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Let&apos;s Start a Conversation
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Have questions or feedback? We&apos;re here to help and would love
            to hear from you.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm">
            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      Contact Information
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Fill out the form and we&apos;ll get back to you within 24
                      hours.
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Mail className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">
                          support@taskmate.com
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <form onSubmit={onSubmit} className="space-y-6">
                  <div>
                    <div className="relative">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="size-4 text-muted-foreground" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className={cn(
                            "w-full pl-10 pr-4 py-2 rounded-lg border bg-background/50 placeholder:text-muted-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20",
                            errors.name &&
                              "border-destructive focus:ring-destructive/20"
                          )}
                          placeholder="Your name"
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-destructive">
                          {errors.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="size-4 text-muted-foreground" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className={cn(
                            "w-full pl-10 pr-4 py-2 rounded-lg border bg-background/50 placeholder:text-muted-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20",
                            errors.email &&
                              "border-destructive focus:ring-destructive/20"
                          )}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-destructive">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Message
                      </label>
                      <div className="relative">
                        <div className="absolute left-0 top-3 pl-3 pointer-events-none">
                          <MessageSquare className="size-4 text-muted-foreground" />
                        </div>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              message: e.target.value,
                            })
                          }
                          rows={4}
                          className={cn(
                            "w-full pl-10 pr-4 py-2 rounded-lg border bg-background/50 placeholder:text-muted-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20",
                            "resize-none",
                            errors.message &&
                              "border-destructive focus:ring-destructive/20"
                          )}
                          placeholder="Your message here..."
                        />
                      </div>
                      {errors.message && (
                        <p className="mt-1 text-sm text-destructive">
                          {errors.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      type="submit"
                      disabled={state.submitting}
                      className="w-full transition-all duration-200 hover:scale-[1.02]"
                    >
                      {state.submitting ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 size-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
