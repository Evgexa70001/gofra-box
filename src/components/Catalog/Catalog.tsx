import { useState, useEffect } from 'react'
import { Package, ShoppingCart, Filter, Search, X } from 'lucide-react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../config/firebase'
import ProductSkeleton from './ProductSkeleton'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

interface Product {
	id: string
	название: string
	размер: string
	цена: number
	цвет: string[]
	типКартона: string
	марка: string
	категория: string
	количество: number
	наличие: string
	изображение?: string
}

const Catalog = () => {
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedCategory, setSelectedCategory] = useState<string>('all')
	const [sortBy, setSortBy] = useState<string>('name')
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
	const [searchQuery, setSearchQuery] = useState('')
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
	const [selectedCardboardType, setSelectedCardboardType] =
		useState<string>('all')
	const [selectedColor, setSelectedColor] = useState<string>('all')
	const [showFilters, setShowFilters] = useState(false)
	const navigate = useNavigate()
	const [quantities, setQuantities] = useState<{ [id: string]: number }>({})
	const [inputValues, setInputValues] = useState<{ [id: string]: string }>({})
	const { addToCart, items } = useCart()

	// Загрузка данных из Firebase
	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setLoading(true)
				const q = query(collection(db, 'products'), orderBy('название'))
				const querySnapshot = await getDocs(q)
				const productsData: Product[] = []

				querySnapshot.forEach(doc => {
					productsData.push({
						id: doc.id,
						...doc.data(),
					} as Product)
				})

				setProducts(productsData)
			} catch (error) {
				console.error('Ошибка при загрузке товаров:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchProducts()
	}, [])

	// Получаем уникальные значения для фильтров
	const categories = [
		{ id: 'all', name: 'Все товары', icon: Package },
		{ id: 'самосборные', name: 'Самосборные коробки', icon: Package },
		{ id: 'четырехклапанные', name: 'Четырехклапанные коробки', icon: Package },
	]

	const cardboardTypes = [
		{ id: 'all', name: 'Все типы' },
		{ id: 'микрогофра', name: 'Микрогофра' },
		{ id: '3 слойный', name: '3 слойный' },
		{ id: '5 слойный', name: '5 слойный' },
	]

	const colors = [
		{ id: 'all', name: 'Все цвета' },
		{ id: 'бурый', name: 'Бурый' },
		{ id: 'белый', name: 'Белый' },
	]

	// Фильтрация товаров
	const filteredProducts = products.filter(product => {
		const matchesCategory =
			selectedCategory === 'all' || product.категория === selectedCategory
		const matchesSearch =
			product.название.toLowerCase().includes(searchQuery.toLowerCase()) ||
			product.размер.toLowerCase().includes(searchQuery.toLowerCase()) ||
			product.марка.toLowerCase().includes(searchQuery.toLowerCase())
		const matchesPrice =
			product.цена >= priceRange[0] && product.цена <= priceRange[1]
		const matchesCardboardType =
			selectedCardboardType === 'all' ||
			product.типКартона === selectedCardboardType
		const matchesColor =
			selectedColor === 'all' || product.цвет.includes(selectedColor)

		return (
			matchesCategory &&
			matchesSearch &&
			matchesPrice &&
			matchesCardboardType &&
			matchesColor
		)
	})

	// Сортировка товаров
	const sortedProducts = [...filteredProducts].sort((a, b) => {
		switch (sortBy) {
			case 'price':
				return a.цена - b.цена
			case 'price-desc':
				return b.цена - a.цена
			case 'name':
			default:
				return a.название.localeCompare(b.название)
		}
	})

	const clearFilters = () => {
		setSelectedCategory('all')
		setSearchQuery('')
		setPriceRange([0, 1000])
		setSelectedCardboardType('all')
		setSelectedColor('all')
	}

	if (loading) {
		return (
			<section
				id='catalog'
				className='py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50'
			>
				<div className='container mx-auto px-4'>
					<div className='text-center mb-16'>
						<div className='inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg'>
							Наш каталог
						</div>
						<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-['Playfair_Display']">
							Гофро коробки для любых задач
						</h2>
						<p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
							Выберите подходящие коробки для вашего бизнеса или личных нужд
						</p>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{Array.from({ length: 6 }).map((_, index) => (
							<ProductSkeleton key={index} />
						))}
					</div>
				</div>
			</section>
		)
	}

	return (
		<section
			id='catalog'
			className='py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50'
		>
			<div className='container mx-auto px-4'>
				{/* Заголовок секции */}
				<div className='text-center mb-16'>
					<div className='inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg'>
						Наш каталог
					</div>
					<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-['Playfair_Display']">
						Гофро коробки для любых задач
					</h2>
					<p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
						Выберите подходящие коробки для вашего бизнеса или личных нужд
					</p>
				</div>

				{/* Поиск и фильтры */}
				<div className='mb-12'>
					<div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
						{/* Поиск */}
						<div className='mb-6'>
							<div className='relative'>
								<Search
									className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400'
									size={20}
								/>
								<input
									type='text'
									placeholder='Поиск по названию, размеру или материалу...'
									value={searchQuery}
									onChange={e => setSearchQuery(e.target.value)}
									className='w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300'
								/>
								{searchQuery && (
									<button
										onClick={() => setSearchQuery('')}
										className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
									>
										<X size={20} />
									</button>
								)}
							</div>
						</div>

						{/* Основные фильтры */}
						<div className='flex flex-col lg:flex-row gap-6 items-center justify-between'>
							{/* Категории */}
							<div className='flex flex-wrap gap-3'>
								{categories.map(category => (
									<button
										key={category.id}
										onClick={() => setSelectedCategory(category.id)}
										className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
											selectedCategory === category.id
												? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
										}`}
									>
										<category.icon size={20} />
										{category.name}
									</button>
								))}
							</div>

							{/* Сортировка и вид */}
							<div className='flex items-center gap-4'>
								<select
									value={sortBy}
									onChange={e => setSortBy(e.target.value)}
									className='px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300'
								>
									<option value='name'>По названию</option>
									<option value='price'>По цене (возрастание)</option>
									<option value='price-desc'>По цене (убывание)</option>
								</select>

								<div className='flex bg-gray-100 rounded-xl p-1'>
									<button
										onClick={() => setViewMode('grid')}
										className={`p-3 rounded-lg transition-all duration-300 ${
											viewMode === 'grid'
												? 'bg-white text-blue-600 shadow-lg'
												: 'text-gray-600 hover:text-gray-900'
										}`}
									>
										<svg
											className='w-5 h-5'
											fill='currentColor'
											viewBox='0 0 20 20'
										>
											<path d='M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' />
										</svg>
									</button>
									<button
										onClick={() => setViewMode('list')}
										className={`p-3 rounded-lg transition-all duration-300 ${
											viewMode === 'list'
												? 'bg-white text-blue-600 shadow-lg'
												: 'text-gray-600 hover:text-gray-900'
										}`}
									>
										<svg
											className='w-5 h-5'
											fill='currentColor'
											viewBox='0 0 20 20'
										>
											<path
												fillRule='evenodd'
												d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
												clipRule='evenodd'
											/>
										</svg>
									</button>
								</div>

								<button
									onClick={() => setShowFilters(!showFilters)}
									className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
										showFilters
											? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}
								>
									<Filter size={20} />
									Дополнительные фильтры
								</button>
							</div>
						</div>

						{/* Дополнительные фильтры */}
						{showFilters && (
							<div className='mt-6 pt-6 border-t border-gray-200'>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
									{/* Диапазон цен */}
									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>
											Диапазон цен (₽)
										</label>
										<div className='flex gap-2'>
											<input
												type='number'
												placeholder='От'
												value={priceRange[0]}
												onChange={e =>
													setPriceRange([Number(e.target.value), priceRange[1]])
												}
												className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											/>
											<input
												type='number'
												placeholder='До'
												value={priceRange[1]}
												onChange={e =>
													setPriceRange([priceRange[0], Number(e.target.value)])
												}
												className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											/>
										</div>
									</div>

									{/* Тип картона */}
									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>
											Тип картона
										</label>
										<select
											value={selectedCardboardType}
											onChange={e => setSelectedCardboardType(e.target.value)}
											className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										>
											{cardboardTypes.map(type => (
												<option key={type.id} value={type.id}>
													{type.name}
												</option>
											))}
										</select>
									</div>

									{/* Цвет */}
									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>
											Цвет
										</label>
										<select
											value={selectedColor}
											onChange={e => setSelectedColor(e.target.value)}
											className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										>
											{colors.map(color => (
												<option key={color.id} value={color.id}>
													{color.name}
												</option>
											))}
										</select>
									</div>

									{/* Кнопка сброса */}
									<div className='flex items-end'>
										<button
											onClick={clearFilters}
											className='w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300'
										>
											Сбросить фильтры
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Результаты поиска */}
				<div className='mb-8'>
					<div className='flex items-center justify-between'>
						<p className='text-gray-600'>
							Найдено товаров:{' '}
							<span className='font-semibold text-gray-900'>
								{sortedProducts.length}
							</span>
						</p>
						{sortedProducts.length === 0 && (
							<p className='text-gray-500'>
								По вашему запросу ничего не найдено
							</p>
						)}
					</div>
				</div>

				{/* Список товаров */}
				<div
					className={`grid gap-8 ${
						viewMode === 'grid'
							? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
							: 'grid-cols-1'
					}`}
				>
					{sortedProducts.map(product => {
						const quantity =
							Number(inputValues[product.id] ?? quantities[product.id] ?? 1) ||
							1
						const pricePerItem = product.цена
						const inCart = items.some(item => item.productId === product.id)
						return (
							<div
								key={product.id}
								className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-xl hover:scale-[1.02] group ${
									viewMode === 'list' ? 'flex' : ''
								} cursor-pointer`}
								onClick={e => {
									// Не переходить по клику на кнопки внутри карточки
									if ((e.target as HTMLElement).closest('button, input')) return
									navigate(`/product/${product.id}`)
								}}
								tabIndex={0}
								role='button'
								aria-label={`Подробнее о товаре ${product.название}`}
							>
								{/* Изображение */}
								<div
									className={`relative flex items-center justify-center bg-gray-50 ${
										viewMode === 'list' ? 'w-1/3' : ''
									}`}
									style={{
										minHeight: '180px',
										height: '180px',
										maxHeight: '180px',
									}}
								>
									{product.изображение ? (
										<img
											src={product.изображение}
											alt={product.название}
											className='w-full h-full object-contain transition-transform duration-500 group-hover:scale-105'
											style={{
												background: '#fff',
												borderRadius: '12px',
												maxHeight: '170px',
												maxWidth: '100%',
											}}
										/>
									) : (
										<div
											className='flex items-center justify-center w-full h-full text-gray-300'
											style={{ minHeight: '120px' }}
										>
											<Package size={64} />
										</div>
									)}
									{product.наличие !== 'в наличии' && (
										<div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
											<span className='bg-red-500 text-white px-4 py-2 rounded-lg font-semibold'>
												Под заказ
											</span>
										</div>
									)}
								</div>

								{/* Информация о товаре */}
								<div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
									<div className='flex items-start justify-between mb-4'>
										<h3 className='text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300'>
											{product.название}
										</h3>
										<div className='flex items-center gap-1'>
											<span className='text-sm text-gray-600'>
												{product.наличие === 'в наличии'
													? '✓ В наличии'
													: '⏳ Под заказ'}
											</span>
										</div>
									</div>

									<p className='text-gray-600 mb-4 leading-relaxed'>
										Размер: {product.размер} | Материал: {product.марка}
									</p>

									{/* Особенности */}
									<div className='mb-6'>
										<div className='flex flex-wrap gap-2'>
											<span className='px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium'>
												{product.типКартона}
											</span>
											<span className='px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium'>
												{product.категория}
											</span>
											{product.цвет.map((color, index) => (
												<span
													key={index}
													className='px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm font-medium'
												>
													{color}
												</span>
											))}
										</div>
									</div>

									{/* Цена и кнопки */}
									<div className='flex items-center justify-between mt-4 gap-2 flex-wrap'>
										<div>
											<span className='text-sm text-gray-500 mb-1 block'>
												цена от
											</span>
											<span className='text-3xl font-bold text-gray-900'>
												{pricePerItem.toFixed(2)} ₽
											</span>
											<span className='text-sm text-gray-500 ml-2'>
												за штуку
											</span>
										</div>
										<div className='flex flex-col items-end gap-2'>
											<div className='flex items-center gap-2'>
												<button
													type='button'
													className='w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition disabled:opacity-50'
													onClick={e => {
														e.stopPropagation()
														const newQty = Math.max(1, quantity - 1)
														setQuantities(q => ({ ...q, [product.id]: newQty }))
														setInputValues(v => ({
															...v,
															[product.id]: String(newQty),
														}))
													}}
													disabled={quantity <= 1}
													aria-label='Уменьшить количество'
												>
													–
												</button>
												<input
													type='number'
													min={1}
													step={1}
													value={inputValues[product.id] ?? quantity}
													onClick={e => e.stopPropagation()}
													onChange={e => {
														setInputValues(v => ({
															...v,
															[product.id]: e.target.value,
														}))
													}}
													onBlur={e => {
														let val = Number(e.target.value)
														if (isNaN(val) || val < 1) val = 1
														setQuantities(q => ({ ...q, [product.id]: val }))
														setInputValues(v => ({
															...v,
															[product.id]: String(val),
														}))
													}}
													className='w-16 text-center border border-gray-200 rounded-md py-1 px-2 font-medium text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
													aria-label='Количество'
													inputMode='numeric'
													pattern='[0-9]*'
												/>
												<button
													type='button'
													className='w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition'
													onClick={e => {
														e.stopPropagation()
														const newQty = quantity + 1
														setQuantities(q => ({ ...q, [product.id]: newQty }))
														setInputValues(v => ({
															...v,
															[product.id]: String(newQty),
														}))
													}}
													aria-label='Увеличить количество'
												>
													+
												</button>
											</div>
											<button
												className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
													inCart
														? 'bg-gray-300 text-gray-500 cursor-not-allowed'
														: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
												}`}
												onClick={e => {
													e.stopPropagation()
													if (!inCart) {
														addToCart({
															productId: product.id,
															название: product.название,
															количество: quantity,
															цена: pricePerItem,
															изображение: product.изображение,
															количествоВУпаковке: 1,
														})
													}
												}}
												disabled={inCart}
											>
												<ShoppingCart size={20} />
												{inCart ? 'В корзине' : 'В корзину'}
											</button>
										</div>
									</div>
								</div>
							</div>
						)
					})}
				</div>

				{/* Кнопка "Показать еще" */}
				{sortedProducts.length > 0 && (
					<div className='text-center mt-12'>
						<button className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105'>
							Показать еще товары
						</button>
					</div>
				)}
			</div>
		</section>
	)
}

export default Catalog
