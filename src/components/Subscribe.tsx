"use client"

import { useState, type FormEvent } from "react"

/*
 * Where the form posts: any newsletter service's subscribe endpoint that accepts an `email`
 * field (Buttondown, ConvertKit, a Cloudflare Worker…), set at build time. Unset — as on the
 * demo — the form still validates and then says plainly that sign-ups are not open yet, and
 * points to the feed, which works today.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_NEWSLETTER_URL ?? ""

export function Subscribe() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "closed" | "error">("idle")

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get("email")
    if (!ENDPOINT) return setState("closed")
    setState("sending")
    try {
      const res = await fetch(ENDPOINT, { method: "POST", body: new URLSearchParams({ email: String(email) }) })
      setState(res.ok ? "done" : "error")
    } catch {
      setState("error")
    }
  }

  return (
    <section aria-labelledby="subscribe" className="border-t border-rule py-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-x-12">
        <h2 id="subscribe" className="mark">
          The next issue
        </h2>
        <div className="max-w-[46rem]">
          <p className="prose-fig text-lg text-pretty text-fg-muted">
            Five pieces and their plates, four times a year. One email when it is out, nothing else.
          </p>
          <form onSubmit={submit} className="mt-5 flex flex-wrap gap-3">
            <label htmlFor="subscribe-email" className="sr-only">
              Email address
            </label>
            <input
              id="subscribe-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@studio.com"
              className="min-h-11 min-w-0 flex-1 border border-rule-strong bg-bg px-3 font-sans text-base outline-none focus:border-sun"
            />
            <button
              type="submit"
              disabled={state === "sending"}
              className="min-h-11 bg-sun px-5 font-sans text-sm font-semibold tracking-wide text-bg-deep transition-opacity disabled:opacity-60"
            >
              {state === "sending" ? "Sending…" : "Notify me"}
            </button>
          </form>
          <p role="status" className="instrument mt-3 min-h-5 text-fg-faint">
            {state === "done" && "Done — look out for one email when the issue is out."}
            {state === "error" && "That did not go through. Try again in a moment."}
            {state === "closed" && "Sign-ups open with issue 15. Until then the feed carries every new piece."}
          </p>
          <a href="/feed.xml" className="mark mt-2 inline-block hover:text-fg">
            RSS feed →
          </a>
        </div>
      </div>
    </section>
  )
}
