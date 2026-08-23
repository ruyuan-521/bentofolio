import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/lib/constants/projects";
import { siteContent } from "@/lib/constants/siteContent";
import { ArrowLeft, ArrowUpRight, ExternalLink, Github, Sparkles } from "lucide-react";

/* 静态生成所有项目详情页（构建时就产出，访问秒开） */
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "项目不存在" };
  return {
    title: `${project.title} — ${siteContent.fullName}的项目`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  /* 其他项目（详情页底部导航，看完一个接着看下一个） */
  const others = projects.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-bg relative overflow-hidden">
      {/* Background glow（与主页一致） */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-white/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/[0.03] blur-[100px]" />
      </div>

      <div className="px-5 md:px-10 lg:px-16 pt-10 md:pt-14 pb-16 max-w-[1100px] mx-auto">
        {/* 返回 */}
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          返回项目列表
        </Link>

        {/* Hero 大图 */}
        <div className="relative aspect-[16/9] w-full rounded-3xl border border-border overflow-hidden mb-8">
          <Image
            src={project.image}
            alt={project.title}
            fill
            priority
            sizes="(max-width: 1100px) 100vw, 1100px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent" />
        </div>

        {/* 标题 + 标签 + 链接按钮 */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
          <div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-full bg-card-alt text-xs text-text-muted border border-border"
                >
                  {t}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {project.title}
            </h1>
          </div>
          <div className="flex gap-3 shrink-0">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-text text-bg text-sm font-medium hover:opacity-80 transition-opacity"
              >
                <ExternalLink size={15} />
                在线预览
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-card text-sm font-medium hover:bg-card-alt transition-colors"
              >
                <Github size={15} />
                GitHub 仓库
              </a>
            )}
          </div>
        </div>

        {/* 描述 + 亮点 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-sm uppercase tracking-[0.2em] text-text-muted mb-4">
              项目简介
            </h2>
            <p className="text-base leading-relaxed text-text/90 whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {project.details && project.details.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
              <h2 className="flex items-center gap-1.5 text-sm uppercase tracking-[0.2em] text-text-muted mb-4">
                <Sparkles size={14} className="text-amber-400" />
                项目亮点
              </h2>
              <ul className="space-y-3">
                {project.details.map((d) => (
                  <li key={d} className="flex gap-2.5 text-sm leading-relaxed">
                    <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-text-muted shrink-0" />
                    <span className="text-text/85">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 其他项目 */}
        {others.length > 0 && (
          <div className="mt-12">
            <h2 className="text-sm uppercase tracking-[0.2em] text-text-muted mb-4">
              看看其他项目
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  href={`/projects/${p.slug}`}
                  className="group rounded-3xl border border-border bg-card overflow-hidden card-hover"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg/70 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold mb-1 flex items-center justify-between">
                      <span className="line-clamp-1">{p.title}</span>
                      <ArrowUpRight
                        size={14}
                        className="text-text-muted shrink-0 group-hover:text-text transition-colors"
                      />
                    </h3>
                    <p className="text-xs text-text-muted line-clamp-2">
                      {p.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 页脚 */}
        <footer className="mt-16 pt-8 border-t border-border text-sm text-text-muted flex flex-col md:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} 渊。保留所有权利。</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-text transition-colors"
          >
            返回主页 <ArrowUpRight size={14} />
          </Link>
        </footer>
      </div>
    </main>
  );
}
