"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ComponentProps, type ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

export function FadeIn({
  children,
  className,
  delay = 0,
  layout = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  layout?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      layout={layout}
      initial={reduce ? false : { y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.35, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function CountUp({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) {
      setN(value);
      return;
    }
    const from = n;
    const t0 = performance.now();
    const dur = 700;
    let frame: number;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(from + (value - from) * eased);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate from current displayed value
  }, [value, reduce]);
  const text = `${prefix}${n.toFixed(decimals)}${suffix}`;
  return <span className={className}>{text}</span>;
}

export function MotionButton({
  children,
  className,
  ...rest
}: ComponentProps<"button">) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      className={className}
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...(rest as ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}

export function MotionItem({
  children,
  className,
  layoutId,
  id,
}: {
  children: ReactNode;
  className?: string;
  layoutId?: string;
  id?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.li
      id={id}
      layout={!reduce}
      layoutId={reduce ? undefined : layoutId}
      className={className}
      initial={reduce ? false : { y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.3, ease }}
    >
      {children}
    </motion.li>
  );
}
