
interface CartItem {
  productId?: string;
  название: string;
  количество: number;
  цена: number;
  изображение?: string;
  количествоВУпаковке?: number;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string | undefined, quantity: number) => void;
  onRemoveItem: (productId: string | undefined) => void;
}

const Cart = ({ items, onUpdateQuantity, onRemoveItem }: CartProps) => {
  const getPriceForQuantity = (basePrice: number, quantity: number): number => {
    if (quantity >= 20000) return basePrice - 0.7;
    if (quantity >= 10000) return basePrice - 0.6;
    if (quantity >= 5000) return basePrice - 0.5;
    if (quantity >= 1000) return basePrice - 0.4;
    if (quantity >= 500) return basePrice - 0.3;
    if (quantity >= 100) return basePrice - 0.2;
    return basePrice;
  };

  const total = items.reduce((sum, item) => {
    const pricePerUnit = getPriceForQuantity(item.цена, item.количество);
    return sum + (pricePerUnit * item.количество);
  }, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Расчет заказа</h2>
      
      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Корзина пуста</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => {
              const pricePerUnit = getPriceForQuantity(item.цена, item.количество);
              return (
                <div key={item.productId} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  {item.изображение && (
                    <img 
                      src={item.изображение} 
                      alt={item.название} 
                      className="w-16 h-16 object-contain"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.название}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <input
                        type="number"
                        min={item.количествоВУпаковке || 100}
                        step={item.количествоВУпаковке || 100}
                        value={item.количество}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 0;
                          const packageSize = item.количествоВУпаковке || 100;
                          
                          // Если значение меньше размера упаковки, устанавливаем минимальное
                          if (newValue < packageSize) {
                            onUpdateQuantity(item.productId, packageSize);
                            return;
                          }

                          // Округляем до ближайшего кратного размеру упаковки
                          const remainder = newValue % packageSize;
                          const roundedValue = remainder === 0 
                            ? newValue 
                            : newValue + (packageSize - remainder);

                          onUpdateQuantity(item.productId, roundedValue);
                        }}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                      />
                      <span className="text-gray-600">
                        × {pricePerUnit.toFixed(2)} ₽
                      </span>
                      <span className="font-medium">
                        = {(pricePerUnit * item.количество).toFixed(2)} ₽
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.productId)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Удалить
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center">
              <span className="text-xl font-medium text-gray-800">Итого:</span>
              <span className="text-2xl font-bold text-blue-600">
                {total.toFixed(2)} ₽
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart; 