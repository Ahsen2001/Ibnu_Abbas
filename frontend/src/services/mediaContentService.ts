import { api } from './api'

export type LocalizedText = {
  en: string
  ta: string
  si: string
  ar: string
}

export type GalleryCategory = 'event' | 'graduation' | 'academic' | 'construction' | 'general'
export type PublicationCategory = 'thikra_magazine' | 'syllabus_book' | 'souvenir' | 'general_knowledge' | 'research_journal' | 'newsletter'
export type IslamicArticleCategory = 'fiqh' | 'aqeedah' | 'seerah' | 'quran_tafsir' | 'hadith' | 'general' | 'fatwa'
export type IslamicLectureCategory = 'friday_sermon' | 'lecture' | 'seminar' | 'workshop' | 'debate'
export type IslamicLectureMediaType = 'video' | 'audio' | 'youtube'
export type VideoMediaType = 'youtube' | 'uploaded'
export type VideoCategory = 'event' | 'lecture' | 'graduation' | 'general'

export type PaginatedResponse<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type GalleryImageRecord = {
  id: number
  album_id: number
  image_path: string
  thumbnail_path: string
  caption: LocalizedText | null
  sort_order: number
  is_cover: boolean
  created_at: string
  updated_at: string
  image_url: string
  thumbnail_url: string
  download_url: string
}

export type GalleryAlbumRecord = {
  id: number
  title: LocalizedText
  description: LocalizedText | null
  cover_image_path: string | null
  event_date: string | null
  category: GalleryCategory
  department: 'shareea' | 'hifl' | null
  is_published: boolean
  created_by: number | null
  sort_order: number
  created_at: string
  updated_at: string
  images_count: number
  cover_image_url: string | null
  cover_download_url: string | null
  images: GalleryImageRecord[]
}

export type PublicationRecord = {
  id: number
  title: LocalizedText
  description: LocalizedText | null
  category: PublicationCategory
  cover_image_path: string | null
  file_path: string
  issue_number: string | null
  published_year: number
  published_date: string | null
  author_editor: string | null
  department: 'shareea' | 'hifl' | null
  is_published: boolean
  download_count: number
  created_by: number | null
  created_at: string
  updated_at: string
  cover_image_url: string | null
  preview_url: string | null
  download_url: string | null
  related_publications?: PublicationRecord[]
}

export type IslamicArticleRecord = {
  id: number
  title: LocalizedText
  content: LocalizedText
  author_name: string
  author_id: number | null
  category: IslamicArticleCategory
  tags: string[] | null
  cover_image_path: string | null
  is_published: boolean
  published_at: string | null
  views_count: number
  created_by: number | null
  created_at: string
  updated_at: string
  cover_image_url: string | null
  related_articles?: IslamicArticleRecord[]
}

export type IslamicLectureRecord = {
  id: number
  title: LocalizedText
  description: LocalizedText | null
  speaker_name: string
  speaker_id: number | null
  category: IslamicLectureCategory
  media_type: IslamicLectureMediaType
  file_path: string | null
  youtube_url: string | null
  thumbnail_path: string | null
  duration_minutes: number | null
  event_date: string | null
  tags: string[] | null
  is_published: boolean
  views_count: number
  created_by: number | null
  created_at: string
  updated_at: string
  thumbnail_url: string | null
  media_url: string | null
  media_download_url: string | null
  related_lectures?: IslamicLectureRecord[]
}

export type GuestEntryRecord = {
  id: number
  guest_name: string
  designation: string | null
  organization: string | null
  country: string | null
  message: string
  visit_date: string | null
  photo_path: string | null
  is_published: boolean
  created_by: number | null
  created_at: string
  updated_at: string
  photo_url: string | null
}

export type VideoRecord = {
  id: number
  title: LocalizedText
  description: LocalizedText | null
  media_type: VideoMediaType
  youtube_url: string | null
  file_path: string | null
  thumbnail_path: string | null
  category: VideoCategory
  event_date: string | null
  is_published: boolean
  views_count: number
  created_by: number | null
  created_at: string
  updated_at: string
  thumbnail_url: string | null
  media_url: string | null
  media_download_url: string | null
  related_videos?: VideoRecord[]
}

export const emptyLocalizedText = (): LocalizedText => ({
  en: '',
  ta: '',
  si: '',
  ar: '',
})

function appendLocalized(formData: FormData, key: string, value: LocalizedText | null | undefined) {
  if (!value) return

  Object.entries(value).forEach(([lang, text]) => {
    if (text !== undefined && text !== null) {
      formData.append(`${key}[${lang}]`, text)
    }
  })
}

