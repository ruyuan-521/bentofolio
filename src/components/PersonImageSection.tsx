"use client";

import { motion } from "motion/react";
import { siteContent } from "@/lib/constants/siteContent";
import { fadeInUp, scaleIn } from "@/lib/animation/variants";
import { MapPin } from "lucide-react";
import { contactInfo } from "@/lib/constants/contact";
import { cn } from "@/lib/utils/cn";

export default function PersonImageSection() {
  return (
    <>
      {/* 照片大卡 */}
      <motion.div
        custom={3}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-2 md:col-span-2 lg:col-span-2 row-span-2
                   rounded-3xl border border-border overflow-hidden relative card-hover bg-card-alt"
      >
        {/* 个人形象大图
            使用原生 <img>：本地静态图无需重启 dev server，HMR 热更新直接生效 */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/user-hero-image.jpg"
            alt="个人形象大图"
            fetchPriority="high"
            className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
          />
          {/* 柔和蓝色渐变叠加，和角色蓝头发色调协调，同时衬托底部文字可读 */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/15 via-blue-500/10 to-indigo-500/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-bg/10 to-transparent" />
        </div>

        {/* 底部信息 */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted mb-1">{siteContent.title}</p>
              <h3 className="text-xl md:text-2xl font-bold">{siteContent.fullName}</h3>
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-text-muted">
                <MapPin size={14} />
                <span>{contactInfo.location}</span>
              </div>
            </div>
            {/* 在线状态点 */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs font-medium whitespace-nowrap">{contactInfo.availability}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats 小卡 — 放在照片旁边一列 */}
      <motion.div
        custom={4}
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="col-span-2 md:col-span-0 lg:col-span-1 row-span-2 hidden lg:grid grid-rows-2 gap-5"
      >
        {/* 上半：状态 */}
        <div className="rounded-3xl border border-border bg-card p-5 card-hover flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-spotify/10 text-spotify flex items-center justify-center mb-3">
            <MapPin size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted mb-1">所在地</p>
            <p className="text-lg font-bold leading-tight">{contactInfo.location}</p>
            <p className="mt-2 text-xs text-spotify inline-flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-spotify opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-spotify" />
              </span>
              {contactInfo.availability}
            </p>
          </div>
        </div>

        {/* 下半：数字统计网格 */}
        <div className="rounded-3xl border border-border bg-card p-5 card-hover grid grid-cols-2 grid-rows-2 gap-3">
          {siteContent.stats.map((s, i) => (
            <div key={s.label} className={cn(
              "flex flex-col justify-center",
              i < 2 && "border-b border-border pb-3",
              i % 2 === 0 && "border-r border-border pr-3",
              i % 2 === 1 && "pl-1",
              i >= 2 && "pt-1",
            )}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-[11px] text-text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
