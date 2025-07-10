import { Phone, MessageCircle } from 'lucide-react'

interface MobileCallButtonProps {
	isOpen: boolean
	position?: 'fixed' | 'absolute'
}

const MobileCallButton = ({
	isOpen,
	position = 'fixed',
}: MobileCallButtonProps) => {
	const contactOptions = [
		{
			number: '+7 (928) 929-06-89',
			label: 'Основной',
			type: 'phone',
			icon: Phone,
		},
		{
			number: '+7 (928) 006-21-26',
			label: 'Дополнительный',
			type: 'phone',
			icon: Phone,
		},
		{
			number: 'WhatsApp',
			label: 'Написать в WhatsApp',
			type: 'whatsapp',
			icon: MessageCircle,
		},
		{
			number: 'Telegram',
			label: 'Написать в Telegram',
			type: 'telegram',
			icon: MessageCircle,
		},
	]

	if (!isOpen) return null

	const positionClass =
		position === 'fixed'
			? 'fixed left-2 right-2 top-[60px] w-auto rounded-b-2xl'
			: 'absolute right-0 mt-2 w-80 rounded-2xl'

	const handleContactClick = (option: any) => {
		let url = ''

		if (option.type === 'phone') {
			// Для телефонов используем tel: протокол
			url = `tel:${option.number.replace(/[^\d+]/g, '')}`
		} else if (option.type === 'whatsapp') {
			// WhatsApp ссылка с номером телефона и сообщением
			const phoneNumber = '79289290689' // Основной номер без форматирования
			const message = encodeURIComponent(
				'Здравствуйте! Хочу заказать гофро коробки'
			)
			url = `https://wa.me/${phoneNumber}?text=${message}`
		} else if (option.type === 'telegram') {
			// Telegram ссылка с username и сообщением
			const username = 'evgexa700'
			const message = encodeURIComponent(
				'Здравствуйте! Хочу заказать гофро коробки'
			)
			url = `https://t.me/${username}?text=${message}`
		}

		// Открываем ссылку в новом окне/вкладке
		if (url) {
			window.open(url, '_blank', 'noopener,noreferrer')
		}
	}

	return (
		<div
			className={
				'bg-white/95 backdrop-blur-md shadow-2xl z-[60] border border-gray-100 max-h-[80vh] overflow-y-auto ' +
				positionClass
			}
			onClick={event => event.stopPropagation()}
		>
			<div className='py-3 sm:py-4'>
				<div className='px-4 sm:px-6 py-2 sm:py-3 border-b border-gray-100'>
					<h3 className='text-base sm:text-lg font-bold text-gray-800'>
						Связаться с нами
					</h3>
				</div>
				{contactOptions.map((option, index) => (
					<button
						key={index}
						onClick={event => {
							event.stopPropagation()
							handleContactClick(option)
						}}
						className='flex items-center w-full px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-600/5 transition-all duration-300 rounded-xl mx-1 sm:mx-2 my-1 text-left'
						type='button'
					>
						<div className='flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/10 to-blue-600/10 rounded-xl mr-3 sm:mr-4'>
							<option.icon size={16} className='text-primary sm:w-5 sm:h-5' />
						</div>
						<div className='flex-1'>
							<div className='font-semibold text-gray-900 text-sm sm:text-base'>
								{option.number}
							</div>
							<div className='text-xs sm:text-sm text-gray-500 mt-1'>
								{option.label}
							</div>
						</div>
					</button>
				))}
				<div className='px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 mt-2'>
					<div className='flex items-center gap-2'>
						<div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
						<p className='text-xs sm:text-sm text-gray-600 font-medium'>
							Время работы: Пн-Пт 9:00-18:00
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default MobileCallButton
