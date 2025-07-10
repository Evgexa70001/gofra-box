import { Suspense } from 'react'
import Slider from '../Slider/Slider'
import SEO from '../SEO/SEO'
import FAQ from '../FAQ/FAQ'
import Catalog from '../Catalog/Catalog'
import Map from '../Map/Map'
import {
	Package,
	Truck,
	Shield,
	Star,
	Quote,
	Percent,
	Gift,
	Zap,
} from 'lucide-react'

const Advantages = () => {
	const advantages = [
		{
			icon: Package,
			title: 'Любые размеры',
			description:
				'Изготавливаем коробки под ваши требования - от маленьких до больших размеров',
		},
		{
			icon: Truck,
			title: 'Быстрая доставка',
			description:
				'Доставляем по Пятигорску и Ставропольскому краю в кратчайшие сроки',
		},

		{
			icon: Shield,
			title: 'Гарантия качества',
			description:
				'Используем только качественные материалы и контролируем каждый этап',
		},
	]

	return (
		<section className='py-20 bg-gradient-to-br from-gray-50 to-white'>
			<div className='max-w-7xl mx-auto px-4'>
				<div className='text-center mb-16'>
					<div className='inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4'>
						Почему выбирают нас
					</div>
					<h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
						Надежный партнер для вашего бизнеса
					</h2>
					<p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
						Мы предлагаем качественные гофро коробки с быстрой доставкой по
						Пятигорску и Ставропольскому краю
					</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
					{advantages.map((advantage, index) => (
						<div
							key={index}
							className='group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100'
						>
							{/* Декоративный элемент */}
							<div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

							<div className='flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300'>
								<advantage.icon size={36} className='text-primary' />
							</div>
							<h3 className='text-2xl font-bold text-gray-900 mb-4 text-center group-hover:text-primary transition-colors duration-300'>
								{advantage.title}
							</h3>
							<p className='text-gray-600 text-center leading-relaxed'>
								{advantage.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

const SpecialOffers = () => {
	const offers = [
		{
			icon: Percent,
			title: 'Скидка 10%',
			description: 'При заказе от 5000 коробок',
			color: 'bg-gradient-to-br from-red-500 to-pink-600',
			textColor: 'text-red-600',
			badge: 'Популярно',
		},
		{
			icon: Gift,
			title: 'Бесплатная доставка',
			description: 'По Пятигорску при заказе от 10 000 ₽',
			color: 'bg-gradient-to-br from-green-500 to-emerald-600',
			textColor: 'text-green-600',
			badge: 'Экономия',
		},
		{
			icon: Zap,
			title: 'Срочное производство',
			description: 'Изготовление коробок от 2 дней',
			color: 'bg-gradient-to-br from-yellow-500 to-orange-500',
			textColor: 'text-yellow-600',
			badge: 'Быстро',
		},
	]

	return (
		<section className='py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
			<div className='max-w-7xl mx-auto px-4'>
				<div className='text-center mb-16'>
					<div className='inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4'>
						Специальные предложения
					</div>
					<h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
						Выгодные условия для наших клиентов
					</h2>
					<p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
						Выгодные условия для наших клиентов в Пятигорске и Ставропольском
						крае
					</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
					{offers.map((offer, index) => (
						<div
							key={index}
							className='group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 overflow-hidden'
						>
							{/* Badge */}
							<div className='absolute top-4 right-4'>
								<span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary'>
									{offer.badge}
								</span>
							</div>

							{/* Декоративный фон */}
							<div
								className={`absolute top-0 right-0 w-32 h-32 ${offer.color} rounded-full opacity-10 -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500`}
							></div>

							<div className='relative z-10'>
								<div
									className={`flex items-center justify-center w-20 h-20 ${offer.color} rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}
								>
									<offer.icon size={36} className='text-white' />
								</div>
								<h3 className='text-2xl font-bold text-gray-900 mb-4 text-center group-hover:text-primary transition-colors duration-300'>
									{offer.title}
								</h3>
								<p className='text-gray-600 text-center leading-relaxed'>
									{offer.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

const Reviews = () => {
	const reviews = [
		{
			name: 'Александр Петров',
			company: 'ООО "Торговый дом"',
			rating: 5,
			text: 'Отличное качество коробок! Заказывали для отправки товаров на Wildberries. Все коробки соответствуют требованиям площадки. Быстрая доставка по Пятигорску.',
			date: '2024',
		},
		{
			name: 'Елена Смирнова',
			company: 'Интернет-магазин "Мода"',
			rating: 5,
			text: 'Очень довольны сотрудничеством. Изготовили коробки под наши размеры в кратчайшие сроки. Цены приемлемые, качество на высоте.',
			date: '2024',
		},
		{
			name: 'Дмитрий Козлов',
			company: 'Переездная компания',
			rating: 5,
			text: 'Используем коробки для переездов клиентов. Прочные, удобные размеры. Клиенты довольны, вещи доезжают без повреждений.',
			date: '2024',
		},
		{
			name: 'Мария Иванова',
			company: 'ИП "Сувениры"',
			rating: 5,
			text: 'Заказываем коробки для упаковки сувениров. Красивая печать логотипа, аккуратная работа. Рекомендуем всем!',
			date: '2024',
		},
		{
			name: 'Сергей Волков',
			company: 'ООО "Электроника"',
			rating: 5,
			text: 'Надежный поставщик упаковки. Работаем уже больше года. Никаких нареканий, все заказы выполняются в срок.',
			date: '2024',
		},
		{
			name: 'Анна Морозова',
			company: 'Салон красоты',
			rating: 5,
			text: 'Заказывали коробки для переезда салона. Все сделали быстро и качественно. Спасибо за отличную работу!',
			date: '2024',
		},
	]

	return (
		<section className='py-20 bg-gradient-to-br from-gray-50 to-white'>
			<div className='max-w-7xl mx-auto px-4'>
				<div className='text-center mb-16'>
					<div className='inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4'>
						Отзывы клиентов
					</div>
					<h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
						Что говорят наши клиенты
					</h2>
					<p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
						Более 500 довольных клиентов в Пятигорске и Ставропольском крае
					</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
					{reviews.map((review, index) => (
						<div
							key={index}
							className='group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100'
						>
							{/* Декоративная иконка */}
							<div className='absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300'>
								<Quote size={48} className='text-primary' />
							</div>

							<div className='flex items-center mb-6'>
								<div className='flex items-center'>
									{[...Array(review.rating)].map((_, i) => (
										<Star
											key={i}
											size={20}
											className='text-yellow-400 fill-current'
										/>
									))}
								</div>
								<div className='ml-auto text-sm text-gray-400'>
									{review.date}
								</div>
							</div>

							<p className='text-gray-700 mb-6 italic leading-relaxed text-lg'>
								"{review.text}"
							</p>

							<div className='border-t border-gray-100 pt-6'>
								<div className='font-bold text-gray-900 text-lg'>
									{review.name}
								</div>
								<div className='text-sm text-gray-600'>{review.company}</div>
							</div>
						</div>
					))}
				</div>

				<div className='text-center mt-16'>
					<div className='bg-white rounded-2xl p-8 shadow-xl max-w-2xl mx-auto border border-gray-100'>
						<h3 className='text-2xl font-bold text-gray-900 mb-4'>
							Оставьте свой отзыв
						</h3>
						<p className='text-gray-600 mb-8 leading-relaxed'>
							Поделитесь своим опытом работы с нами. Ваш отзыв поможет другим
							клиентам сделать правильный выбор.
						</p>
						<button className='bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg'>
							Написать отзыв
						</button>
					</div>
				</div>
			</div>
		</section>
	)
}

const HomePage = () => {
	return (
		<>
			<SEO
				title='Гофро коробки в Пятигорске | Производство и продажа упаковки'
				description='Производство и продажа гофро коробок в Пятигорске. Качественная упаковка для бизнеса, маркетплейсов и переездов. Быстрая доставка по Ставропольскому краю.'
				keywords='гофро коробки пятигорск, упаковка пятигорск, коробки для маркетплейсов, коробки для переезда, производство коробок, доставка коробок ставропольский край'
			/>
			<section id='home'>
				<Slider />
			</section>

			<section id='advantages'>
				<Advantages />
			</section>

			<section id='offers'>
				<SpecialOffers />
			</section>

			<Suspense fallback={<div>Загрузка...</div>}>
				<section id='faq'>
					<FAQ />
				</section>
				<section id='catalog'>
					<Catalog />
				</section>
				<section id='reviews'>
					<Reviews />
				</section>
				<section id='address'>
					<Map />
				</section>
			</Suspense>
		</>
	)
}

export default HomePage
