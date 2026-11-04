export default defineSource(async () => {
  const data = await rss2json("https://feeds.feedburner.com/TheHackersNews")
  if (!data?.items.length) throw new Error("Cannot fetch rss data")
  return data.items.map((item) => {
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
})
