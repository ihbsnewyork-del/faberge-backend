import mongoose from 'mongoose'
import { config } from '.'
export const connectDB = async () => {
  try {
    const dbUrl = config.db_url
    if (!dbUrl) {
      throw new Error('DB_URL is not defined in .env file')
    }
    await mongoose.connect(dbUrl)
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Failed to connect to DB:', error)
    process.exit(1)
  }
}
