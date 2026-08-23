import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PersonImageSection from "@/components/PersonImageSection";
import ProjectsSection from "@/components/ProjectsSection";
import AboutContactSection from "@/components/AboutContactSection";
import ContactModal from "@/components/ContactModal";
import LoginModal from "@/components/LoginModal";
import WeChatModal from "@/components/WeChatModal";
import GuestbookSection from "@/components/GuestbookSection";
import VisitTracker from "@/components/VisitTracker";
import { NavigationProvider } from "@/hooks/useNavigation";

export default function Home() {
  return (
    <NavigationProvider>
      <main className="min-h-screen bg-bg relative overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-white/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/[0.03] blur-[100px]" />
        </div>

        <Navbar />
        <VisitTracker />

        <section className="px-5 md:px-10 lg:px-16 pt-28 pb-16 max-w-[1400px] mx-auto">
          {/* Bento Grid Container */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-[minmax(140px,auto)] gap-4 md:gap-5">
            {/* Row 1 & 2 */}
            <HeroSection />
            <PersonImageSection />

            {/* Row 3 & 4 */}
            <ProjectsSection />
            <AboutContactSection />
          </div>

          {/* 留言板 */}
          <GuestbookSection />

          <footer className="mt-20 pt-8 border-t border-border text-sm text-text-muted flex flex-col md:flex-row justify-between items-center gap-3">
            <p>© {new Date().getFullYear()} 渊。保留所有权利。</p>
            <p className="flex items-center gap-1.5">
              使用
              <span className="text-red-500">❤</span>
              基于 Next.js 与 Tailwind CSS 打造
            </p>
          </footer>
        </section>

        <ContactModal />
        <LoginModal />
        <WeChatModal />
      </main>
    </NavigationProvider>
  );
}
