export function triggerDownload(url: null | string | undefined, target: '_blank' | '_self' = '_blank') {
  if (!url) {
    return
  }

  window.open(url, target, target === '_blank' ? 'noopener,noreferrer' : undefined)
}
