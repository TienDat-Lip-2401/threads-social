import { useRef, useState } from 'react'

export const useDragScroll = () => {
    // Tham chiếu đến DOM element (container chứa ảnh)
    const scrollRef = useRef(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0) // Vị trí X khi bắt đầu kéo
    const [scrollLeft, setScrollLeft] = useState(0) // Vị trí scroll ban đầu

    const handleMouseDown = (e) => {
        setIsDragging(true) // Đánh dấu: đang bắt đầu kéo
        setStartX(e.pageX - scrollRef.current.offsetLeft) // Tính vị trí X của chuột TRONG container
        setScrollLeft(scrollRef.current.scrollLeft) // Lưu vị trí scroll hiện tại
        scrollRef.current.style.cursor = 'grabbing'
    }

    const handleMouseUp = () => {
        setIsDragging(false) // Đánh dấu: đã ngừng kéo
        if (scrollRef.current) {
            scrollRef.current.style.cursor = 'grab' // ← Thêm dòng này
        }
    }

    const handleMouseMove = (e) => {
        if (!isDragging) return
        e.preventDefault()

        // Tính vị trí X hiện tại TRONG container
        const x = e.pageX - scrollRef.current.offsetLeft
        const walk = x - startX // Scroll speed
        scrollRef.current.scrollLeft = scrollLeft - walk // Update vị trí scroll
    }

    return {
        scrollRef,
        handlers: {
            onMouseDown: handleMouseDown,
            onMouseUp: handleMouseUp,
            onMouseMove: handleMouseMove,
            onMouseLeave: handleMouseUp
        }
    }
}
