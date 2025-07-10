import { useState } from 'react'
import {
	ChevronDown,
	Package,
	Truck,
	Clock,
	Phone,
	Calculator,
	Shield,
	Users,
} from 'lucide-react'

const FAQ = () => {
	const [openItem, setOpenItem] = useState<number | null>(null)

	const faqData = [
		{
			id: 1,
			question: 'Какие размеры коробок вы производите?',
			answer:
				'Мы производим гофро коробки любых размеров от маленьких до больших. Стандартные размеры: 200x150x100 мм, 300x200x150 мм, 400x300x200 мм, 500x400x300 мм. Также изготавливаем коробки по индивидуальным размерам заказчика.',
			icon: Package,
		},
		{
			id: 2,
			question: 'Сколько времени занимает производство?',
			answer:
				'Стандартные коробки изготавливаем за 1-3 дня. Срочные заказы выполняем в течение 24 часов. При больших объемах сроки обсуждаются индивидуально. Всегда стараемся выполнить заказ в кратчайшие сроки.',
			icon: Clock,
		},
		{
			id: 3,
			question: 'Осуществляете ли вы доставку?',
			answer:
				'Да, мы доставляем коробки по Пятигорску и Ставропольскому краю. Доставка по городу бесплатная при заказе от 5000 рублей. В другие города доставляем транспортными компаниями.',
			icon: Truck,
		},
		{
			id: 4,
			question: 'Как рассчитать стоимость заказа?',
			answer:
				'Стоимость зависит от размера коробки, количества и типа гофрокартона. Для точного расчета свяжитесь с нами по телефону или оставьте заявку на сайте. Мы предоставим детальную смету.',
			icon: Calculator,
		},
		{
			id: 5,
			question: 'Какое качество у ваших коробок?',
			answer:
				'Мы используем только качественный гофрокартон от проверенных поставщиков. Все коробки соответствуют ГОСТам и выдерживают необходимые нагрузки. Гарантируем прочность и надежность упаковки.',
			icon: Shield,
		},
		{
			id: 6,
			question: 'Работаете ли вы с юридическими лицами?',
			answer:
				'Да, мы работаем как с физическими, так и с юридическими лицами. Предоставляем все необходимые документы для бухгалтерии. Возможна работа по договору и отсрочка платежа для постоянных клиентов.',
			icon: Users,
		},
		{
			id: 7,
			question: 'Можете ли вы напечатать логотип на коробках?',
			answer:
				'Да, мы выполняем печать логотипов и брендинг на коробках. Используем качественную флексографическую печать. Минимальный тираж для печати - 100 штук. Стоимость печати рассчитывается отдельно.',
			icon: Package,
		},
		{
			id: 8,
			question: 'Как с вами связаться?',
			answer:
				'Вы можете связаться с нами по телефону +7 (XXX) XXX-XX-XX, через форму на сайте или написать в WhatsApp. Наши менеджеры ответят на все вопросы и помогут с выбором подходящих коробок.',
			icon: Phone,
		},
	]

	const toggleItem = (id: number) => {
		setOpenItem(openItem === id ? null : id)
	}

	return (
		<section
			id='faq'
			className='py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50'
		>
			<div className='container mx-auto px-4'>
				{/* Заголовок секции */}
				<div className='text-center mb-16'>
					<div className='inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg'>
						Часто задаваемые вопросы
					</div>
					<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-['Playfair_Display']">
						Ответы на популярные вопросы
					</h2>
					<p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
						Здесь вы найдете ответы на самые частые вопросы о наших гофро
						коробках и услугах
					</p>
				</div>

				{/* FAQ список */}
				<div className='max-w-4xl mx-auto'>
					<div className='grid gap-6'>
						{faqData.map(item => (
							<div
								key={item.id}
								className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-xl hover:scale-[1.02] ${
									openItem === item.id
										? 'ring-2 ring-blue-500 ring-opacity-50'
										: ''
								}`}
							>
								<button
									onClick={() => toggleItem(item.id)}
									className='w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-all duration-300 group'
								>
									<div className='flex items-center gap-4'>
										<div className='flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300'>
											<item.icon size={24} />
										</div>
										<h3 className='text-lg md:text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300'>
											{item.question}
										</h3>
									</div>
									<div
										className={`flex-shrink-0 transition-transform duration-300 ${
											openItem === item.id ? 'rotate-180' : ''
										}`}
									>
										<ChevronDown
											size={24}
											className='text-gray-500 group-hover:text-blue-600'
										/>
									</div>
								</button>

								<div
									className={`overflow-hidden transition-all duration-500 ease-in-out ${
										openItem === item.id
											? 'max-h-96 opacity-100'
											: 'max-h-0 opacity-0'
									}`}
								>
									<div className='px-8 pb-6'>
										<div className='border-t border-gray-100 pt-6'>
											<p className='text-gray-700 leading-relaxed text-base md:text-lg'>
												{item.answer}
											</p>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

export default FAQ
