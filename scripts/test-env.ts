// Test if .env is loaded correctly
console.log('🔍 ENV Test:')
console.log('TICIMAX_WS_AUTH_CODE:', process.env.TICIMAX_WS_AUTH_CODE || 'UNDEFINED')
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'UNDEFINED')
