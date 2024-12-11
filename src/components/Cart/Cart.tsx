import { getPriceForQuantity } from '../../utils/priceCalculator';

interface CartProps {
  items: Array<{
    productId?: string;
    название: string;
    количество: number;
    цена: number;
    изображение?: string;
    количествоВУпаковке?: number;
  }>;
  onUpdateQuantity: (productId: string | undefined, quantity: number) => void;
  onRemoveItem: (productId: string | undefined) => void;
}

const Cart = ({ items, onUpdateQuantity, onRemoveItem }: CartProps) => {
  if (items.length === 0) {
    return null;
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const pricePerUnit = getPriceForQuantity(item.цена, item.количество);
      return total + pricePerUnit * item.количество;
    }, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 border border-gray-200">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Расчет заказа</h2>

      <div className="space-y-3 sm:space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg relative">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {item.изображение && (
                <img
                  src={item.изображение}
                  alt={item.название}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                />
              )}

              <div className="flex-grow">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">{item.название}</h3>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.количество}
                      onChange={(e) => onUpdateQuantity(item.productId, Number(e.target.value))}
                      min={item.количествоВУпаковке || 100}
                      className="w-20 sm:w-24 px-2 py-1 border border-gray-300 rounded-md text-sm"
                    />
                    <span className="text-gray-600 text-sm">
                      × {getPriceForQuantity(item.цена, item.количество).toFixed(2)} ₽
                    </span>
                  </div>
                  <span className="font-medium text-sm sm:text-base">
                    ={' '}
                    {(getPriceForQuantity(item.цена, item.количество) * item.количество).toFixed(2)}{' '}
                    ₽
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onRemoveItem(item.productId)}
              className="absolute top-2 right-2 sm:static p-2 text-red-600 hover:text-red-800 transition-colors"
              aria-label="Удалить товар">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-base sm:text-lg font-medium">Итого:</span>
          <span className="text-lg sm:text-xl font-bold text-blue-600">
            {calculateTotal().toFixed(2)} ₽
          </span>
        </div>
      </div>
    </div>
  );
};

export default Cart;
