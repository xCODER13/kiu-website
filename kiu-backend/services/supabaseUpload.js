const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

let supabase = null

function getSupabase() {
  if (!supabase) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('SUPABASE_URL yoki SUPABASE_SERVICE_KEY sozlanmagan')
    }
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  }
  return supabase
}

function sanitizeFileName(originalName) {
  return originalName
    .normalize('NFKD')
    .replace(/[^\w.-]/g, '_')
    .slice(-100)
}

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

async function uploadImageToSupabase(file) {
  if (!file || !file.buffer) {
    throw new Error("Yuklanadigan fayl topilmadi")
  }
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new Error(`Ruxsat etilmagan fayl turi: ${file.mimetype}`)
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Fayl hajmi juda katta (maksimal ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB)`)
  }

  const client = getSupabase()
  const safeName = sanitizeFileName(file.originalname)
  const fileName = `${crypto.randomUUID()}-${safeName}`

  const { error } = await client.storage
    .from('news-images')
    .upload(fileName, file.buffer, { contentType: file.mimetype })

  if (error) {
    throw new Error(`Supabase upload xatosi: ${error.message}`)
  }

  const { data } = client.storage.from('news-images').getPublicUrl(fileName)
  return data.publicUrl
}

module.exports = { getSupabase, uploadImageToSupabase }