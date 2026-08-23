import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "我们的小窝 — 渊茹 & 茹渊",
  description: "情侣主页：在一起计时器、我们的相册与留言板。",
};

export default function LoveLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
