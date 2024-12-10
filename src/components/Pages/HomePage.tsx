import Slider from '../Slider/Slider'
import Catalog from '../Catalog/Catalog'
import Map from '../Map/Map'
import SEO from '../SEO/SEO'
import MaterialsTable from '../MaterialsTable/MaterialsTable'
import FAQ from '../FAQ/FAQ'

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
			<section id='faq'>
				<FAQ />
			</section>
			<section id='catalog'>
				<Catalog />
			</section>
			<section id='catalog'>
				<MaterialsTable />
			</section>

			<section id='address'>
				<Map />
			</section>
		</>
	)
}

export default HomePage
