/* Motion/Framer Motion 动画 variants（不用改） */

/* 进场渐入 */
export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/* 缩放进入 */
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.55,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

/* hover 微弹 */
export const hoverTilt = {
  rest: { y: 0, rotateX: 0, rotateY: 0 },
  hover: {
    y: -6,
    rotateX: 2,
    rotateY: -2,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};
