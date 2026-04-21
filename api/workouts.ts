import { Client } from '@notionhq/client'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints.js'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const token =
    (req.headers['x-notion-token'] as string | undefined) || process.env.NOTION_TOKEN
  const databaseId =
    (req.headers['x-notion-database-id'] as string | undefined) ||
    process.env.NOTION_DATABASE_ID ||
    '347f5a925c3a807193b4ce2e67218b59'

  if (!token) return res.status(401).json({ error: 'Notion token not configured' })

  const notion = new Client({ auth: token })

  try {
    const allPages: PageObjectResponse[] = []
    let cursor: string | undefined

    do {
      const response = await notion.databases.query({
        database_id: databaseId,
        sorts: [{ property: 'Date', direction: 'descending' }],
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      })
      allPages.push(...(response.results as PageObjectResponse[]))
      cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
    } while (cursor)

    const entries = allPages.map((page) => {
      const props = page.properties
      return {
        id: page.id,
        name:
          props.Name?.type === 'title' ? (props.Name.title[0]?.plain_text ?? '') : '',
        date:
          props.Date?.type === 'date' ? (props.Date.date?.start ?? null) : null,
        weight:
          props.Weight?.type === 'number' ? props.Weight.number : null,
        reps:
          props.Reps?.type === 'number' ? props.Reps.number : null,
        unit:
          props.Unit?.type === 'select' ? (props.Unit.select?.name ?? null) : null,
        volume:
          props.Volume?.type === 'formula' && props.Volume.formula.type === 'number'
            ? props.Volume.formula.number
            : null,
        notes:
          props.Notes?.type === 'rich_text' ? (props.Notes.rich_text[0]?.plain_text ?? null) : null,
      }
    })

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60')
    return res.json(entries)
  } catch (err) {
    console.error('Notion API error:', err)
    return res.status(500).json({ error: 'Failed to fetch workouts' })
  }
}
