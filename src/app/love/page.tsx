"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { loveConfig } from "@/lib/constants/love";
import { fadeInUp, scaleIn } from "@/lib/animation/variants";
import { ArrowLeft, Heart, MessageCircleHeart, Camera } from "lucide-react";

/** 实时计算在一起时长：天 : 时 : 分 : 秒 */
function useTogetherTime(startISO: string) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // SSR 时不渲染具体数字，避免水合不一致
  if (now === null) return null;
  const start = new Date(startISO).getTime();
  const dist = Math.max(0, now - start);
  const days = Math.floor(dist / 86400000);
  const hours = Math.floor((dist % 86400000) / 3600000);
  const minutes = Math.floor((dist % 3600000) / 60000);
  const seconds = Math.floor((dist % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

/** 圆形头像（无图时显示名字首字符占位） */
function Avatar({ name, avatar, delay }: { name: string; avatar: string; delay: number }) {
  return (
    <motion.div
      custom={delay}
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-4"
    >
      <div className="relative w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-rose-500/30 ring-4 ring-rose-500/10 shadow-2xl shadow-rose-500/20 bg-card-alt">
        {avatar ? (
          <Image src={avatar} alt={name} fill sizes="160px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl md:text-5xl font-bold text-rose-300/70 bg-gradient-to-br from-rose-500/15 to-pink-500/10">
            {name.charAt(0)}
          </div>
        )}
      </div>
      <span className="text-lg md:text-2xl font-bold tracking-wide">{name}</span>
    </motion.div>
  );
}

export default function LovePage() {
  const t = useTogetherTime(loveConfig.startDate);

  const units = t
    ? [
        { value: t.days, label: "天" },
        { value: t.hours, label: "时" },
        { value: t.minutes, label: "分" },
        { value: t.seconds, label: "秒" },
      ]
    : null;

  return (
    <main className="min-h-screen bg-bg relative overflow-hidden">
      {/* 玫瑰色背景光晕 */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-rose-500/[0.07] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-pink-500/[0.06] blur-[100px]" />
      </div>

      <div className="px-5 md:px-10 lg:px-16 pt-10 md:pt-14 pb-16 max-w-[1100px] mx-auto">
        {/* 返回 */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          返回主页
        </Link>

        {/* ===== 双头像 + 爱心 ===== */}
        <div className="flex items-center justify-center gap-6 md:gap-14 mb-12">
          <Avatar name={loveConfig.left.name} avatar={loveConfig.left.avatar} delay={1} />

          <motion.div
            custom={2}
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-2"
          >
            <motion.div
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart size={52} className="text-rose-500 fill-rose-500 drop-shadow-[0_0_18px_rgba(244,63,94,0.45)]" />
            </motion.div>
            <span className="text-xs md:text-sm text-text-muted tracking-widest">FOREVER</span>
          </motion.div>

          <Avatar name={loveConfig.right.name} avatar={loveConfig.right.avatar} delay={3} />
        </div>

        {/* ===== 在一起计时器 ===== */}
        <motion.section
          custom={4}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="rounded-3xl border border-border bg-card p-8 md:p-12 mb-8 text-center"
        >
          <h1 className="text-xl md:text-3xl font-bold mb-8 tracking-wide">
            {loveConfig.title}
          </h1>
          {units ? (
            <div className="flex items-end justify-center gap-3 md:gap-6">
              {units.map((u, i) => (
                <div key={u.label} className="flex items-end gap-3 md:gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl md:text-7xl font-bold tabular-nums tracking-tight bg-gradient-to-b from-rose-400 to-pink-500 bg-clip-text text-transparent">
                      {String(u.value).padStart(2, "0")}
                    </span>
                    <span className="text-xs md:text-sm text-text-muted">{u.label}</span>
                  </div>
                  {i < units.length - 1 && (
                    <span className="text-3xl md:text-6xl font-bold text-rose-500/30 pb-6 md:pb-8">:</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-24 md:h-32" />
          )}
          <p className="mt-8 text-sm text-text-muted">
            自 {new Date(loveConfig.startDate).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })} 起，每一天都算数
          </p>
        </motion.section>

        {/* ===== 相册 ===== */}
        <motion.section
          custom={5}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="rounded-3xl border border-border bg-card p-8 md:p-10 mb-8"
        >
          <h2 className="flex items-center gap-2 text-lg md:text-xl font-bold mb-6">
            <Camera size={18} className="text-rose-400" />
            我们的相册
          </h2>
          {loveConfig.album.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loveConfig.album.map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-border group">
                  <Image
                    src={photo.url}
                    alt={photo.title || `照片 ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {photo.title && (
                    <div className="absolute bottom-0 inset-x-0 p-3 text-xs bg-gradient-to-t from-black/60 to-transparent text-white">
                      {photo.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center text-sm text-text-muted">
              相册还是空的，等待放入美好瞬间 ~
              <div className="mt-2 text-xs opacity-70">（照片放到 public/ 目录，配置在 src/lib/constants/love.ts）</div>
            </div>
          )}
        </motion.section>

        {/* ===== 留言引导 ===== */}
        <motion.section
          custom={6}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/[0.06] to-pink-500/[0.04] p-8 md:p-10 text-center"
        >
          <MessageCircleHeart size={28} className="mx-auto mb-4 text-rose-400" />
          <h2 className="text-lg md:text-xl font-bold mb-2">给我们留句话吧</h2>
          <p className="text-sm text-text-muted mb-6">你们的祝福，我们都认真收藏</p>
          <Link
            href="/#guestbook"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-500 text-white text-sm font-medium hover:bg-rose-400 transition-colors"
          >
            去留言板
            <Heart size={14} className="fill-current" />
          </Link>
        </motion.section>

        <footer className="mt-16 pt-8 border-t border-border text-sm text-text-muted flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="flex items-center gap-1.5">
            © {new Date().getFullYear()} 我们的小窝 · 用
            <span className="text-rose-500">❤</span>
            打造
          </p>
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-text transition-colors">
            渊 · Yuan <Heart size={12} className="text-rose-500 fill-rose-500" />
          </Link>
        </footer>
      </div>
    </main>
  );
}
