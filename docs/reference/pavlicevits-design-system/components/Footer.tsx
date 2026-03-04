import React from 'react';
import { cn } from '@/lib/utils';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  logo?: React.ReactNode;
  companyName?: string;
  tagline?: string;
  columns: FooterColumn[];
  socialLinks?: Array<{
    icon: React.ReactNode;
    href: string;
    label: string;
  }>;
  copyrightYear?: number;
  bottomLinks?: FooterLink[];
  className?: string;
}

export function Footer({
  logo,
  companyName = 'Pavlicevits',
  tagline,
  columns,
  socialLinks,
  copyrightYear = new Date().getFullYear(),
  bottomLinks,
  className,
}: FooterProps) {
  return (
    <footer className={cn('bg-card border-t border-border', className)}>
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4">
              {logo || (
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">P</span>
                </div>
              )}
              <span className="text-lg font-bold text-foreground uppercase tracking-wide">
                {companyName}
              </span>
            </div>

            {/* Tagline */}
            {tagline && (
              <p className="text-sm text-muted-foreground max-w-xs">
                {tagline}
              </p>
            )}

            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="flex gap-3 mt-6">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Columns */}
          {columns.map((column, index) => (
            <div key={index}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {copyrightYear} {companyName}. All rights reserved.
          </p>

          {bottomLinks && bottomLinks.length > 0 && (
            <div className="flex items-center gap-6">
              {bottomLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
