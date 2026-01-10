import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

interface Config {
  port: string
  host: string
  db_url: string
  jwt_secret: string
  jwt_expires_in: string
}

if (!process.env.DB_URL) throw new Error('DB_URL is not defined in .env')
if (!process.env.JWT_SECRET)
  throw new Error('JWT_SECRET is not defined in .env')

export const config: Config = {
  port: process.env.PORT || '5000',
  host: process.env.HOST || 'localhost',
  db_url: process.env.DB_URL,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expires_in: process.env.JWT_EXPIRES_IN || '7d',
}
