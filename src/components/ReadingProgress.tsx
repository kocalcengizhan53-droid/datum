/**
 * Reading progress, also pure CSS: a scroll-driven animation on the document timeline. No
 * listener, no state, nothing to throttle, and it cannot desynchronise from the scroll position.
 */
export function ReadingProgress() {
  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-40 h-px">
      <div className="progress bg-sun h-full origin-left" />
    </div>
  )
}
