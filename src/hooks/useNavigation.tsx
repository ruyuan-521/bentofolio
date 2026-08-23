"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";

/**
 * 导航上下文：Navbar 的按钮 / 各弹窗组件共享同一份状态。
 *
 * ⚠️ 注意：这里必须是 React Context，不能是普通自定义 hook。
 * 之前用普通 hook 时，每个调用 useNavigation() 的组件（Navbar、
 * ContactModal、LoginModal、HeroSection、AboutContactSection）
 * 都会拿到【各自独立的一份 state】——
 * Navbar 里 setShowContact(true) 只改了 Navbar 自己那份，
 * ContactModal 里的 showContact 永远是 false → 弹窗永远不出现，
 * 但 body overflow:hidden 的副作用又执行了 → 页面滚动被锁死，
 * 表现为「点了按钮就卡死，没有任何弹窗」。
 */
type NavigationState = {
  /** 移动端汉堡菜单是否展开 */
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  /** 联系我弹窗 */
  showContact: boolean;
  setShowContact: Dispatch<SetStateAction<boolean>>;
  /** 登录弹窗 */
  showLogin: boolean;
  setShowLogin: Dispatch<SetStateAction<boolean>>;
  /** 页面是否已滚动（Navbar 背景切换用） */
  scrolled: boolean;
  /** 关闭移动端菜单 */
  closeAll: () => void;
};

const NavigationContext = createContext<NavigationState | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* 滚动时给 navbar 加背景 */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* 锁滚动（移动端菜单/弹窗打开时）—— Provider 全局只有一份，不会重复锁 */
  useEffect(() => {
    document.body.style.overflow =
      isOpen || showContact || showLogin ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, showContact, showLogin]);

  const closeAll = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        isOpen,
        setIsOpen,
        showContact,
        setShowContact,
        showLogin,
        setShowLogin,
        scrolled,
        closeAll,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error(
      "useNavigation 必须在 <NavigationProvider> 内部使用 —— 请检查 page.tsx 是否已用 NavigationProvider 包裹"
    );
  }
  return ctx;
}
