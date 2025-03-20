"use client";

import Link from "next/link";
import { Logo } from "../logo";
import { cn } from "@/lib/utils";
import { Github, Linkedin, Facebook, Instagram } from "lucide-react";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it Works", href: "#how-it-works" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "#contact" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Documentation", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61552702670893",
    icon: Facebook,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/youssef-mohammed-6893a031b",
    icon: Linkedin,
  },
  {
    label: "Github",
    href: "https://github.com/YoussefMohammed93",
    icon: Github,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/youssef_mohamed.93",
    icon: Instagram,
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-card dark:bg-secondary">
      <div className="mx-auto max-w-[1280px] px-5 py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="flex flex-col gap-6 col-span-1 sm:col-span-2 lg:col-span-2">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-md">
              Your personal productivity companion for enhanced focus and
              organization.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "size-9 flex items-center justify-center rounded-lg transition-colors",
                    "bg-background hover:bg-primary/10 border"
                  )}
                  aria-label={social.label}
                >
                  <social.icon className="size-4 text-foreground" />
                </Link>
              ))}
            </div>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold text-foreground">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      onClick={(e) => {
                        if (link.href.startsWith("#")) {
                          e.preventDefault();
                          document.querySelector(link.href)?.scrollIntoView({
                            behavior: "smooth",
                          });
                        }
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-5 mt-5 border-t">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} TaskMate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
