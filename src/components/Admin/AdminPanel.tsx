import { auth, db } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Pencil, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ProductData {
  id?: string;
  название: string;
  размер: string;
  цена: number | '';
  цвет: string[];
  типКартона: 'микрогофра' | '3 слойный' | '5 слойный';
  марка: string;
  категория: 'самосборные' | 'четырехклапанные';
  количество: number | '';
  наличие: 'в наличии' | 'под заказ';
  лист: string;
  изображение?: string;
}


// const CARDBOARD_TYPES = ['микрогофра', '3 слойный', '5 слойный'] as const;
// const CATEGORIES = ['самосборные', 'четырехклапанные'] as const;
// const AVAILABILITY_STATUS = ['в наличии', 'под заказ'] as const;
// const COLORS = ['бурый', 'белый'] as const;

type SortField = 'name' | 'price' | 'size' | 'cardboardType' | 'brand' | 'category' | 'quantity' | 'availability' | 'sheet' | 'color' | null;
type SortDirection = 'asc' | 'desc';


const AdminPanel = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState<ProductData>({
    название: '',
    размер: '',
    цена: '',
    цвет: [],
    типКартона: 'микрогофра',
    марка: '',
    категория: 'самосборные',
    количество: '',
    наличие: 'в наличии',
    лист: ''
  });
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const currentUser = auth.currentUser;
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Move constants inside component
  const CARDBOARD_TYPES = ['микрогофра', '3 слойный', '5 слойный'] as const;
  const CATEGORIES = ['самосборные', 'четырехклапанные'] as const;
  const AVAILABILITY_STATUS = ['в наличии', 'под заказ'] as const;
  const COLORS = ['бурый', 'белый'] as const;

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchProducts();
  }, []);

  // Функция загрузки продуктов
  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('название'));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProductData[];
      setProducts(productsData);
    } catch (error) {
      console.error('Ошибка при загрузке продуктов:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'цена' || name === 'количество') {
      setProductData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
    } else if (name === 'цвет') {
      const checkbox = e.target as HTMLInputElement;
      setProductData(prev => ({
        ...prev,
        цвет: checkbox.checked 
          ? [...prev.цвет, value]
          : prev.цвет.filter(color => color !== value)
      }));
    } else {
      setProductData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем, что числовые поля содержат числа
    if (productData.цена === '' || productData.количество === '') {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    try {
      // Преобразуем данные перед отправкой
      const dataToSubmit = {
        ...productData,
        цена: Number(productData.цена),
        количество: Number(productData.количество)
      };
      
      await addDoc(collection(db, 'products'), dataToSubmit);
      
      // Очищаем форму
      setProductData({
        название: '',
        размер: '',
        цена: '',
        цвет: [],
        типКартона: 'микрогофра',
        марка: '',
        категория: 'самосборные',
        количество: '',
        наличие: 'в наличии',
        лист: ''
      });

      // Перезагружаем список продуктов
      await fetchProducts();
      
      alert('Товар успешно добавлен!');
    } catch (error) {
      console.error('Ошибка при добавлении товара:', error);
      alert('Ошибка при добавлении товара');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Если поле то же самое, меняем направление
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Если новое поле, устанавливаем его и направление по умолчанию
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedProducts = () => {
    if (!products) return [];
    
    return [...products].sort((a, b) => {
      if (!sortField) return 0;
      
      switch (sortField) {
        case 'name':
          return sortDirection === 'asc' 
            ? a.название.localeCompare(b.название)
            : b.название.localeCompare(a.название);
        case 'price':
          return sortDirection === 'asc' 
            ? (Number(a.цена) || 0) - (Number(b.цена) || 0)
            : (Number(b.цена) || 0) - (Number(a.цена) || 0);
        case 'size':
          return sortDirection === 'asc' 
            ? a.размер.localeCompare(b.размер)
            : b.размер.localeCompare(a.размер);
        case 'cardboardType':
          return sortDirection === 'asc'
            ? a.типКартона.localeCompare(b.типКартона)
            : b.типКартона.localeCompare(a.типКартона);
        case 'brand':
          return sortDirection === 'asc'
            ? a.марка.localeCompare(b.марка)
            : b.марка.localeCompare(a.марка);
        case 'category':
          return sortDirection === 'asc'
            ? a.категория.localeCompare(b.категория)
            : b.категория.localeCompare(a.категория);
        case 'quantity':
          return sortDirection === 'asc'
            ? (Number(a.количество) || 0) - (Number(b.количество) || 0)
            : (Number(b.количество) || 0) - (Number(a.количество) || 0);
        case 'availability':
          return sortDirection === 'asc'
            ? a.наличие.localeCompare(b.наличие)
            : b.наличие.localeCompare(a.наличие);
        case 'sheet':
          return sortDirection === 'asc'
            ? a.лист.localeCompare(b.лист)
            : b.лист.localeCompare(a.лист);
        case 'color':
          return sortDirection === 'asc'
            ? a.цвет.join(',').localeCompare(b.цвет.join(','))
            : b.цвет.join(',').localeCompare(a.цвет.join(','));
        default:
          return 0;
      }
    });
  };

  // Добавляем функцию удаления
  const handleDelete = async (productId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', productId));
      await fetchProducts();
      alert('Товар успешно удален!');
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      alert('Ошибка при удалении товара');
    }
  };

  // Функция для открытия модального окна редактирования
  const handleEdit = (product: ProductData) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  // Функция для сох изменений
  const handleSaveEdit = async () => {
    if (!editingProduct?.id) return;

    try {
      const { id, ...updateData } = editingProduct;
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, updateData);
      await fetchProducts();
      setIsEditModalOpen(false);
      setEditingProduct(null);
      alert('Товар успешно обновлен!');
    } catch (error) {
      console.error('Ошибка при обновлении товара:', error);
      alert('Ошибка при обновлении товара');
    }
  };

  const exportToExcel = () => {
    try {
      // Подготовка данных для экспорта
      const exportData = products.map(product => ({
        'Название': product.название,
        'Размер': product.размер,
        'Цена': product.цена,
        'Цвет': product.цвет.join(', '),
        'Тип картона': product.типКартона,
        'Марка': product.марка,
        'Категория': product.категория,
        'Количество': product.количество,
        'Наличие': product.наличие,
        'Лист': product.лист
      }));

      // Создание рабочей книги
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Products");

      // Сохранение файла
      XLSX.writeFile(wb, "products.xlsx");
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      alert('Ошибка при экспорте данных');
    }
  };

  const importFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          // Преобразование и валидация данных
          const productsToImport = jsonData.map((item: any) => ({
            название: item['Название'] || '',
            размер: item['Размер'] || '',
            цена: Number(item['Цена']) || 0,
            цвет: item['Цвет'] ? item['Цвет'].split(', ') : [],
            типКартона: item['Тип картона'] || 'микрогофра',
            марка: item['Марка'] || '',
            категория: item['Категория'] || 'самосборные',
            количество: Number(item['Количество']) || 0,
            наличие: item['Наличие'] || 'в наличии',
            лист: item['Лист'] || ''
          }));

          // Добавление каждого продукта в базу данных
          for (const product of productsToImport) {
            await addDoc(collection(db, 'products'), product);
          }

          await fetchProducts();
          alert('Данные успешно импортированы!');
        } catch (error) {
          console.error('Ошибка при импорте:', error);
          alert('Ошибка при импорте данных');
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Ошибка при чтении файла:', error);
      alert('Ошибка при чтении файла');
    }
  };

  // Обновляем функцию uploadToImgur
  const uploadToImgur = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('https://api.imgur.com/3/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Client-ID b4f0a3b82615df1',
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return data.data.link;
      } else {
        throw new Error(data.data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // В компоненте AdminPanel добавляем обработчик загрузки изображения
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadToImgur(file);
      setProductData(prev => ({
        ...prev,
        изображение: imageUrl
      }));
    } catch (error) {
      alert('Ошибка при загрузке изображения');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white rounded-xl shadow-sm p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Админ панель</h1>
          <p className="text-gray-500 mt-1">
            Вы вошли как: {currentUser?.email}
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 
            transition-all duration-200 flex items-center gap-2 shadow-sm"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Выйти
        </button>
      </div>

      {/* Add Product Form */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Добавить новый товар</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Название</label>
            <input
              type="text"
              name="название"
              value={productData.название}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Размер (д x ш x в)</label>
            <input
              type="text"
              name="размер"
              placeholder="например: 100x50x30"
              pattern="\d+x\d+x\d+"
              value={productData.размер}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Цена</label>
            <input
              type="number"
              name="цена"
              min="0"
              value={productData.цена}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Цвет</label>
            <div className="flex gap-4">
              {COLORS.map(color => (
                <label key={color} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="цвет"
                    value={color}
                    checked={productData.цвет.includes(color)}
                    onChange={handleInputChange}
                  />
                  {color}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Тип картона</label>
            <select
              name="типКартона"
              value={productData.типКартона}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            >
              {CARDBOARD_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Марка</label>
            <input
              type="text"
              name="марка"
              value={productData.марка}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Категория</label>
            <select
              name="категории"
              value={productData.категория}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Количество</label>
            <input
              type="number"
              name="количество"
              min="0"
              value={productData.количество}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Наличие</label>
            <select
              name="наличие"
              value={productData.наличие}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            >
              {AVAILABILITY_STATUS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Лист (д x ш)</label>
            <input
              type="text"
              name="лист"
              placeholder="например: 100x50"
              pattern="\d+x\d+"
              value={productData.лист}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Изображение</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 
                  transition-all duration-200 cursor-pointer flex items-center gap-2"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                Загрузить изображение
              </label>
              {productData.изображение && (
                <a 
                  href={productData.изображение} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Просмотреть
                </a>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`col-span-full bg-gradient-to-r from-green-500 to-green-600 
              text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 
              transition-all duration-200 shadow-sm flex items-center justify-center gap-2
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Добавление...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z" clipRule="evenodd" />
                </svg>
                Добавить товар
              </>
            )}
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-6 font-medium text-gray-700 border-b border-gray-100">
          {/* Column headers with updated styling */}
          <button onClick={() => handleSort('name')} 
            className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200">
            Название
            {sortField === 'name' && (
              <span className="text-blue-600">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <button onClick={() => handleSort('size')} 
            className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200">
            Размер
            {sortField === 'size' && (
              <span className="text-blue-600">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <button onClick={() => handleSort('color')} 
            className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200">
            Цвет
            {sortField === 'color' && (
              <span className="text-blue-600">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <button onClick={() => handleSort('price')} 
            className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200">
            Цена
            {sortField === 'price' && (
              <span className="text-blue-600">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <button onClick={() => handleSort('cardboardType')} 
            className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200">
            Тип картона
            {sortField === 'cardboardType' && (
              <span className="text-blue-600">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <button onClick={() => handleSort('brand')} 
            className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200">
            Марка
            {sortField === 'brand' && (
              <span className="text-blue-600">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <button onClick={() => handleSort('category')} 
            className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200">
            Категория
            {sortField === 'category' && (
              <span className="text-blue-600">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <button onClick={() => handleSort('quantity')} 
            className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200">
            Кол-во
            {sortField === 'quantity' && (
              <span className="text-blue-600">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <button onClick={() => handleSort('availability')} 
            className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200">
            Наличие
            {sortField === 'availability' && (
              <span className="text-blue-600">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <button onClick={() => handleSort('sheet')} 
            className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200">
            Лист
            {sortField === 'sheet' && (
              <span className="text-blue-600">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2">
            Изображение
          </div>
          <div className="flex items-center gap-2">
            Действия
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {getSortedProducts().map((product) => (
            <div key={product.id} 
              className="grid grid-cols-12 gap-4 p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="truncate">{product.название}</div>
              <div className="truncate">{product.размер}</div>
              <div className="truncate">{product.цвет.join(', ')}</div>
              <div className="truncate">{product.цена}</div>
              <div className="truncate">{product.типКартона}</div>
              <div className="truncate">{product.марка}</div>
              <div className="truncate">{product.категория}</div>
              <div className="truncate">{product.количество}</div>
              <div className="truncate">
                <span className={`px-2 py-1 rounded-full text-sm ${
                  product.наличие === 'в наличии' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {product.наличие}
                </span>
              </div>
              <div className="truncate">{product.лист}</div>
              <div className="truncate">
                {product.изображение && (
                  <a 
                    href={product.изображение} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Просмотреть
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  title="Редактировать"
                >
                  <Pencil className="h-5 w-5 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(product.id!)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  title="Удалить"
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модальное окно редактирования */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Редактировать товар
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Название</label>
                <input
                  type="text"
                  value={editingProduct.название}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    название: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Размер (д x ш x в)</label>
                <input
                  type="text"
                  value={editingProduct.размер}
                  pattern="\d+x\d+x\d+"
                  placeholder="например: 100x50x30"
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    размер: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Цена</label>
                <input
                  type="number"
                  value={editingProduct.цена}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    цена: e.target.value === '' ? '' : Number(e.target.value)
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Цвет</label>
                <div className="flex gap-4">
                  {COLORS.map(color => (
                    <label key={color} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingProduct.цвет.includes(color)}
                        onChange={(e) => {
                          const newColors = e.target.checked
                            ? [...editingProduct.цвет, color]
                            : editingProduct.цвет.filter(c => c !== color);
                          setEditingProduct({
                            ...editingProduct,
                            цвет: newColors
                          });
                        }}
                      />
                      {color}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Тип картона</label>
                <select
                  value={editingProduct.типКартона}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    типКартона: e.target.value as typeof editingProduct.типКартона
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  {CARDBOARD_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Марка</label>
                <input
                  type="text"
                  value={editingProduct.марка}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    марка: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Категория</label>
                <select
                  value={editingProduct.категория}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    категория: e.target.value as typeof editingProduct.категория
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Количество</label>
                <input
                  type="number"
                  value={editingProduct.количество}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    количество: e.target.value === '' ? '' : Number(e.target.value)
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Наличие</label>
                <select
                  value={editingProduct.наличие}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    наличие: e.target.value as typeof editingProduct.наличие
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  {AVAILABILITY_STATUS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Лист (д x ш)</label>
                <input
                  type="text"
                  value={editingProduct.лист}
                  pattern="\d+x\d+"
                  placeholder="например: 100x50"
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    лист: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Изображение</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const imageUrl = await uploadToImgur(file);
                        setEditingProduct({
                          ...editingProduct,
                          изображение: imageUrl
                        });
                      } catch (error) {
                        alert('Ошибка при загрузке изображения');
                      }
                    }}
                    className="hidden"
                    id="edit-image-upload"
                  />
                  <label
                    htmlFor="edit-image-upload"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 
                      transition-all duration-200 cursor-pointer flex items-center gap-2"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    Загрузить изображение
                  </label>
                  {editingProduct.изображение && (
                    <a 
                      href={editingProduct.изображение} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Просмотреть
                    </a>
                  )}
                </div>
              </div>

              <div className="col-span-2 flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-4 justify-end">
        <button
          onClick={exportToExcel}
          className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 
            transition-all duration-200 flex items-center gap-2 shadow-sm"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Экспорт в Excel
        </button>

        <label className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
          transition-all duration-200 flex items-center gap-2 shadow-sm cursor-pointer">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Импорт из Excel
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={importFromExcel}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

export default AdminPanel; 