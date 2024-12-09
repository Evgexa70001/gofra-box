import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import { ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'

interface MainLayoutProps {
	children: ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
	return (
		<>
			<Helmet>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<meta
					name='description'
					content='Производство и продажа гофрокартона и гофротары в Пятигорске. Картонные коробки любых размеров, упаковка для товаров. Доставка по России.'
				/>
				<meta
					name='keywords'
					content='гофрокартон, гофротара, картонные коробки, упаковка, производство картонных коробок, Пятигорск'
				/>
				<meta name='robots' content='index, follow' />

				{/* Open Graph теги */}
				<meta property='og:type' content='website' />
				<meta
					property='og:title'
					content='Гофра-Тара | Производство картонных коробок'
				/>
				<meta
					property='og:description'
					content='Производство и продажа гофрокартона и гофротары в Пятигорске. Картонные коробки любых размеров.'
				/>
				<meta property='og:image' content='/path-to-your-logo.jpg' />
				<meta property='og:url' content='https://ваш-домен.com' />

				{/* Twitter Card теги */}
				<meta name='twitter:card' content='summary_large_image' />
				<meta
					name='twitter:title'
					content='Гофра-Тара | Производство картонных коробок'
				/>
				<meta
					name='twitter:description'
					content='Производство и продажа гофрокартона и гофротары в Пятигорске'
				/>
				<meta name='twitter:image' content='/path-to-your-logo.jpg' />
			</Helmet>
			<div className='min-h-screen bg-gray-100'>
				<Header />
				<div className='max-w-[1280px] mx-auto px-4'>{children}</div>
				<Footer id='footer' />
			</div>
		</>
	)
}

export default MainLayout
