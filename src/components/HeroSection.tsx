"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { siteContent } from "@/lib/constants/siteContent";
import { useNavigation } from "@/hooks/useNavigation";
import { scrollToHash } from "@/lib/utils/scroll";
import { fadeInUp, fadeIn } from "@/lib/animation/variants";
import { ArrowDownRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function HeroSection() {
  const { setShowContact } = useNavigation();

  return (
    <>
      {/* Hero Text — 占 col-span-2 md:col-span-2 lg:col-span-3，行跨度 1 */}
      <motion.div
        id="home"
        custom={0}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-2 md:col-span-2 lg:col-span-3 row-span-2
                   rounded-3xl border border-border bg-card
                   p-6 md:p-8 lg:p-10 card-hover relative overflow-hidden
                   scroll-mt-24 md:scroll-mt-28"
      >
        {/* 装饰 */}
        <div className="absolute -top-24 -right-20 w-64 h-64 rounded-full bg-white/[0.04] blur-3xl" />

        <motion.p
          custom={1}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-border text-xs md:text-sm text-text-muted mb-5"
        >
          <Sparkles size={14} className="text-white" />
          欢迎接新项目合作
        </motion.p>

        {/* 名字 + 小头像：把原来 PersonImage 大卡上的 GitHub 头像缩小为圆形，放在左上角名字旁边 */}
        <motion.div
          custom={2}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex items-start gap-4 md:gap-5 mb-4"
        >
          <div className="relative shrink-0 w-14 h-14 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px]
                          rounded-full overflow-hidden
                          border-2 border-border ring-2 ring-white/10
                          shadow-xl shadow-black/30
                          bg-card-alt
                          grayscale-[10%] hover:grayscale-0 transition-all duration-500">
            <Image
              src="/user-big-avatar.jpg"
              alt={siteContent.fullName}
              fill
              priority
              sizes="72px"
              className="object-cover"
            />
          </div>
          <h1 className="flex-1 text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            你好，我是 <span className="text-gradient">{siteContent.name}</span>
            <br className="hidden sm:block" />
            <span className="text-text-muted text-[0.8em] font-semibold">
              {siteContent.title}
            </span>
          </h1>
        </motion.div>

        <motion.p
          custom={3}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-sm md:text-base text-text-muted max-w-xl mb-7 leading-relaxed"
        >
          {siteContent.bio}
        </motion.p>

        {/* 技能 chips */}
        <motion.div
          custom={4}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap gap-2 mb-8"
        >
          {siteContent.skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1.5 text-xs md:text-sm rounded-full bg-card-alt border border-border text-text-muted hover:text-text hover:border-white/20 transition-colors"
            >
              {skill}
            </span>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          custom={5}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center gap-3"
        >
          <button
            onClick={() => setShowContact(true)}
            className="group inline-flex items-center gap-2 px-5 md:px-6 py-3 md:py-3.5 rounded-full bg-text text-bg text-sm md:text-base font-semibold hover:bg-text-muted transition-colors"
          >
            联系我
            <ArrowDownRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
          </button>
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              scrollToHash("#projects");
            }}
            className="inline-flex items-center gap-2 px-5 md:px-6 py-3 md:py-3.5 rounded-full border border-border hover:border-white/20 hover:bg-white/[0.03] text-sm md:text-base transition-colors"
          >
            查看作品
          </a>
        </motion.div>
      </motion.div>

      {/* Stats 小卡片（col-span-2 row-span-1，放在 Hero 下方占据 Hero 的下半区域，通过 grid 布局自动安排） */}
      {/* 实际上我们这里设计的是：Hero = col-span-3 row-span-2 + Stats = col-span-1 row-span-2 + PersonImage = col-span-2 row-span-2 */}
      {/* 为了简单起见，把 stats 集成到 Hero 下面的独立小卡片在另一列 */}
    </>
  );
}
