"use client";

import { AnimatePresence, motion } from "motion/react";
import { navItems } from "@/lib/constants/navItems";
import { socialLinks, platformColors } from "@/lib/constants/socials";
import { SocialIcon } from "@/components/SocialIcon";
import { siteContent } from "@/lib/constants/siteContent";
import { contactInfo } from "@/lib/constants/contact";
import { Mail, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onContact: () => void;
}

export default function MobileNav({ isOpen, onClose, onContact }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-30 md:hidden"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-bg/80 backdrop-blur-xl"
            onClick={onClose}
          />
          {/* Content */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-card border-l border-border h-full overflow-y-auto"
          >
            <div className="p-6 pt-24 flex flex-col h-full">
              {/* Nav links */}
              <nav className="flex flex-col gap-1 mb-10">
                {navItems.map((item, i) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className="px-4 py-4 rounded-2xl text-xl font-medium hover:bg-white/[0.04] transition-colors"
                  >
                    {item.label}
                  </motion.a>
                ))}
              </nav>

              {/* Info */}
              <div className="space-y-4 mb-8 text-sm text-text-muted">
                <div className="flex items-center gap-3">
                  <Mail size={16} />
                  <a href={`mailto:${contactInfo.email}`} className="hover:text-text transition-colors">
                    {contactInfo.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} />
                  <span>{contactInfo.location}</span>
                </div>
                {contactInfo.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={16} />
                    <span>{contactInfo.phone}</span>
                  </div>
                )}
              </div>

              {/* Contact CTA */}
              <button
                onClick={onContact}
                className="w-full py-4 rounded-2xl bg-text text-bg font-semibold mb-8 hover:bg-text-muted transition-colors"
              >
                {contactInfo.ctaText}
              </button>

              {/* Social */}
              <div className="mt-auto">
                <p className="text-xs uppercase tracking-widest text-text-muted mb-3">
                  也可以通过这里找到我
                </p>
                <div className="flex flex-wrap gap-2">
                  {socialLinks
                    .filter((s) => s.url)
                    .map((s) => (
                      <a
                        key={s.platform}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={s.label}
                        style={{
                          ["--hover" as never]: platformColors[s.platform],
                        }}
                        className={cn(
                          "w-11 h-11 rounded-xl border border-border",
                          "flex items-center justify-center",
                          "hover:border-[var(--hover)] hover:text-[var(--hover)] transition-colors"
                        )}
                      >
                        <SocialIcon platform={s.platform} />
                      </a>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
