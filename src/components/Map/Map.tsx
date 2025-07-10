import { Phone, Clock } from 'lucide-react'

const Map = () => {
	return (
		<section
			id='contacts'
			className='py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50'
		>
			<div className='container mx-auto px-4'>
				{/* Заголовок секции */}
				<div className='text-center mb-16'>
					<div className='inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg'>
						Контакты
					</div>
					<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-['Playfair_Display']">
						Как нас найти
					</h2>
					<p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
						Мы находимся в Пятигорске. Приезжайте к нам или свяжитесь любым
						удобным способом
					</p>
				</div>

				<div className='grid lg:grid-cols-2 gap-12 items-center'>
					{/* Информация о компании */}
					<div className='space-y-8'>
						{/* Основной телефон */}
						<div className='bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02]'>
							<div className='flex items-start gap-4'>
								<div className='flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg'>
									<Phone size={24} />
								</div>
								<div>
									<h3 className='text-xl font-bold text-gray-900 mb-2'>
										Основной телефон
									</h3>
									<p className='text-gray-600 text-lg font-medium'>
										+7 (928) 929-06-89
									</p>
									<p className='text-gray-500 text-sm mt-1'>
										Звонки принимаем ежедневно
									</p>
									<button className='mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105'>
										Позвонить сейчас
									</button>
								</div>
							</div>
						</div>

						{/* Дополнительный телефон */}
						<div className='bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02]'>
							<div className='flex items-start gap-4'>
								<div className='flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg'>
									<Phone size={24} />
								</div>
								<div>
									<h3 className='text-xl font-bold text-gray-900 mb-2'>
										Дополнительный телефон
									</h3>
									<p className='text-gray-600 text-lg font-medium'>
										+7 (928) 006-21-26
									</p>
									<p className='text-gray-500 text-sm mt-1'>Резервная линия</p>
									<button className='mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105'>
										Позвонить сейчас
									</button>
								</div>
							</div>
						</div>

						{/* Время работы */}
						<div className='bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02]'>
							<div className='flex items-start gap-4'>
								<div className='flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg'>
									<Clock size={24} />
								</div>
								<div>
									<h3 className='text-xl font-bold text-gray-900 mb-2'>
										Время работы
									</h3>
									<div className='space-y-2 text-gray-600'>
										<div className='flex justify-between'>
											<span>Понедельник - Пятница:</span>
											<span className='font-medium'>9:00 - 18:00</span>
										</div>
										<div className='flex justify-between'>
											<span>Суббота:</span>
											<span className='font-medium'>10:00 - 16:00</span>
										</div>
										<div className='flex justify-between'>
											<span>Воскресенье:</span>
											<span className='font-medium'>Выходной</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Карта */}
					<div className='relative'>
						<div className='bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100'>
							{/* Заголовок карты */}
							<div className='bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white'>
								<h3 className='text-xl font-bold mb-2'>Мы на карте</h3>
								<p className='text-blue-100'>
									Работаем по всему Пятигорску и Ставропольскому краю
								</p>
							</div>

							{/* Официальная карта организации */}
							<div className='relative h-96'>
								<iframe
									src='https://yandex.ru/map-widget/v1/?z=12&ol=biz&oid=77674865478'
									width='100%'
									height='100%'
									frameBorder='0'
									allowFullScreen
									title='Карта Гофра-Тара в Пятигорске'
									className='rounded-b-2xl'
								></iframe>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Map
