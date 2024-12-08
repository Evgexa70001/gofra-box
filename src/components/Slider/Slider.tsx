import { useState, useEffect } from 'react'

const Slider = () => {
	const [currentSlide, setCurrentSlide] = useState(0)

	const slides = [
		{
			id: 1,
			text: 'Изготовим коробки по индивидуальным размерам под ваш заказ',
			image:
				'https://img-fotki.yandex.ru/get/15561/78948279.195/0_9dbfa_bfd192b0_XXL.jpg',
		},
		{
			id: 2,
			text: 'Брендируем коробки логотипом вашей компании',
			image:
				'https://avatars.mds.yandex.net/i?id=890482d75c50348b466f31f2e8ec64b1_l-5242655-images-thumbs&n=13',
		},
		{
			id: 3,
			text: 'Бесплатная доставка при крупном заказе',
			image:
				'https://avatars.mds.yandex.net/get-ydo/4219998/2a0000018de40352cc3f0ed93a1f171418e8/diploma',
		},
	]

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1))
		}, 20000)

		return () => clearInterval(interval)
	}, [])

	return (
		<section className='relative h-[400px] overflow-hidden'>
			<div
				className='absolute inset-0 transition-all duration-700 ease-in-out'
				style={{
					backgroundImage: `url(${slides[currentSlide].image})`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
					width: '100%',
					height: '100%',
					objectFit: 'cover',
				}}
			>
				<div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center px-12'>
					<p className='text-3xl font-medium text-center max-w-3xl text-white'>
						{slides[currentSlide].text}
					</p>
				</div>
			</div>
			<button
				className='absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl text-white hover:text-gray-200 z-10'
				onClick={() =>
					setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))
				}
			>
				&lt;
			</button>
			<button
				className='absolute right-4 top-1/2 transform -translate-y-1/2 text-2xl text-white hover:text-gray-200 z-10'
				onClick={() =>
					setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1))
				}
			>
				&gt;
			</button>
		</section>
	)
}

export default Slider
