import { supabase } from '../lib/supabase'

async function checkImage() {
  const { data } = await supabase
    .from('blog_posts')
    .select('title, slug, image_url, featured_image')
    .eq('slug', 'coworking-lyon-lyon-2025')
    .single()
  
  console.log('Article coworking:')
  console.log('- Title:', data?.title)
  console.log('- image_url:', data?.image_url)
  console.log('- featured_image:', data?.featured_image)
}

checkImage()