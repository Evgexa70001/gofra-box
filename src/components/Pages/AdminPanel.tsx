import { auth, db } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { Pencil, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ProductData {
  id?: string;
  название: string;
  размер: string;
  цена: number | '';
  цвет: string[];
  типКартона: string;
  марка: string;
  категория: string;
  количество: number | '';
  наличие: string;
  изображение?: string;
}

// Добавляем новый интерфейс для складской позиции
interface WarehouseItem {
  id?: string;
  размерЛиста: string; // длина x ширина
  размерРелевки: number; // Меняем тип на number
  связанныеТовары: {
    id: string;
    название: string;
    размер: string;
  }[];
  количество: number;
  стоимость: number;
  статус: 'В наличии' | 'В пути' | 'Отсутствует';
  цвет: string[]; // Меняем тип на массив строк
  типКартона: string; // Добавляем поле типа картона
}

type SortField =
  | 'name'
  | 'price'
  | 'size'
  | 'cardboardType'
  | 'brand'
  | 'category'
  | 'quantity'
  | 'availability'
  | 'sheet'
  | 'color'
  | null;
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
  });
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const currentUser = auth.currentUser;
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'warehouse'>('products');

  // Move constants inside component
  const CARDBOARD_TYPES = ['микрогофра', '3 слойный', '5 слойный'] as const;
  const CATEGORIES = ['самосборные', 'четырехклапанные'] as const;
  const AVAILABILITY_STATUS = ['в наличии', 'под заказ'] as const;
  const COLORS = ['бурый', 'белый'] as const;

  // Добавляем новые состояния для складского учета
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [warehouseData, setWarehouseData] = useState<WarehouseItem>({
    размерЛиста: '',
    размерРелевки: 0, // Инициализируем нулем
    связанныеТовары: [],
    количество: 0,
    стоимость: 0,
    статус: 'В наличии',
    цвет: [], // Очищаем массив цветов
    типКартона: 'микрогофра',
  });

  // Добавляем константу для статусов склада
  const WAREHOUSE_STATUSES = ['В наличии', 'В пути', 'Отсутствует'] as const;

  // Добавляем новые состояния после существующих
  const [editingWarehouseItem, setEditingWarehouseItem] = useState<WarehouseItem | null>(null);
  const [isWarehouseEditModalOpen, setIsWarehouseEditModalOpen] = useState(false);

  // Добавляем новое состояние для поискового запроса
  const [searchQuery, setSearchQuery] = useState('');

  // Добавляем функцию фильтрации продуктов
  const getFilteredProducts = () => {
    if (!searchQuery) return products;

    return products.filter(
      (product) =>
        product.название.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.размер.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchProducts();
    fetchWarehouseItems();
  }, []);

  // Функция загрузки продуктов
  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('название'));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProductData[];
      setProducts(productsData);
    } catch (error) {
      console.error('Ошибка при загрузке продуктов:', error);
    }
  };

  // Добавляем функцию загрузки складских позиций
  const fetchWarehouseItems = async () => {
    try {
      const q = query(collection(db, 'warehouse'));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          цвет: Array.isArray(data.цвет) ? data.цвет : [], // Преобразуем в массив если это не массив
        };
      }) as WarehouseItem[];
      setWarehouseItems(items);
    } catch (error) {
      console.error('Ошибка при загрузке складских позиций:', error);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'цена') {
      setProductData((prev) => ({
        ...prev,
        [name]: value === '' ? '' : Number(parseFloat(value).toFixed(2)),
      }));
    } else if (name === 'количество') {
      setProductData((prev) => ({
        ...prev,
        [name]: value === '' ? '' : Number(value),
      }));
    } else if (name === 'цвет') {
      const checkbox = e.target as HTMLInputElement;
      setProductData((prev) => ({
        ...prev,
        цвет: checkbox.checked
          ? [...prev.цвет, value]
          : prev.цвет.filter((color) => color !== value),
      }));
    } else {
      setProductData((prev) => ({
        ...prev,
        [name]: value,
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
        количество: Number(productData.количество),
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
      const exportData = products.map((product) => ({
        Название: product.название,
        Размер: product.размер,
        Цена: product.цена,
        Цвет: product.цвет.join(', '),
        'Тип картона': product.типКартона,
        Марка: product.марка,
        Категория: product.категория,
        'Количество в упаковке': product.количество,
        Наличие: product.наличие,
        Изображение: product.изображение || '',
      }));

      // Создание рабочей книги
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Products');

      // Сохранение файла
      XLSX.writeFile(wb, 'products.xlsx');
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

          // Получаем существующие товары для проверки дубликатов
          const existingProducts = products.map((item) => ({
            название: item.название,
            размер: item.размер,
            марка: item.марка,
          }));

          // Преобразование и валидация данных
          const productsToImport = jsonData.map((item: any) => ({
            название: item['Название'] || '',
            размер: item['Размер'] || '',
            цена: Number(item['Цена']) || 0,
            цвет: item['Цвет']
              ? item['Цвет']
                  .split(', ')
                  .filter((c: string) => COLORS.includes(c as (typeof COLORS)[number]))
              : [],
            типКартона: CARDBOARD_TYPES.includes(item['Тип картона'])
              ? item['Тип картона']
              : 'микрогофра',
            марка: item['Марка'] || '',
            категория: CATEGORIES.includes(item['Категория']) ? item['Категория'] : 'самосборные',
            количество: Number(item['Количество в упаковке']) || 0,
            наличие: AVAILABILITY_STATUS.includes(item['Наличие']) ? item['Наличие'] : 'в наличии',
            изображение: item['Изображение'] || '',
          }));

          // Фильруем дубликаты
          const uniqueProducts = productsToImport.filter((newProduct) => {
            return !existingProducts.some(
              (existingProduct) =>
                existingProduct.название === newProduct.название &&
                existingProduct.размер === newProduct.размер &&
                existingProduct.марка === newProduct.марка,
            );
          });

          const skippedCount = productsToImport.length - uniqueProducts.length;

          if (uniqueProducts.length === 0) {
            alert('Все товары уже существуют в базе данных');
            return;
          }

          // Проверка обязательных полей перед импортом
          const invalidProducts = uniqueProducts.filter(
            (product) => !product.название || !product.размер || !product.марка,
          );

          if (invalidProducts.length > 0) {
            throw new Error('Некоторые записи содержат пустые обязательные поля');
          }

          // Добавление только уникальных товаров
          for (const product of uniqueProducts) {
            await addDoc(collection(db, 'products'), product);
          }

          await fetchProducts();
          alert(
            `Импорт завершен:\n` +
              `- Добавлено новых товаров: ${uniqueProducts.length}\n` +
              `- Пропущено дубликатов: ${skippedCount}`,
          );
        } catch (error) {
          console.error('Ошибка при импорте:', error);
          alert('Ошибка при импорте данных: ' + (error as Error).message);
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
          Authorization: 'Client-ID b4f0a3b82615df1',
          Accept: 'application/json',
        },
        body: formData,
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
      setProductData((prev) => ({
        ...prev,
        изображение: imageUrl,
      }));
    } catch (error) {
      alert('Ошибка при загрузке изображения');
    }
  };

  // Добавляем функцию обрабтки изменений в форме склада
  const handleWarehouseInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === 'стоимость' || name === 'количество') {
      setWarehouseData((prev) => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value),
      }));
    } else if (name === 'цвет') {
      const checkbox = e.target as HTMLInputElement;
      setWarehouseData((prev) => ({
        ...prev,
        цвет: checkbox.checked
          ? [...prev.цвет, value]
          : prev.цвет.filter((color) => color !== value),
      }));
    } else {
      setWarehouseData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Добавляем функцию для обработки выбора связанных товаров
  const handleProductSelection = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setWarehouseData((prev) => ({
      ...prev,
      связанныеТовары: [
        ...prev.связанныеТовары,
        {
          id: productId,
          название: product.название,
          размер: product.размер,
        },
      ],
    }));
  };

  // Добавляем функцию удаления связанного товара
  const handleRemoveLinkedProduct = (productId: string) => {
    setWarehouseData((prev) => ({
      ...prev,
      связанныеТовары: prev.связанныеТовары.filter((p) => p.id !== productId),
    }));
  };

  // Добавляем функцию сохранения складской позиции
  const handleWarehouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!warehouseData.размерЛиста || warehouseData.связанныеТовары.length === 0) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'warehouse'), warehouseData);

      // Очищаем форму
      setWarehouseData({
        размерЛиста: '',
        размерРелевки: 0, // Инициализируем нулем
        связанныеТовары: [],
        количество: 0,
        стоимость: 0,
        статус: 'В наличии',
        цвет: [], // Очищаем массив цветов
        типКартона: 'микрогофра',
      });

      await fetchWarehouseItems();
      alert('Складская позиция успешно добавлена!');
    } catch (error) {
      console.error('Ошибка при добавлении складской позиции:', error);
      alert('Ошибка при добавлении складской позиции');
    } finally {
      setLoading(false);
    }
  };

  // Добавляем функции для работы со складскими позициями
  const handleWarehouseEdit = (item: WarehouseItem) => {
    setEditingWarehouseItem(item);
    setIsWarehouseEditModalOpen(true);
  };

  const handleWarehouseDelete = async (itemId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту позицию?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'warehouse', itemId));
      await fetchWarehouseItems();
      alert('Позиция успешно удалена!');
    } catch (error) {
      console.error('Ошибка при удалении позиции:', error);
      alert('Ошибка при удалении позиции');
    }
  };

  const handleSaveWarehouseEdit = async () => {
    if (!editingWarehouseItem?.id) return;

    try {
      const { id, ...updateData } = editingWarehouseItem;
      const warehouseRef = doc(db, 'warehouse', id);
      await updateDoc(warehouseRef, updateData);
      await fetchWarehouseItems();
      setIsWarehouseEditModalOpen(false);
      setEditingWarehouseItem(null);
      alert('Позиция успешно обновлена!');
    } catch (error) {
      console.error('Ошибка при обновлении позиции:', error);
      alert('Ошибка при обновлении позиции');
    }
  };

  // Добавляем функции экспорта и импорта для складского учета
  const exportWarehouseToExcel = () => {
    try {
      // Подготовка данных для экспорта
      const exportData = warehouseItems.map((item) => ({
        'Размер листа': item.размерЛиста,
        'Размер релевки': item.размерРелевки, // Добавляем новое поле
        'Связанные товары': item.связанныеТовары
          .map((product) => `${product.название} (${product.размер})`)
          .join('; '),
        Количество: item.количество,
        Стоимость: item.стоимость,
        Статус: item.статус,
        Цвет: item.цвет.join(', '),
        'Тип картона': item.типКартона,
      }));

      // Создание рабочей книги
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Warehouse');

      // Сохранение файла
      XLSX.writeFile(wb, 'warehouse.xlsx');
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      alert('Ошибка при экспорте данных');
    }
  };

  const importWarehouseFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
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

          // Получаем существующие позиции для проверки дубликатов
          const existingItems = warehouseItems.map((item) => ({
            размерЛиста: item.размерЛиста,
            размерРелевки: item.размерРелевки, // Добавляем новое поле
            связанныеТоварыIds: item.связанныеТовары
              .map((p) => p.id)
              .sort()
              .join(','),
          }));

          // Преобразование и валидация данных
          const warehouseItemsToImport = jsonData.map((item: any) => {
            // Парсим связанные товары из строки
            const связанныеТоварыStr = item['Связанные товары'] || '';
            const связанныеТовары = связанныеТоварыStr
              .split(';')
              .map((productStr: string) => {
                const match = productStr.trim().match(/^(.+) \((.+)\)$/);
                if (match) {
                  const название = match[1];
                  const размер = match[2];
                  // Находим ID товара по названию и размеру
                  const product = products.find(
                    (p) => p.название === название && p.размер === размер,
                  );
                  return product
                    ? {
                        id: product.id!,
                        название,
                        размер,
                      }
                    : null;
                }
                return null;
              })
              .filter(Boolean);

            return {
              размерЛиста: item['Размер листа'] || '',
              размерРелевки: item['Размер релевки'] || '', // Добавляем новое поле
              связанныеТовары,
              количество: Number(item['Количество']) || 0,
              стоимость: Number(item['Стоимость']) || 0,
              статус: WAREHOUSE_STATUSES.includes(item['Статус']) ? item['Статус'] : 'В наличии',
              цвет: item['Цвет'] ? item['Цвет'].split(', ') : [], // Исправляем на массив
              типКартона: item['Тип картона'] || 'микрогофра',
            } as WarehouseItem;
          });

          // Фильтруем дубликаты
          const uniqueItems = warehouseItemsToImport.filter((newItem) => {
            const связанныеТоварыIds = newItem.связанныеТовары
              .map((p) => p.id)
              .sort()
              .join(',');
            const isDuplicate = existingItems.some(
              (existingItem) =>
                existingItem.размерЛиста === newItem.размерЛиста &&
                existingItem.связанныеТоварыIds === связанныеТоварыIds,
            );
            return !isDuplicate;
          });

          const skippedCount = warehouseItemsToImport.length - uniqueItems.length;

          if (uniqueItems.length === 0) {
            alert('Все позиции уже существуют в базе данных');
            return;
          }

          // Проверка обязательных полей перед импортом
          const invalidItems = uniqueItems.filter(
            (item) => !item.размерЛиста || item.связанныеТовары.length === 0,
          );

          if (invalidItems.length > 0) {
            throw new Error('Некоторые записи содержат пустые обязательные поля');
          }

          // Добавление только уникальных позиций
          for (const item of uniqueItems) {
            await addDoc(collection(db, 'warehouse'), item);
          }

          await fetchWarehouseItems();
          alert(
            `Импорт завершен:\n` +
              `- Добавлено новых позиций: ${uniqueItems.length}\n` +
              `- Пропущено дубликатов: ${skippedCount}`,
          );
        } catch (error) {
          console.error('Ошибка при импорте:', error);
          alert('Ошибка при импорте данных: ' + (error as Error).message);
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Ошибка при чтении файла:', error);
      alert('Ошибка при чтении файла');
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8  p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Админ панель</h1>
          <p className="text-gray-500 mt-1">Вы вошли как: {currentUser?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 
            transition-all duration-200 flex items-center gap-2 shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Выйти
        </button>
      </div>

      {/* Tabs */}
      <div className=" mb-8">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'products'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            Товары
          </button>
          <button
            onClick={() => setActiveTab('warehouse')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'warehouse'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            Складской учет
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'products' ? (
        <>
          {/* Existing Products Content */}
          <div className="p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Добавить новый товар</h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="relative">
                  <input
                    type="number"
                    name="цена"
                    min="0"
                    step="0.01"
                    value={productData.цена}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">₽</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Цвет</label>
                <div className="flex gap-4">
                  {COLORS.map((color) => (
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
                <div className="relative">
                  <input
                    type="text"
                    list="cardboardTypes"
                    name="типКартона"
                    value={productData.типКартона}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                  <datalist id="cardboardTypes">
                    {CARDBOARD_TYPES.map((type) => (
                      <option key={type} value={type} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Материал</label>
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
                <div className="relative">
                  <input
                    type="text"
                    list="categories"
                    name="категория"
                    value={productData.категория}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                  <datalist id="categories">
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Количество в упаковке</label>
                <div className="relative">
                  <input
                    type="number"
                    name="количество"
                    min="1"
                    value={productData.количество}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    шт
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Укажите количество коробок в одной упаковке
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Наличие</label>
                <div className="relative">
                  <input
                    type="text"
                    list="availabilityStatuses"
                    name="наличие"
                    value={productData.наличие}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                  <datalist id="availabilityStatuses">
                    {AVAILABILITY_STATUS.map((status) => (
                      <option key={status} value={status} />
                    ))}
                  </datalist>
                </div>
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
                      transition-all duration-200 cursor-pointer flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    Загрузить изображение
                  </label>
                  {productData.изображение && (
                    <a
                      href={productData.изображение}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline">
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
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Добавление...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Добавить товар
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Products Table/Cards */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Table Headers - показываем только на десктопе */}
            <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,1.2fr,1fr,1fr,0.8fr,0.8fr] gap-4 p-6 font-medium text-gray-700 border-b border-gray-100">
              <button
                onClick={() => handleSort('name')}
                className="col-span-2 flex items-center gap-2">
                Название {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSort('size')} className="flex items-center gap-2">
                Размер {sortField === 'size' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSort('price')} className="flex items-center gap-2">
                Цена {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSort('color')} className="flex items-center gap-2">
                Цвет {sortField === 'color' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('cardboardType')}
                className="flex items-center gap-2">
                Тип картона {sortField === 'cardboardType' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSort('brand')} className="flex items-center gap-2">
                Материал {sortField === 'brand' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSort('category')} className="flex items-center gap-2">
                Категория {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSort('quantity')} className="flex items-center gap-2">
                Кол-во в упаковке{' '}
                {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('availability')}
                className="flex items-center gap-2">
                Наличие {sortField === 'availability' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <div>Изображение</div>
              <div>Действия</div>
            </div>

            <div className="divide-y divide-gray-100">
              {getSortedProducts().map((product, index) => (
                <div key={product.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  {/* Десктопная версия */}
                  <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,1.2fr,1fr,1fr,0.8fr,0.8fr] gap-4 p-6 hover:bg-gray-100 border-l-4 border-transparent hover:border-blue-500 transition-all duration-200">
                    <div className="col-span-2 font-medium">{product.название}</div>
                    <div className="text-gray-600">{product.размер}</div>
                    <div className="text-gray-600">{product.цена} ₽</div>
                    <div className="text-gray-600">{product.цвет.join(', ')}</div>
                    <div className="text-gray-600">{product.типКартона}</div>
                    <div className="text-gray-600">{product.марка}</div>
                    <div className="text-gray-600">{product.категория}</div>
                    <div className="text-gray-600">{product.количество}</div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          product.наличие === 'в наличии'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {product.наличие}
                      </span>
                    </div>
                    <div>
                      {product.изображение && (
                        <a
                          href={product.изображение}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline">
                          Просмотреть
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1 hover:bg-blue-100 rounded-full transition-colors duration-200"
                        title="Редактировать">
                        <Pencil className="h-5 w-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id!)}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors duration-200"
                        title="Удалить">
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Мобильная версия - карточка */}
                  <div className="md:hidden p-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-gray-900">{product.название}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                          title="Редактировать">
                          <Pencil className="h-5 w-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id!)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                          title="Удалить">
                          <Trash2 className="h-5 w-5 text-red-600" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-gray-500">Размер:</div>
                        <div>{product.размер}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-gray-500">Цвет:</div>
                        <div>{product.цвет.join(', ')}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-gray-500">Цена:</div>
                        <div>{product.цена}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-gray-500">Тип картона:</div>
                        <div>{product.типКартона}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-gray-500">Марка:</div>
                        <div>{product.марка}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-gray-500">Категория:</div>
                        <div>{product.категория}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-gray-500">Количество:</div>
                        <div>{product.количество}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-gray-500">Наличие:</div>
                        <div>
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${
                              product.наличие === 'в наличии'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {product.наличие}
                          </span>
                        </div>
                      </div>

                      {product.изображение && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-gray-500">Изображение:</div>
                          <div>
                            <a
                              href={product.изображение}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline">
                              Просмотреть
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={exportToExcel}
              className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg 
                hover:bg-green-700 transition-all duration-200 flex items-center 
                justify-center gap-2 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Экспорт в Excel
            </button>

            <label
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg 
              hover:bg-blue-700 transition-all duration-200 flex items-center 
              justify-center gap-2 shadow-sm cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
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
        </>
      ) : (
        <div className="space-y-8">
          {/* Форма добавления складской позиции */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Добавить складскую позицию
            </h2>

            <form
              onSubmit={handleWarehouseSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Размер листа (длина x ширина)
                </label>
                <input
                  type="text"
                  name="размерЛиста"
                  placeholder="например: 1000x800"
                  pattern="\d+x\d+"
                  value={warehouseData.размерЛиста}
                  onChange={handleWarehouseInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Размер релевки (мм)</label>
                <input
                  type="number"
                  name="размерРелевки"
                  placeholder="например: 100"
                  min="0"
                  value={warehouseData.размерРелевки}
                  onChange={handleWarehouseInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Связанные товары</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Поиск товаров..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  />
                  {searchQuery && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {getFilteredProducts().map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            handleProductSelection(product.id!);
                            setSearchQuery('');
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center">
                          <span>{product.название}</span>
                          <span className="text-gray-500 text-sm">{product.размер}</span>
                        </button>
                      ))}
                      {getFilteredProducts().length === 0 && (
                        <div className="px-4 py-2 text-gray-500">Ничего не найдено</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Список выбранных товаров */}
                <div className="mt-2 space-y-2">
                  {warehouseData.связанныеТовары.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>
                        {product.название} ({product.размер})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLinkedProduct(product.id)}
                        className="text-red-600 hover:text-red-700">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Количество (шт.)</label>
                <input
                  type="number"
                  name="количество"
                  min="0"
                  value={warehouseData.количество}
                  onChange={handleWarehouseInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Стоимость</label>
                <div className="relative">
                  <input
                    type="number"
                    name="стоимость"
                    min="0"
                    step="0.01"
                    value={warehouseData.стоимость}
                    onChange={handleWarehouseInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">₽</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Статус</label>
                <select
                  name="статус"
                  value={warehouseData.статус}
                  onChange={handleWarehouseInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  required>
                  {WAREHOUSE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Цвет</label>
                <div className="flex gap-4">
                  {COLORS.map((color) => (
                    <label key={color} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="цвет"
                        value={color}
                        checked={warehouseData.цвет.includes(color)}
                        onChange={handleWarehouseInputChange}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      {color}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Тип картона</label>
                <input
                  type="text"
                  name="типКартона"
                  value={warehouseData.типКартона}
                  onChange={handleWarehouseInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-blue-600 text-white py-2.5 rounded-lg
                    hover:bg-blue-700 transition-all duration-200
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {loading ? 'Добавление...' : 'Добавить позицию'}
                </button>
              </div>
            </form>
          </div>

          {/* Таблица складских позиций */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Складские позиции</h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3">Размер листа</th>
                      <th className="text-left p-3">Размер релевки</th> {/* Новая колонка */}
                      <th className="text-left p-3">Связанные товары</th>
                      <th className="text-left p-3">Количество</th>
                      <th className="text-left p-3">Стоимость</th>
                      <th className="text-left p-3">Статус</th>
                      <th className="text-left p-3">Цвет</th>
                      <th className="text-left p-3">Тип картона</th>
                      <th className="text-left p-3">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warehouseItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="p-3">{item.размерЛиста}</td>
                        <td className="p-3">{item.размерРелевки}</td> {/* Новая ячейка */}
                        <td className="p-3">
                          <div className="space-y-1">
                            {item.связанныеТовары.map((product) => (
                              <div key={product.id}>
                                {product.название} ({product.размер})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">{item.количество}</td>
                        <td className="p-3">{item.стоимость} ₽</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${
                              item.статус === 'В наличии'
                                ? 'bg-green-100 text-green-800'
                                : item.статус === 'В пути'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {item.статус}
                          </span>
                        </td>
                        <td className="p-3">{item.цвет.join(', ')}</td>
                        <td className="p-3">{item.типКартона}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleWarehouseEdit(item)}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                              title="Редактировать">
                              <Pencil className="h-5 w-5 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleWarehouseDelete(item.id!)}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                              title="Удалить">
                              <Trash2 className="h-5 w-5 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={exportWarehouseToExcel}
              className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg 
                hover:bg-green-700 transition-all duration-200 flex items-center 
                justify-center gap-2 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Экспорт в Excel
            </button>

            <label
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg 
              hover:bg-blue-700 transition-all duration-200 flex items-center 
              justify-center gap-2 shadow-sm cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Импорт из Excel
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={importWarehouseFromExcel}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Редактировать товар</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Название</label>
                <input
                  type="text"
                  value={editingProduct.название}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      название: e.target.value,
                    })
                  }
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
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      размер: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Цена</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingProduct.цена}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        цена:
                          e.target.value === ''
                            ? ''
                            : Number(parseFloat(e.target.value).toFixed(2)),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">₽</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Цвет</label>
                <div className="flex gap-4">
                  {COLORS.map((color) => (
                    <label key={color} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingProduct.цвет.includes(color)}
                        onChange={(e) => {
                          const newColors = e.target.checked
                            ? [...editingProduct.цвет, color]
                            : editingProduct.цвет.filter((c) => c !== color);
                          setEditingProduct({
                            ...editingProduct,
                            цвет: newColors,
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
                <div className="relative">
                  <input
                    type="text"
                    list="editCardboardTypes"
                    value={editingProduct.типКартона}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        типКартона: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  />
                  <datalist id="editCardboardTypes">
                    {CARDBOARD_TYPES.map((type) => (
                      <option key={type} value={type} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Материал</label>
                <input
                  type="text"
                  value={editingProduct.марка}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      марка: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Категория</label>
                <div className="relative">
                  <input
                    type="text"
                    list="editCategories"
                    value={editingProduct.категория}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        категория: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  />
                  <datalist id="editCategories">
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Количество в упаковке</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={editingProduct.количество}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        количество: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    шт
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Укажите количество коробок в одной упаковке
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Наличие</label>
                <div className="relative">
                  <input
                    type="text"
                    list="editAvailabilityStatuses"
                    value={editingProduct.наличие}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        наличие: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  />
                  <datalist id="editAvailabilityStatuses">
                    {AVAILABILITY_STATUS.map((status) => (
                      <option key={status} value={status} />
                    ))}
                  </datalist>
                </div>
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
                          изображение: imageUrl,
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
                      transition-all duration-200 cursor-pointer flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    Загрузить изображение
                  </label>
                  {editingProduct.изображение && (
                    <a
                      href={editingProduct.изображение}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline">
                      Просмотреть
                    </a>
                  )}
                </div>
              </div>

              <div className="col-span-2 flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  Отмена
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Добавляем модальное окно редактирования складской позиции */}
      {isWarehouseEditModalOpen && editingWarehouseItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Редактировать складскую позицию
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Размер листа (длина x ширина)
                </label>
                <input
                  type="text"
                  placeholder="например: 1000x800"
                  pattern="\d+x\d+"
                  value={editingWarehouseItem.размерЛиста}
                  onChange={(e) =>
                    setEditingWarehouseItem({
                      ...editingWarehouseItem,
                      размерЛиста: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Размер релевки (мм)</label>
                <input
                  type="number"
                  placeholder="например: 100"
                  min="0"
                  value={editingWarehouseItem.размерРелевки}
                  onChange={(e) =>
                    setEditingWarehouseItem({
                      ...editingWarehouseItem,
                      размерРелевки: Number(e.target.value), // Convert string to number
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Связанные товары</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Поиск товаров..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  />
                  {searchQuery && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {getFilteredProducts().map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            handleProductSelection(product.id!);
                            setSearchQuery('');
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center">
                          <span>{product.название}</span>
                          <span className="text-gray-500 text-sm">{product.размер}</span>
                        </button>
                      ))}
                      {getFilteredProducts().length === 0 && (
                        <div className="px-4 py-2 text-gray-500">Ничего не найдено</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Список выбранных товаров */}
                <div className="mt-2 space-y-2">
                  {warehouseData.связанныеТовары.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>
                        {product.название} ({product.размер})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLinkedProduct(product.id)}
                        className="text-red-600 hover:text-red-700">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Количество (шт.)</label>
                <input
                  type="number"
                  min="0"
                  value={editingWarehouseItem.количество}
                  onChange={(e) =>
                    setEditingWarehouseItem({
                      ...editingWarehouseItem,
                      количество: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Стоимость</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingWarehouseItem.стоимость}
                    onChange={(e) =>
                      setEditingWarehouseItem({
                        ...editingWarehouseItem,
                        стоимость: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">₽</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Статус</label>
                <select
                  value={editingWarehouseItem.статус}
                  onChange={(e) =>
                    setEditingWarehouseItem({
                      ...editingWarehouseItem,
                      статус: e.target.value as WarehouseItem['статус'],
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  required>
                  {WAREHOUSE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Цвет</label>
                <div className="flex gap-4">
                  {COLORS.map((color) => (
                    <label key={color} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="цвет"
                        value={color}
                        checked={editingWarehouseItem.цвет.includes(color)}
                        onChange={(e) => {
                          const checkbox = e.target;
                          setEditingWarehouseItem({
                            ...editingWarehouseItem,
                            цвет: checkbox.checked
                              ? [...editingWarehouseItem.цвет, color]
                              : editingWarehouseItem.цвет.filter((c) => c !== color),
                          });
                        }}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      {color}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Тип картона</label>
                <div className="relative">
                  <input
                    type="text"
                    list="editWarehouseCardboardTypes"
                    value={editingWarehouseItem.типКартона}
                    onChange={(e) =>
                      setEditingWarehouseItem({
                        ...editingWarehouseItem,
                        типКартона: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    required
                  />
                  <datalist id="editWarehouseCardboardTypes">
                    {CARDBOARD_TYPES.map((type) => (
                      <option key={type} value={type} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-4">
                <button
                  onClick={() => setIsWarehouseEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  Отмена
                </button>
                <button
                  onClick={handleSaveWarehouseEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
