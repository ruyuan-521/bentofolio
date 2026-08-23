"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/lib/constants/projects";
import { scaleIn, fadeInUp } from "@/lib/animation/variants";
import { ArrowUpRight, Github, ExternalLink, Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** 单个项目的点赞按钮（状态由 ProjectsSection 统一管理） */
function LikeButton({
  projectKey,
  count,
  liked,
  onToggle,
  size = "sm",
}: {
  projectKey: string;
  count: number;
  liked: boolean;
  onToggle: (key: string) => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(projectKey);
      }}
      aria-label={liked ? "取消点赞" : "点赞"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-all active:scale-90 select-none",
        size === "md" ? "px-3 py-1.5" : "px-2.5 py-1",
        liked
          ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
          : "border-border bg-card-alt/80 backdrop-blur-md text-text-muted hover:text-rose-400 hover:border-rose-500/30"
      )}
    >
      <Heart
        size={size === "md" ? 15 : 13}
        className={cn(liked && "fill-current")}
      />
      <span className="text-xs tabular-nums font-medium">
        {count > 0 ? count : "赞"}
      </span>
    </button>
  );
}

export default function ProjectsSection() {
  const featured = projects.find((p) => p.featured) ?? projects[0];
  const rest = projects.filter((p) => p !== featured);

  // ---------- 点赞状态 ----------
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/projects/likes")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setLikeCounts(d.counts || {});
          setLikedSet(new Set(d.liked || []));
        }
      })
      .catch(() => {});
  }, []);

  // likedSet 的最新引用（乐观更新计算 delta 用，避免闭包旧值）
  const likedSetRef = useRef(new Set<string>());
  useEffect(() => {
    likedSetRef.current = likedSet;
  }, [likedSet]);

  const toggleLike = useCallback(async (key: string) => {
    // 乐观更新：先改 UI，再发请求
    const wasLiked = likedSetRef.current.has(key);
    setLikedSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setLikeCounts((prev) => {
      const cur = prev[key] ?? 0;
      const delta = wasLiked ? -1 : 1;
      return { ...prev, [key]: Math.max(0, cur + delta) };
    });
    try {
      const r = await fetch("/api/projects/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const d = await r.json();
      if (d.ok) {
        // 以服务端结果为准（并发安全）
        setLikeCounts((prev) => ({ ...prev, [key]: d.count }));
        setLikedSet((prev) => {
          const next = new Set(prev);
          if (d.liked) next.add(key);
          else next.delete(key);
          return next;
        });
      }
    } catch {
      /* 失败就刷新真实状态 */
      fetch("/api/projects/likes")
        .then((r) => r.json())
        .then((d) => {
          if (d.ok) {
            setLikeCounts(d.counts || {});
            setLikedSet(new Set(d.liked || []));
          }
        })
        .catch(() => {});
    }
  }, []);


  return (
    <motion.section
      id="projects"
      custom={5}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="col-span-2 md:col-span-4 lg:col-span-4 row-span-2 mt-0 scroll-mt-24 md:scroll-mt-28"
    >
      {/* Section header */}
      <motion.div custom={0} variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex items-end justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted mb-2">精选作品</p>
          <h2 className="text-2xl md:text-3xl font-bold">项目展示</h2>
        </div>
        <Link
          href="#contact"
          className="hidden md:inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
        >
          联系我
          <ArrowUpRight size={16} />
        </Link>
      </motion.div>

      {/* 大网格布局：featured 大卡占一半，其余小卡占一半 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {/* Featured 项目卡 */}
        <motion.article
          custom={6}
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className={cn(
            "group md:col-span-2 lg:col-span-1 lg:row-span-2 rounded-3xl border border-border bg-card overflow-hidden card-hover",
            "flex flex-col"
          )}
        >
          {/* lg 下卡片会被 grid 拉伸到与右侧两行小卡等高，
              图片用 h-full 填满整卡（object-cover 自动裁剪），避免图片下方留白 */}
          <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[380px] w-full overflow-hidden">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent" />
            {/* 左上角：点赞按钮（常显） */}
            <div className="absolute top-4 left-4 z-10">
              <LikeButton
                projectKey={featured.title}
                count={likeCounts[featured.title] ?? 0}
                liked={likedSet.has(featured.title)}
                onToggle={toggleLike}
                size="sm"
              />
            </div>
            {/* 悬浮链接 */}
            {(featured.liveUrl || featured.githubUrl) && (
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {featured.liveUrl && (
                  <a
                    href={featured.liveUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="在线预览"
                    className="w-10 h-10 rounded-full bg-bg/80 backdrop-blur-md border border-border flex items-center justify-center hover:bg-text hover:text-bg transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
                {featured.githubUrl && (
                  <a
                    href={featured.githubUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="项目 GitHub 仓库"
                    className="w-10 h-10 rounded-full bg-bg/80 backdrop-blur-md border border-border flex items-center justify-center hover:bg-text hover:text-bg transition-colors"
                  >
                    <Github size={16} />
                  </a>
                )}
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {featured.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[11px] font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h3 className="text-xl font-bold mb-1.5">{featured.title}</h3>
              <p className="text-sm text-text-muted line-clamp-2">{featured.description}</p>
            </div>
          </div>
        </motion.article>

        {/* 其余小卡 */}
        <div className="md:col-span-2 lg:col-span-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {rest.map((p, i) => (
            <motion.article
              key={p.title}
              custom={7 + i}
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="group rounded-3xl border border-border bg-card overflow-hidden card-hover flex flex-col"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
                {(p.liveUrl || p.githubUrl) && (
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {p.liveUrl && (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label="在线预览"
                        className="w-8 h-8 rounded-full bg-bg/80 backdrop-blur-md border border-border flex items-center justify-center hover:bg-text hover:text-bg transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {p.githubUrl && (
                      <a
                        href={p.githubUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label="项目 GitHub 仓库"
                        className="w-8 h-8 rounded-full bg-bg/80 backdrop-blur-md border border-border flex items-center justify-center hover:bg-text hover:text-bg transition-colors"
                      >
                        <Github size={14} />
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 md:p-5 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {p.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-full bg-card-alt text-[10px] text-text-muted border border-border"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-1.5 leading-snug">
                  {p.title}
                </h3>
                <p className="text-xs md:text-sm text-text-muted line-clamp-2 flex-1 mb-3">
                  {p.description}
                </p>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1 hover:text-text transition-colors">
                    查看详情 <ArrowUpRight size={12} />
                  </span>
                  <LikeButton
                    projectKey={p.title}
                    count={likeCounts[p.title] ?? 0}
                    liked={likedSet.has(p.title)}
                    onToggle={toggleLike}
                  />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
