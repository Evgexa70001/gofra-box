import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import {
	ArrowLeft,
	Package,
	Ruler,
	Palette,
	Layers,
	Tag,
	CheckCircle,
	AlertCircle,
	ShoppingCart,
} from 'lucide-react'
import SEO from '../SEO/SEO'

import LazyImage from '../UI/LazyImage'
import { useCart } from '../../context/CartContext'

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

const ProductDetail = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const [product, setProduct] = useState<ProductData | null>(null)
	const [loading, setLoading] = useState(true)
	const { addToCart } = useCart()
	const [added, setAdded] = useState(false)

	useEffect(() => {
		window.scrollTo(0, 0)
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
						размер: { длина, ширина, высота },
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

	const formatPrice = (price: number) =>
		new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
			minimumFractionDigits: 2,
		}).format(price)

	if (loading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center'>
				<div className='text-center text-lg text-gray-500 animate-pulse'>
					Загрузка...
				</div>
			</div>
		)
	}

	if (!product) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center'>
				<div className='text-center text-lg text-gray-500'>Товар не найден</div>
			</div>
		)
	}

	return (
		<>
			<SEO
				title={`${product.название} | Гофра Тара`}
				description={`Купить ${product.название}. Размер: ${product.размер.длина}×${product.размер.ширина}×${product.размер.высота}мм. Тип картона: ${product.типКартона}. Доставка по Пятигорску и КМВ.`}
				keywords={`${product.название}, купить ${product.название}, ${product.категория}`}
			/>
			<div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-6 px-2 sm:px-4'>
				<div className='max-w-5xl mx-auto'>
					<button
						onClick={() => navigate(-1)}
						className='inline-flex items-center gap-2 px-5 py-2.5 mb-6 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-all text-base sm:text-lg'
					>
						<ArrowLeft className='w-5 h-5' />
						<span>Назад к каталогу</span>
					</button>
					<div className='bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col lg:flex-row gap-10 items-center lg:items-start'>
						{/* Фото */}
						<div className='w-full max-w-xs sm:max-w-sm lg:max-w-md flex-shrink-0'>
							<div className='aspect-square bg-gradient-to-br from-primary/10 to-blue-600/10 rounded-2xl shadow-xl flex items-center justify-center overflow-hidden'>
								{product.изображение ? (
									<LazyImage
										src={product.изображение}
										alt={product.название}
										className='w-full h-full object-contain'
										loading='lazy'
									/>
								) : (
									<Package className='w-24 h-24 text-gray-300' />
								)}
							</div>
						</div>
						{/* Описание и действия */}
						<div className='flex-1 w-full space-y-6'>
							<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Playfair_Display'] mb-2">
								{product.название}
							</h1>
							<div className='flex items-center gap-3 flex-wrap'>
								<span className='text-2xl sm:text-3xl font-bold text-primary'>
									{formatPrice(product.цена)}
								</span>
								<span
									className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
										product.наличие === 'в наличии'
											? 'bg-green-100 text-green-800'
											: 'bg-orange-100 text-orange-800'
									}`}
								>
									{product.наличие === 'в наличии' ? (
										<CheckCircle className='w-4 h-4' />
									) : (
										<AlertCircle className='w-4 h-4' />
									)}
									{product.наличие}
								</span>
							</div>
							<button
								onClick={() => {
									addToCart({
										productId: product.id,
										название: product.название,
										цена: product.цена,
										изображение: product.изображение,
										количество: 1,
									})
									setAdded(true)
									setTimeout(() => setAdded(false), 1500)
								}}
								className={`mt-2 w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base sm:text-lg ${
									added ? 'opacity-70 pointer-events-none' : ''
								}`}
								disabled={added}
							>
								<ShoppingCart className='w-5 h-5' />
								{added ? 'Добавлено!' : 'В корзину'}
							</button>
							{/* Характеристики */}
							<div className='pt-2'>
								<h2 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
									<Ruler className='w-5 h-5 text-blue-600' /> Характеристики
								</h2>
								<dl
									className='grid grid-cols-1 sm:grid-cols-2 gap-4'
									aria-label='Характеристики товара'
								>
									<div className='flex items-center gap-3'>
										<Layers className='w-5 h-5 text-primary' />
										<div>
											<dt className='text-xs text-gray-500'>Тип картона</dt>
											<dd className='text-base font-medium text-gray-900'>
												{product.типКартона}
											</dd>
										</div>
									</div>
									<div className='flex items-center gap-3'>
										<Palette className='w-5 h-5 text-blue-600' />
										<div>
											<dt className='text-xs text-gray-500'>Цвет</dt>
											<dd className='text-base font-medium text-gray-900'>
												{product.цвет.join(', ')}
											</dd>
										</div>
									</div>
									<div className='flex items-center gap-3'>
										<Ruler className='w-5 h-5 text-blue-600' />
										<div>
											<dt className='text-xs text-gray-500'>Размер (Д×Ш×В)</dt>
											<dd className='text-base font-medium text-gray-900'>{`${product.размер.длина}×${product.размер.ширина}×${product.размер.высота} мм`}</dd>
										</div>
									</div>
									<div className='flex items-center gap-3'>
										<Package className='w-5 h-5 text-primary' />
										<div>
											<dt className='text-xs text-gray-500'>Категория</dt>
											<dd className='text-base font-medium text-gray-900'>
												{product.категория}
											</dd>
										</div>
									</div>
									<div className='flex items-center gap-3'>
										<Tag className='w-5 h-5 text-blue-600' />
										<div>
											<dt className='text-xs text-gray-500'>Марка</dt>
											<dd className='text-base font-medium text-gray-900'>
												{product.марка}
											</dd>
										</div>
									</div>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default ProductDetail
