"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import Logo from "@/components/Logo";

export default function Footer() {
  const footerLinks = {
    platform: [
      { name: "Home", href: "/" },
      { name: "Lost Items", href: "/lost" },
      { name: "Found Items", href: "/found" },
      { name: "Share Items", href: "/share" },
    ],
    account: [
      { name: "My Items", href: "/my-items" },
      { name: "My Claims", href: "/claims" },
      { name: "Profile", href: "/profile" },
      { name: "Settings", href: "/settings" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Contact Us", href: "/contact" },
      { name: "Report Issue", href: "/report" },
      { name: "Safety Guidelines", href: "/safety" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Community Guidelines", href: "/guidelines" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  };

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Logo size="md" showText={true} className="mb-4" />
              <p className="text-muted-foreground mb-6 max-w-md">
                The modern platform connecting JnU students through lost & found
                services, item sharing, and community building. Safe, secure,
                and student-verified.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>support@circlehub.jnu.edu</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>+88 (02) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>JnU Campus, Dhaka</span>
                </div>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Platform
              </h3>
              <ul className="space-y-3">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account Links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Account
              </h3>
              <ul className="space-y-3">
                {footerLinks.account.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Support
              </h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="py-8 border-t border-border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Stay Updated
              </h3>
              <p className="text-muted-foreground">
                Get notified about new features and JnU campus updates.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
