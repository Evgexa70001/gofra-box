import { useEffect, useState, useRef } from 'react'
import { Package, Menu, X, Phone, ShoppingCart } from 'lucide-react'
import MobileCallButton from './CallButton'
import MobileCartDropdown from './CartButton'
import { useCart } from '../../context/CartContext'

interface HeaderProps {
	id?: string
	role?: string
	'aria-label'?: string
}

function Header({}: HeaderProps) {
	const [activeSection, setActiveSection] = useState('home')
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isMobileCartOpen, setIsMobileCartOpen] = useState(false)
	const [isMobileContactsOpen, setIsMobileContactsOpen] = useState(false)
	const [isTabletContactsOpen, setIsTabletContactsOpen] = useState(false)
	const [isTabletCartOpen, setIsTabletCartOpen] = useState(false)
	const [isDesktopContactsOpen, setIsDesktopContactsOpen] = useState(false)
	const [isDesktopCartOpen, setIsDesktopCartOpen] = useState(false)
	const { items } = useCart()

	const mobileCartRef = useRef<HTMLDivElement>(null)
	const mobileContactsRef = useRef<HTMLDivElement>(null)
	const tabletCartRef = useRef<HTMLDivElement>(null)
	const tabletContactsRef = useRef<HTMLDivElement>(null)
	const desktopCartRef = useRef<HTMLDivElement>(null)
	const desktopContactsRef = useRef<HTMLDivElement>(null)
	const uniqueItemsCount = items.length

	useEffect(() => {
		const sections = document.querySelectorAll('section[id]')

		const checkVisibleSections = (entries: IntersectionObserverEntry[]) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					setActiveSection(entry.target.id)
				}
			})
		}

		const handleScroll = () => {
			const scrollPosition = window.scrollY + window.innerHeight / 2

			sections.forEach(section => {
				const { top, bottom } = section.getBoundingClientRect()
				const sectionTop = top + window.scrollY
				const sectionBottom = bottom + window.scrollY

				if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
					setActiveSection(section.id)
				}
			})
		}

		const observerOptions = {
			threshold: 0.5,
			rootMargin: '-20% 0px -20% 0px',
		}

		const observer = new IntersectionObserver(
			checkVisibleSections,
			observerOptions
		)
		sections.forEach(section => observer.observe(section))

		window.addEventListener('scroll', handleScroll)

		return () => {
			observer.disconnect()
			window.removeEventListener('scroll', handleScroll)
		}
	}, [])

	// useEffect для клика вне дропдаунов
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				isMobileCartOpen &&
				mobileCartRef.current &&
				!mobileCartRef.current.contains(event.target as Node)
			) {
				setIsMobileCartOpen(false)
			}
			if (
				isMobileContactsOpen &&
				mobileContactsRef.current &&
				!mobileContactsRef.current.contains(event.target as Node)
			) {
				setIsMobileContactsOpen(false)
			}
			if (
				isTabletCartOpen &&
				tabletCartRef.current &&
				!tabletCartRef.current.contains(event.target as Node)
			) {
				setIsTabletCartOpen(false)
			}
			if (
				isTabletContactsOpen &&
				tabletContactsRef.current &&
				!tabletContactsRef.current.contains(event.target as Node)
			) {
				setIsTabletContactsOpen(false)
			}
			if (
				isDesktopCartOpen &&
				desktopCartRef.current &&
				!desktopCartRef.current.contains(event.target as Node)
			) {
				setIsDesktopCartOpen(false)
			}
			if (
				isDesktopContactsOpen &&
				desktopContactsRef.current &&
				!desktopContactsRef.current.contains(event.target as Node)
			) {
				setIsDesktopContactsOpen(false)
			}
		}
		if (
			isMobileCartOpen ||
			isMobileContactsOpen ||
			isTabletCartOpen ||
			isTabletContactsOpen ||
			isDesktopCartOpen ||
			isDesktopContactsOpen
		) {
			document.addEventListener('mousedown', handleClickOutside)
			return () => document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [
		isMobileCartOpen,
		isMobileContactsOpen,
		isTabletCartOpen,
		isTabletContactsOpen,
		isDesktopCartOpen,
		isDesktopContactsOpen,
	])

	const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault()
		const href = e.currentTarget.getAttribute('href')
		if (!href) return

		const targetId = href.replace('#', '')
		const element = document.getElementById(targetId)
		if (!element) return

		const headerHeight = 80
		const elementPosition = element.getBoundingClientRect().top
		const offsetPosition = elementPosition + window.pageYOffset - headerHeight

		window.scrollTo({
			top: offsetPosition,
			behavior: 'smooth',
		})

		setIsMenuOpen(false)
		setIsMobileCartOpen(false)
		setIsMobileContactsOpen(false)
		setIsTabletCartOpen(false)
		setIsTabletContactsOpen(false)
		setIsDesktopCartOpen(false)
		setIsDesktopContactsOpen(false)
	}

	return (
		<header className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'>
			<div className='max-w-[1280px] mx-auto px-4'>
				<div className='flex items-center justify-between py-4'>
					<a
						href='#home'
						onClick={handleNavClick}
						className='flex items-center gap-2 lg:gap-3 text-dark font-bold text-xl hover:text-primary transition-all duration-300 transform hover:scale-105'
					>
						<div className='w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg'>
							<Package size={20} className='lg:w-6 lg:h-6 text-white' />
						</div>
						<span className="font-['Playfair_Display'] text-xl lg:text-2xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
							Гофра-Тара
						</span>
					</a>

					{/* Десктопная навигация - показывается только на больших экранах */}
					<nav className='hidden xl:flex space-x-6 2xl:space-x-8'>
						<a
							href='#home'
							onClick={handleNavClick}
							className={`relative transition-all duration-300 font-medium text-sm 2xl:text-base ${
								activeSection === 'home'
									? 'text-primary'
									: 'text-dark hover:text-primary'
							}`}
						>
							Главная
							{activeSection === 'home' && (
								<div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full'></div>
							)}
						</a>
						<a
							href='#advantages'
							onClick={handleNavClick}
							className={`relative transition-all duration-300 font-medium text-sm 2xl:text-base ${
								activeSection === 'advantages'
									? 'text-primary'
									: 'text-dark hover:text-primary'
							}`}
						>
							Преимущества
							{activeSection === 'advantages' && (
								<div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full'></div>
							)}
						</a>
						<a
							href='#offers'
							onClick={handleNavClick}
							className={`relative transition-all duration-300 font-medium text-sm 2xl:text-base ${
								activeSection === 'offers'
									? 'text-primary'
									: 'text-dark hover:text-primary'
							}`}
						>
							Акции
							{activeSection === 'offers' && (
								<div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full'></div>
							)}
						</a>
						<a
							href='#faq'
							onClick={handleNavClick}
							className={`relative transition-all duration-300 font-medium text-sm 2xl:text-base ${
								activeSection === 'faq'
									? 'text-primary'
									: 'text-dark hover:text-primary'
							}`}
						>
							FAQ
							{activeSection === 'faq' && (
								<div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full'></div>
							)}
						</a>
						<a
							href='#catalog'
							onClick={handleNavClick}
							className={`relative transition-all duration-300 font-medium text-sm 2xl:text-base ${
								activeSection === 'catalog'
									? 'text-primary'
									: 'text-dark hover:text-primary'
							}`}
						>
							Каталог
							{activeSection === 'catalog' && (
								<div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full'></div>
							)}
						</a>
						<a
							href='#reviews'
							onClick={handleNavClick}
							className={`relative transition-all duration-300 font-medium text-sm 2xl:text-base ${
								activeSection === 'reviews'
									? 'text-primary'
									: 'text-dark hover:text-primary'
							}`}
						>
							Отзывы
							{activeSection === 'reviews' && (
								<div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full'></div>
							)}
						</a>
						<a
							href='#address'
							onClick={handleNavClick}
							className={`relative transition-all duration-300 font-medium text-sm 2xl:text-base ${
								activeSection === 'address'
									? 'text-primary'
									: 'text-dark hover:text-primary'
							}`}
						>
							Контакты
							{activeSection === 'address' && (
								<div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full'></div>
							)}
						</a>
					</nav>

					{/* Планшетная навигация - текстовые ссылки */}
					<nav className='hidden lg:flex xl:hidden space-x-3'>
						<a
							href='#home'
							onClick={handleNavClick}
							className={`relative transition-all duration-300 font-medium text-sm ${
								activeSection === 'home'
									? 'text-primary'
									: 'text-dark hover:text-primary'
							}`}
						>
							Главная
							{activeSection === 'home' && (
								<div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full'></div>
							)}
						</a>
						<a
							href='#advantages'
							onClick={handleNavClick}
							className={`relative transition-all duration-300 font-medium text-sm ${
								activeSection === 'advantages'
									? 'text-primary'
									: 'text-dark hover:text-primary'
							}`}
						>
							Преимущества
							{activeSection === 'advantages' && (
								<div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full'></div>
							)}
						</a>
						<a
							href='#offers'
							onClick={handleNavClick}
							className={`relative transition-all duration-300 font-medium text-sm ${
								activeSection === 'offers'
									? 'text-primary'
									: 'text-dark hover:text-primary'
							}`}
						>
							Акции
							{activeSection === 'offers' && (
								<div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full'></div>
							)}
						</a>
						<a
							href='#faq'
							onClick={handleNavClick}
							className={`relative transition-all duration-300 font-medium text-sm ${
								activeSection === 'faq'
									? 'text-primary'
									: 'text-dark hover:text-primary'
							}`}
						>
							FAQ
							{activeSection === 'faq' && (
								<div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full'></div>
							)}
						</a>
						<a
							href='#catalog'
							onClick={handleNavClick}
							className={`relative transition-all duration-300 font-medium text-sm ${
								activeSection === 'catalog'
									? 'text-primary'
									: 'text-dark hover:text-primary'
							}`}
						>
							Каталог
							{activeSection === 'catalog' && (
								<div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full'></div>
							)}
						</a>
						<a
							href='#reviews'
							onClick={handleNavClick}
							className={`relative transition-all duration-300 font-medium text-sm ${
								activeSection === 'reviews'
									? 'text-primary'
									: 'text-dark hover:text-primary'
							}`}
						>
							Отзывы
							{activeSection === 'reviews' && (
								<div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full'></div>
							)}
						</a>
						<a
							href='#address'
							onClick={handleNavClick}
							className={`relative transition-all duration-300 font-medium text-sm ${
								activeSection === 'address'
									? 'text-primary'
									: 'text-dark hover:text-primary'
							}`}
						>
							Контакты
							{activeSection === 'address' && (
								<div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full'></div>
							)}
						</a>
					</nav>

					{/* Мобильные иконки */}
					<div className='flex items-center gap-2 lg:hidden'>
						{/* Контакты (иконка) */}
						<div className='relative' ref={mobileContactsRef}>
							<button
								onClick={() => {
									setIsMobileContactsOpen(v => !v)
									setIsMobileCartOpen(false)
								}}
								className='p-2 rounded-lg hover:bg-primary/10 transition-colors'
								aria-label='Контакты'
							>
								<Phone size={22} className='text-dark' />
							</button>
							{isMobileContactsOpen && (
								<MobileCallButton isOpen={isMobileContactsOpen} />
							)}
						</div>
						{/* Корзина (иконка) */}
						<div className='relative' ref={mobileCartRef}>
							<button
								onClick={() => {
									setIsMobileCartOpen(v => !v)
									setIsMobileContactsOpen(false)
								}}
								className='p-2 rounded-lg hover:bg-primary/10 transition-colors relative'
								aria-label='Корзина'
							>
								<ShoppingCart size={22} className='text-dark' />
								{uniqueItemsCount > 0 && (
									<span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold'>
										{uniqueItemsCount}
									</span>
								)}
							</button>
							{isMobileCartOpen && (
								<MobileCartDropdown isOpen={isMobileCartOpen} />
							)}
						</div>
					</div>

					{/* Бургер-меню для мобильных и планшетов */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className='lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors'
					>
						{isMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>

					{/* Десктопные кнопки - иконки с мобильным функционалом */}
					<div className='hidden xl:flex items-center space-x-4 2xl:space-x-6'>
						{/* Контакты (иконка) */}
						<div className='relative' ref={desktopContactsRef}>
							<button
								onClick={() => {
									setIsDesktopContactsOpen(v => !v)
									setIsDesktopCartOpen(false)
								}}
								className='p-2 rounded-lg hover:bg-primary/10 transition-colors'
								aria-label='Контакты'
								title='Контакты'
							>
								<Phone size={20} className='text-dark' />
							</button>
							{isDesktopContactsOpen && (
								<MobileCallButton
									isOpen={isDesktopContactsOpen}
									position='absolute'
								/>
							)}
						</div>
						{/* Корзина (иконка) */}
						<div className='relative' ref={desktopCartRef}>
							<button
								onClick={() => {
									setIsDesktopCartOpen(v => !v)
									setIsDesktopContactsOpen(false)
								}}
								className='p-2 rounded-lg hover:bg-primary/10 transition-colors relative'
								aria-label='Корзина'
								title='Корзина'
							>
								<ShoppingCart size={20} className='text-dark' />
								{uniqueItemsCount > 0 && (
									<span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold'>
										{uniqueItemsCount}
									</span>
								)}
							</button>
							{isDesktopCartOpen && (
								<MobileCartDropdown
									isOpen={isDesktopCartOpen}
									position='absolute'
								/>
							)}
						</div>
					</div>

					{/* Планшетные кнопки - иконки */}
					<div className='hidden lg:flex xl:hidden items-center space-x-3'>
						{/* Контакты (иконка) */}
						<div className='relative' ref={tabletContactsRef}>
							<button
								onClick={() => {
									setIsTabletContactsOpen(v => !v)
									setIsTabletCartOpen(false)
								}}
								className='p-2 rounded-lg hover:bg-primary/10 transition-colors'
								aria-label='Контакты'
								title='Контакты'
							>
								<Phone size={20} className='text-dark' />
							</button>
							{isTabletContactsOpen && (
								<MobileCallButton
									isOpen={isTabletContactsOpen}
									position='absolute'
								/>
							)}
						</div>
						{/* Корзина (иконка) */}
						<div className='relative' ref={tabletCartRef}>
							<button
								onClick={() => {
									setIsTabletCartOpen(v => !v)
									setIsTabletContactsOpen(false)
								}}
								className='p-2 rounded-lg hover:bg-primary/10 transition-colors relative'
								aria-label='Корзина'
								title='Корзина'
							>
								<ShoppingCart size={20} className='text-dark' />
								{uniqueItemsCount > 0 && (
									<span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold'>
										{uniqueItemsCount}
									</span>
								)}
							</button>
							{isTabletCartOpen && (
								<MobileCartDropdown isOpen={isTabletCartOpen} />
							)}
						</div>
					</div>
				</div>

				{isMenuOpen && (
					<div className='lg:hidden py-6 border-t border-gray-100 bg-white/95 backdrop-blur-md rounded-b-2xl shadow-lg'>
						<nav className='flex flex-col space-y-4'>
							<a
								href='#home'
								onClick={handleNavClick}
								className={`transition-all duration-300 font-medium py-2 px-4 rounded-lg ${
									activeSection === 'home'
										? 'text-primary bg-primary/10'
										: 'text-dark hover:text-primary hover:bg-gray-50'
								}`}
							>
								Главная
							</a>
							<a
								href='#advantages'
								onClick={handleNavClick}
								className={`transition-all duration-300 font-medium py-2 px-4 rounded-lg ${
									activeSection === 'advantages'
										? 'text-primary bg-primary/10'
										: 'text-dark hover:text-primary hover:bg-gray-50'
								}`}
							>
								Преимущества
							</a>
							<a
								href='#offers'
								onClick={handleNavClick}
								className={`transition-all duration-300 font-medium py-2 px-4 rounded-lg ${
									activeSection === 'offers'
										? 'text-primary bg-primary/10'
										: 'text-dark hover:text-primary hover:bg-gray-50'
								}`}
							>
								Акции
							</a>
							<a
								href='#faq'
								onClick={handleNavClick}
								className={`transition-all duration-300 font-medium py-2 px-4 rounded-lg ${
									activeSection === 'faq'
										? 'text-primary bg-primary/10'
										: 'text-dark hover:text-primary hover:bg-gray-50'
								}`}
							>
								FAQ
							</a>
							<a
								href='#catalog'
								onClick={handleNavClick}
								className={`transition-all duration-300 font-medium py-2 px-4 rounded-lg ${
									activeSection === 'catalog'
										? 'text-primary bg-primary/10'
										: 'text-dark hover:text-primary hover:bg-gray-50'
								}`}
							>
								Каталог
							</a>
							<a
								href='#reviews'
								onClick={handleNavClick}
								className={`transition-all duration-300 font-medium py-2 px-4 rounded-lg ${
									activeSection === 'reviews'
										? 'text-primary bg-primary/10'
										: 'text-dark hover:text-primary hover:bg-gray-50'
								}`}
							>
								Отзывы
							</a>
							<a
								href='#address'
								onClick={handleNavClick}
								className={`transition-all duration-300 font-medium py-2 px-4 rounded-lg ${
									activeSection === 'address'
										? 'text-primary bg-primary/10'
										: 'text-dark hover:text-primary hover:bg-gray-50'
								}`}
							>
								Контакты
							</a>
						</nav>
					</div>
				)}
			</div>
		</header>
	)
}

export default Header
