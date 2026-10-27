import Link from "next/link"

import { Datum } from "@/components/sheet/Datum"

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-[94rem] px-6 py-16 sm:px-10">
      <Datum note="sheet missing from the set" />
      <p className="instrument tnum mt-10">404</p>
      <h1 className="mt-3 max-w-[18ch] text-5xl font-medium text-balance">No sheet at this address.</h1>
      <p className="prose-fig mt-6 max-w-[46ch] text-xl text-pretty text-fg-muted">
        The piece may have moved between issues, or the link lost a letter. Search with ⌘K, or start from the cover.
      </p>
      <div className="mt-10 flex flex-wrap gap-6">
        <Link href="/" className="mark hover:text-fg">
          ← The current issue
        </Link>
        <Link href="/tags" className="mark hover:text-fg">
          All topics →
        </Link>
      </div>
    </main>
  )
}
