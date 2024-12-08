import { useState, useEffect } from 'react'

interface CartItem {
	productId?: string
	название: string
	количество: number
	цена: number
	изображение?: string
	количествоВУпаковке?: number
}

interface CartProps {
	items: CartItem[]
	onUpdateQuantity: (productId: string | undefined, quantity: number) => void
	onRemoveItem: (productId: string | undefined) => void
}

const Cart = ({ items, onUpdateQuantity, onRemoveItem }: CartProps) => {
	const [quantities, setQuantities] = useState<{ [key: string]: string }>({})

	useEffect(() => {
		const newQuantities: { [key: string]: string } = {}
		items.forEach(item => {
			if (item.productId && !quantities[item.productId]) {
				newQuantities[item.productId] = item.количество
					? String(item.количество)
					: ''
			}
		})
		setQuantities(prev => ({
			...prev,
			...newQuantities,
		}))
	}, [items])

	const getPriceForQuantity = (basePrice: number, quantity: number): number => {
		if (quantity >= 20000) return basePrice - 0.7
		if (quantity >= 10000) return basePrice - 0.6
		if (quantity >= 5000) return basePrice - 0.5
		if (quantity >= 1000) return basePrice - 0.4
		if (quantity >= 500) return basePrice - 0.3
		if (quantity >= 100) return basePrice - 0.2
		return basePrice
	}

	const handleQuantityChange = (
		productId: string | undefined,
		value: string
	) => {
		if (productId) {
			setQuantities(prev => ({
				...prev,
				[productId]: value,
			}))

			if (value !== '') {
				const numValue = parseInt(value)
				if (!isNaN(numValue)) {
					onUpdateQuantity(productId, numValue)
				}
			}
		}
	}

	const total = items.reduce((sum, item) => {
		if (!item.количество) return sum
		const pricePerUnit = getPriceForQuantity(item.цена, item.количество)
		return sum + pricePerUnit * item.количество
	}, 0)

	return (
		<div className='bg-white rounded-2xl shadow-lg p-8'>
			<h2 className='text-2xl font-bold text-gray-800 mb-8'>Расчет заказа</h2>

			{items.length === 0 ? (
				<div className='text-center py-12'>
					<svg
						className='mx-auto h-12 w-12 text-gray-400'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
						/>
					</svg>
					<p className='mt-4 text-gray-500 text-lg'>Корзина пуста</p>
				</div>
			) : (
				<>
					<div className='space-y-6'>
						{items.map(item => (
							<div
								key={item.productId}
								className='flex items-start space-x-6 p-6 bg-gray-50 rounded-xl border border-gray-100'
							>
								{item.изображение && (
									<img
										src={item.изображение}
										alt={item.название}
										className='w-20 h-20 object-contain rounded-lg bg-white p-2'
									/>
								)}
								<div className='flex-1 min-w-0'>
									<h3 className='font-medium text-gray-900 truncate'>
										{item.название}
									</h3>
									<div className='mt-4 flex flex-wrap items-center gap-6'>
										<div className='flex items-center gap-4'>
											<input
												type='text'
												inputMode='numeric'
												pattern='[0-9]*'
												value={quantities[item.productId || ''] ?? ''}
												onChange={e =>
													handleQuantityChange(item.productId, e.target.value)
												}
												onBlur={e => {
													const value = e.target.value
													if (value === '') {
														return
													}
													const newValue = parseInt(value)
													if (
														!isNaN(newValue) &&
														newValue < (item.количествоВУпаковке || 100)
													) {
														alert(
															`Минимальное количество для заказа: ${
																item.количествоВУпаковке || 100
															} шт`
														)
														const minQuantity = item.количествоВУпаковке || 100
														handleQuantityChange(
															item.productId,
															String(minQuantity)
														)
													}
												}}
												className='w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
												placeholder='Кол-во'
											/>
											{item.количество ? (
												<div className='flex items-baseline gap-2'>
													<span className='text-gray-500'>×</span>
													<span className='text-gray-900 font-medium'>
														{getPriceForQuantity(
															item.цена,
															item.количество
														).toFixed(2)}{' '}
														₽
													</span>
													<span className='text-gray-500'>=</span>
													<span className='text-blue-600 font-bold text-lg'>
														{(
															getPriceForQuantity(item.цена, item.количество) *
															item.количество
														).toFixed(2)}{' '}
														₽
													</span>
												</div>
											) : (
												<span className='text-gray-600'>
													{item.цена.toFixed(2)} ₽ за шт
												</span>
											)}
										</div>
									</div>
								</div>
								<button
									onClick={() => onRemoveItem(item.productId)}
									className='p-2 text-gray-400 hover:text-red-500 transition-colors'
								>
									<svg
										className='w-5 h-5'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M6 18L18 6M6 6l12 12'
										/>
									</svg>
								</button>
							</div>
						))}
					</div>

					<div className='mt-8 pt-6 border-t border-gray-200'>
						<div className='flex justify-between items-center'>
							<span className='text-xl font-medium text-gray-800'>Итого:</span>
							<span className='text-3xl font-bold text-blue-600'>
								{total.toFixed(2)} ₽
							</span>
						</div>
					</div>
				</>
			)}
		</div>
	)
}

export default Cart
