/* ========== 💑 修改这里：你们的小窝配置 ========== */
/* 纪念日：在一起的第一天（用于计算在一起时长） */
/* 头像图片放到 /public/ 下，然后写 "/xxx.jpg" */

export const loveConfig = {
  /** 在一起的纪念日（改成你们的真实日期） */
  startDate: "2026-05-03T11:18:10",

  /** 左边的人 */
  left: {
    name: "渊茹",
    avatar: "", // 空字符串 = 显示文字头像占位；有图填 "/love-avatar-1.jpg"
  },

  /** 右边的人 */
  right: {
    name: "茹渊",
    avatar: "", // 填 "/love-avatar-2.jpg"
  },

  /** 相册照片：图片放 /public/ 下，往数组里加即可 */
  album: [] as { url: string; title?: string }[],

  /** 一句话（显示在计时器上方） */
  title: "我们已经一起走过了",
};
