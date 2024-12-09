import { Package } from 'lucide-react'
import SocialLinks from '../Header/SocialLinks'
import { Helmet } from 'react-helmet'

interface FooterProps {
	id?: string
}

function Footer({ id }: FooterProps) {
	return (
		<footer
			id={id}
			className='bg-gray-800 text-white scroll-mt-24 target:bg-gray-700 transition-colors duration-300 pt-20'
		>
			<Helmet>
				<script type='application/ld+json'>
					{JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'Organization',
						name: 'Гофра-Тара',
						url: 'https://ваш-домен.com',
						logo: 'url-to-your-logo',
						address: {
							'@type': 'PostalAddress',
							streetAddress: 'ул. Ленина, д. 46',
							addressLocality: 'Пятигорск',
							postalCode: '357565',
							addressCountry: 'RU',
						},
						contactPoint: {
							'@type': 'ContactPoint',
							telephone: '+79289290689',
							contactType: 'customer service',
						},
						openingHoursSpecification: {
							'@type': 'OpeningHoursSpecification',
							dayOfWeek: [
								'Monday',
								'Tuesday',
								'Wednesday',
								'Thursday',
								'Friday',
							],
							opens: '08:00',
							closes: '17:00',
						},
					})}
				</script>
			</Helmet>
			<div className='max-w-[1280px] mx-auto px-4 py-12'>
				<div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
					{/* Логотип и информация о компании */}
					<div className='col-span-1'>
						<div className='flex items-center gap-2 mb-4'>
							<Package size={24} className='text-white' />
							<span className="font-['Playfair_Display'] text-2xl">
								Гофра-Тара
							</span>
						</div>
						<p className='text-gray-300 text-sm'>
							ООО "Гофра-Тара" - производитель гофрированной упаковки и тары в
							России. Мы работаем с 2010 года и специализируемся на производстве
							упаковочной продукции.
						</p>
					</div>

					{/* Контакты */}
					<div className='col-span-1'>
						<h3 className='text-lg font-semibold mb-4'>Контакты</h3>
						<ul className='space-y-2 text-gray-300'>
							<li>
								<a
									href='tel:+79289290689'
									className='hover:text-primary transition-colors'
								>
									+7 (928) 929-06-89
								</a>
							</li>

							<li>
								<a
									href='tel:+79283590689'
									className='hover:text-primary transition-colors'
								>
									+7 (928) 359-06-89
								</a>
							</li>

							<li>
								<a
									href='tel:+79280062126'
									className='hover:text-primary transition-colors'
								>
									+7 (928) 006-21-26
								</a>
							</li>
							<li>График работы:</li>
							<li className='text-sm'>Пн-Пт: 8:00 - 17:00</li>
							<li className='text-sm'>Сб-Вс: выходной</li>
						</ul>
					</div>

					{/* Адрес */}
					<div className='col-span-1'>
						<h3 className='text-lg font-semibold mb-4'>Адрес</h3>
						<address className='text-gray-300 not-italic'>
							<p>357565, Россия</p>
							<p>г. Пятигорск, ст. Константиновская</p>
							<p>ул. Ленина, д. 46</p>
							<p className='mt-2 text-sm'>
								Производство и офис находятся по одному адресу
							</p>
						</address>
					</div>

					{/* Социальные сети */}
					<div className='col-span-1'>
						<h3 className='text-lg font-semibold mb-4'>Мы в соцсетях</h3>
						<SocialLinks className='text-white' />
						<p className='mt-4 text-sm text-gray-300'>
							Наши социальные сети, для связи с нами
						</p>
					</div>
				</div>

				{/* Нижняя часть футера */}
				<div className='mt-8 pt-8 border-t border-gray-700'>
					<div className='flex flex-col md:flex-row justify-between items-center'>
						<p className='text-sm text-gray-400'>
							© {new Date().getFullYear()} ООО "Гофра-Тара". Все права защищены.
						</p>
						<p className='text-sm text-gray-400 mt-2 md:mt-0'>
							ИНН: 2632802588 | ОГРН: 1112651031833
						</p>
					</div>
				</div>
			</div>
		</footer>
	)
}

export default Footer
