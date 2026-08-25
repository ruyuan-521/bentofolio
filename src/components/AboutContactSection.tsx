"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { siteContent } from "@/lib/constants/siteContent";
import { contactInfo } from "@/lib/constants/contact";
import { socialLinks, platformColors } from "@/lib/constants/socials";
import { SocialIcon } from "@/components/SocialIcon";
import { useNavigation } from "@/hooks/useNavigation";
import { fadeInUp, scaleIn } from "@/lib/animation/variants";
import { Mail, MapPin, Phone, ArrowUpRight, MessageCircle, Heart, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function AboutContactSection() {
  const { setShowWechat } = useNavigation();
  const [copied, setCopied] = useState(false);

  const copyWechat = async () => {
    try {
      await navigator.clipboard.writeText(contactInfo.wechat);
    } catch {
      /* 剪贴板不可用时静默失败，用户仍可手动复制 */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          {/* 微信号 + 一键复制 */}
          <div className="flex items-center gap-2.5">
            <span className="text-[#07C160] shrink-0">
              <SocialIcon platform="wechat" size={16} />
            </span>
            <span className="truncate">{contactInfo.wechat}</span>
            <button
              type="button"
              onClick={copyWechat}
              className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-current/20 hover:bg-black/5 transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check size={12} /> 已复制
                </>
              ) : (
                <>
                  <Copy size={12} /> 复制
                </>
              )}
            </button>
          </div>
          {/* 抖音主页链接 */}
          <a
            href={contactInfo.douyinUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2.5 hover:underline underline-offset-4"
          >
            <span className="text-[#FE2C55] shrink-0">
              <SocialIcon platform="douyin" size={16} />
            </span>
            <span className="truncate">抖音：{contactInfo.douyinId}</span>
            <ArrowUpRight size={13} className="shrink-0 opacity-60" />
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
        <a
          href={`mailto:${contactInfo.email}?subject=${encodeURIComponent("来自网站的留言")}`}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-bg text-text text-sm font-semibold group-hover:bg-opacity-90 transition-colors"
        >
          发消息给我
          <ArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
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

        {/* 微信专属横幅：最想让人用的联系方式，绿色高亮但不喧宾夺主 */}
        <button
          type="button"
          onClick={() => setShowWechat(true)}
          className="w-full flex items-center gap-3.5 rounded-2xl border border-[#07C160]/40 bg-[#07C160]/[0.08] p-3.5 mb-4 text-left hover:border-[#07C160]/70 hover:bg-[#07C160]/[0.14] transition-colors group/wechat"
        >
          <div className="w-11 h-11 rounded-xl bg-[#07C160]/15 border border-[#07C160]/30 flex items-center justify-center text-[#07C160] shrink-0">
            <SocialIcon platform="wechat" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold flex items-center gap-1.5">
              加我微信
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#07C160]/15 text-[#07C160] border border-[#07C160]/25 font-medium">
                最快回复
              </span>
            </p>
            <p className="text-xs text-text-muted truncate">
              扫码加好友，或复制微信号
            </p>
          </div>
          <ArrowUpRight
            size={16}
            className="text-[#07C160]/70 shrink-0 transition-transform group-hover/wechat:translate-x-0.5 group-hover/wechat:-translate-y-0.5"
          />
        </button>

        {/* 其余平台图标（放大一号） */}
        <div className="grid grid-cols-4 gap-2.5 md:gap-3">
          {socialLinks
            .filter((s) => s.url && s.platform !== "wechat")
            .slice(0, 8)
            .map((s) => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={s.label}
                title={s.label}
                style={{ ["--hover" as never]: platformColors[s.platform] }}
                className={cn(
                  "aspect-square rounded-2xl border border-border bg-card-alt",
                  "flex items-center justify-center",
                  "hover:-translate-y-1 hover:border-[var(--hover)] hover:text-[var(--hover)]",
                  "transition-all duration-300"
                )}
              >
                <SocialIcon platform={s.platform} size={24} />
              </a>
            ))}
        </div>
      </motion.article>
    </motion.section>
  );
}
