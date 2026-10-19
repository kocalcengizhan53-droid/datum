/**
 * Scroll-driven reveal, in CSS rather than JavaScript.
 *
 * Progressive enhancement on purpose: a browser without scroll timelines simply shows the
 * content, so nothing can ever end up invisible — the failure mode of JS reveal libraries, where
 * a missed observer leaves a paragraph at opacity zero forever. The `animation-timeline`
 * declaration has to follow the `animation` shorthand or it is overwritten.
 */
export function Reveal({ children }: { children: React.ReactNode }) {
  return <div className="reveal">{children}</div>
}
