import { ArrowDown, ArrowUp, ImagePlus, Star, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import FileUploadZone from '../../components/FileUploadZone'
import LanguageTabEditor from '../../components/LanguageTabEditor'
import PublishToggle from '../../components/PublishToggle'
import Skeleton from '../../components/Skeleton'
import { getApiErrorMessage } from '../../services/errorService'
import { emptyLocalizedText, mediaContentService, type GalleryAlbumRecord, type LocalizedText } from '../../services/mediaContentService'
import { formatDateTime } from '../../utils/date'
import { getLocalizedText } from '../../utils/localizedContent'

const initialAlbumForm = {
  title: emptyLocalizedText(),
  description: emptyLocalizedText(),
  event_date: '',
  category: 'event' as GalleryAlbumRecord['category'],
  department: '',
  is_published: false,
}

function AdminGalleryManager() {
  const [albums, setAlbums] = useState<GalleryAlbumRecord[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbumRecord | null>(null)
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbumRecord | null>(null)
  const [albumForm, setAlbumForm] = useState(initialAlbumForm)
  const [queuedImages, setQueuedImages] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const loadAlbums = async (preferredAlbumId?: number | null) => {
    setIsLoading(true)
    try {
      const response = await mediaContentService.gallery.listAlbums({ per_page: 50 })
      setAlbums(response.data)

      const nextSelected =
        response.data.find((album) => album.id === (preferredAlbumId ?? selectedAlbum?.id)) ??
        response.data[0] ??
        null

      setSelectedAlbum(nextSelected)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load gallery albums.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAlbums()
  }, [])

  useEffect(() => {
    if (!selectedAlbum) {
      return
    }

    mediaContentService.gallery
      .getAlbum(selectedAlbum.id)
      .then((album) => setSelectedAlbum(album))
      .catch(() => null)
  }, [selectedAlbum?.id])

  const orderedImages = useMemo(() => [...(selectedAlbum?.images ?? [])].sort((left, right) => left.sort_order - right.sort_order), [selectedAlbum?.images])

  const resetAlbumForm = () => {
    setEditingAlbum(null)
    setAlbumForm(initialAlbumForm)
  }

  const beginEditAlbum = (album: GalleryAlbumRecord) => {
    setEditingAlbum(album)
    setAlbumForm({
      title: album.title,
      description: album.description ?? emptyLocalizedText(),
      event_date: album.event_date ? album.event_date.slice(0, 10) : '',
      category: album.category,
      department: album.department ?? '',
      is_published: album.is_published,
    })
  }

  const moveImage = async (index: number, direction: -1 | 1) => {
    if (!selectedAlbum) {
      return
    }

    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= orderedImages.length) {
      return
    }

    const reordered = [...orderedImages]
    const current = reordered[index]
    reordered[index] = reordered[nextIndex]
    reordered[nextIndex] = current

    try {
      const response = await mediaContentService.gallery.reorder(selectedAlbum.id, reordered.map((image) => image.id))
      setSelectedAlbum(response.album)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to reorder gallery images.'))
    }
  }

  const handleBulkDelete = async () => {
    if (!selectedAlbum || selectedImageIds.length === 0) {
      return
    }

    if (!window.confirm(`Delete ${selectedImageIds.length} selected image(s)?`)) {
      return
    }

    try {
      await Promise.all(selectedImageIds.map((imageId) => mediaContentService.gallery.deleteImage(imageId)))
      toast.success('Selected images deleted.')
      setSelectedImageIds([])
      await loadAlbums(selectedAlbum.id)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to delete the selected images.'))
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(280px,0.34fr)_minmax(0,0.66fr)]">
      <div className="grid gap-6">
        <section className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-college-ink">{editingAlbum ? 'Edit Album' : 'Create Album'}</h1>
            {editingAlbum ? <button className="btn-secondary" onClick={resetAlbumForm} type="button">Cancel Edit</button> : null}
          </div>
          <div className="mt-5 grid gap-4">
            <LanguageTabEditor label="Album title" onChange={(value) => setAlbumForm((current) => ({ ...current, title: value }))} value={albumForm.title} />
            <LanguageTabEditor label="Album description" multiline onChange={(value) => setAlbumForm((current) => ({ ...current, description: value }))} rows={7} value={albumForm.description} />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Event Date
                <input className="form-input" onChange={(event) => setAlbumForm((current) => ({ ...current, event_date: event.target.value }))} type="date" value={albumForm.event_date} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Category
                <select className="form-input" onChange={(event) => setAlbumForm((current) => ({ ...current, category: event.target.value as GalleryAlbumRecord['category'] }))} value={albumForm.category}>
                  <option value="event">Event</option>
                  <option value="graduation">Graduation</option>
                  <option value="academic">Academic</option>
                  <option value="construction">Construction</option>
                  <option value="general">General</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                Department
                <select className="form-input" onChange={(event) => setAlbumForm((current) => ({ ...current, department: event.target.value }))} value={albumForm.department}>
                  <option value="">All departments</option>
                  <option value="shareea">Shareea</option>
                  <option value="hifl">Hifl</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <PublishToggle checked={albumForm.is_published} onChange={(checked) => setAlbumForm((current) => ({ ...current, is_published: checked }))} />
              <button
                className="btn-primary"
                disabled={isSaving}
                onClick={async () => {
                  try {
                    setIsSaving(true)
                      const payload: Partial<GalleryAlbumRecord> = {
                        title: albumForm.title as LocalizedText,
                        description: albumForm.description as LocalizedText,
                        event_date: albumForm.event_date || undefined,
                        category: albumForm.category,
                        department: albumForm.department ? (albumForm.department as 'shareea' | 'hifl') : undefined,
                        is_published: albumForm.is_published,
                      }

                    if (editingAlbum) {
                      await mediaContentService.gallery.updateAlbum(editingAlbum.id, payload)
                      toast.success('Album updated.')
                      await loadAlbums(editingAlbum.id)
                    } else {
                      const created = await mediaContentService.gallery.createAlbum(payload)
                      toast.success('Album created.')
                      await loadAlbums(created.id)
                    }

                    resetAlbumForm()
                  } catch (error) {
                    toast.error(getApiErrorMessage(error, 'Unable to save the gallery album.'))
                  } finally {
                    setIsSaving(false)
                  }
                }}
                type="button"
              >
                {isSaving ? 'Saving...' : editingAlbum ? 'Update Album' : 'Create Album'}
              </button>
            </div>
          </div>
        </section>

        <section className="panel overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-4">
            <h2 className="text-lg font-semibold text-college-ink">Albums</h2>
            <p className="text-sm text-slate-500">Select an album to upload images, adjust the cover, or review its order.</p>
          </div>
          {isLoading ? <div className="p-4"><Skeleton className="h-80 w-full" /></div> : null}
          {!isLoading ? (
            <div className="grid gap-3 p-4">
              {albums.length === 0 ? <p className="text-sm text-slate-500">No albums created yet.</p> : null}
              {albums.map((album) => (
                <button
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedAlbum?.id === album.id ? 'border-college-green bg-teal-50/60' : 'border-slate-200 bg-white hover:border-college-green/50'
                  }`}
                  key={album.id}
                  onClick={() => setSelectedAlbum(album)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-college-ink">{getLocalizedText(album.title, 'en')}</p>
                      <p className="mt-1 text-xs text-slate-500">{album.images_count} images | {formatDateTime(album.event_date, 'No event date')}</p>
                    </div>
                    <span className={`status-chip ${album.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{album.is_published ? 'published' : 'draft'}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="btn-secondary min-h-9 px-3" onClick={(event) => {
                      event.stopPropagation()
                      beginEditAlbum(album)
                    }} type="button">Edit</button>
                    <button
                      className="btn-secondary min-h-9 px-3"
                      onClick={async (event) => {
                        event.stopPropagation()
                        try {
                          await mediaContentService.gallery.updateAlbum(album.id, {
                            title: album.title,
                            description: album.description ?? emptyLocalizedText(),
                            event_date: album.event_date ?? undefined,
                            category: album.category,
                            department: album.department ?? undefined,
                            is_published: !album.is_published,
                          })
                          toast.success(album.is_published ? 'Album moved to draft.' : 'Album published.')
                          await loadAlbums(album.id)
                        } catch (error) {
                          toast.error(getApiErrorMessage(error, 'Unable to update album visibility.'))
                        }
                      }}
                      type="button"
                    >
                      {album.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      className="btn-secondary min-h-9 px-3 text-red-600 hover:bg-red-50"
                      onClick={async (event) => {
                        event.stopPropagation()
                        if (!window.confirm(`Delete album "${getLocalizedText(album.title, 'en')}" and all its images?`)) {
                          return
                        }
                        try {
                          await mediaContentService.gallery.deleteAlbum(album.id)
                          toast.success('Album deleted.')
                          if (editingAlbum?.id === album.id) {
                            resetAlbumForm()
                          }
                          await loadAlbums()
                        } catch (error) {
                          toast.error(getApiErrorMessage(error, 'Unable to delete the album.'))
                        }
                      }}
                      type="button"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      <section className="grid gap-6">
        <section className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-college-ink">{selectedAlbum ? getLocalizedText(selectedAlbum.title, 'en') : 'Select an Album'}</h2>
              <p className="mt-2 text-sm text-slate-500">Bulk upload up to 50 images, then choose a cover image and refine the order.</p>
            </div>
            {selectedAlbum ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">{selectedAlbum.images.length} images</span> : null}
          </div>

          {selectedAlbum ? (
            <div className="mt-5 grid gap-4">
              <FileUploadZone
                accept="image/jpeg,image/png,image/webp"
                files={queuedImages}
                helperText="Drop JPG, PNG, or WEBP images here. Up to 50 images, 5MB each."
                label="Album image upload"
                maxFiles={50}
                multiple
                onChange={setQueuedImages}
                progress={uploadProgress}
              />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="btn-primary"
                  disabled={queuedImages.length === 0}
                  onClick={async () => {
                    try {
                      const response = await mediaContentService.gallery.uploadImages(selectedAlbum.id, queuedImages, [], (progress) => {
                        const nextProgress: Record<string, number> = {}
                        queuedImages.forEach((file) => {
                          nextProgress[file.name] = progress
                        })
                        setUploadProgress(nextProgress)
                      })

                      setSelectedAlbum(response.album)
                      setQueuedImages([])
                      setUploadProgress({})
                      toast.success('Images uploaded successfully.')
                      await loadAlbums(selectedAlbum.id)
                    } catch (error) {
                      toast.error(getApiErrorMessage(error, 'Unable to upload the selected images.'))
                    }
                  }}
                  type="button"
                >
                  <ImagePlus size={16} />
                  Upload Images
                </button>
                <button className="btn-secondary" disabled={selectedImageIds.length === 0} onClick={handleBulkDelete} type="button">
                  <Trash2 size={16} />
                  Delete Selected
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">Choose or create an album first to start uploading images.</div>
          )}
        </section>

        <section className="panel overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-4">
            <h2 className="text-lg font-semibold text-college-ink">Album Images</h2>
            <p className="text-sm text-slate-500">Set a cover image, move images up or down, or bulk-delete the selected items.</p>
          </div>
          {!selectedAlbum ? <div className="p-5 text-sm text-slate-500">No album selected yet.</div> : null}
          {selectedAlbum ? (
            <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {orderedImages.length === 0 ? <p className="text-sm text-slate-500 sm:col-span-2 xl:col-span-3">No images uploaded to this album yet.</p> : null}
              {orderedImages.map((image, index) => (
                <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" key={image.id}>
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <img alt={getLocalizedText(image.caption, 'en', 'Gallery image')} className="h-full w-full object-cover" src={image.thumbnail_url || image.image_url} />
                    <label className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-college-ink">
                      <input checked={selectedImageIds.includes(image.id)} onChange={(event) => {
                        setSelectedImageIds((current) => event.target.checked ? [...current, image.id] : current.filter((id) => id !== image.id))
                      }} type="checkbox" />
                      Select
                    </label>
                    {image.is_cover ? <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-700"><Star size={12} /> Cover</span> : null}
                  </div>
                  <div className="grid gap-3 p-4">
                    <p className="min-h-12 text-sm leading-6 text-slate-600">{getLocalizedText(image.caption, 'en', 'No caption for this image.')}</p>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-secondary min-h-9 px-3" disabled={index === 0} onClick={() => moveImage(index, -1)} type="button">
                        <ArrowUp size={15} />
                        Up
                      </button>
                      <button className="btn-secondary min-h-9 px-3" disabled={index === orderedImages.length - 1} onClick={() => moveImage(index, 1)} type="button">
                        <ArrowDown size={15} />
                        Down
                      </button>
                      <button
                        className="btn-secondary min-h-9 px-3"
                        onClick={async () => {
                          try {
                            const response = await mediaContentService.gallery.setCover(image.id)
                            setSelectedAlbum(response.album)
                            toast.success('Album cover updated.')
                          } catch (error) {
                            toast.error(getApiErrorMessage(error, 'Unable to set the album cover.'))
                          }
                        }}
                        type="button"
                      >
                        <Star size={15} />
                        Set Cover
                      </button>
                      <button
                        className="btn-secondary min-h-9 px-3 text-red-600 hover:bg-red-50"
                        onClick={async () => {
                          if (!window.confirm('Delete this image from the album?')) {
                            return
                          }
                          try {
                            await mediaContentService.gallery.deleteImage(image.id)
                            toast.success('Image deleted.')
                            await loadAlbums(selectedAlbum.id)
                          } catch (error) {
                            toast.error(getApiErrorMessage(error, 'Unable to delete the image.'))
                          }
                        }}
                        type="button"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </section>
    </section>
  )
}

export default AdminGalleryManager
