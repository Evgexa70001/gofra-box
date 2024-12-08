import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { ArrowLeft } from 'lucide-react'

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
	оптоваяЦена?: number
}

const PRICE_DISCOUNTS = {
	LEVEL_1: 0.2, // скидка 20 копеек при заказе от 100 шт
	LEVEL_2: 0.3, // скидка 30 копеек при заказе от 500 шт
	LEVEL_3: 0.4, // скидка 40 копеек при заказе от 1000 шт
	LEVEL_4: 0.5, // скидка 50 копеек при заказе от 5000 шт
	LEVEL_5: 0.6, // скидка 60 копеек при заказе от 10000 шт
	LEVEL_6: 0.7, // скидка 70 копеек при заказе от 20000 шт
}

const ProductDetail = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const [product, setProduct] = useState<ProductData | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				if (!id) return

				const docRef = doc(db, 'products', id)
				const docSnap = await getDoc(docRef)

				if (docSnap.exists()) {
					const data = docSnap.data()
					const [длина, ширина, высота] = (data.размер as string)
						.split('x')
						.map(Number)
					setProduct({
						id: docSnap.id,
						...data,
						размер: {
							длина,
							ширина,
							высота,
						},
					} as ProductData)
				}
			} catch (error) {
				console.error('Ошибка при загрузке продукта:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchProduct()
	}, [id])

	const getPriceForQuantity = (basePrice: number, quantity: number): number => {
		if (quantity >= 20000) return basePrice - PRICE_DISCOUNTS.LEVEL_6
		if (quantity >= 10000) return basePrice - PRICE_DISCOUNTS.LEVEL_5
		if (quantity >= 5000) return basePrice - PRICE_DISCOUNTS.LEVEL_4
		if (quantity >= 1000) return basePrice - PRICE_DISCOUNTS.LEVEL_3
		if (quantity >= 500) return basePrice - PRICE_DISCOUNTS.LEVEL_2
		if (quantity >= 100) return basePrice - PRICE_DISCOUNTS.LEVEL_1
		return basePrice
	}

	if (loading) {
		return (
			<div className='min-h-screen bg-gray-50 px-8 py-12'>
				<div className='text-center'>Загрузка...</div>
			</div>
		)
	}

	if (!product) {
		return (
			<div className='min-h-screen bg-gray-50 px-8 py-12'>
				<div className='text-center'>Товар не найден</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				<button
					onClick={() => navigate(-1)}
					className='group flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-8 transition-all duration-200'
				>
					<ArrowLeft className='w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200' />
					<span className='font-medium'>Назад к каталогу</span>
				</button>

				<div className='bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100'>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-0'>
						<div className='p-6 lg:p-8'>
							<div className='bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl h-96 flex items-center justify-center p-8 transition-all duration-300 hover:shadow-inner'>
								{product.изображение ? (
									<img
										src={product.изображение}
										alt={product.название}
										className='h-full w-full object-contain transition-transform duration-300 hover:scale-105'
										onError={e => {
											const target = e.target as HTMLImageElement
											target.onerror = null
											target.src =
												'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCAxNmw0LjU4Ni00LjU4NmEyIDIgMCAwMTIuODI4IDBMMTYgMTZtLTItMmwxLjU4Ni0xLjU4NmEyIDIgMCAwMTIuODI4IDBMMjAgMTRtLTYtNmguMDFNNiAyMGgxMmEyIDIgMCAwMDItMlY2YTIgMiAwIDAwLTItMkg2YTIgMiAwIDAwLTIgMnYxMmEyIDIgMCAwMDIgMnoiIHN0cm9rZT0iI0E0QTRBNCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4='
										}}
									/>
								) : (
									<svg
										className='w-24 h-24 text-gray-400'
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
							</div>
						</div>

						<div className='p-6 lg:p-8 bg-white'>
							<div className='flex justify-between items-start mb-8'>
								<h1 className='text-3xl font-bold text-gray-900 tracking-tight'>
									{product.название}
								</h1>
								<span
									className={`px-4 py-2 rounded-full text-sm font-semibold ${
										product.наличие === 'в наличии'
											? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
											: 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20'
									}`}
								>
									{product.наличие}
								</span>
							</div>

							<div className='space-y-8'>
								<div className='grid grid-cols-2 gap-6'>
									<div className='bg-gray-50 rounded-xl p-4 transition-all duration-200 hover:shadow-md'>
										<h3 className='text-lg font-semibold text-gray-900 mb-2'>
											Розничная цена
										</h3>
										<div className='flex items-baseline space-x-2'>
											<span className='text-2xl font-bold text-blue-600'>
												{product.цена} ₽
											</span>
											<span className='text-gray-500 text-sm'>/шт</span>
										</div>
									</div>
									<div className='bg-gray-50 rounded-xl p-4 transition-all duration-200 hover:shadow-md'>
										<h3 className='text-lg font-semibold text-gray-900 mb-2'>
											Оптовая цена
										</h3>
										<div className='flex items-baseline space-x-2'>
											<span className='text-2xl font-bold text-green-600'>
												{getPriceForQuantity(product.цена, 5000)} ₽
											</span>
											<span className='text-gray-500 text-sm'>/шт</span>
										</div>
									</div>
								</div>

								<div className='bg-gray-50 rounded-xl overflow-hidden'>
									<table className='min-w-full divide-y divide-gray-200'>
										<thead>
											<tr className='bg-gray-100'>
												<th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
													Количество
												</th>
												<th className='px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>
													Цена за штуку
												</th>
											</tr>
										</thead>
										<tbody className='divide-y divide-gray-200 bg-white'>
											{[1, 100, 500, 1000, 5000, 10000, 20000].map(quantity => (
												<tr
													key={quantity}
													className='transition-colors duration-150 hover:bg-blue-50'
												>
													<td className='px-6 py-4 text-sm text-gray-600'>
														От {quantity.toLocaleString()} шт
													</td>
													<td className='px-6 py-4 text-right text-sm font-medium text-gray-900'>
														{getPriceForQuantity(
															product.цена,
															quantity
														).toFixed(2)}{' '}
														₽
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								<div className='flex items-center space-x-2 bg-amber-50 text-amber-700 p-4 rounded-xl'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-5 w-5 flex-shrink-0'
										viewBox='0 0 20 20'
										fill='currentColor'
									>
										<path
											fillRule='evenodd'
											d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
											clipRule='evenodd'
										/>
									</svg>
									<span className='text-sm font-medium'>
										Оптовые заказы должны быть кратны упаковке!
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className='p-6 lg:p-8 border-t border-gray-100 bg-gray-50'>
						<h2 className='text-2xl font-bold text-gray-900 mb-8'>
							Характеристики
						</h2>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
							<div className='bg-white p-4 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md'>
								<h3 className='text-gray-500 text-sm mb-2'>Размер (мм)</h3>
								<p className='text-lg font-semibold text-gray-900'>
									{`${product.размер.длина}×${product.размер.ширина}×${product.размер.высота}`}
								</p>
							</div>

							<div className='bg-white p-4 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md'>
								<h3 className='text-gray-500 text-sm mb-2'>Тип картона</h3>
								<p className='text-lg font-semibold text-gray-900'>
									{product.типКартона}
								</p>
							</div>

							<div className='bg-white p-4 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md'>
								<h3 className='text-gray-500 text-sm mb-2'>Марка</h3>
								<p className='text-lg font-semibold text-gray-900'>
									{product.марка}
								</p>
							</div>

							{product.количество && (
								<div className='bg-white p-4 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md'>
									<h3 className='text-gray-500 text-sm mb-2'>
										Количество в упаковке
									</h3>
									<p className='text-lg font-semibold text-gray-900'>
										{product.количество} шт
									</p>
								</div>
							)}

							<div className='bg-white p-4 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md'>
								<h3 className='text-gray-500 text-sm mb-2'>Категория</h3>
								<p className='text-lg font-semibold text-gray-900'>
									{product.категория}
								</p>
							</div>

							{product.цвет.length > 0 && (
								<div className='bg-white p-4 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md'>
									<h3 className='text-gray-500 text-sm mb-3'>
										Доступные цвета
									</h3>
									<div className='flex flex-wrap gap-2'>
										{product.цвет.map(color => (
											<span
												key={color}
												className='px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium ring-1 ring-blue-600/20'
											>
												{color}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ProductDetail
