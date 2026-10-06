"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { ButtonSize, ButtonVariant } from "@/components/motion/button";
import { SPRING_PRESS } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

export interface PressLinkProps extends ComponentProps<typeof MotionLink> {
  pressScale?: number;
}

/** Next.js link with the beUI button spring press (from the beUI site chrome). */
export function PressLink({ pressScale = 0.97, ...props }: PressLinkProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  return (
    <MotionLink
      whileTap={reduce ? undefined : { scale: pressScale }}
      whileHover={reduce || !canHover ? undefined : { scale: 1.02 }}
      transition={SPRING_PRESS}
      {...props}
    />
  );
}

// Mirrors the variant/size classes of beUI's Button so links and buttons match.
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "border border-border bg-card text-foreground hover:border-border-strong",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-muted/60",
  outline: "border border-border bg-transparent text-foreground hover:bg-muted/60",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-full",
  md: "h-10 px-5 text-sm gap-2 rounded-full",
  lg: "h-12 px-6 text-base gap-2 rounded-full",
  icon: "h-8 w-8 rounded-lg",
};

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: PressLinkProps & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <PressLink
      pressScale={0.93}
      className={cn(
        "inline-flex items-center justify-center font-medium select-none transition-colors",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    />
  );
}
