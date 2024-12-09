import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { Search, ChevronDown } from 'lucide-react'
import { db } from '../../config/firebase'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import Cart from '../Cart/Cart'
import LazyImage from '../UI/LazyImage'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

interface ProductData {
	id?: string
	название: string
	размер: {
		длина: number
		ширина: number
		высота: number
	}
	цена: number
	цвет: string[]
	типКартона: 'микрогофра' | '3 слойный' | '5 слойный'
	марка: string
	категория: 'самосборные' | 'четырехклапанные'
	наличие: 'в наличии' | 'под заказ'
	изображение?: string
	количество?: number
}

interface FilterState {
	размер: {
		длина: { от: string; до: string }
		ширина: { от: string; до: string }
		высота: { от: string; до: string }
	}
	ценаОт: string
	ценаДо: string
	типКартона: string[]
	марка: string[]
	категория: string[]
	цвет: string[]
}

const getPriceForQuantity = (basePrice: number, quantity: number): number => {
	if (quantity >= 20000) return basePrice - 0.7
	if (quantity >= 10000) return basePrice - 0.6
	if (quantity >= 5000) return basePrice - 0.5
	if (quantity >= 1000) return basePrice - 0.4
	if (quantity >= 500) return basePrice - 0.3
	if (quantity >= 100) return basePrice - 0.2
	return basePrice
}

const ITEMS_PER_PAGE = 9

const debounce = (func: Function, wait: number) => {
	let timeout: NodeJS.Timeout
	return (...args: any[]) => {
		clearTimeout(timeout)
		timeout = setTimeout(() => func(...args), wait)
	}
}

