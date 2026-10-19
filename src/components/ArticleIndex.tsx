import { ARTICLES } from "@/data/issue"

export function ArticleIndex() {
  return (
    <section aria-label="In this issue" className="px-6 sm:px-10">
      <ol>
        {ARTICLES.map((article, index) => (
          <li key={article.slug} className="border-rule border-b last:border-0">
            <a
              href={`/${article.slug}`}
              className="group grid gap-x-10 gap-y-3 py-8 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]"
            >
              <div className="flex items-baseline gap-4">
                <span className="mark tnum">{String(index + 1).padStart(2, "0")}</span>
                <span className="mark">{article.kicker}</span>
              </div>
              <div className="max-w-[62ch]">
                <h2 className="text-3xl font-medium text-balance">{article.title}</h2>
                <p className="text-fg-muted mt-3 text-lg text-pretty">{article.standfirst}</p>
                <p className="mark mt-4">
                  {article.author} · {article.readingMinutes} min
                </p>
              </div>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
