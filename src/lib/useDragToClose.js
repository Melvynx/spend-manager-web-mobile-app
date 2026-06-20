import { useEffect, useRef, useState } from 'react'

const CLOSE_DISTANCE = 96
const CLOSE_VELOCITY = 0.55
const CLOSE_ANIMATION_MS = 170

function viewportHeight() {
  return window.innerHeight || document.documentElement?.clientHeight || 720
}

export function useDragToClose(onClose) {
  const startYRef = useRef(0)
  const startTimeRef = useRef(0)
  const currentYRef = useRef(0)
  const draggingRef = useRef(false)
  const closingRef = useRef(false)
  const closeTimerRef = useRef(null)

  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [hasDragStyle, setHasDragStyle] = useState(false)

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  function closeWithSlide() {
    if (closingRef.current) return

    closingRef.current = true
    setHasDragStyle(true)
    setIsDragging(false)
    setDragY(viewportHeight())
    closeTimerRef.current = window.setTimeout(onClose, CLOSE_ANIMATION_MS)
  }

  function resetDrag() {
    currentYRef.current = 0
    setIsDragging(false)
    setDragY(0)
  }

  function handlePointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return

    draggingRef.current = true
    setHasDragStyle(true)
    startYRef.current = event.clientY
    startTimeRef.current = Date.now()
    currentYRef.current = 0
    setIsDragging(true)
    setDragY(0)
    event.currentTarget.setPointerCapture?.(event.pointerId)
    event.preventDefault()
  }

  function handlePointerMove(event) {
    if (!draggingRef.current) return

    const nextY = Math.max(0, event.clientY - startYRef.current)
    currentYRef.current = nextY
    setDragY(nextY)
    event.preventDefault()
  }

  function handlePointerEnd(event) {
    if (!draggingRef.current) return

    draggingRef.current = false
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    const elapsed = Math.max(Date.now() - startTimeRef.current, 1)
    const velocity = currentYRef.current / elapsed

    if (
      currentYRef.current >= CLOSE_DISTANCE ||
      (currentYRef.current > 28 && velocity >= CLOSE_VELOCITY)
    ) {
      closeWithSlide()
      return
    }

    resetDrag()
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      closeWithSlide()
    }
  }

  const sheetStyle =
    hasDragStyle
      ? {
          transform: `translateY(${dragY}px)`,
          transition: isDragging
            ? 'none'
            : `transform ${CLOSE_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }
      : undefined

  return {
    isDragging,
    sheetStyle,
    dragHandleProps: {
      role: 'button',
      tabIndex: 0,
      'aria-label': 'Swipe down to close',
      onKeyDown: handleKeyDown,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerCancel: handlePointerEnd,
    },
  }
}
