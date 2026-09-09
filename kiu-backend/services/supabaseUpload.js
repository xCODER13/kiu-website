const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// POST/PUT /api/news'da ishlatiladi
async function uploadImageToSupabase(file) {
  const { v4: uuidv4 } = require('uuid')
  const fileName = uuidv4() + '-' + file.originalname
  const { error } = await supabase.storage
    .from('news-images')
    .upload(fileName, file.buffer, { contentType: file.mimetype })
  if (error) throw error
  const { data } = supabase.storage.from('news-images').getPublicUrl(fileName)
  return data.publicUrl
}

module.exports = { supabase, uploadImageToSupabase }