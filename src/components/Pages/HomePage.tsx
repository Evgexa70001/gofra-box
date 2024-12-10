import { Suspense } from 'react'
import Slider from '../Slider/Slider'
import SEO from '../SEO/SEO'
import FAQ from '../FAQ/FAQ'
import Catalog from '../Catalog/Catalog'
import Map from '../Map/Map'
import MaterialsTable from '../MaterialsTable/MaterialsTable'

// Ленивая загрузка компонентов
// const Catalog = lazy(() => import('../Catalog/Catalog'))
// const Map = lazy(() => import('../Map/Map'))
// const MaterialsTable = lazy(() => import('../MaterialsTable/MaterialsTable'))
// const FAQ  import('../FAQ/FAQ'))

const HomePage = () => {
	return (
		<>
			<SEO
				title='Главная | Гофра Тара'
				description='Добро пожаловать в наш интернет-магазин. У нас вы найдете широкий ассортимент упаковочных картонных коробок.'
				keywords='интернет-магазин, коробки, упаковка, картон, гофра, тара, упаковка для товаров, упаковка для продуктов, упаковка для маркетплейсов'
			/>
			<section id='home'>
				<Slider />
			</section>

			<Suspense fallback={<div>Загрузка...</div>}>
				<section id='faq'>
					<FAQ />
				</section>
				<section id='catalog'>
					<Catalog />
				</section>
				<section id='materials'>
					<MaterialsTable />
				</section>
				<section id='address'>
					<Map />
				</section>
			</Suspense>
		</>
	)
}

export default HomePage
