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
  copyrightYear = new Date().getFullYear(),
  bottomLinks,
  className,
}: FooterProps) {
  return (
    <footer className={cn('bg-background border-t border-border py-12 px-6 md:px-20 mt-12', className)}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        <div className="md:col-span-5 border-border space-y-6 flex flex-col items-start text-left">
          <div className="flex items-center gap-3">
            {logo}
            <h2 className="text-lg font-black uppercase tracking-tighter text-foreground">{companyName}</h2>
          </div>
          {tagline && (
            <p className="text-muted-foreground text-sm leading-relaxed text-left max-w-sm">
              {tagline}
            </p>
          )}
        </div>

        {columns.map((column, index) => (
          <div key={index} className={cn(
            "flex flex-col text-left items-start",
            index === 0 ? "md:col-span-2" : index === 1 ? "md:col-span-2" : "md:col-span-3"
          )}>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-foreground">{column.title}</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              {column.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <a href={link.href} className="hover:text-accent transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest text-center md:text-left">
          © {copyrightYear} {companyName} International. All Rights Reserved.
        </p>
        {bottomLinks && (
          <div className="flex gap-8 justify-center md:justify-end">
            {bottomLinks.map((link, index) => (
              <a key={index} href={link.href} className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest hover:text-foreground">
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}

export default Footer;
