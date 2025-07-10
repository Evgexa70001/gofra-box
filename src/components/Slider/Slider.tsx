import { useState, useEffect, useRef } from 'react'
import {
	ChevronLeft,
	ChevronRight,
	Package,
	Truck,
	Clock,
	Phone,
} from 'lucide-react'

const Slider = () => {
	const [currentSlide, setCurrentSlide] = useState(0)
	const [touchStart, setTouchStart] = useState(0)
	const [touchEnd, setTouchEnd] = useState(0)
	const [isSwiping, setIsSwiping] = useState(false)
	const [isPaused, setIsPaused] = useState(false)
	const sliderRef = useRef<HTMLDivElement>(null)
	const intervalRef = useRef<NodeJS.Timeout | null>(null)

	const slides = [
		{
			id: 1,
			title: 'Гофро коробки в Пятигорске',
			subtitle: 'Качественная упаковка для вашего бизнеса',
			description:
				'Производство и продажа гофро коробок любых размеров. Быстрая доставка по Пятигорску и Ставропольскому краю.',
			cta: 'Смотреть каталог',
			gradient: 'from-blue-600 via-indigo-600 to-purple-700',
			features: [
				{ icon: Package, text: 'Любые размеры' },
				{ icon: Truck, text: 'Быстрая доставка' },
				{ icon: Clock, text: 'Срочное производство' },
			],
		},
		{
			id: 2,
			title: 'Упаковка для маркетплейсов',
			subtitle: 'Специальные решения для онлайн-торговли',
			description:
				'Коробки для отправки товаров на Wildberries, Ozon, Яндекс.Маркет и другие площадки.',
			cta: 'Заказать сейчас',
			gradient: 'from-green-600 via-emerald-600 to-teal-700',
			features: [
				{ icon: Package, text: 'Стандарты маркетплейсов' },
				{ icon: Truck, text: 'Оптимальная стоимость' },
				{ icon: Clock, text: 'Сроки от 1 дня' },
			],
		},
		{
			id: 3,
			title: 'Коробки для переезда',
			subtitle: 'Надежная упаковка для ваших вещей',
			description:
				'Прочные коробки для переезда квартиры или офиса. Защита от повреждений при транспортировке.',
			cta: 'Рассчитать стоимость',
			gradient: 'from-purple-600 via-pink-600 to-red-600',
			features: [
				{ icon: Package, text: 'Высокая прочность' },
				{ icon: Truck, text: 'Доставка по городу' },
				{ icon: Phone, text: 'Консультация 24/7' },
			],
		},
	]

	// Функция для запуска автопереключения
	const startAutoPlay = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
		}
		intervalRef.current = setInterval(() => {
			setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1))
		}, 20000)
	}

	// Функция для остановки автопереключения
	const stopAutoPlay = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
	}

	useEffect(() => {
		if (!isPaused) {
			startAutoPlay()
		}
		return () => stopAutoPlay()
	}, [isPaused])

	// Обработчик клавиатуры
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') {
				e.preventDefault()
				prevSlide()
			} else if (e.key === 'ArrowRight') {
				e.preventDefault()
				nextSlide()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [])

	const nextSlide = () => {
		setIsPaused(true)
		setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1))
		// Возобновляем автопереключение через 5 секунд
		setTimeout(() => setIsPaused(false), 5000)
	}

	const prevSlide = () => {
		setIsPaused(true)
		setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))
		// Возобновляем автопереключение через 5 секунд
		setTimeout(() => setIsPaused(false), 5000)
	}

	// Обработчики для свайпов
	const onTouchStart = (e: React.TouchEvent) => {
		setTouchEnd(0)
		setTouchStart(e.targetTouches[0].clientX)
		setIsSwiping(true)
		setIsPaused(true)
	}

	const onTouchMove = (e: React.TouchEvent) => {
		setTouchEnd(e.targetTouches[0].clientX)
	}

	const onTouchEnd = () => {
		setIsSwiping(false)
		if (!touchStart || !touchEnd) return

		const distance = touchStart - touchEnd
		const isLeftSwipe = distance > 50
		const isRightSwipe = distance < -50

		if (isLeftSwipe) {
			nextSlide()
		}
		if (isRightSwipe) {
			prevSlide()
		}
	}

	const scrollToCatalog = () => {
		const catalogSection = document.getElementById('catalog')
		if (catalogSection) {
			const headerHeight = 80
			const elementPosition = catalogSection.getBoundingClientRect().top
			const offsetPosition = elementPosition + window.pageYOffset - headerHeight
			window.scrollTo({
				top: offsetPosition,
				behavior: 'smooth',
			})
		}
	}

	return (
		<section
			ref={sliderRef}
			className='relative w-full h-auto overflow-hidden'
			onTouchStart={onTouchStart}
			onTouchMove={onTouchMove}
			onTouchEnd={onTouchEnd}
			role='region'
			aria-label='Слайдер с информацией о продуктах'
		>
			<div className='relative pt-[70%] sm:pt-[60%] md:pt-[50%] lg:pt-[45%] xl:pt-[40%]'>
				<div
					className={`absolute inset-0 transition-all duration-1000 ease-in-out bg-gradient-to-br ${
						slides[currentSlide].gradient
					} ${isSwiping ? 'scale-95 opacity-90' : 'scale-100 opacity-100'}`}
				>
					{/* Анимированный паттерн */}
					<div className='absolute inset-0 opacity-20'>
						<div
							className='absolute inset-0 animate-pulse'
							style={{
								backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
								backgroundSize: '60px 60px',
							}}
						></div>
					</div>

					{/* Декоративные элементы */}
					<div className='absolute top-8 left-8 sm:top-16 sm:left-16 w-12 h-12 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-xl'></div>
					<div className='absolute bottom-8 right-8 sm:bottom-16 sm:right-16 w-16 h-16 sm:w-32 sm:h-32 bg-white/5 rounded-full blur-2xl'></div>

					<div className='absolute inset-0 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12'>
						<div className='text-center text-white max-w-4xl xl:max-w-5xl'>
							<div className='mb-2 sm:mb-3 md:mb-4 lg:mb-6'>
								<div className='inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm md:text-base font-medium mb-2 sm:mb-3 md:mb-4'>
									Производство и продажа
								</div>
							</div>

							<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-6 font-['Playfair_Display'] drop-shadow-2xl leading-tight">
								{slides[currentSlide].title}
							</h1>
							<h2 className='text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-medium mb-2 sm:mb-3 md:mb-4 lg:mb-6 drop-shadow-lg'>
								{slides[currentSlide].subtitle}
							</h2>
							<p className='text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl mb-4 sm:mb-6 md:mb-8 lg:mb-10 max-w-2xl lg:max-w-3xl mx-auto drop-shadow-lg leading-relaxed px-2'>
								{slides[currentSlide].description}
							</p>

							<div className='flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8 lg:mb-10 px-2'>
								{slides[currentSlide].features.map((feature, index) => (
									<div
										key={index}
										className='flex items-center gap-1.5 sm:gap-2 md:gap-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 lg:px-5 lg:py-3 border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105'
									>
										<feature.icon
											size={12}
											className='text-white sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6'
										/>
										<span className='text-xs sm:text-sm md:text-base lg:text-lg font-medium'>
											{feature.text}
										</span>
									</div>
								))}
							</div>

							<button
								onClick={scrollToCatalog}
								className='bg-white text-gray-800 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 rounded-lg sm:rounded-xl md:rounded-2xl text-sm sm:text-base md:text-lg lg:text-xl font-bold transition-all duration-500 transform hover:scale-110 hover:shadow-2xl shadow-xl hover:bg-gray-50'
							>
								{slides[currentSlide].cta}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Улучшенные кнопки навигации для мобильных */}
			<div className='absolute left-1 sm:left-2 md:left-4 lg:left-6 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 ease-in-out hover:bg-white hover:scale-110 cursor-pointer shadow-xl'>
				<button
					className='w-full h-full flex items-center justify-center text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 hover:text-primary transition-colors'
					onClick={prevSlide}
					aria-label='Предыдущий слайд'
				>
					<ChevronLeft
						size={16}
						className='sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7'
					/>
				</button>
			</div>

			<div className='absolute right-1 sm:right-2 md:right-4 lg:right-6 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 ease-in-out hover:bg-white hover:scale-110 cursor-pointer shadow-xl'>
				<button
					className='w-full h-full flex items-center justify-center text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 hover:text-primary transition-colors'
					onClick={nextSlide}
					aria-label='Следующий слайд'
				>
					<ChevronRight
						size={16}
						className='sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7'
					/>
				</button>
			</div>

			{/* Улучшенные индикаторы для мобильных */}
			<div
				className='absolute bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-6 right-4 sm:right-6 md:right-8 lg:right-10 flex space-x-1.5 sm:space-x-2 md:space-x-3'
				role='tablist'
			>
				{slides.map((_, index) => (
					<button
						key={index}
						onClick={() => {
							setCurrentSlide(index)
							setIsPaused(true)
							setTimeout(() => setIsPaused(false), 5000)
						}}
						className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
							index === currentSlide
								? 'bg-white scale-125 shadow-lg'
								: 'bg-white/50 hover:bg-white/75 hover:scale-110'
						}`}
						role='tab'
						aria-selected={index === currentSlide}
						aria-label={`Слайд ${index + 1} из ${slides.length}`}
					/>
				))}
			</div>

			{/* Подсказка для свайпов на мобильных */}
			<div className='absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 sm:hidden'>
				<div className='bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white'>
					← Свайп →
				</div>
			</div>

			{/* Индикатор паузы автопереключения */}
			{isPaused && (
				<div className='absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white'>
					⏸️ Пауза
				</div>
			)}
		</section>
	)
}

export default Slider
