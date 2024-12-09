import React, { useState, useEffect } from 'react'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
	src: string
	alt: string
	placeholderSrc?: string
}

const LazyImage: React.FC<LazyImageProps> = ({
	src,
	alt,
	placeholderSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMSAxIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PC9zdmc+',
	className,
	...props
}) => {
	const [loading, setLoading] = useState(true)
	const [currentSrc, setCurrentSrc] = useState(placeholderSrc)

	useEffect(() => {
		// Создаем новый экземпляр Image для предзагрузки
		const img = new Image()
		img.src = src
		img.onload = () => {
			setCurrentSrc(src)
			setLoading(false)
		}
	}, [src])

	return (
		<img
			src={currentSrc}
			alt={alt}
			className={`transition-opacity duration-300 ${
				loading ? 'opacity-50' : 'opacity-100'
			} ${className || ''}`}
			{...props}
		/>
	)
}

export default LazyImage