function appendArray(formData: FormData, key: string, values: string[] | null | undefined) {
  if (!values) return
  values.forEach((value) => formData.append(`${key}[]`, value))
}

function buildGalleryAlbumFormData(payload: Partial<GalleryAlbumRecord>) {
  const formData = new FormData()
  appendLocalized(formData, 'title', payload.title)
  appendLocalized(formData, 'description', payload.description)
  if (payload.event_date) formData.append('event_date', payload.event_date)
  if (payload.category) formData.append('category', payload.category)
  if (payload.department) formData.append('department', payload.department)
  if (typeof payload.is_published === 'boolean') formData.append('is_published', payload.is_published ? '1' : '0')
  if (payload.sort_order !== undefined) formData.append('sort_order', String(payload.sort_order))
  return formData
}

function buildPublicationFormData(payload: {
  title: LocalizedText
  description: LocalizedText
  category: PublicationCategory
  issue_number?: string
  published_year: number
  published_date?: string
  author_editor?: string
  department?: string
  is_published?: boolean
  cover_image?: File | null
  file?: File | null
}) {
  const formData = new FormData()
  appendLocalized(formData, 'title', payload.title)
  appendLocalized(formData, 'description', payload.description)
  formData.append('category', payload.category)
  formData.append('published_year', String(payload.published_year))
  if (payload.issue_number) formData.append('issue_number', payload.issue_number)
  if (payload.published_date) formData.append('published_date', payload.published_date)
  if (payload.author_editor) formData.append('author_editor', payload.author_editor)
  if (payload.department) formData.append('department', payload.department)
  if (typeof payload.is_published === 'boolean') formData.append('is_published', payload.is_published ? '1' : '0')
  if (payload.cover_image) formData.append('cover_image', payload.cover_image)
  if (payload.file) formData.append('file', payload.file)
  return formData
}

function buildArticleFormData(payload: {
  title: LocalizedText
  content: LocalizedText
  author_name: string
  author_id?: number | null
  category: IslamicArticleCategory
  tags?: string[]
  is_published?: boolean
  published_at?: string
  cover_image?: File | null
}) {
  const formData = new FormData()
  appendLocalized(formData, 'title', payload.title)
  appendLocalized(formData, 'content', payload.content)
  formData.append('author_name', payload.author_name)
  formData.append('category', payload.category)
  if (payload.author_id) formData.append('author_id', String(payload.author_id))
  appendArray(formData, 'tags', payload.tags)
  if (typeof payload.is_published === 'boolean') formData.append('is_published', payload.is_published ? '1' : '0')
  if (payload.published_at) formData.append('published_at', payload.published_at)
  if (payload.cover_image) formData.append('cover_image', payload.cover_image)
  return formData
}

function buildLectureFormData(payload: {
  title: LocalizedText
  description: LocalizedText
  speaker_name: string
  speaker_id?: number | null
  category: IslamicLectureCategory
  media_type: IslamicLectureMediaType
  youtube_url?: string
  duration_minutes?: number | null
  event_date?: string
  tags?: string[]
  is_published?: boolean
  thumbnail?: File | null
  file?: File | null
}) {
  const formData = new FormData()
  appendLocalized(formData, 'title', payload.title)
  appendLocalized(formData, 'description', payload.description)
  formData.append('speaker_name', payload.speaker_name)
  formData.append('category', payload.category)
  formData.append('media_type', payload.media_type)
  if (payload.speaker_id) formData.append('speaker_id', String(payload.speaker_id))
  if (payload.youtube_url) formData.append('youtube_url', payload.youtube_url)
  if (payload.duration_minutes) formData.append('duration_minutes', String(payload.duration_minutes))
  if (payload.event_date) formData.append('event_date', payload.event_date)
  appendArray(formData, 'tags', payload.tags)
  if (typeof payload.is_published === 'boolean') formData.append('is_published', payload.is_published ? '1' : '0')
  if (payload.thumbnail) formData.append('thumbnail', payload.thumbnail)
  if (payload.file) formData.append('file', payload.file)
  return formData
}

function buildGuestEntryFormData(payload: {
  guest_name: string
  designation?: string
  organization?: string
  country?: string
  message: string
  visit_date?: string
  is_published?: boolean
  photo?: File | null
}) {
  const formData = new FormData()
  formData.append('guest_name', payload.guest_name)
  formData.append('message', payload.message)
  if (payload.designation) formData.append('designation', payload.designation)
  if (payload.organization) formData.append('organization', payload.organization)
  if (payload.country) formData.append('country', payload.country)
  if (payload.visit_date) formData.append('visit_date', payload.visit_date)
  if (typeof payload.is_published === 'boolean') formData.append('is_published', payload.is_published ? '1' : '0')
  if (payload.photo) formData.append('photo', payload.photo)
  return formData
}