const Catalog = () => {
	const [products, setProducts] = useState<ProductData[]>([])
	const [loading, setLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')
	const [isFilterOpen, setIsFilterOpen] = useState(false)
	const [filters, setFilters] = useState<FilterState>({
		размер: {
			длина: { от: '', до: '' },
			ширина: { от: '', до: '' },
			высота: { от: '', до: '' },
		},
		ценаОт: '',
		ценаДо: '',
		типКартона: [],
		марка: [],
		категория: [],
		цвет: [],
	})
	const { items, addToCart, updateQuantity, removeItem } = useCart()
	const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
	const [currentPage, setCurrentPage] = useState(1)

	const navigate = useNavigate()

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const q = query(collection(db, 'products'), orderBy('название'))
				const querySnapshot = await getDocs(q)
				const productsData = querySnapshot.docs.map(doc => {
					const data = doc.data()
					// console.log('Raw product data:', data)
					const [длина, ширина, высота] = (data.размер as string)
						.split('x')
						.map(Number)
					return {
						id: doc.id,
						...(data as Omit<ProductData, 'id' | 'размер'>),
						размер: {
							длина,
							ширина,
							высота,
						},
						количество: data.количество || undefined,
					}
				}) as ProductData[]
				// console.log('Processed products:', productsData)
				setProducts(productsData)
			} catch (error) {
				console.error('Ошибка при загрузке продуктов:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchProducts()
	}, [])

	const uniqueValues = {
		типКартона: Array.from(new Set(products.map(p => p.типКартона))),
		марка: Array.from(new Set(products.map(p => p.марка))),
		категория: Array.from(new Set(products.map(p => p.категория))),
		цвет: Array.from(new Set(products.flatMap(p => p.цвет))),
	}

	const filteredProducts = products.filter(product => {
		const matchesSearch =
			product.название.toLowerCase().includes(searchQuery.toLowerCase()) ||
			product.марка.toLowerCase().includes(searchQuery.toLowerCase()) ||
			product.категория.toLowerCase().includes(searchQuery.toLowerCase())

		const matchesSize =
			(!filters.размер.длина.от ||
				product.размер.длина >= parseFloat(filters.размер.длина.от)) &&
			(!filters.размер.длина.до ||
				product.размер.длина <= parseFloat(filters.размер.длина.до)) &&
			(!filters.размер.ширина.от ||
				product.размер.ширина >= parseFloat(filters.размер.ширина.от)) &&
			(!filters.размер.ширина.до ||
				product.размер.ширина <= parseFloat(filters.размер.ширина.до)) &&
			(!filters.размер.высота.от ||
				product.размер.высота >= parseFloat(filters.размер.высота.от)) &&
			(!filters.размер.высота.до ||
				product.размер.высота <= parseFloat(filters.размер.высота.до))

		const matchesPrice =
			(!filters.ценаОт || product.цена >= parseFloat(filters.ценаОт)) &&
			(!filters.ценаДо || product.цена <= parseFloat(filters.ценаДо))

		const matchesType =
			filters.типКартона.length === 0 ||
			filters.типКартона.includes(product.типКартона)

		const matchesBrand =
			filters.марка.length === 0 || filters.марка.includes(product.марка)

		const matchesCategory =
			filters.категория.length === 0 ||
			filters.категория.includes(product.категория)

		const matchesColor =
			filters.цвет.length === 0 ||
			product.цвет.some(color => filters.цвет.includes(color))

		return (
			matchesSearch &&
			matchesSize &&
			matchesPrice &&
			matchesType &&
			matchesBrand &&
			matchesCategory &&
			matchesColor
		)
	})

	const handleFilterChange = useCallback(
		debounce((path: string[], value: string | string[]) => {
			setCurrentPage(1)
			setFilters(prev => {
				const newFilters = { ...prev }
				let current: any = newFilters

				for (let i = 0; i < path.length - 1; i++) {
					current = current[path[i]]
				}

				current[path[path.length - 1]] = value
				return newFilters
			})
		}, 500),
		[]
	)

	const [localSizeValues, setLocalSizeValues] = useState<{
		[key: string]: { от: string; до: string }
	}>({
		длина: { от: '', до: '' },
		ширина: { от: '', до: '' },
		высота: { от: '', до: '' },
	})

	const SizeFilter = ({
		dimension,
		label,
	}: {
		dimension: keyof FilterState['размер']
		label: string
	}) => {
		const [mounted, setMounted] = useState(false)

		// Проверяем, есть ли продукты перед вычислением значений
		const dimensionValues = products.map(p => p.размер[dimension])
		const minDimensionValue =
			dimensionValues.length > 0 ? Math.min(...dimensionValues) : 0
		const maxDimensionValue =
			dimensionValues.length > 0 ? Math.max(...dimensionValues) : 100

		// Инициализируем range с учетом текущих значений фильтров
		const [range, setRange] = useState<[number, number]>(() => {
			const fromValue = filters.размер[dimension].от
			const toValue = filters.размер[dimension].до
			return [
				fromValue ? parseInt(fromValue) : minDimensionValue,
				toValue ? parseInt(toValue) : maxDimensionValue,
			]
		})

		useEffect(() => {
			setMounted(true)
			return () => setMounted(false)
		}, [])

		// Обработчик изменения диапазона
		const handleRangeChange = useCallback(
			(newRange: number | number[]) => {
				if (Array.isArray(newRange)) {
					const [min, max] = newRange
					setRange([min, max])

					// Обновляем локальные значения
					setLocalSizeValues(prev => ({
						...prev,
						[dimension]: {
							от: min === minDimensionValue ? '' : min.toString(),
							до: max === maxDimensionValue ? '' : max.toString(),
						},
					}))

					// Обновляем фильтры
					handleFilterChange(
						['размер', dimension, 'от'],
						min === minDimensionValue ? '' : min.toString()
					)
					handleFilterChange(
						['размер', dimension, 'до'],
						max === maxDimensionValue ? '' : max.toString()
					)
				}
			},
			[dimension, minDimensionValue, maxDimensionValue]
		)

		// Обработчик изменения текстовых полей
		const handleInputChange = useCallback(
			(type: 'от' | 'до', value: string) => {
				if (value === '' || /^\d*$/.test(value)) {
					const numValue =
						value === ''
							? type === 'от'
								? minDimensionValue
								: maxDimensionValue
							: parseInt(value)

					let newRange: [number, number]
					if (type === 'от') {
						newRange = [Math.min(numValue, range[1]), range[1]]
					} else {
						newRange = [range[0], Math.max(numValue, range[0])]
					}

					setRange(newRange)
					setLocalSizeValues(prev => ({
						...prev,
						[dimension]: {
							...prev[dimension],
							[type]: value,
						},
					}))
					handleFilterChange(['размер', dimension, type], value)
				}
			},
			[dimension, range, minDimensionValue, maxDimensionValue]
		)

		return (
			<div className='space-y-2'>
				<label className='block text-sm font-medium text-gray-700'>
					{label} (см)
				</label>
				<div className='flex space-x-3 mb-6'>
					<div className='flex-1'>
						<input
							type='text'
							inputMode='numeric'
							pattern='[0-9]*'
							placeholder={minDimensionValue.toString()}
							value={localSizeValues[dimension].от}
							onChange={e => handleInputChange('от', e.target.value)}
							className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
						/>
					</div>
					<div className='flex-1'>
						<input
							type='text'
							inputMode='numeric'
							pattern='[0-9]*'
							placeholder={maxDimensionValue.toString()}
							value={localSizeValues[dimension].до}
							onChange={e => handleInputChange('до', e.target.value)}
							className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
						/>
					</div>
				</div>
				{mounted &&
					products.length > 0 && ( // Добавляем проверку mounted
						<div className='px-2'>
							<Slider
								range
								min={minDimensionValue}
								max={maxDimensionValue}
								value={range}
								onChange={handleRangeChange}
								className='my-4'
								step={5}
								trackStyle={[{ backgroundColor: '#3b82f6' }]}
								handleStyle={[
									{
										backgroundColor: '#3b82f6',
										borderColor: '#fff',
										boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
										cursor: 'grab',
										width: 20,
										height: 20,
										marginTop: -8,
										zIndex: 2,
									},
									{
										backgroundColor: '#3b82f6',
										borderColor: '#fff',
										boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
										cursor: 'grab',
										width: 20,
										height: 20,
										marginTop: -8,
										zIndex: 1,
									},
								]}
								railStyle={{ backgroundColor: '#e5e7eb' }}
								pushable={5}
								allowCross={false}
							/>
						</div>
					)}
			</div>
		)
	}

	const handleQuantityChange = (
		productId: string | undefined,
		value: string
	) => {
		if (productId) {
			const numValue = value === '' ? 0 : parseInt(value)
			setQuantities(prev => ({
				...prev,
				[productId]: numValue,
			}))
		}
	}

	// Вычисляем общее количество страниц
	const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)

	// Получаем товары для текущей страницы
	const currentProducts = filteredProducts.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	)

	// Функция для изменения страницы
	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	if (loading) {
		return (
			<section className='px-8 py-12'>
				<div className='text-center'>Загрузка...</div>
			</section>
		)
	}

	return (
		<section className='px-8 py-12'>
			<h1 className='text-3xl font-bold mb-8'>
				Катало катонных коробок и упаковки
			</h1>

			<div className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>Фильтры и поиск</h2>
				<div className='relative'>
					<div className='relative'>
						<input
							type='text'
							value={searchQuery}
							onChange={e => {
								setSearchQuery(e.target.value)
								setCurrentPage(1)
							}}
							placeholder='Поиск товаров...'
							aria-label='Поиск по каталогу'
							className='w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
						/>
						<Search className='w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2' />
					</div>

					<div className='mt-4'>
						<button
							onClick={() => setIsFilterOpen(!isFilterOpen)}
							className='flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50'
						>
							<span>Фильтры</span>
							<ChevronDown
								className={`w-4 h-4 transition-transform ${
									isFilterOpen ? 'rotate-180' : ''
								}`}
							/>
						</button>

						{isFilterOpen && (
							<div className='mt-4 p-6 bg-white border border-gray-200 rounded-lg shadow-lg'>
								<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
									<div className='space-y-4'>
										<div className='bg-gray-50 p-4 rounded-lg space-y-4'>
											<SizeFilter dimension='длина' label='Длина' />
											<SizeFilter dimension='ширина' label='Ширина' />
											<SizeFilter dimension='высота' label='Высота' />
										</div>

										<div className='bg-gray-50 p-4 rounded-lg'>
											<div className='space-y-3'>
												<label className='block text-sm font-medium text-gray-700'>
													Цена (₽)
												</label>
												<div className='flex space-x-3'>
													<div className='flex-1'>
														<input
															type='number'
															placeholder='От'
															value={filters.ценаОт}
															onChange={e =>
																handleFilterChange(['ценаОт'], e.target.value)
															}
															className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
														/>
													</div>
													<div className='flex-1'>
														<input
															type='number'
															placeholder='До'
															value={filters.ценаДо}
															onChange={e =>
																handleFilterChange(['ценаДо'], e.target.value)
															}
															className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
														/>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div className='space-y-4'>
										<div className='bg-gray-50 p-4 rounded-lg'>
											<div className='space-y-3'>
												<label className='block text-sm font-medium text-gray-700'>
													Тип картона
												</label>
												<div className='space-y-2 max-h-32 overflow-y-auto'>
													<div role='group' aria-label='Фильтр по типу картона'>
														{uniqueValues.типКартона.map(type => (
															<label
																key={type}
																className='flex items-center space-x-2'
															>
																<input
																	type='checkbox'
																	checked={filters.типКартона.includes(type)}
																	onChange={e => {
																		const newTypes = e.target.checked
																			? [...filters.типКартона, type]
																			: filters.типКартона.filter(
																					t => t !== type
																			  )
																		handleFilterChange(['типКартона'], newTypes)
																	}}
																	className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
																	aria-label={`Фильтр по типу картона: ${type}`}
																/>
																<span className='text-sm text-gray-700'>
																	{type}
																</span>
															</label>
														))}
													</div>
												</div>
											</div>
										</div>

										<div className='bg-gray-50 p-4 rounded-lg'>
											<div className='space-y-3'>
												<label className='block text-sm font-medium text-gray-700'>
													Марка
												</label>
												<div className='space-y-2 max-h-32 overflow-y-auto'>
													{uniqueValues.марка.map(brand => (
														<label
															key={brand}
															className='flex items-center space-x-2'
														>
															<input
																type='checkbox'
																checked={filters.марка.includes(brand)}
																onChange={e => {
																	const newBrands = e.target.checked
																		? [...filters.марка, brand]
																		: filters.марка.filter(b => b !== brand)
																	handleFilterChange(['марка'], newBrands)
																}}
																className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
																aria-label={`Фильтр по марке: ${brand}`}
															/>
															<span className='text-sm text-gray-700'>
																{brand}
															</span>
														</label>
													))}
												</div>
											</div>
										</div>
									</div>

									<div className='space-y-4'>
										<div className='bg-gray-50 p-4 rounded-lg'>
											<div className='space-y-3'>
												<label className='block text-sm font-medium text-gray-700'>
													Категория
												</label>
												<div className='space-y-2'>
													{uniqueValues.категория.map(category => (
														<label
															key={category}
															className='flex items-center space-x-2'
														>
															<input
																type='checkbox'
																checked={filters.категория.includes(category)}
																onChange={e => {
																	const newCategories = e.target.checked
																		? [...filters.категория, category]
																		: filters.категория.filter(
																				c => c !== category
																		  )
																	handleFilterChange(
																		['категория'],
																		newCategories
																	)
																}}
																className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
																aria-label={`Фильтр по категории: ${category}`}
															/>
															<span className='text-sm text-gray-700'>
																{category}
															</span>
														</label>
													))}
												</div>
											</div>
										</div>

										<div className='bg-gray-50 p-4 rounded-lg'>
											<div className='space-y-3'>
												<label className='block text-sm font-medium text-gray-700'>
													Цвет
												</label>
												<div className='space-y-2 max-h-32 overflow-y-auto'>
													{uniqueValues.цвет.map(color => (
														<label
															key={color}
															className='flex items-center space-x-2'
														>
															<input
																type='checkbox'
																checked={filters.цвет.includes(color)}
																onChange={e => {
																	const newColors = e.target.checked
																		? [...filters.цвет, color]
																		: filters.цвет.filter(c => c !== color)
																	handleFilterChange(['цвет'], newColors)
																}}
																className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
																aria-label={`Фильтр по цвету: ${color}`}
															/>
															<span className='text-sm text-gray-700'>
																{color}
															</span>
														</label>
													))}
												</div>
											</div>
										</div>
									</div>
								</div>

								<div className='mt-6 flex justify-between items-center border-t pt-4'>
									<div className='text-sm text-gray-500'>
										Найдено товаров: {filteredProducts.length}
									</div>
									<button
										onClick={() => {
											setFilters({
												размер: {
													длина: { от: '', до: '' },
													ширина: { от: '', до: '' },
													высота: { от: '', до: '' },
												},
												ценаОт: '',
												ценаДо: '',
												типКартона: [],
												марка: [],
												категория: [],
												цвет: [],
											})
											setLocalSizeValues({
												длина: { от: '', до: '' },
												ширина: { от: '', до: '' },
												высота: { от: '', до: '' },
											})
										}}
										className='px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors'
										aria-label='Сбросить фильтры'
									>
										Сбросить фильтры
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>Товары</h2>
				{filteredProducts.length === 0 ? (
					<div className='text-center py-12'>
						<p className='text-gray-500 text-lg'>Ничего не найдено</p>
					</div>
				) : (
					<div
						className='products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
						role='region'
						aria-label='Список товаров'
					>
						{currentProducts.map(product => (
							<article
								key={product.id}
								className='bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200'
								aria-labelledby={`product-title-${product.id}`}
							>
								<div
									className='product-info p-4'
									aria-label='Информация о товаре'
								>
									<div
										className='cursor-pointer'
										onClick={() => navigate(`/product/${product.id}`)}
									>
										<div className='bg-gray-50 h-40 flex items-center justify-center group relative overflow-hidden -mx-4 -mt-4 mb-4'>
											{product.изображение ? (
												<LazyImage
													src={product.изображение}
													alt={product.название}
													className='h-full w-full object-contain transition-transform duration-300 group-hover:scale-105'
													loading='lazy'
												/>
											) : (
												<svg
													className='w-12 h-12 text-gray-300'
													fill='none'
													stroke='currentColor'
													viewBox='0 0 24 24'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
													/>
												</svg>
											)}
											<span
												className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
													product.наличие === 'в наличии'
														? 'bg-green-100 text-green-800'
														: 'bg-orange-100 text-orange-800'
												}`}
											>
												{product.наличие}
											</span>
										</div>

										<h3
											id={`product-title-${product.id}`}
											className='font-bold text-lg text-gray-800 mb-3 line-clamp-2 hover:text-blue-600 transition-colors'
										>
											{product.название}
										</h3>
									</div>

									<div className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
										<div className='space-y-2'>
											<div>
												<span className='text-gray-500'>Размер (Д*Ш*В)</span>
												<div className='font-medium text-gray-900'>
													{`${product.размер.длина}×${product.размер.ширина}×${product.размер.высота}`}
												</div>
											</div>

											{product.цвет.length > 0 && (
												<div>
													<span className='text-gray-500'>Цвет</span>
													<div className='font-medium text-gray-900'>
														{product.цвет.join(', ')}
													</div>
												</div>
											)}

											<div>
												<span className='text-gray-500'>Тип картона</span>
												<div className='font-medium text-gray-900'>
													{product.типКартона}
												</div>
											</div>
										</div>

										<div className='space-y-2'>
											<div>
												<span className='text-gray-500'>Марка</span>
												<div className='font-medium text-gray-900'>
													{product.марка}
												</div>
											</div>

											<div>
												<span className='text-gray-500'>Категория</span>
												<div className='font-medium text-gray-900'>
													{product.категория}
												</div>
											</div>

											<div>
												<span className='text-gray-500'>Цена</span>
												<div className='flex items-baseline gap-1 mt-1'>
													<span className='font-bold text-lg text-blue-600'>
														{getPriceForQuantity(product.цена, 100).toFixed(2)}{' '}
														₽
													</span>
													<span className='text-gray-500 text-xs'>/шт</span>
												</div>
												<div className='flex items-baseline gap-1'>
													<span className='font-medium text-green-600 text-sm'>
														{getPriceForQuantity(product.цена, 5000).toFixed(2)}{' '}
														₽
													</span>
													<span className='text-gray-500 text-xs'>
														от 5000 шт
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div className='px-4 pb-4'>
									<div className='pt-3 border-t border-gray-100'>
										<div className='flex items-end gap-3'>
											<div className='flex-1'>
												<label className='block text-xs font-medium text-gray-700 mb-1'>
													Количество (шт)
												</label>
												<input
													type='text'
													inputMode='numeric'
													pattern='[0-9]*'
													value={quantities[product.id || ''] || ''}
													onChange={e =>
														handleQuantityChange(product.id, e.target.value)
													}
													className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
													placeholder='Введите количество'
												/>
											</div>
											<button
												onClick={e => {
													e.stopPropagation()
													const quantity = quantities[product.id || '']
													if (
														!quantity ||
														quantity < (product.количество || 100)
													) {
														alert(
															`Минимальное количество для заказа: ${
																product.количество || 100
															} шт`
														)
														return
													}
													const cartItem = {
														productId: product.id,
														название: product.название,
														количество: quantity,
														цена: product.цена,
														изображение: product.изображение,
														количествоВУпаковке: product.количество,
													}
													addToCart(cartItem)
												}}
												className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm whitespace-nowrap'
											>
												В расчет
											</button>
										</div>
									</div>
								</div>
							</article>
						))}
					</div>
				)}
			</div>

			{/* Пагинация */}
			<nav role='navigation' aria-label='Постраничная навигация'>
				<div className='flex justify-center space-x-2'>
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						aria-label='Предыдущая страница'
						className={`px-4 py-2 rounded-md ${
							currentPage === 1
								? 'bg-gray-100 text-gray-400 cursor-not-allowed'
								: 'bg-white text-gray-700 hover:bg-gray-50'
						} border border-gray-300`}
					>
						Назад
					</button>

					{Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
						<button
							key={page}
							onClick={() => handlePageChange(page)}
							aria-label={`Страница ${page}`}
							aria-current={currentPage === page ? 'page' : undefined}
							className={`px-4 py-2 rounded-md border ${
								currentPage === page
									? 'bg-blue-600 text-white border-blue-600'
									: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
							}`}
						>
							{page}
						</button>
					))}

					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						aria-label='Следующая страница'
						className={`px-4 py-2 rounded-md ${
							currentPage === totalPages
								? 'bg-gray-100 text-gray-400 cursor-not-allowed'
								: 'bg-white text-gray-700 hover:bg-gray-50'
						} border border-gray-300`}
					>
						Вперед
					</button>
				</div>
			</nav>

			<div className='mt-8'>
				<Cart
					items={items}
					onUpdateQuantity={updateQuantity}
					onRemoveItem={removeItem}
				/>
			</div>
		</section>
	)
}

export default Catalog
