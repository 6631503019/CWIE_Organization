const TIME_RANGE_PATTERN = /^([01]\d|2[0-3])([:.])([0-5]\d)\s*-\s*([01]\d|2[0-3])([:.])([0-5]\d)$/;

export const normalizeRoadshowTime = (value: string): string | null => {
  const match = value.trim().match(TIME_RANGE_PATTERN)
  if (!match) return null
  return `${match[1]}.${match[3]} - ${match[4]}.${match[6]}`;
}

export const formatRoadshowTime = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) return ''
  const match = value.trim().match(TIME_RANGE_PATTERN)
  if (!match) return value.trim()
  return `${match[1]}:${match[3]} - ${match[4]}:${match[6]}`
}

export const splitRoadshowTime = (value: unknown): { start: string; end: string } => {
  const formatted = formatRoadshowTime(value)
  const parts = formatted.split('-').map(part => part.trim())
  return { start: parts[0] || '', end: parts[1] || '' }
}
