import OpenAI from 'openai'

// La clé sera lue depuis process.env.OPENAI_API_KEY
// qui est chargée automatiquement depuis .env.local par Next.js
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY
}