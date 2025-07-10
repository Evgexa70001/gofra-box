import {
	MapPin,
	Phone,
	Clock,
	Package,
	Truck,
	Shield,
	Users,
} from 'lucide-react'

const Footer = () => {
	const currentYear = new Date().getFullYear()

	return (
		<footer className='bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white'>
			{/* Основная информация */}
			<div className='container mx-auto px-4 py-16'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
					{/* О компании */}
					<div className='lg:col-span-2'>
						<div className='flex items-center gap-3 mb-6'>
							<div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center'>
								<Package size={24} />
							</div>
							<h3 className='text-2xl font-bold'>Гофра-Тара</h3>
						</div>
						<p className='text-gray-300 leading-relaxed mb-6 max-w-md'>
							Производство и продажа качественных гофро коробок в Пятигорске и
							Ставропольском крае. Мы помогаем бизнесу и частным лицам найти
							идеальную упаковку для любых задач.
						</p>
						<div className='flex flex-wrap gap-4'>
							<div className='flex items-center gap-2 text-gray-300'>
								<Shield size={20} className='text-green-400' />
								<span>Гарантия качества</span>
							</div>
							<div className='flex items-center gap-2 text-gray-300'>
								<Truck size={20} className='text-blue-400' />
								<span>Быстрая доставка</span>
							</div>
							<div className='flex items-center gap-2 text-gray-300'>
								<Users size={20} className='text-purple-400' />
								<span>Опыт 10+ лет</span>
							</div>
						</div>
					</div>

					{/* Контакты */}
					<div>
						<h4 className='text-xl font-bold mb-6 text-white'>Контакты</h4>
						<div className='space-y-4'>
							<div className='flex items-start gap-3'>
								<MapPin size={20} className='text-blue-400 mt-1' />
								<div>
									<p className='text-gray-300'>г. Пятигорск</p>
									<p className='text-gray-300'>Ставропольский край</p>
								</div>
							</div>
							<div className='flex items-center gap-3'>
								<Phone size={20} className='text-green-400' />
								<a
									href='tel:+79289290689'
									className='text-gray-300 hover:text-white transition-colors duration-300'
								>
									+7 (928) 929-06-89
								</a>
							</div>
							<div className='flex items-center gap-3'>
								<Phone size={20} className='text-blue-400' />
								<a
									href='tel:+79280062126'
									className='text-gray-300 hover:text-white transition-colors duration-300'
								>
									+7 (928) 006-21-26
								</a>
							</div>

							<div className='flex items-start gap-3'>
								<Clock size={20} className='text-orange-400 mt-1' />
								<div>
									<p className='text-gray-300'>Пн-Пт: 9:00-18:00</p>
									<p className='text-gray-300'>Сб: 10:00-16:00</p>
								</div>
							</div>
						</div>
					</div>

					{/* Услуги */}
					<div>
						<h4 className='text-xl font-bold mb-6 text-white'>Услуги</h4>
						<ul className='space-y-3'>
							<li>
								<a
									href='#catalog'
									className='text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2'
								>
									<Package size={16} />
									Стандартные коробки
								</a>
							</li>
							<li>
								<a
									href='#catalog'
									className='text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2'
								>
									<Truck size={16} />
									Для маркетплейсов
								</a>
							</li>
							<li>
								<a
									href='#catalog'
									className='text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2'
								>
									<Package size={16} />
									Для переезда
								</a>
							</li>
							<li>
								<a
									href='#catalog'
									className='text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2'
								>
									<Shield size={16} />
									Индивидуальные заказы
								</a>
							</li>
							<li>
								<a
									href='#contacts'
									className='text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2'
								>
									<Truck size={16} />
									Доставка
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Нижняя часть */}
			<div className='border-t border-gray-700'>
				<div className='container mx-auto px-4 py-6'>
					<div className='flex flex-col md:flex-row justify-between items-center gap-4'>
						<div className='text-gray-400 text-sm'>
							© {currentYear} Гофра-Тара. Все права защищены.
						</div>
						<div className='flex items-center gap-6 text-sm'>
							<a
								href='#'
								className='text-gray-400 hover:text-white transition-colors duration-300'
							>
								Политика конфиденциальности
							</a>
							<a
								href='#'
								className='text-gray-400 hover:text-white transition-colors duration-300'
							>
								Условия использования
							</a>
							<a
								href='#'
								className='text-gray-400 hover:text-white transition-colors duration-300'
							>
								Карта сайта
							</a>
						</div>
					</div>
				</div>
			</div>

			{/* Плавающая кнопка обратной связи */}
			<div className='fixed bottom-6 right-6 z-50'>
				<button className='bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110'>
					<Phone size={24} />
				</button>
			</div>
		</footer>
	)
}

export default Footer
