import { useEffect, useState } from 'react'
import { getImage } from './db.js'

// Loads an expense's image from IndexedDB and returns a URL usable
// in an <img> tag. The URL is revoked automatically.
export function useImageUrl(imageId) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    let active = true
    let objectUrl

    if (!imageId) {
      setUrl(null)
      return
    }

    getImage(imageId).then((blob) => {
      if (active && blob) {
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      }
    })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [imageId])

  return url
}
