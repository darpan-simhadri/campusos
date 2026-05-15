/* ─────────────────────────────────────────────────────────────────────
   CAMPUSOS MOTION SYSTEM
   Inspired by Matiks / Linear / Arc Browser motion language.
   ───────────────────────────────────────────────────────────────────── */

/* ── Spring presets ─────────────────────────────────────────────────── */
export const spring = {
  smooth:  { type: 'spring', stiffness: 180, damping: 24, mass: 0.8 },
  snappy:  { type: 'spring', stiffness: 340, damping: 30 },
  gentle:  { type: 'spring', stiffness: 100, damping: 18, mass: 1.1 },
  bouncy:  { type: 'spring', stiffness: 420, damping: 22 },
  slow:    { type: 'spring', stiffness: 80,  damping: 20, mass: 1.2 },
}

/* ── Easing curves ──────────────────────────────────────────────────── */
export const ease = {
  out:    [0.16, 1, 0.3, 1],
  in:     [0.4,  0, 1,   1],
  inOut:  [0.4,  0, 0.2, 1],
  expo:   [0.19, 1, 0.22, 1],
}

/* ── Page transition ────────────────────────────────────────────────── */
export const page = {
  initial:  { opacity: 0, y: 14, filter: 'blur(6px)' },
  animate:  { opacity: 1, y: 0,  filter: 'blur(0px)' },
  exit:     { opacity: 0, y: -6, filter: 'blur(2px)' },
  transition: { duration: 0.32, ease: ease.expo },
}

/* ── Stagger container ──────────────────────────────────────────────── */
export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren:   0.04,
    },
  },
}

/* ── Stagger items ──────────────────────────────────────────────────── */
export const staggerItem = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  show:   {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.42, ease: ease.expo },
  },
}

export const staggerItemFast = {
  hidden: { opacity: 0, y: 10 },
  show:   {
    opacity: 1, y: 0,
    transition: { duration: 0.28, ease: ease.out },
  },
}

export const staggerItemLeft = {
  hidden: { opacity: 0, x: -16 },
  show:   {
    opacity: 1, x: 0,
    transition: { duration: 0.35, ease: ease.expo },
  },
}

/* ── Fade variants ──────────────────────────────────────────────────── */
export const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.3 } },
}

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.36, ease: ease.expo } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.28, ease: ease.out } },
  exit:   { opacity: 0, scale: 0.96 },
}

export const slideDown = {
  hidden: { opacity: 0, y: -10, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.22, ease: ease.out } },
  exit:   { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.16 } },
}

export const slideUp = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0,  transition: spring.smooth },
  exit:   { opacity: 0, y: 8,  transition: { duration: 0.16 } },
}

/* ── Card hover presets (use as whileHover/whileTap props) ──────────── */
export const cardHoverProps = {
  whileHover: { y: -3, scale: 1.007 },
  whileTap:   { scale: 0.99 },
  transition:  spring.smooth,
}

export const cardHoverLift = {
  whileHover: { y: -5, scale: 1.012 },
  whileTap:   { scale: 0.99 },
  transition:  spring.smooth,
}

/* ── Button hover ───────────────────────────────────────────────────── */
export const btnHoverProps = {
  whileHover: { y: -1 },
  whileTap:   { scale: 0.97 },
  transition:  spring.snappy,
}

/* ── Nav item hover ─────────────────────────────────────────────────── */
export const navItemHover = {
  whileHover: { x: 2 },
  transition:  spring.snappy,
}

/* ── Drawer (mobile sidebar) ────────────────────────────────────────── */
export const drawer = {
  initial: { x: '-100%', opacity: 0 },
  animate: { x: 0,       opacity: 1 },
  exit:    { x: '-100%', opacity: 0 },
  transition: spring.smooth,
}

/* ── Message bubble ─────────────────────────────────────────────────── */
export const messageBubble = {
  initial: { opacity: 0, y: 8, scale: 0.97 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.24, ease: ease.out },
  },
}

/* ── Notification / Toast ───────────────────────────────────────────── */
export const toast = {
  initial: { opacity: 0, y: -12, scale: 0.96 },
  animate: { opacity: 1, y: 0,   scale: 1    },
  exit:    { opacity: 0, y: -8,  scale: 0.96 },
  transition: spring.snappy,
}

/* ── Float loop (decorative) ────────────────────────────────────────── */
export const floatLoop = {
  animate: {
    y: [-4, 4, -4],
    transition: { repeat: Infinity, duration: 5, ease: 'easeInOut' },
  },
}

/* ── Shimmer (for loaders) ──────────────────────────────────────────── */
export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { repeat: Infinity, duration: 1.8, ease: 'linear' },
  },
}

/* ── Helper: build stagger with custom config ───────────────────────── */
export function buildStagger(staggerDelay = 0.07, delay = 0.04) {
  return {
    hidden: {},
    show: { transition: { staggerChildren: staggerDelay, delayChildren: delay } },
  }
}
