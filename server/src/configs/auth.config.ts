const isDevMode = process.env.NODE_ENV === 'development'

function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/)
  if (!match) throw Error('Invalid expiresIn format')
  
  const value = parseInt(match[1])
  const unit = match[2]
  
  switch (unit) {
    case 's': return value
    case 'm': return value * 60
    case 'h': return value * 60 * 60
    case 'd': return value * 24 * 60 * 60
    default: return 7 * 24 * 60 * 60
  }
}

// время жизни токена
const acceessTtlStr = isDevMode ? '30d' : '15m' 
const refreshTtlStr = isDevMode ? '120d' : '7d'
// время жизни токена в секндах
const acceessTtlSeconds = parseExpiresIn(acceessTtlStr) 
const refreshTtlSeconds = parseExpiresIn(refreshTtlStr)

export default {
  acceessTtlStr,
  refreshTtlStr,
  acceessTtlSeconds,
  refreshTtlSeconds,
  refreshTokenPrfix: 'token:',
  userTokenPrefix: 'user:'
}