import fs from 'fs';

function csvCell(value: unknown) {
  const s = value === null || value === undefined ? '' : String(value);
  if (s.includes('"')) return `"${s.replace(/"/g, '""')}"`;
  if (s.includes(',') || s.includes('\n')) return `"${s}"`;
  return s;
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function exportToJson(data: unknown, filePath: string) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function exportToCsv(rows: Record<string, unknown>[], filePath: string) {
  if (!rows || rows.length === 0) {
    fs.writeFileSync(filePath, '', 'utf-8');
    return;
  }

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => csvCell(row[h])).join(',')),
  ];

  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
}
