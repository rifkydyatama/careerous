"use client";




import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0 },
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  
  delay?: number;
  
  repeat?: boolean;
  
  as?: "div" | "section" | "li" | "article";
};

export default function Reveal({
  children,
  className,
  delay = 0,
  repeat = false,
  as = "div",
}: RevealProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: !repeat, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