function buildVideoFormData(payload: {
  title: LocalizedText
  description: LocalizedText
  media_type: VideoMediaType
  youtube_url?: string
  category: VideoCategory
  event_date?: string
  is_published?: boolean
  thumbnail?: File | null
  file?: File | null
}) {
  const formData = new FormData()
  appendLocalized(formData, 'title', payload.title)
  appendLocalized(formData, 'description', payload.description)
  formData.append('media_type', payload.media_type)
  formData.append('category', payload.category)
  if (payload.youtube_url) formData.append('youtube_url', payload.youtube_url)
  if (payload.event_date) formData.append('event_date', payload.event_date)
  if (typeof payload.is_published === 'boolean') formData.append('is_published', payload.is_published ? '1' : '0')
  if (payload.thumbnail) formData.append('thumbnail', payload.thumbnail)
  if (payload.file) formData.append('file', payload.file)
  return formData
}

export const mediaContentService = {
  gallery: {
    listAlbums: async (params: Record<string, string | number | undefined> = {}) => {
      const { data } = await api.get<PaginatedResponse<GalleryAlbumRecord>>('/gallery/albums', { params })
      return data
    },
    getAlbum: async (id: number) => {
      const { data } = await api.get<GalleryAlbumRecord>(`/gallery/albums/${id}`)
      return data
    },
    createAlbum: async (payload: Partial<GalleryAlbumRecord>) => {
      const { data } = await api.post<GalleryAlbumRecord>('/gallery/albums', buildGalleryAlbumFormData(payload))
      return data
    },
    updateAlbum: async (id: number, payload: Partial<GalleryAlbumRecord>) => {
      const formData = buildGalleryAlbumFormData(payload)
      formData.append('_method', 'PUT')
      const { data } = await api.post<GalleryAlbumRecord>(`/gallery/albums/${id}`, formData)
      return data
    },
    deleteAlbum: async (id: number) => {
      await api.delete(`/gallery/albums/${id}`)
    },
    uploadImages: async (albumId: number, files: File[], captions: LocalizedText[] = [], onProgress?: (progress: number) => void) => {
      const formData = new FormData()
      files.forEach((file) => formData.append('images[]', file))
      captions.forEach((caption, index) => {
        appendLocalized(formData, `captions[${index}]`, caption)
      })
      const { data } = await api.post<{ message: string; album: GalleryAlbumRecord }>(
        `/gallery/albums/${albumId}/images`,
        formData,
        {
          onUploadProgress: (event) => {
            if (!event.total || !onProgress) return
            onProgress(Math.round((event.loaded / event.total) * 100))
          },
        },
      )
      return data
    },
    deleteImage: async (id: number) => {
      await api.delete(`/gallery/images/${id}`)
    },
    setCover: async (id: number) => {
      const { data } = await api.patch<{ message: string; album: GalleryAlbumRecord }>(`/gallery/images/${id}/cover`)
      return data
    },
    reorder: async (albumId: number, imageIds: number[]) => {
      const { data } = await api.patch<{ message: string; album: GalleryAlbumRecord }>(`/gallery/albums/${albumId}/reorder`, {
        image_ids: imageIds,
      })
      return data
    },
  },
  publications: {
    list: async (params: Record<string, string | number | undefined> = {}) => {
      const { data } = await api.get<PaginatedResponse<PublicationRecord>>('/publications', { params })
      return data
    },
    featured: async () => {
      const { data } = await api.get<Record<string, PublicationRecord | null>>('/publications/featured')
      return data
    },
    getById: async (id: number) => {
      const { data } = await api.get<PublicationRecord>(`/publications/${id}`)
      return data
    },
    create: async (payload: Parameters<typeof buildPublicationFormData>[0]) => {
      const { data } = await api.post<PublicationRecord>('/publications', buildPublicationFormData(payload))
      return data
    },
    update: async (id: number, payload: Parameters<typeof buildPublicationFormData>[0]) => {
      const formData = buildPublicationFormData(payload)
      formData.append('_method', 'PUT')
      const { data } = await api.post<PublicationRecord>(`/publications/${id}`, formData)
      return data
    },
    delete: async (id: number) => {
      await api.delete(`/publications/${id}`)
    },
    prepareDownload: async (id: number) => {
      const { data } = await api.get<{ message: string; download_count: number; preview_url: string | null; download_url: string | null }>(`/publications/${id}/download`)
      return data
    },
  },
  articles: {
    list: async (params: Record<string, string | number | undefined> = {}) => {
      const { data } = await api.get<PaginatedResponse<IslamicArticleRecord>>('/islamic/articles', { params })
      return data
    },
    featured: async () => {
      const { data } = await api.get<IslamicArticleRecord[]>('/islamic/articles/featured')
      return data
    },
    byCategory: async (category: IslamicArticleCategory, params: Record<string, string | number | undefined> = {}) => {
      const { data } = await api.get<PaginatedResponse<IslamicArticleRecord>>(`/islamic/articles/category/${category}`, { params })
      return data
    },
    getById: async (id: number) => {
      const { data } = await api.get<IslamicArticleRecord>(`/islamic/articles/${id}`)
      return data
    },
    create: async (payload: Parameters<typeof buildArticleFormData>[0]) => {
      const { data } = await api.post<IslamicArticleRecord>('/islamic/articles', buildArticleFormData(payload))
      return data
    },
    update: async (id: number, payload: Parameters<typeof buildArticleFormData>[0]) => {
      const formData = buildArticleFormData(payload)
      formData.append('_method', 'PUT')
      const { data } = await api.post<IslamicArticleRecord>(`/islamic/articles/${id}`, formData)
      return data
    },
    delete: async (id: number) => {
      await api.delete(`/islamic/articles/${id}`)
    },
  },
  lectures: {
    list: async (params: Record<string, string | number | undefined> = {}) => {
      const { data } = await api.get<PaginatedResponse<IslamicLectureRecord>>('/islamic/lectures', { params })
      return data
    },
    featured: async () => {
      const { data } = await api.get<IslamicLectureRecord[]>('/islamic/lectures/featured')
      return data
    },
    getById: async (id: number) => {
      const { data } = await api.get<IslamicLectureRecord>(`/islamic/lectures/${id}`)
      return data
    },
    create: async (payload: Parameters<typeof buildLectureFormData>[0]) => {
      const { data } = await api.post<IslamicLectureRecord>('/islamic/lectures', buildLectureFormData(payload))
      return data
    },
    update: async (id: number, payload: Parameters<typeof buildLectureFormData>[0]) => {
      const formData = buildLectureFormData(payload)
      formData.append('_method', 'PUT')
      const { data } = await api.post<IslamicLectureRecord>(`/islamic/lectures/${id}`, formData)
      return data
    },
    delete: async (id: number) => {
      await api.delete(`/islamic/lectures/${id}`)
    },
  },
  guestbook: {
    listPublic: async (params: Record<string, string | number | undefined> = {}) => {
      const { data } = await api.get<PaginatedResponse<GuestEntryRecord>>('/guestbook/public', { params })
      return data
    },
    listAdmin: async (params: Record<string, string | number | undefined> = {}) => {
      const { data } = await api.get<PaginatedResponse<GuestEntryRecord>>('/guestbook', { params })
      return data
    },
    create: async (payload: Parameters<typeof buildGuestEntryFormData>[0]) => {
      const { data } = await api.post<GuestEntryRecord>('/guestbook', buildGuestEntryFormData(payload))
      return data
    },
    update: async (id: number, payload: Parameters<typeof buildGuestEntryFormData>[0]) => {
      const formData = buildGuestEntryFormData(payload)
      formData.append('_method', 'PUT')
      const { data } = await api.post<GuestEntryRecord>(`/guestbook/${id}`, formData)
      return data
    },
    delete: async (id: number) => {
      await api.delete(`/guestbook/${id}`)
    },
  },
  videos: {
    list: async (params: Record<string, string | number | undefined> = {}) => {
      const { data } = await api.get<PaginatedResponse<VideoRecord>>('/videos', { params })
      return data
    },
    featured: async () => {
      const { data } = await api.get<VideoRecord[]>('/videos/featured')
      return data
    },
    getById: async (id: number) => {
      const { data } = await api.get<VideoRecord>(`/videos/${id}`)
      return data
    },
    create: async (payload: Parameters<typeof buildVideoFormData>[0]) => {
      const { data } = await api.post<VideoRecord>('/videos', buildVideoFormData(payload))
      return data
    },
    update: async (id: number, payload: Parameters<typeof buildVideoFormData>[0]) => {
      const formData = buildVideoFormData(payload)
      formData.append('_method', 'PUT')
      const { data } = await api.post<VideoRecord>(`/videos/${id}`, formData)
      return data
    },
    delete: async (id: number) => {
      await api.delete(`/videos/${id}`)
    },
  },
}
