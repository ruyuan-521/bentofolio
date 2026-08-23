"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useNavigation } from "@/hooks/useNavigation";
import { useAuth } from "@/hooks/useAuth";
import { siteContent } from "@/lib/constants/siteContent";
import { navItems } from "@/lib/constants/navItems";
import HamburgerButton from "./HamburgerButton";
import MobileNav from "./MobileNav";
import ThemeToggle from "./ThemeToggle";
import { cn } from "@/lib/utils/cn";
import { ShieldCheck, LogOut, Settings2, LogIn, UserRound } from "lucide-react";

export default function Navbar() {
  const { isOpen, setIsOpen, scrolled, setShowContact, setShowLogin, goTo, closeAll } =
    useNavigation();
  const { me, loading: meLoading, logout } = useAuth();

  // ---------- 管理员下拉菜单 ----------
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  // 登录后头像首字母（比如 13585010039@163.com -> 取 1 或者邮箱前两位做头像）
  const avatarText = me?.email
    ? me.email.substring(0, 1).toUpperCase()
    : "?";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
          scrolled
            ? "backdrop-blur-xl bg-bg/70 border-b border-border"
            : "bg-transparent"
        )}
      >
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 lg:px-16 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              goTo("#home");
            }}
            className="text-text font-bold tracking-tight text-lg md:text-xl hover:opacity-80 transition-opacity"
          >
            {siteContent.name}
            <span className="text-accent-2">.</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(item.href);
                }}
                className="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors rounded-full hover:bg-white/[0.04]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-2.5">
            {/* 主题切换（暗/亮） */}
            <ThemeToggle />

            {/* 登录入口（未登录：登录按钮；已登录：头像下拉菜单） */}
            {!meLoading && !me && (
              <button
                onClick={() => setShowLogin(true)}
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-text-muted hover:text-text hover:bg-white/[0.04] transition-colors"
              >
                <LogIn className="w-4 h-4 text-sky-400" />
                登录
              </button>
            )}

            {!meLoading && me && (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="hidden md:inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-border bg-card-alt hover:bg-white/[0.06] transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-sky-500/20">
                    {avatarText}
                  </span>
                  <span className="text-sm text-text max-w-[160px] truncate">
                    {me.email}
                  </span>
                  {me.isAdmin && (
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-[10px] font-medium border border-sky-500/20">
                      管理员
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-border bg-white/[0.02]">
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          {me.isAdmin ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                              已作为管理员登录
                            </>
                          ) : (
                            <>
                              <UserRound className="w-3.5 h-3.5 text-emerald-400" />
                              已登录
                            </>
                          )}
                        </div>
                        <div className="mt-1 text-sm font-medium text-text truncate">
                          {me.email}
                        </div>
                      </div>
                      <div className="p-1.5">
                        {me.isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setMenuOpen(false)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-text hover:bg-white/[0.04] transition-colors"
                          >
                            <Settings2 className="w-4 h-4" />
                            管理后台
                            <span className="ml-auto text-[10px] text-sky-400">→</span>
                          </Link>
                        )}
                        <button
                          onClick={async () => {
                            await logout();
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          退出登录
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button
              onClick={() => setShowContact(true)}
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-text text-bg text-sm font-medium hover:bg-text-muted transition-colors"
            >
              联系我
            </button>
            <HamburgerButton
              isOpen={isOpen}
              onToggle={() => setIsOpen((v) => !v)}
            />
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={isOpen}
        onClose={closeAll}
        onContact={() => {
          setIsOpen(false);
          setShowContact(true);
        }}
      />
    </>
  );
}
