"use client";

import { FAQ } from "@/components/landing/faq";
import { Hero } from "@/components/landing/hero";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Features } from "@/components/landing/features";
import { ContactUs } from "@/components/landing/contact";
import { HowItWorks } from "@/components/landing/how-it-works";

export default function Main() {
  return (
    <main>
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <FAQ />
      <ContactUs />
      <Footer />
    </main>
  );
}
