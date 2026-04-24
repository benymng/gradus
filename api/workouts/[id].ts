import { Client } from '@notionhq/client'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = process.env.NOTION_TOKEN
  if (!token) return res.status(500).json({ error: 'NOTION_TOKEN not set' })

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing page id' })
  }

  const notion = new Client({ auth: token })

  try {
    await notion.pages.update({
      page_id: id,
      archived: true,
    })
    return res.json({ success: true })
  } catch (err) {
    console.error('Notion API error:', err)
    return res.status(500).json({ error: 'Failed to archive page' })
  }
}
