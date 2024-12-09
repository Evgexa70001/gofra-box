import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { ArrowLeft } from 'lucide-react'
import SEO from '../SEO/SEO'
import { Helmet } from 'react-helmet'
// import { useCart } from '../../context/CartContext'

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
	// const { addToCart } = useCart()

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

	const priceBreakdown = product?.цена
		? [
				{ quantity: 100, price: product.цена - PRICE_DISCOUNTS.LEVEL_1 },
				{ quantity: 500, price: product.цена - PRICE_DISCOUNTS.LEVEL_2 },
				{ quantity: 1000, price: product.цена - PRICE_DISCOUNTS.LEVEL_3 },
				{ quantity: 5000, price: product.цена - PRICE_DISCOUNTS.LEVEL_4 },
				{ quantity: 10000, price: product.цена - PRICE_DISCOUNTS.LEVEL_5 },
				{ quantity: 20000, price: product.цена - PRICE_DISCOUNTS.LEVEL_6 },
		  ]
		: []

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
		<>
			<SEO
				title={`${product.название} | Гофра Тара`}
				description={`Купить ${product.название}. Размер: ${product.размер.длина}×${product.размер.ширина}×${product.размер.высота}мм. Тип картона: ${product.типКартона}. Доставка по Москве и области.`}
				keywords={`${product.название}, купить ${product.название}, ${product.категория}`}
				ogImage={product.изображение}
			/>

			<Helmet>
				<script type='application/ld+json'>
					{JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'Product',
						name: product.название,
						description: `${product.название}. Размер: ${product.размер.длина}×${product.размер.ширина}×${product.размер.высота}мм`,
						brand: {
							'@type': 'Brand',
							name: 'Гофра-Тара',
						},
						offers: {
							'@type': 'Offer',
							price: product.цена,
							priceCurrency: 'RUB',
							availability:
								product.наличие === 'в наличии'
									? 'https://schema.org/InStock'
									: 'https://schema.org/PreOrder',
						},
					})}
				</script>
			</Helmet>

			<article className='min-h-screen bg-gray-50 px-8 py-12'>
				<div className='max-w-7xl mx-auto'>
					<button
						onClick={() => navigate(-1)}
						className='flex items-center text-gray-600 hover:text-gray-900 mb-8'
					>
						<ArrowLeft className='w-5 h-5 mr-2' />
						Назад к каталогу
					</button>

					<div className='bg-white rounded-xl shadow-lg p-8'>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
							<div className='space-y-8'>
								<h1 className='text-3xl font-bold text-gray-900'>
									{product.название}
								</h1>

								<div className='aspect-square bg-gray-100 rounded-lg overflow-hidden'>
									{product.изображение ? (
										<img
											src={product.изображение}
											alt={product.название}
											className='w-full h-full object-contain'
											loading='lazy'
										/>
									) : (
										<div className='w-full h-full flex items-center justify-center'>
											<svg
												className='w-24 h-24 text-gray-300'
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
										</div>
									)}
								</div>
							</div>

							<div className='space-y-8'>
								<div className='bg-gray-50 p-6 rounded-lg'>
									<h2 className='text-xl font-semibold text-gray-900 mb-4'>
										Стоимость за штуку
									</h2>
									<div className='space-y-4'>
										{priceBreakdown.map((tier, index) => (
											<div
												key={index}
												className='flex justify-between items-center'
											>
												<span className='text-gray-600'>
													от {tier.quantity} шт.
												</span>
												<span className='font-semibold text-gray-900'>
													{tier.price?.toFixed(2)} ₽
												</span>
											</div>
										))}
									</div>
									<p className='mt-4 text-sm text-gray-500'>
										* Цены указаны с учетом оптовых скидок
									</p>
								</div>

								<div
									className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
										product.наличие === 'в наличии'
											? 'bg-green-100 text-green-800'
											: 'bg-orange-100 text-orange-800'
									}`}
								>
									{product.наличие}
								</div>
							</div>
						</div>

						<div className='mt-12 border-t pt-8'>
							<h2 className='text-xl font-semibold text-gray-900 mb-6'>
								Характеристики
							</h2>
							<dl className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
								<div>
									<dt className='text-sm text-gray-500'>Размер (Д×Ш×В)</dt>
									<dd className='text-base font-medium text-gray-900'>
										{`${product.размер.длина}×${product.размер.ширина}×${product.размер.высота} мм`}
									</dd>
								</div>
								<div>
									<dt className='text-sm text-gray-500'>Тип картона</dt>
									<dd className='text-base font-medium text-gray-900'>
										{product.типКартона}
									</dd>
								</div>
								<div>
									<dt className='text-sm text-gray-500'>Марка</dt>
									<dd className='text-base font-medium text-gray-900'>
										{product.марка}
									</dd>
								</div>
								<div>
									<dt className='text-sm text-gray-500'>Категория</dt>
									<dd className='text-base font-medium text-gray-900'>
										{product.категория}
									</dd>
								</div>
								<div>
									<dt className='text-sm text-gray-500'>Цвет</dt>
									<dd className='text-base font-medium text-gray-900'>
										{product.цвет.join(', ')}
									</dd>
								</div>
							</dl>
						</div>
					</div>
				</div>
			</article>
		</>
	)
}

export default ProductDetail
