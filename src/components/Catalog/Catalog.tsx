import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Search, ChevronDown } from 'lucide-react';
import { db } from '../../config/firebase';

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
}

interface FilterState {
  размер: {
    длина: { от: string; до: string; };
    ширина: { от: string; до: string; };
    высота: { от: string; до: string; };
  };
  ценаОт: string;
  ценаДо: string;
  типКартона: string[];
  марка: string[];
  категория: string[];
  цвет: string[];
}

const Catalog = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    размер: {
      длина: { от: '', до: '' },
      ширина: { от: '', до: '' },
      высота: { от: '', до: '' }
    },
    ценаОт: '',
    ценаДо: '',
    типКартона: [],
    марка: [],
    категория: [],
    цвет: [],
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('название'));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const [длина, ширина, высота] = (data.размер as string).split('x').map(Number);
          return {
            id: doc.id,
            ...data,
            размер: {
              длина,
              ширина,
              высота
            }
          };
        }) as ProductData[];
        setProducts(productsData);
      } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const uniqueValues = {
    типКартона: Array.from(new Set(products.map(p => p.типКартона))),
    марка: Array.from(new Set(products.map(p => p.марка))),
    категория: Array.from(new Set(products.map(p => p.категория))),
    цвет: Array.from(new Set(products.flatMap(p => p.цвет))),
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.название.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.марка.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.категория.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSize = 
      (!filters.размер.длина.от || product.размер.длина >= parseFloat(filters.размер.длина.от)) &&
      (!filters.размер.длина.до || product.размер.длина <= parseFloat(filters.размер.длина.до)) &&
      (!filters.размер.ширина.от || product.размер.ширина >= parseFloat(filters.размер.ширина.от)) &&
      (!filters.размер.ширина.до || product.размер.ширина <= parseFloat(filters.размер.ширина.до)) &&
      (!filters.размер.высота.от || product.размер.высота >= parseFloat(filters.размер.высота.от)) &&
      (!filters.размер.высота.до || product.размер.высота <= parseFloat(filters.размер.высота.до));

    const matchesPrice =
      (!filters.ценаОт || product.цена >= parseFloat(filters.ценаОт)) &&
      (!filters.ценаДо || product.цена <= parseFloat(filters.ценаДо));

    const matchesType = 
      filters.типКартона.length === 0 || 
      filters.типКартона.includes(product.типКартона);

    const matchesBrand = 
      filters.марка.length === 0 || 
      filters.марка.includes(product.марка);

    const matchesCategory = 
      filters.категория.length === 0 || 
      filters.категория.includes(product.категория);

    const matchesColor = 
      filters.цвет.length === 0 || 
      product.цвет.some(color => filters.цвет.includes(color));

    return matchesSearch && matchesSize && matchesPrice && 
           matchesType && matchesBrand && matchesCategory && matchesColor;
  });

  const handleFilterChange = (path: string[], value: string | string[]) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      let current: any = newFilters;
      
      // Проходим по пути до предпоследнего элемента
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      
      // Устанавливаем значение
      current[path[path.length - 1]] = value;
      return newFilters;
    });
  };

  const SizeFilter = ({ dimension, label }: { dimension: 'длина' | 'ширина' | 'высота', label: string }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label} (мм)</label>
      <div className="flex space-x-3">
        <div className="flex-1">
          <input
            type="number"
            placeholder="От"
            value={filters.размер[dimension].от}
            onChange={(e) => handleFilterChange(['размер', dimension, 'от'], e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex-1">
          <input
            type="number"
            placeholder="До"
            value={filters.размер[dimension].до}
            onChange={(e) => handleFilterChange(['размер', dimension, 'до'], e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="px-8 py-12">
        <div className="text-center">Загрузка...</div>
      </section>
    );
  }

  return (
    <section className="px-8 py-12 bg-gray-50">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Каталог</h2>
      
      <div className="mb-8">
        <div className="relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск товаров..." 
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>
        <div className="mt-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
          >
            <span>Фильтры</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isFilterOpen && (
            <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <SizeFilter dimension="длина" label="Длина" />
                    <SizeFilter dimension="ширина" label="Ширина" />
                    <SizeFilter dimension="высота" label="Высота" />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Цена (₽)</label>
                      <div className="flex space-x-3">
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="От"
                            value={filters.ценаОт}
                            onChange={(e) => handleFilterChange(['ценаОт'], e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="До"
                            value={filters.ценаДо}
                            onChange={(e) => handleFilterChange(['ценаДо'], e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Тип картона</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {uniqueValues.типКартона.map(type => (
                          <label key={type} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={filters.типКартона.includes(type)}
                              onChange={(e) => {
                                const newTypes = e.target.checked
                                  ? [...filters.типКартона, type]
                                  : filters.типКартона.filter(t => t !== type);
                                handleFilterChange(['типКартона'], newTypes);
                              }}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Марка</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {uniqueValues.марка.map(brand => (
                          <label key={brand} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={filters.марка.includes(brand)}
                              onChange={(e) => {
                                const newBrands = e.target.checked
                                  ? [...filters.марка, brand]
                                  : filters.марка.filter(b => b !== brand);
                                handleFilterChange(['марка'], newBrands);
                              }}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{brand}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Категория</label>
                      <div className="space-y-2">
                        {uniqueValues.категория.map(category => (
                          <label key={category} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={filters.категория.includes(category)}
                              onChange={(e) => {
                                const newCategories = e.target.checked
                                  ? [...filters.категория, category]
                                  : filters.категория.filter(c => c !== category);
                                handleFilterChange(['категория'], newCategories);
                              }}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{category}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Цвет</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {uniqueValues.цвет.map(color => (
                          <label key={color} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={filters.цвет.includes(color)}
                              onChange={(e) => {
                                const newColors = e.target.checked
                                  ? [...filters.цвет, color]
                                  : filters.цвет.filter(c => c !== color);
                                handleFilterChange(['цвет'], newColors);
                              }}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{color}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center border-t pt-4">
                <div className="text-sm text-gray-500">
                  Найдено товаров: {filteredProducts.length}
                </div>
                <button
                  onClick={() => setFilters({
                    размер: {
                      длина: { от: '', до: '' },
                      ширина: { от: '', до: '' },
                      высота: { от: '', до: '' }
                    },
                    ценаОт: '',
                    ценаДо: '',
                    типКартона: [],
                    марка: [],
                    категория: [],
                    цвет: [],
                  })}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Сбросить фильтры
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Ничего не найдено</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center group-hover:opacity-90 transition-opacity">
                {product.изображение ? (
                  <img
                    src={product.изображение}
                    alt={product.название}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Предотвращаем бесконечный цикл
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCAxNmw0LjU4Ni00LjU4NmEyIDIgMCAwMTIuODI4IDBMMTYgMTZtLTItMmwxLjU4Ni0xLjU4NmEyIDIgMCAwMTIuODI4IDBMMjAgMTRtLTYtNmguMDFNNiAyMGgxMmEyIDIgMCAwMDItMlY2YTIgMiAwIDAwLTItMkg2YTIgMiAwIDAwLTIgMnYxMmEyIDIgMCAwMDIgMnoiIHN0cm9rZT0iI0E0QTRBNCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=';
                    }}
                  />
                ) : (
                  <svg 
                    className="w-16 h-16 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-xl text-gray-800">{product.название}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.наличие === 'в наличии' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {product.наличие}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">Размер (мм)</span>
                      <span className="font-medium text-gray-800">
                        {`${product.размер.длина}×${product.размер.ширина}×${product.размер.высота}`}
                      </span>
                    </div>
                    
                    {product.цвет.length > 0 && (
                      <div className="flex flex-col">
                        <span className="text-gray-600 text-sm">Цвет</span>
                        <span className="font-medium text-gray-800">{product.цвет.join(', ')}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">Тип картона</span>
                      <span className="font-medium text-gray-800">{product.типКартона}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">Марка</span>
                      <span className="font-medium text-gray-800">{product.марка}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">Категория</span>
                      <span className="font-medium text-gray-800">{product.категория}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">Цена</span>
                      <span className="font-bold text-lg text-blue-600">{product.цена} ₽</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Catalog; 