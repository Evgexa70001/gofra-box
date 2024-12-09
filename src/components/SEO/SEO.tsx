import { Helmet } from 'react-helmet-async'

interface SEOProps {
	title: string
	description: string
	keywords?: string
	ogImage?: string
}

const SEO = ({ title, description, keywords, ogImage }: SEOProps) => {
	return (
		<Helmet>
			<title>{title}</title>
			<meta name='description' content={description} />
			{keywords && <meta name='keywords' content={keywords} />}

			{/* Open Graph / Facebook */}
			<meta property='og:type' content='website' />
			<meta property='og:title' content={title} />
			<meta property='og:description' content={description} />
			{ogImage && <meta property='og:image' content={ogImage} />}

			{/* Twitter */}
			<meta property='twitter:card' content='summary_large_image' />
			<meta property='twitter:title' content={title} />
			<meta property='twitter:description' content={description} />
			{ogImage && <meta property='twitter:image' content={ogImage} />}
		</Helmet>
	)
}

export default SEO
