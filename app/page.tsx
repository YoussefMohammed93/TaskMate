"use client";

import { FAQ } from "@/components/landing/faq";
import { Hero } from "@/components/landing/hero";
import { Header } from "@/components/landing/header";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";

export default function Main() {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <FAQ />
    </>
  );
}
