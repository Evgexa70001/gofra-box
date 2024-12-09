export const getPriceForQuantity = (
	basePrice: number,
	quantity: number
): number => {
	if (quantity >= 20000) return basePrice - 0.7
	if (quantity >= 10000) return basePrice - 0.6
	if (quantity >= 5000) return basePrice - 0.5
	if (quantity >= 1000) return basePrice - 0.4
	if (quantity >= 500) return basePrice - 0.3
	if (quantity >= 100) return basePrice - 0.2
	return basePrice
}
