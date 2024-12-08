import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ArrowLeft } from 'lucide-react';

interface ProductData {
  id?: string;
  название: string;
  размер: {
    длина: number;
    ширина: number;
    высота: number;
  };
  цена: number;
  цвет: string[];
  типКартона: 'микрогофра' | '3 слойный' | '5 слойный';
  марка: string;
  категория: 'самосборные' | 'четырехклапанные';
  наличие: 'в наличии' | 'под заказ';
  изображение?: string;
  количество?: number;
  оптоваяЦена?: number;
}

const PRICE_DISCOUNTS = {
  LEVEL_1: 0.2, // скидка 20 копеек при заказе от 100 шт
  LEVEL_2: 0.3, // скидка 30 копеек при заказе от 500 шт
  LEVEL_3: 0.4, // скидка 40 копеек при заказе от 1000 шт
  LEVEL_4: 0.5, // скидка 50 копеек при заказе от 5000 шт
  LEVEL_5: 0.6, // скидка 60 копеек при заказе от 10000 шт
  LEVEL_6: 0.7, // скидка 70 копеек при заказе от 20000 шт
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
        
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const [длина, ширина, высота] = (data.размер as string).split('x').map(Number);
          setProduct({
            id: docSnap.id,
            ...data,
            размер: {
              длина,
              ширина,
              высота
            }
          } as ProductData);
        }
      } catch (error) {
        console.error('Ошибка при загрузке продукта:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const getPriceForQuantity = (basePrice: number, quantity: number): number => {
    if (quantity >= 20000) return basePrice - PRICE_DISCOUNTS.LEVEL_6;
    if (quantity >= 10000) return basePrice - PRICE_DISCOUNTS.LEVEL_5;
    if (quantity >= 5000) return basePrice - PRICE_DISCOUNTS.LEVEL_4;
    if (quantity >= 1000) return basePrice - PRICE_DISCOUNTS.LEVEL_3;
    if (quantity >= 500) return basePrice - PRICE_DISCOUNTS.LEVEL_2;
    if (quantity >= 100) return basePrice - PRICE_DISCOUNTS.LEVEL_1;
    return basePrice;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-8 py-12">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 px-8 py-12">
        <div className="text-center">Товар не найден</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Назад к каталогу</span>
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-96 flex items-center justify-center">
                {product.изображение ? (
                  <img
                    src={product.изображение}
                    alt={product.название}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCAxNmw0LjU4Ni00LjU4NmEyIDIgMCAwMTIuODI4IDBMMTYgMTZtLTItMmwxLjU4Ni0xLjU4NmEyIDIgMCAwMTIuODI4IDBMMjAgMTRtLTYtNmguMDFNNiAyMGgxMmEyIDIgMCAwMDItMlY2YTIgMiAwIDAwLTItMkg2YTIgMiAwIDAwLTIgMnYxMmEyIDIgMCAwMDIgMnoiIHN0cm9rZT0iI0E0QTRBNCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=';
                    }}
                  />
                ) : (
                  <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{product.название}</h1>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  product.наличие === 'в наличии' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {product.наличие}
                </span>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Розничная цена</h3>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-blue-600">{product.цена} ₽</span>
                      <span className="text-gray-500">(шт)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Оптовая цена</h3>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-green-600">{getPriceForQuantity(product.цена, 5000)} ₽</span>
                      <span className="text-gray-500">(от 5000 шт)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Количество</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Цена</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[1, 100, 500, 1000, 5000, 10000, 20000].map((quantity) => (
                        <tr key={quantity} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">От {quantity} шт</td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-800">
                            {getPriceForQuantity(product.цена, quantity).toFixed(2)} р.
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center space-x-2 text-sm text-amber-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Оптовые заказы должны быть кратны упаковке!</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border-t">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Характеристики</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-gray-600 text-sm mb-2">Размер (мм)</h3>
                <p className="text-lg font-medium text-gray-800">
                  {`${product.размер.длина}×${product.размер.ширина}×${product.размер.высота}`}
                </p>
              </div>

              <div>
                <h3 className="text-gray-600 text-sm mb-2">Тип картона</h3>
                <p className="text-lg font-medium text-gray-800">{product.типКартона}</p>
              </div>

              <div>
                <h3 className="text-gray-600 text-sm mb-2">Марка</h3>
                <p className="text-lg font-medium text-gray-800">{product.марка}</p>
              </div>

              {product.количество && (
                <div>
                  <h3 className="text-gray-600 text-sm mb-2">Количество в упаковке</h3>
                  <p className="text-lg font-medium text-gray-800">{product.количество} шт</p>
                </div>
              )}

              <div>
                <h3 className="text-gray-600 text-sm mb-2">Категория</h3>
                <p className="text-lg font-medium text-gray-800">{product.категория}</p>
              </div>

              {product.цвет.length > 0 && (
                <div>
                  <h3 className="text-gray-600 text-sm mb-2">Доступные цвета</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.цвет.map((color) => (
                      <span
                        key={color}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-800"
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
  );
};

export default ProductDetail; 