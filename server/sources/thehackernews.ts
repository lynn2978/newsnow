const TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t"

async function translateTitles(titles: string[]): Promise<string[] | null> {
  try {
    const text = titles.join("\n")
    const url = `${TRANSLATE_URL}&q=${encodeURIComponent(text)}`
    const data: any = await myFetch(url)
    const sentences = data?.[0]
    if (!Array.isArray(sentences) || sentences.length !== titles.length) return null
    const out = sentences.map((s: any) => (typeof s?.[0] === "string" ? s[0].trim() : ""))
    if (out.some(t => !t)) return null
    return out
  } catch {
    return null
  }
}

export default defineSource(async () => {
  const data = await rss2json("https://feeds.feedburner.com/TheHackersNews")
  if (!data?.items.length) throw new Error("Cannot fetch rss data")
  const items = data.items.map((item) => {
    const description = item.description ?? ""
    return {
      id: item.id ?? item.link,
      title: item.title,
      url: item.link,
      pubDate: item.created,
      extra: {
        hover: description.replace(/<[^>]*>/g, "").trim() || undefined,
      },
    }
  }).filter(item => item.id && item.title && item.url)
  const translated = await translateTitles(items.map(i => i.title))
  if (translated) {
    items.forEach((item, idx) => {
      item.extra = { hover: item.title }
      item.title = translated[idx]
    })
  }
  return items
})
