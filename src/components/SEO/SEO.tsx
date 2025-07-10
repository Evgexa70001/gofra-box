import { Helmet } from 'react-helmet-async'

interface SEOProps {
	title: string
	description: string
	keywords: string
}

const SEO = ({ title, description, keywords }: SEOProps) => {
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Гофра-Тара',
		description: 'Производство и продажа гофро коробок в Пятигорске',
		url: 'https://gofra-tara.ru',
		logo: 'https://gofra-tara.ru/logo.png',
		address: {
			'@type': 'PostalAddress',
			addressLocality: 'Пятигорск',
			addressRegion: 'Ставропольский край',
			addressCountry: 'RU',
		},
		contactPoint: [
			{
				'@type': 'ContactPoint',
				telephone: '+7-928-929-06-89',
				contactType: 'customer service',
				areaServed: 'RU',
				availableLanguage: 'Russian',
			},
			{
				'@type': 'ContactPoint',
				telephone: '+7-928-006-21-26',
				contactType: 'customer service',
				areaServed: 'RU',
				availableLanguage: 'Russian',
			},
		],
		sameAs: ['https://vk.com/gofra_tara', 'https://t.me/gofra_tara'],
		serviceArea: {
			'@type': 'GeoCircle',
			geoMidpoint: {
				'@type': 'GeoCoordinates',
				latitude: 44.0486,
				longitude: 43.0594,
			},
			geoRadius: '50000',
		},
		hasOfferCatalog: {
			'@type': 'OfferCatalog',
			name: 'Гофро коробки',
			itemListElement: [
				{
					'@type': 'Offer',
					itemOffered: {
						'@type': 'Product',
						name: 'Гофро коробки для маркетплейсов',
					},
				},
				{
					'@type': 'Offer',
					itemOffered: {
						'@type': 'Product',
						name: 'Гофро коробки для переезда',
					},
				},
				{
					'@type': 'Offer',
					itemOffered: {
						'@type': 'Product',
						name: 'Индивидуальные гофро коробки',
					},
				},
			],
		},
	}

	return (
		<Helmet>
			<title>{title}</title>
			<meta name='description' content={description} />
			<meta name='keywords' content={keywords} />

			{/* Open Graph */}
			<meta property='og:title' content={title} />
			<meta property='og:description' content={description} />
			<meta property='og:type' content='website' />
			<meta property='og:url' content='https://gofra-tara.ru' />
			<meta property='og:image' content='https://gofra-tara.ru/og-image.jpg' />
			<meta property='og:locale' content='ru_RU' />

			{/* Twitter Card */}
			<meta name='twitter:card' content='summary_large_image' />
			<meta name='twitter:title' content={title} />
			<meta name='twitter:description' content={description} />
			<meta
				name='twitter:image'
				content='https://gofra-tara.ru/twitter-image.jpg'
			/>

			{/* Local Business */}
			<meta name='geo.region' content='RU-STA' />
			<meta name='geo.placename' content='Пятигорск' />
			<meta name='geo.position' content='44.0486;43.0594' />
			<meta name='ICBM' content='44.0486, 43.0594' />

			{/* Additional SEO */}
			<meta name='robots' content='index, follow' />
			<meta name='author' content='Гофра-Тара' />
			<meta name='copyright' content='Гофра-Тара' />

			{/* Canonical URL */}
			<link rel='canonical' href='https://gofra-tara.ru' />

			{/* Structured Data */}
			<script type='application/ld+json'>
				{JSON.stringify(structuredData)}
			</script>

			{/* Local Business Structured Data */}
			<script type='application/ld+json'>
				{JSON.stringify({
					'@context': 'https://schema.org',
					'@type': 'LocalBusiness',
					name: 'Гофра-Тара',
					description: 'Производство и продажа гофро коробок в Пятигорске',
					url: 'https://gofra-tara.ru',
					telephone: '+7-928-929-06-89',
					address: {
						'@type': 'PostalAddress',
						addressLocality: 'Пятигорск',
						addressRegion: 'Ставропольский край',
						addressCountry: 'RU',
					},
					geo: {
						'@type': 'GeoCoordinates',
						latitude: 44.0486,
						longitude: 43.0594,
					},
					openingHours: 'Mo-Fr 09:00-18:00',
					priceRange: '$$',
					areaServed: [
						{
							'@type': 'City',
							name: 'Пятигорск',
						},
						{
							'@type': 'City',
							name: 'Ессентуки',
						},
						{
							'@type': 'City',
							name: 'Кисловодск',
						},
						{
							'@type': 'City',
							name: 'Железноводск',
						},
						{
							'@type': 'City',
							name: 'Ставрополь',
						},
					],
					hasOfferCatalog: {
						'@type': 'OfferCatalog',
						name: 'Гофро коробки',
						itemListElement: [
							{
								'@type': 'Offer',
								itemOffered: {
									'@type': 'Product',
									name: 'Гофро коробки для маркетплейсов',
									description:
										'Коробки для отправки товаров на Wildberries, Ozon, Яндекс.Маркет',
								},
							},
							{
								'@type': 'Offer',
								itemOffered: {
									'@type': 'Product',
									name: 'Гофро коробки для переезда',
									description:
										'Прочные коробки для переезда квартиры или офиса',
								},
							},
							{
								'@type': 'Offer',
								itemOffered: {
									'@type': 'Product',
									name: 'Индивидуальные гофро коробки',
									description: 'Коробки любых размеров под ваши требования',
								},
							},
						],
					},
				})}
			</script>
		</Helmet>
	)
}

export default SEO
