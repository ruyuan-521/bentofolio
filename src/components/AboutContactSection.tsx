"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { siteContent } from "@/lib/constants/siteContent";
import { contactInfo } from "@/lib/constants/contact";
import { socialLinks, platformColors } from "@/lib/constants/socials";
import { SocialIcon } from "@/components/SocialIcon";
import { useNavigation } from "@/hooks/useNavigation";
import { fadeInUp, scaleIn } from "@/lib/animation/variants";
import { Mail, MapPin, Phone, ArrowUpRight, MessageCircle, Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function AboutContactSection() {
  const { setShowContact, setShowWechat } = useNavigation();

  return (
    <motion.section
      id="about"
      custom={8}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="col-span-2 md:col-span-4 lg:col-span-2 mt-0 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-5 auto-rows-min scroll-mt-24 md:scroll-mt-28"
    >
      {/* About 大卡 */}
      <motion.article
        custom={9}
        variants={scaleIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="col-span-2 lg:col-span-2 rounded-3xl border border-border bg-card p-6 md:p-8 card-hover"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-border flex items-center justify-center">
            <MessageCircle size={16} />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">关于我</p>
        </div>
        <h2 className="text-xl md:text-2xl font-bold mb-3">
          打造让人热爱的产品。
        </h2>
        <p className="text-sm md:text-base text-text-muted leading-relaxed whitespace-pre-line">
          {siteContent.about}
        </p>
      </motion.article>

      {/* 💑 我们的小窝入口（情侣页 /love） */}
      <motion.article
        custom={9.5}
        variants={scaleIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="col-span-2 lg:col-span-2 rounded-3xl border border-rose-500/20 bg-gradient-to-r from-rose-500/[0.08] to-pink-500/[0.04] p-5 md:p-6 card-hover relative overflow-hidden group"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-rose-500/10 blur-2xl" />
        <Link href="/love" className="flex items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0"
          >
            <Heart size={20} className="text-rose-500 fill-rose-500" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
              我们的小窝
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/25 font-medium">
                LOVE
              </span>
            </h3>
            <p className="text-xs md:text-sm text-text-muted truncate">
              在一起的每一秒，都值得被记录 ♥
            </p>
          </div>
          <ArrowUpRight
            size={18}
            className="text-rose-400/70 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </motion.article>

      {/* Contact 小卡 */}
      <motion.article
        id="contact"
        custom={10}
        variants={scaleIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="col-span-2 md:col-span-1 rounded-3xl border border-border bg-text text-bg p-6 md:p-7 card-hover relative overflow-hidden group scroll-mt-24 md:scroll-mt-28"
      >
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-black/5 blur-2xl" />
        <p className="text-xs uppercase tracking-[0.2em] opacity-60 mb-3">联系方式</p>
        <h3 className="text-xl md:text-2xl font-bold mb-1 leading-tight">
          {contactInfo.ctaText}
        </h3>
        <p className="text-sm opacity-70 mb-6">
          给我发个消息，24 小时内回复你。
        </p>
        <div className="space-y-3 mb-6 text-sm">
          <a
            href={`mailto:${contactInfo.email}`}
            className="flex items-center gap-2.5 hover:underline underline-offset-4"
          >
            <Mail size={16} className="shrink-0" />
            <span className="truncate">{contactInfo.email}</span>
          </a>
          <div className="flex items-center gap-2.5 opacity-80">
            <MapPin size={16} className="shrink-0" />
            <span>{contactInfo.location}</span>
          </div>
          {contactInfo.phone && (
            <div className="flex items-center gap-2.5 opacity-80">
              <Phone size={16} className="shrink-0" />
              <span>{contactInfo.phone}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowContact(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-bg text-text text-sm font-semibold group-hover:bg-opacity-90 transition-colors"
        >
          发消息给我
          <ArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
      </motion.article>

      {/* Socials 小卡 */}
      <motion.article
        custom={11}
        variants={scaleIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="col-span-2 md:col-span-1 rounded-3xl border border-border bg-card p-6 md:p-7 card-hover"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted mb-3">
          社交平台
        </p>
        <h3 className="text-xl md:text-2xl font-bold mb-5 leading-tight">
          保持联系吧。
        </h3>
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {socialLinks
            .filter((s) => s.url)
            .slice(0, 8)
            .map((s) => (
              <a
                key={s.platform}
                href={s.platform === "wechat" ? undefined : s.url}
                target={s.platform === "wechat" ? undefined : "_blank"}
                rel="noreferrer noopener"
                aria-label={s.label}
                title={s.label}
                onClick={
                  s.platform === "wechat"
                    ? (e) => {
                        e.preventDefault();
                        setShowWechat(true);
                      }
                    : undefined
                }
                style={{ ["--hover" as never]: platformColors[s.platform] }}
                className={cn(
                  "aspect-square rounded-2xl border border-border bg-card-alt",
                  "flex items-center justify-center",
                  "hover:-translate-y-1 hover:border-[var(--hover)] hover:text-[var(--hover)]",
                  "transition-all duration-300"
                )}
              >
                <SocialIcon platform={s.platform} />
              </a>
            ))}
        </div>
      </motion.article>
    </motion.section>
  );
}
