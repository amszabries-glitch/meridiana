import { supabase } from './supabase'

export interface UploadResult {
  success: boolean
  filePath?: string
  publicUrl?: string
  error?: string
}

export interface FileUploadOptions {
  bucket: string
  folder?: string
  makePublic?: boolean
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  options: FileUploadOptions = { bucket: 'documents' }
): Promise<UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}_${randomId}.${fileExtension}`
    
    // Create file path
    const filePath = options.folder ? `${options.folder}/${fileName}` : fileName
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(options.bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL if needed
    let publicUrl = ''
    if (options.makePublic) {
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(filePath)
      publicUrl = urlData.publicUrl
    }

    return {
      success: true,
      filePath: data.path,
      publicUrl
    }
  } catch (error) {
    console.error('Upload exception:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  filePath: string,
  bucket: string = 'documents'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete exception:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get a signed URL for private file access
 */
export async function getSignedUrl(
  filePath: string,
  bucket: string = 'documents',
  expiresIn: number = 3600 // 1 hour
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error('Signed URL error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, url: data.signedUrl }
  } catch (error) {
    console.error('Signed URL exception:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * List files in a bucket/folder
 */
export async function listFiles(
  bucket: string = 'documents',
  folder?: string
): Promise<{ success: boolean; files?: any[]; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder)

    if (error) {
      console.error('List files error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, files: data }
  } catch (error) {
    console.error('List files exception:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
