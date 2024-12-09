import React from 'react'
import { Helmet } from 'react-helmet-async'

interface SEOProps {
	title: string
	description: string
	keywords?: string
	ogImage?: string
	canonicalUrl?: string
}

const SEO: React.FC<SEOProps> = ({
	title,
	description,
	keywords,
	ogImage,
	canonicalUrl,
}) => {
	const siteUrl =
		import.meta.env.VITE_SITE_URL || 'https://gofra-box.vercel.app'

	return (
		<Helmet>
			<title>{title}</title>
			<meta name='description' content={description} />
			{keywords && <meta name='keywords' content={keywords} />}

			{/* Open Graph */}
			<meta property='og:title' content={title} />
			<meta property='og:description' content={description} />
			<meta property='og:type' content='website' />
			<meta property='og:url' content={canonicalUrl || siteUrl} />
			{ogImage && <meta property='og:image' content={ogImage} />}

			{/* Twitter Card */}
			<meta name='twitter:card' content='summary_large_image' />
			<meta name='twitter:title' content={title} />
			<meta name='twitter:description' content={description} />
			{ogImage && <meta name='twitter:image' content={ogImage} />}

			{/* Canonical URL */}
			{canonicalUrl && <link rel='canonical' href={canonicalUrl} />}
		</Helmet>
	)
}

export default SEO
