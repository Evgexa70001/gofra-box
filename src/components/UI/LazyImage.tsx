import React, { useState, useEffect, useRef } from 'react'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
	src: string
	alt: string
	placeholderSrc?: string
	threshold?: number
}

const LazyImage: React.FC<LazyImageProps> = ({
	src,
	alt,
	placeholderSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMSAxIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PC9zdmc+',
	threshold = 0.1,
	className,
	...props
}) => {
	const [loading, setLoading] = useState(true)
	const [currentSrc, setCurrentSrc] = useState(placeholderSrc)
	const [isInView, setIsInView] = useState(false)
	const imgRef = useRef<HTMLImageElement>(null)

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsInView(true)
					observer.disconnect()
				}
			},
			{
				threshold,
				rootMargin: '50px',
			}
		)

		if (imgRef.current) {
			observer.observe(imgRef.current)
		}

		return () => observer.disconnect()
	}, [threshold])

	useEffect(() => {
		if (isInView) {
			const img = new Image()
			img.src = src
			img.onload = () => {
				setCurrentSrc(src)
				setLoading(false)
			}
			img.onerror = () => {
				setLoading(false)
				console.error(`Failed to load image: ${src}`)
			}
		}
	}, [src, isInView])

	return (
		<img
			ref={imgRef}
			src={currentSrc}
			alt={alt}
			className={`transition-all duration-500 ${
				loading ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
			} ${className || ''}`}
			loading='lazy'
			{...props}
		/>
	)
}

export default LazyImage
