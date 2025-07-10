import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart } from '../../context/CartContext'

interface MobileCartDropdownProps {
	isOpen: boolean
	position?: 'fixed' | 'absolute'
}

const MobileCartDropdown = ({
	isOpen,
	position = 'fixed',
}: MobileCartDropdownProps) => {
	const { items, updateQuantity, removeItem } = useCart()

	const totalPrice = items.reduce(
		(sum, item) => sum + item.цена * item.количество,
		0
	)
	const uniqueItemsCount = items.length

	const handleQuantityChange = (
		productId: string | undefined,
		newQuantity: number
	) => {
		if (newQuantity > 0) {
			updateQuantity(productId, newQuantity)
		}
	}

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
			minimumFractionDigits: 0,
		}).format(price)
	}

	if (!isOpen) return null

	const positionClass =
		position === 'fixed'
			? 'fixed left-2 right-2 top-[60px] w-auto rounded-b-2xl'
			: 'absolute right-0 mt-2 w-96 rounded-2xl'

	return (
		<div
			className={
				'bg-white/95 backdrop-blur-md shadow-2xl z-50 border border-gray-100 max-h-[80vh] overflow-y-auto ' +
				positionClass
			}
		>
			<div className='py-3 sm:py-4'>
				<div className='px-4 sm:px-6 py-2 sm:py-3 border-b border-gray-100'>
					<h3 className='text-base sm:text-lg font-bold text-gray-800'>
						Корзина ({uniqueItemsCount} товаров)
					</h3>
				</div>

				{items.length === 0 ? (
					<div className='px-4 sm:px-6 py-8 text-center'>
						<ShoppingCart size={40} className='mx-auto text-gray-300 mb-4' />
						<p className='text-gray-500 font-medium text-sm sm:text-base'>
							Корзина пуста
						</p>
						<p className='text-xs sm:text-sm text-gray-400 mt-1'>
							Добавьте товары из каталога
						</p>
					</div>
				) : (
					<>
						<div className='max-h-56 sm:max-h-64 overflow-y-auto'>
							{items.map((item, index) => (
								<div
									key={item.productId || index}
									className='flex items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 last:border-b-0'
								>
									{item.изображение && (
										<img
											src={item.изображение}
											alt={item.название}
											className='w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg mr-3 sm:mr-4'
										/>
									)}
									<div className='flex-1 min-w-0'>
										<h4 className='font-semibold text-gray-900 text-xs sm:text-sm truncate'>
											{item.название}
										</h4>
										<p className='text-xs sm:text-sm text-gray-500 mt-1'>
											{formatPrice(item.цена)} за шт.
										</p>
									</div>
									<div className='flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4'>
										<button
											onClick={() =>
												handleQuantityChange(
													item.productId,
													item.количество - 1
												)
											}
											className='w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
											disabled={item.количество <= 1}
										>
											<Minus
												size={14}
												className='text-gray-600 sm:w-4 sm:h-4'
											/>
										</button>
										<input
											type='number'
											min={1}
											value={item.количество}
											onChange={e => {
												const val = Number(e.target.value)
												if (!isNaN(val) && val >= 1) {
													handleQuantityChange(item.productId, val)
												}
											}}
											className='w-10 sm:w-12 text-center font-semibold text-gray-900 border border-gray-200 rounded-md py-1 px-1 sm:px-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm'
											aria-label='Количество'
										/>
										<button
											onClick={() =>
												handleQuantityChange(
													item.productId,
													item.количество + 1
												)
											}
											className='w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
										>
											<Plus size={14} className='text-gray-600 sm:w-4 sm:h-4' />
										</button>
										<button
											onClick={() => removeItem(item.productId)}
											className='w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 rounded-lg transition-colors'
										>
											<Trash2
												size={14}
												className='text-red-500 sm:w-4 sm:h-4'
											/>
										</button>
									</div>
								</div>
							))}
						</div>

						<div className='px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100'>
							<div className='flex justify-between items-center mb-3 sm:mb-4'>
								<span className='text-base sm:text-lg font-bold text-gray-900'>
									Итого:
								</span>
								<span className='text-lg sm:text-xl font-bold text-primary'>
									{formatPrice(totalPrice)}
								</span>
							</div>
							<button
								onClick={() => {
									// Здесь можно добавить логику оформления заказа
									console.log('Оформление заказа')
								}}
								className='w-full bg-gradient-to-r from-primary to-blue-600 text-white py-2 sm:py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base'
							>
								Оформить заказ
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	)
}

export default MobileCartDropdown
