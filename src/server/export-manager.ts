import fs from 'fs'

function csvCell(value: unknown) {
  const s = value === null || value === undefined ? '' : String(value)
  if (s.includes('"')) return `"${s.replace(/"/g, '""')}"`
  if (s.includes(',') || s.includes('\n')) return `"${s}"`
  return s
}

export function exportToJson(data: unknown, filePath: string) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export function exportToCsv(rows: Record<string, unknown>[], filePath: string) {
  if (!rows || rows.length === 0) {
    fs.writeFileSync(filePath, '', 'utf-8')
    return
  }

  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(h => csvCell(row[h])).join(',')),
  ]

  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8')
}
