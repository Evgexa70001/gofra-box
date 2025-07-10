import { auth, db } from '../../config/firebase'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
	collection,
	addDoc,
	getDocs,
	query,
	orderBy,
	deleteDoc,
	doc,
	updateDoc,
} from 'firebase/firestore'
import {
	Pencil,
	Trash2,
	LogOut,
	Box,
	Warehouse,
	BarChart2,
	UserCircle,
	Plus,
	Package,
	BadgeCheck,
	AlertTriangle,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
} from 'chart.js'
import { Pie } from 'react-chartjs-2'

interface ProductData {
	id?: string
	название: string
	размер: string
	цена: number | ''
	цвет: string[]
	типКартона: string
	марка: string
	категория: string
	количество: number | ''
	наличие: string
	изображение?: string
}

// Добавляем новый интерфейс для складской позиции
interface WarehouseItem {
	id?: string
	размерЛиста: string // длина x ширина
	размерРелевки: number // Меняем тип на number
	связанныеТовары: {
		id: string
		название: string
		размер: string
	}[]
	количество: number
	стоимость: number
	статус: 'В наличии' | 'В пути' | 'Отсутствует'
	цвет: string[] // Меняем тип на массив строк
	типКартона: string // Добавляем поле типа картона
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
	| null
type SortDirection = 'asc' | 'desc'

// Добавляем новый интерфейс для учета прибыли после существующих интерфейсов
interface ProfitRecord {
	id?: string
	дата: string
	товар: {
		id: string
		название: string
		размер: string
	}
	лист?: {
		// Добавляем информацию о листе
		id: string
		размерЛиста: string
		стоимость: number
	}
	штукСЛиста: number // Добавляем количество штук с одного листа
	количество: number
	ценаПродажи: number
	себестоимость: number
	прибыль?: number
	примечание?: string
}

// Регистрируем компоненты Chart.js
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	ArcElement
)

const AdminPanel = () => {
	const navigate = useNavigate()
	const [products, setProducts] = useState<ProductData[]>([])
	const [loading, setLoading] = useState(false)
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
	})
	const [sortField, setSortField] = useState<SortField>(null)
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
	const currentUser = auth.currentUser
	const [editingProduct, setEditingProduct] = useState<ProductData | null>(null)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)
	const [activeTab, setActiveTab] = useState<
		'products' | 'warehouse' | 'profit'
	>('products')
	const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([])
	const [warehouseData, setWarehouseData] = useState<WarehouseItem>({
		размерЛиста: '',
		размерРелевки: 0,
		связанныеТовары: [],
		количество: 0,
		стоимость: 0,
		статус: 'В наличии',
		цвет: [],
		типКартона: 'микрогофра',
	})
	const [editingWarehouseItem, setEditingWarehouseItem] =
		useState<WarehouseItem | null>(null)
	const [isWarehouseEditModalOpen, setIsWarehouseEditModalOpen] =
		useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [profitRecords, setProfitRecords] = useState<ProfitRecord[]>([])
	const [profitData, setProfitData] = useState<ProfitRecord>({
		дата: new Date().toISOString().split('T')[0],
		товар: {
			id: '',
			название: '',
			размер: '',
		},
		лист: undefined,
		штукСЛиста: 0,
		количество: 0,
		ценаПродажи: 0,
		себестоимость: 0,
		примечание: '',
	})
	const [warehouseSearchQuery, setWarehouseSearchQuery] = useState('')

	// Move constants inside component
	const CARDBOARD_TYPES = ['микрогофра', '3 слойный', '5 слойный'] as const
	const CATEGORIES = ['самосборные', 'четырехклапанные'] as const
	const AVAILABILITY_STATUS = ['в наличии', 'под заказ'] as const
	const COLORS = ['бурый', 'белый'] as const

	// Добавляем константу для статусов склада
	const WAREHOUSE_STATUSES = ['В наличии', 'В пути', 'Отсутствует'] as const

	// Добавляем новые состояния после существующих
	// const [editingWarehouseItem, setEditingWarehouseItem] = useState<WarehouseItem | null>(null);
	// const [isWarehouseEditModalOpen, setIsWarehouseEditModalOpen] = useState(false);

	// // Добавляем новое состояние для поискового запроса
	// const [searchQuery, setSearchQuery] = useState('');

	// Добавляем функцию фильтрации продуктов
	const getFilteredProducts = () => {
		if (!searchQuery) return products

		return products.filter(
			product =>
				product.название.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.размер.toLowerCase().includes(searchQuery.toLowerCase())
		)
	}

	// Загрузка данных при монтировании компонента
	useEffect(() => {
		fetchProducts()
		fetchWarehouseItems()
		fetchProfitRecords()
	}, [])

	// Функция загрузки продуктов
	const fetchProducts = async () => {
		try {
			const q = query(collection(db, 'products'), orderBy('название'))
			const querySnapshot = await getDocs(q)
			const productsData = querySnapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data(),
			})) as ProductData[]
			setProducts(productsData)
		} catch (error) {
			console.error('Ошибка при загрузке продуктов:', error)
		}
	}

	// Добавляем функцию загрузки складских позиций
	const fetchWarehouseItems = async () => {
		try {
			const q = query(collection(db, 'warehouse'))
			const querySnapshot = await getDocs(q)
			const items = querySnapshot.docs.map(doc => {
				const data = doc.data()
				return {
					id: doc.id,
					...data,
					цвет: Array.isArray(data.цвет) ? data.цвет : [], // Преобразуем в массив если это не массив
				}
			}) as WarehouseItem[]
			setWarehouseItems(items)
		} catch (error) {
			console.error('Ошибка при загрузке складских позиций:', error)
		}
	}

	// Функция загрузки записей прибыли
	const fetchProfitRecords = async () => {
		try {
			const q = query(collection(db, 'profit'), orderBy('дата', 'desc'))
			const querySnapshot = await getDocs(q)
			const records = querySnapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data(),
			})) as ProfitRecord[]
			setProfitRecords(records)
		} catch (error) {
			console.error('Ошибка при загрузке записей прибыли:', error)
		}
	}

	const handleLogout = async () => {
		try {
			await signOut(auth)
			navigate('/login')
		} catch (error) {
			console.error('Ошибка при выходе:', error)
		}
	}

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target

		if (name === 'цена') {
			setProductData(prev => ({
				...prev,
				[name]: value === '' ? '' : Number(parseFloat(value).toFixed(2)),
			}))
		} else if (name === 'количество') {
			setProductData(prev => ({
				...prev,
				[name]: value === '' ? '' : Number(value),
			}))
		} else if (name === 'цвет') {
			const checkbox = e.target as HTMLInputElement
			setProductData(prev => ({
				...prev,
				цвет: checkbox.checked
					? [...prev.цвет, value]
					: prev.цвет.filter(color => color !== value),
			}))
		} else {
			setProductData(prev => ({
				...prev,
				[name]: value,
			}))
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// Проверяем, что числовые поля содержат числа
		if (productData.цена === '' || productData.количество === '') {
			alert('Пожалуйста, заполните все поля')
			return
		}

		setLoading(true)
		try {
			// Преобразуем данные перед отправкой
			const dataToSubmit = {
				...productData,
				цена: Number(productData.цена),
				количество: Number(productData.количество),
			}

			await addDoc(collection(db, 'products'), dataToSubmit)

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
			})

			// Перезагружаем список продуктов
			await fetchProducts()

			alert('Товар успешно добавлен!')
		} catch (error) {
			console.error('Ошибка при добавлении товара:', error)
			alert('Ошибка при добавлении товара')
		} finally {
			setLoading(false)
		}
	}

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			// Если поле то же самое, меняем направление
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
		} else {
			// Если новое поле, устанавливаем его и направление по умолчанию
			setSortField(field)
			setSortDirection('asc')
		}
	}

	const getSortedProducts = () => {
		if (!products) return []

		return [...products].sort((a, b) => {
			if (!sortField) return 0

			switch (sortField) {
				case 'name':
					return sortDirection === 'asc'
						? a.название.localeCompare(b.название)
						: b.название.localeCompare(a.название)
				case 'price':
					return sortDirection === 'asc'
						? (Number(a.цена) || 0) - (Number(b.цена) || 0)
						: (Number(b.цена) || 0) - (Number(a.цена) || 0)
				case 'size':
					return sortDirection === 'asc'
						? a.размер.localeCompare(b.размер)
						: b.размер.localeCompare(a.размер)
				case 'cardboardType':
					return sortDirection === 'asc'
						? a.типКартона.localeCompare(b.типКартона)
						: b.типКартона.localeCompare(a.типКартона)
				case 'brand':
					return sortDirection === 'asc'
						? a.марка.localeCompare(b.марка)
						: b.марка.localeCompare(a.марка)
				case 'category':
					return sortDirection === 'asc'
						? a.категория.localeCompare(b.категория)
						: b.категория.localeCompare(a.категория)
				case 'quantity':
					return sortDirection === 'asc'
						? (Number(a.количество) || 0) - (Number(b.количество) || 0)
						: (Number(b.количество) || 0) - (Number(a.количество) || 0)
				case 'availability':
					return sortDirection === 'asc'
						? a.наличие.localeCompare(b.наличие)
						: b.наличие.localeCompare(a.наличие)
				case 'color':
					return sortDirection === 'asc'
						? a.цвет.join(',').localeCompare(b.цвет.join(','))
						: b.цвет.join(',').localeCompare(a.цвет.join(','))
				default:
					return 0
			}
		})
	}

	// Добавляем функцию удаления
	const handleDelete = async (productId: string) => {
		if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
			return
		}

		try {
			await deleteDoc(doc(db, 'products', productId))
			await fetchProducts()
			alert('Товар успешно удален!')
		} catch (error) {
			console.error('Ошибка при удалении товара:', error)
			alert('Ошибка при удалении товара')
		}
	}

	// Функция для открытия модального окна редактирования
	const handleEdit = (product: ProductData) => {
		setEditingProduct(product)
		setIsEditModalOpen(true)
	}

	// Функция для сох изменений
	const handleSaveEdit = async () => {
		if (!editingProduct?.id) return

		try {
			const { id, ...updateData } = editingProduct
			const productRef = doc(db, 'products', id)
			await updateDoc(productRef, updateData)
			await fetchProducts()
			setIsEditModalOpen(false)
			setEditingProduct(null)
			alert('Товар успешно обновлен!')
		} catch (error) {
			console.error('Ошибка при обновлении товара:', error)
			alert('Ошибка при обновлении товара')
		}
	}

	const exportToExcel = () => {
		try {
			// Подготовка данных для экспорта
			const exportData = products.map(product => ({
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
			}))

			// Создание рабочей книги
			const ws = XLSX.utils.json_to_sheet(exportData)
			const wb = XLSX.utils.book_new()
			XLSX.utils.book_append_sheet(wb, ws, 'Products')

			// Сохранение файла
			XLSX.writeFile(wb, 'products.xlsx')
		} catch (error) {
			console.error('Ошибка при экспорте:', error)
			alert('Ошибка при экспорте данных')
		}
	}

	const importFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const file = e.target.files?.[0]
			if (!file) return

			const reader = new FileReader()
			reader.onload = async e => {
				try {
					const data = e.target?.result
					const workbook = XLSX.read(data, { type: 'binary' })
					const sheetName = workbook.SheetNames[0]
					const sheet = workbook.Sheets[sheetName]
					const jsonData = XLSX.utils.sheet_to_json(sheet)

					// Получаем существующие товары для проверки дубликатов
					const existingProducts = products.map(item => ({
						название: item.название,
						размер: item.размер,
						марка: item.марка,
					}))

					// Преобразование и валидация данных
					const productsToImport = jsonData.map((item: any) => ({
						название: item['Название'] || '',
						размер: item['Размер'] || '',
						цена: Number(item['Цена']) || 0,
						цвет: item['Цвет']
							? item['Цвет']
									.split(', ')
									.filter((c: string) =>
										COLORS.includes(c as (typeof COLORS)[number])
									)
							: [],
						типКартона: CARDBOARD_TYPES.includes(item['Тип картона'])
							? item['Тип картона']
							: 'микрогофра',
						марка: item['Марка'] || '',
						категория: CATEGORIES.includes(item['Категория'])
							? item['Категория']
							: 'самосборные',
						количество: Number(item['Количество в упаковке']) || 0,
						наличие: AVAILABILITY_STATUS.includes(item['Наличие'])
							? item['Наличие']
							: 'в наличии',
						изображение: item['Изображение'] || '',
					}))

					// Фильруем дубликаты
					const uniqueProducts = productsToImport.filter(newProduct => {
						return !existingProducts.some(
							existingProduct =>
								existingProduct.название === newProduct.название &&
								existingProduct.размер === newProduct.размер &&
								existingProduct.марка === newProduct.марка
						)
					})

					const skippedCount = productsToImport.length - uniqueProducts.length

					if (uniqueProducts.length === 0) {
						alert('Все товары уже существуют в базе данных')
						return
					}

					// Проверка обязательных полей перед импортом
					const invalidProducts = uniqueProducts.filter(
						product => !product.название || !product.размер || !product.марка
					)

					if (invalidProducts.length > 0) {
						throw new Error(
							'Некоторые записи содержат пустые обязательные поля'
						)
					}

					// Добавление только уникальных товаров
					for (const product of uniqueProducts) {
						await addDoc(collection(db, 'products'), product)
					}

					await fetchProducts()
					alert(
						`Импорт завершен:\n` +
							`- Добавлено новых товаров: ${uniqueProducts.length}\n` +
							`- Пропущено дубликатов: ${skippedCount}`
					)
				} catch (error) {
					console.error('Ошибка при импорте:', error)
					alert('Ошибка при импорте данных: ' + (error as Error).message)
				}
			}
			reader.readAsBinaryString(file)
		} catch (error) {
			console.error('Ошибка при чтении файла:', error)
			alert('Ошибка при чтении файла')
		}
	}

	// Обновляем функцию uploadToImgur
	const uploadToImgur = async (file: File): Promise<string> => {
		const formData = new FormData()
		formData.append('image', file)

		try {
			const response = await fetch('https://api.imgur.com/3/upload', {
				method: 'POST',
				headers: {
					Authorization: 'Client-ID b4f0a3b82615df1',
					Accept: 'application/json',
				},
				body: formData,
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const data = await response.json()
			if (data.success) {
				return data.data.link
			} else {
				throw new Error(data.data.error || 'Failed to upload image')
			}
		} catch (error) {
			console.error('Error uploading image:', error)
			throw error
		}
	}

	// В компоненте AdminPanel добавляем обработчик загрузки изображения
	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		try {
			const imageUrl = await uploadToImgur(file)
			setProductData(prev => ({
				...prev,
				изображение: imageUrl,
			}))
		} catch (error) {
			alert('Ошибка при загрузке изображения')
		}
	}

	// Добавляем функцию обрабтки изменений в форме склада
	const handleWarehouseInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target

		if (name === 'стоимость' || name === 'количество') {
			setWarehouseData(prev => ({
				...prev,
				[name]: value === '' ? 0 : Number(value),
			}))
		} else if (name === 'цвет') {
			const checkbox = e.target as HTMLInputElement
			setWarehouseData(prev => ({
				...prev,
				цвет: checkbox.checked
					? [...prev.цвет, value]
					: prev.цвет.filter(color => color !== value),
			}))
		} else {
			setWarehouseData(prev => ({
				...prev,
				[name]: value,
			}))
		}
	}

	// Добавляем функцию для обработки выбора связанных товаров
	const handleProductSelection = (productId: string) => {
		const product = products.find(p => p.id === productId)
		if (!product) return

		setWarehouseData(prev => ({
			...prev,
			связанныеТовары: [
				...prev.связанныеТовары,
				{
					id: productId,
					название: product.название,
					размер: product.размер,
				},
			],
		}))
	}

	// Добавляем функцию удаления связанного товара
	const handleRemoveLinkedProduct = (productId: string) => {
		setWarehouseData(prev => ({
			...prev,
			связанныеТовары: prev.связанныеТовары.filter(p => p.id !== productId),
		}))
	}

	// Добавляем функцию сохранения складской позиции
	const handleWarehouseSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (
			!warehouseData.размерЛиста ||
			warehouseData.связанныеТовары.length === 0
		) {
			alert('Пожалуйста, заполните все обязательные поля')
			return
		}

		setLoading(true)
		try {
			await addDoc(collection(db, 'warehouse'), warehouseData)

			// Очищаем форму
			setWarehouseData({
				размерЛиста: '',
				размерРелевки: 0,
				связанныеТовары: [],
				количество: 0,
				стоимость: 0,
				статус: 'В наличии',
				цвет: [],
				типКартона: 'микрогофра',
			})

			await fetchWarehouseItems()
			alert('Складская позиция успешо добавлена!')
		} catch (error) {
			console.error('Ошибка при добавлении складской позиции:', error)
			alert('Ошибка при добавлении складской позиции')
		} finally {
			setLoading(false)
		}
	}

	// Добавляем функции для работы со складскими позициями
	const handleWarehouseEdit = (item: WarehouseItem) => {
		setEditingWarehouseItem(item)
		setIsWarehouseEditModalOpen(true)
	}

	const handleWarehouseDelete = async (itemId: string) => {
		if (!window.confirm('Вы уверены, что хотите удалить эту позицию?')) {
			return
		}

		try {
			await deleteDoc(doc(db, 'warehouse', itemId))
			await fetchWarehouseItems()
			alert('Позиция успешно удалена!')
		} catch (error) {
			console.error('Ошибка при удалении позиции:', error)
			alert('Ошибка при удалении позиции')
		}
	}

	const handleSaveWarehouseEdit = async () => {
		if (!editingWarehouseItem?.id) return

		try {
			const { id, ...updateData } = editingWarehouseItem
			const warehouseRef = doc(db, 'warehouse', id)
			await updateDoc(warehouseRef, updateData)
			await fetchWarehouseItems()
			setIsWarehouseEditModalOpen(false)
			setEditingWarehouseItem(null)
			alert('Позиция успешно обновлена!')
		} catch (error) {
			console.error('Ошибка при обновлении позиции:', error)
			alert('Ошибка при обновлении позиции')
		}
	}

	// Добавляем функции экспорта и импорта для складского учета
	const exportWarehouseToExcel = () => {
		try {
			// Подготовка данных для экспорта
			const exportData = warehouseItems.map(item => ({
				'Размер листа': item.размерЛиста,
				'Размер релевки': item.размерРелевки, // Добавляем новое поле
				'Связанные товары': item.связанныеТовары
					.map(product => `${product.название} (${product.размер})`)
					.join('; '),
				Количество: item.количество,
				Стоимость: item.стоимость,
				Статус: item.статус,
				Цвет: item.цвет.join(', '),
				'Тип картона': item.типКартона,
			}))

			// Создание рабочей книги
			const ws = XLSX.utils.json_to_sheet(exportData)
			const wb = XLSX.utils.book_new()
			XLSX.utils.book_append_sheet(wb, ws, 'Warehouse')

			// Сохранение файла
			XLSX.writeFile(wb, 'warehouse.xlsx')
		} catch (error) {
			console.error('Ошибка при экспорте:', error)
			alert('Ошибка при экспорте данных')
		}
	}

	const importWarehouseFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const file = e.target.files?.[0]
			if (!file) return

			const reader = new FileReader()
			reader.onload = async e => {
				try {
					const data = e.target?.result
					const workbook = XLSX.read(data, { type: 'binary' })
					const sheetName = workbook.SheetNames[0]
					const sheet = workbook.Sheets[sheetName]
					const jsonData = XLSX.utils.sheet_to_json(sheet)

					// Получаем существующие позиции для проверки дубликатов
					const existingItems = warehouseItems.map(item => ({
						размерЛиста: item.размерЛиста,
						размерРелевки: item.размерРелевки, // Добавляем новое поле
						связанныеТоварыIds: item.связанныеТовары
							.map(p => p.id)
							.sort()
							.join(','),
					}))

					// Преобразование и валидация данных
					const warehouseItemsToImport = jsonData.map((item: any) => {
						// Парсим связанные товары из строки
						const связанныеТоварыStr = item['Связанные товары'] || ''
						const связанныеТовары = связанныеТоварыStr
							.split(';')
							.map((productStr: string) => {
								const match = productStr.trim().match(/^(.+) \((.+)\)$/)
								if (match) {
									const название = match[1]
									const размер = match[2]
									// Находим ID товара по названию и размеру
									const product = products.find(
										p => p.название === название && p.размер === размер
									)
									return product
										? {
												id: product.id!,
												название,
												размер,
										  }
										: null
								}
								return null
							})
							.filter(Boolean)

						return {
							размерЛиста: item['Размер листа'] || '',
							размерРелевки: item['Размер релевки'] || '', // Добавляем новое поле
							связанныеТовары,
							количество: Number(item['Количество']) || 0,
							стоимость: Number(item['Стоимость']) || 0,
							статус: WAREHOUSE_STATUSES.includes(item['Статус'])
								? item['Статус']
								: 'В наличии',
							цвет: item['Цвет'] ? item['Цвет'].split(', ') : [], // Исправляем на массив
							типКартона: item['Тип картона'] || 'микрогофра',
						} as WarehouseItem
					})

					// Фильтруем дубликаты
					const uniqueItems = warehouseItemsToImport.filter(newItem => {
						const связанныеТоварыIds = newItem.связанныеТовары
							.map(p => p.id)
							.sort()
							.join(',')
						const isDuplicate = existingItems.some(
							existingItem =>
								existingItem.размерЛиста === newItem.размерЛиста &&
								existingItem.связанныеТоварыIds === связанныеТоварыIds
						)
						return !isDuplicate
					})

					const skippedCount =
						warehouseItemsToImport.length - uniqueItems.length

					if (uniqueItems.length === 0) {
						alert('Все позиции уже существуют в базе данных')
						return
					}

					// Проверка обязательных полей перед импортом
					const invalidItems = uniqueItems.filter(
						item => !item.размерЛиста || item.связанныеТовары.length === 0
					)

					if (invalidItems.length > 0) {
						throw new Error(
							'Некоторые записи содержат пустые обязательные поля'
						)
					}

					// Добавление только уникальных позиции
					for (const item of uniqueItems) {
						await addDoc(collection(db, 'warehouse'), item)
					}

					await fetchWarehouseItems()
					alert(
						`Импорт завершен:\n` +
							`- Добавлено новых позиций: ${uniqueItems.length}\n` +
							`- Пропущено дубликатов: ${skippedCount}`
					)
				} catch (error) {
					console.error('Ошибка при импорте:', error)
					alert('Ошибка при импорте данных: ' + (error as Error).message)
				}
			}
			reader.readAsBinaryString(file)
		} catch (error) {
			console.error('Ошибка при чтении файла:', error)
			alert('Ошибка при чтении файла')
		}
	}

	// Функция расчета себестоимости
	const calculateCostPrice = (
		quantity: number,
		sheetCost: number,
		piecesPerSheet: number
	) => {
		if (piecesPerSheet <= 0) return 0
		return (sheetCost / piecesPerSheet) * quantity
	}

	// Обновляем handleProfitSubmit
	const handleProfitSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!profitData.товар.id || !profitData.лист) {
			alert('Пожалуйста, выберите товар и лист')
			return
		}

		if (profitData.штукСЛиста <= 0) {
			alert('Количество штук с листа должно быть больше 0')
			return
		}

		setLoading(true)
		try {
			const себестоимость = calculateCostPrice(
				profitData.количество,
				profitData.лист.стоимость,
				profitData.штукСЛиста
			)
			const прибыль =
				profitData.ценаПродажи * profitData.количество - себестоимость

			const dataToSubmit = {
				...profitData,
				себестоимость,
				прибыль,
			}

			await addDoc(collection(db, 'profit'), dataToSubmit)

			// Очищаем форму
			setProfitData({
				дата: new Date().toISOString().split('T')[0],
				товар: {
					id: '',
					название: '',
					размер: '',
				},
				лист: undefined,
				штукСЛиста: 0,
				количество: 0,
				ценаПродажи: 0,
				себестоимость: 0,
				примечание: '',
			})

			await fetchProfitRecords()
			alert('Запись успешно добавлена!')
		} catch (error) {
			console.error('Ошибка при добавлении записи:', error)
			alert('Ошибка при добавлении записи')
		} finally {
			setLoading(false)
		}
	}

	// Функция удаления записи прибыли
	const handleProfitDelete = async (recordId: string) => {
		if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) {
			return
		}

		try {
			await deleteDoc(doc(db, 'profit', recordId))
			await fetchProfitRecords()
			alert('Запись успешно удалена!')
		} catch (error) {
			console.error('Ошибка при удалении записи:', error)
			alert('Ошибка при удалении записи')
		}
	}

	// Функция экспорта записей прибыли в Excel
	const exportProfitToExcel = () => {
		try {
			const exportData = profitRecords.map(record => ({
				Дата: record.дата,
				'Название товара': record.товар.название,
				'Размер товара': record.товар.размер,
				Количество: record.количество,
				'Цена продажи': record.ценаПродажи,
				Себестоимость: record.себестоимость,
				Прибыль: record.прибыль,
				Примечание: record.примечание || '',
				Лист: record.лист?.размерЛиста || '-',
				'Штук с листа': record.штукСЛиста,
			}))

			const ws = XLSX.utils.json_to_sheet(exportData)
			const wb = XLSX.utils.book_new()
			XLSX.utils.book_append_sheet(wb, ws, 'Profit')

			XLSX.writeFile(wb, 'profit.xlsx')
		} catch (error) {
			console.error('Ошибка при экспорте:', error)
			alert('Ошибка при экспорте данных')
		}
	}

	// Добавляем функцию обработки изменений при редактировании товара
	const handleEditInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target

		if (!editingProduct) return

		if (name === 'цена') {
			setEditingProduct(prev => ({
				...prev!,
				[name]: value === '' ? '' : Number(parseFloat(value).toFixed(2)),
			}))
		} else if (name === 'количество') {
			setEditingProduct(prev => ({
				...prev!,
				[name]: value === '' ? '' : Number(value),
			}))
		} else if (name === 'цвет') {
			const checkbox = e.target as HTMLInputElement
			setEditingProduct(prev => ({
				...prev!,
				цвет: checkbox.checked
					? [...prev!.цвет, value]
					: prev!.цвет.filter(color => color !== value),
			}))
		} else {
			setEditingProduct(prev => ({
				...prev!,
				[name]: value,
			}))
		}
	}

	// Добавляем функцию обработки изменений при редактировании складской позиции
	const handleEditWarehouseInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target

		if (!editingWarehouseItem) return

		if (
			name === 'стоимость' ||
			name === 'количество' ||
			name === 'размерРелевки'
		) {
			setEditingWarehouseItem(prev => ({
				...prev!,
				[name]: value === '' ? 0 : Number(value),
			}))
		} else if (name === 'цвет') {
			const checkbox = e.target as HTMLInputElement
			setEditingWarehouseItem(prev => ({
				...prev!,
				цвет: checkbox.checked
					? [...prev!.цвет, value]
					: prev!.цвет.filter(color => color !== value),
			}))
		} else {
			setEditingWarehouseItem(prev => ({
				...prev!,
				[name]: value,
			}))
		}
	}

	// Добавляем функцию подсчета общей суммы
	const calculateTotalWarehouseValue = () => {
		return warehouseItems.reduce(
			(total, item) => total + item.стоимость * item.количество,
			0
		)
	}

	// Заменяем функцию подготовки данных для графика
	const prepareChartData = (
		profitRecords: ProfitRecord[],
		totalWarehouseValue: number
	) => {
		// Считаем общую сумму прибыли
		const totalProfit = profitRecords.reduce(
			(sum, record) => sum + (record.прибыль || 0),
			0
		)

		return {
			labels: ['Доходы', 'Расходы'],
			datasets: [
				{
					data: [totalProfit, totalWarehouseValue],
					backgroundColor: [
						'rgba(75, 192, 192, 0.6)', // Зеленый для доходов
						'rgba(255, 99, 132, 0.6)', // Красный для расходов
					],
					borderColor: ['rgb(75, 192, 192)', 'rgb(255, 99, 132)'],
					borderWidth: 1,
				},
			],
		}
	}

	// Обновляем опции графика
	const chartOptions = {
		responsive: true,
		plugins: {
			legend: {
				position: 'top' as const,
			},
			title: {
				display: true,
				text: 'Соотношение доходов и расходов',
			},
			tooltip: {
				callbacks: {
					label: function (context: any) {
						const value = context.raw
						const formattedValue = new Intl.NumberFormat('ru-RU', {
							style: 'currency',
							currency: 'RUB',
							maximumFractionDigits: 0,
						}).format(value)
						return `${context.label}: ${formattedValue}`
					},
				},
			},
		},
	} as const

	// Перемещаем модальные окна внутрь return statement
	return (
		<div className='min-h-screen bg-gray-100'>
			{/* Header */}
			<div className='flex justify-between items-center px-8 py-6 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 shadow-lg rounded-b-3xl relative'>
				<div className='flex items-center gap-4'>
					<span className='bg-white rounded-full p-1 shadow-md'>
						<UserCircle className='h-10 w-10 text-blue-500' />
					</span>
					<div>
						<h1 className='text-3xl font-bold text-white drop-shadow'>
							Админ панель
						</h1>
						<p className='text-blue-100 mt-1 text-sm flex items-center gap-1'>
							<UserCircle className='h-4 w-4 inline-block' />{' '}
							{currentUser?.email}
						</p>
					</div>
				</div>
				<button
					onClick={handleLogout}
					className='px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2 shadow-lg text-base font-semibold'
				>
					<LogOut className='h-5 w-5' /> Выйти
				</button>
			</div>

			{/* Tabs */}
			<div className='mb-8 px-8'>
				<div className='flex border-b border-gray-200 gap-2'>
					<button
						onClick={() => setActiveTab('products')}
						className={`flex items-center gap-2 px-6 py-4 text-base font-medium transition-all duration-200 rounded-t-xl focus:outline-none ${
							activeTab === 'products'
								? 'bg-white shadow text-blue-600 border-b-2 border-blue-500 -mb-px'
								: 'text-gray-500 hover:text-blue-500 bg-transparent'
						}`}
					>
						<Box className='h-5 w-5' /> Товары
					</button>
					<button
						onClick={() => setActiveTab('warehouse')}
						className={`flex items-center gap-2 px-6 py-4 text-base font-medium transition-all duration-200 rounded-t-xl focus:outline-none ${
							activeTab === 'warehouse'
								? 'bg-white shadow text-blue-600 border-b-2 border-blue-500 -mb-px'
								: 'text-gray-500 hover:text-blue-500 bg-transparent'
						}`}
					>
						<Warehouse className='h-5 w-5' /> Склад
					</button>
					<button
						onClick={() => setActiveTab('profit')}
						className={`flex items-center gap-2 px-6 py-4 text-base font-medium transition-all duration-200 rounded-t-xl focus:outline-none ${
							activeTab === 'profit'
								? 'bg-white shadow text-blue-600 border-b-2 border-blue-500 -mb-px'
								: 'text-gray-500 hover:text-blue-500 bg-transparent'
						}`}
					>
						<BarChart2 className='h-5 w-5' /> Прибыль
					</button>
				</div>
			</div>

			{/* Dashboard Cards */}
			<div className='px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				<div className='bg-white rounded-2xl shadow flex items-center gap-4 p-6'>
					<Box className='h-8 w-8 text-blue-500' />
					<div>
						<div className='text-2xl font-bold text-gray-800'>
							{products.length}
						</div>
						<div className='text-gray-500 text-sm'>Товаров</div>
					</div>
				</div>
				<div className='bg-white rounded-2xl shadow flex items-center gap-4 p-6'>
					<Warehouse className='h-8 w-8 text-yellow-500' />
					<div>
						<div className='text-2xl font-bold text-gray-800'>
							{warehouseItems.length}
						</div>
						<div className='text-gray-500 text-sm'>Позиций на складе</div>
					</div>
				</div>
				<div className='bg-white rounded-2xl shadow flex items-center gap-4 p-6'>
					<BarChart2 className='h-8 w-8 text-green-500' />
					<div>
						<div className='text-2xl font-bold text-gray-800'>
							{new Intl.NumberFormat('ru-RU', {
								style: 'currency',
								currency: 'RUB',
								maximumFractionDigits: 0,
							}).format(
								profitRecords.reduce(
									(sum, record) => sum + (record.прибыль || 0),
									0
								)
							)}
						</div>
						<div className='text-gray-500 text-sm'>Общая прибыль</div>
					</div>
				</div>
				<div className='bg-white rounded-2xl shadow flex items-center gap-4 p-6'>
					<BarChart2 className='h-8 w-8 text-red-500 rotate-180' />
					<div>
						<div className='text-2xl font-bold text-gray-800'>
							{new Intl.NumberFormat('ru-RU', {
								style: 'currency',
								currency: 'RUB',
								maximumFractionDigits: 0,
							}).format(calculateTotalWarehouseValue())}
						</div>
						<div className='text-gray-500 text-sm'>Общие расходы</div>
					</div>
				</div>
			</div>

			{/* Content */}
			{activeTab === 'products' && (
				<>
					{/* Existing Products Content */}
					<div className='flex justify-center items-center mb-8 px-2'>
						<div className='w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 sm:p-10 flex flex-col gap-6'>
							<div className='mb-2'>
								<h2 className='text-3xl font-bold text-gray-800 mb-1 text-center'>
									Добавить новый товар
								</h2>
								<p className='text-gray-500 text-center text-base'>
									Заполните все поля для добавления нового товара в каталог
								</p>
							</div>
							<form
								onSubmit={handleSubmit}
								className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6'
							>
								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Название
									</label>
									<input
										type='text'
										name='название'
										value={productData.название}
										onChange={handleInputChange}
										className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent transition-all duration-200'
										required
									/>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Размер (д x ш x в)
									</label>
									<input
										type='text'
										name='размер'
										placeholder='например: 100x50x30'
										pattern='\d+x\d+x\d+'
										value={productData.размер}
										onChange={handleInputChange}
										className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent transition-all duration-200'
										required
									/>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700 flex items-center gap-1'>
										Цена{' '}
										<span>
											<Box className='h-4 w-4 text-gray-400' />
										</span>
									</label>
									<div className='relative'>
										<input
											type='number'
											name='цена'
											min='0'
											step='0.01'
											value={productData.цена}
											onChange={handleInputChange}
											className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pl-10'
											required
										/>
										<span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
											<Box className='h-4 w-4' />
										</span>
										<span className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'>
											₽
										</span>
									</div>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Цвет
									</label>
									<div className='flex gap-4'>
										{COLORS.map(color => (
											<label key={color} className='flex items-center gap-2'>
												<input
													type='checkbox'
													name='цвет'
													value={color}
													checked={productData.цвет.includes(color)}
													onChange={handleInputChange}
												/>
												{color}
											</label>
										))}
									</div>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Тип картона
									</label>
									<div className='relative'>
										<input
											type='text'
											list='cardboardTypes'
											name='типКартона'
											value={productData.типКартона}
											onChange={handleInputChange}
											className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent transition-all duration-200'
											required
										/>
										<datalist id='cardboardTypes'>
											{CARDBOARD_TYPES.map(type => (
												<option key={type} value={type} />
											))}
										</datalist>
									</div>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Материал
									</label>
									<input
										type='text'
										name='марка'
										value={productData.марка}
										onChange={handleInputChange}
										className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent transition-all duration-200'
										required
									/>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Категория
									</label>
									<div className='relative'>
										<input
											type='text'
											list='categories'
											name='категория'
											value={productData.категория}
											onChange={handleInputChange}
											className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent transition-all duration-200'
											required
										/>
										<datalist id='categories'>
											{CATEGORIES.map(category => (
												<option key={category} value={category} />
											))}
										</datalist>
									</div>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700 flex items-center gap-1'>
										Количество в упаковке{' '}
										<span>
											<Package className='h-4 w-4 text-gray-400' />
										</span>
									</label>
									<div className='relative'>
										<input
											type='number'
											name='количество'
											min='1'
											value={productData.количество}
											onChange={handleInputChange}
											className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pl-10'
											required
										/>
										<span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
											<Package className='h-4 w-4' />
										</span>
										<span className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'>
											шт
										</span>
									</div>
									<p className='text-sm text-gray-500 mt-1'>
										Укажите количество коробок в одной упаковке
									</p>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Наличие
									</label>
									<div className='relative'>
										<input
											type='text'
											list='availabilityStatuses'
											name='наличие'
											value={productData.наличие}
											onChange={handleInputChange}
											className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent transition-all duration-200'
											required
										/>
										<datalist id='availabilityStatuses'>
											{AVAILABILITY_STATUS.map(status => (
												<option key={status} value={status} />
											))}
										</datalist>
									</div>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Изображение
									</label>
									<div className='flex items-center gap-4'>
										<input
											type='file'
											accept='image/*'
											onChange={handleImageUpload}
											className='hidden'
											id='image-upload'
										/>
										<label
											htmlFor='image-upload'
											className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 
                      transition-all duration-200 cursor-pointer flex items-center gap-2'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												className='h-5 w-5'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
											>
												<rect
													x='3'
													y='3'
													width='18'
													height='18'
													rx='2'
													ry='2'
												/>
												<circle cx='8.5' cy='8.5' r='1.5' />
												<polyline points='21 15 16 10 5 21' />
											</svg>
											Загрузить изображение
										</label>
										{productData.изображение && (
											<a
												href={productData.изображение}
												target='_blank'
												rel='noopener noreferrer'
												className='text-blue-600 hover:underline'
											>
												Просмотреть
											</a>
										)}
									</div>
								</div>

								<button
									type='submit'
									disabled={loading}
									className={`col-span-full mt-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-8 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg flex items-center justify-center gap-2 text-lg font-semibold ${
										loading ? 'opacity-50 cursor-not-allowed' : ''
									}`}
								>
									{loading ? (
										<>
											<svg
												className='animate-spin h-5 w-5 text-white'
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'
											>
												<circle
													className='opacity-25'
													cx='12'
													cy='12'
													r='10'
													stroke='currentColor'
													strokeWidth='4'
												></circle>
												<path
													className='opacity-75'
													fill='currentColor'
													d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
												></path>
											</svg>
											Добавление...
										</>
									) : (
										<>
											<Plus className='h-5 w-5' />
											Добавить товар
										</>
									)}
								</button>
							</form>
						</div>
					</div>

					{/* Products Table/Cards */}
					<div className='w-full'>
						<div className='flex justify-end mb-4'>
							{/* Сортировка */}
							<div className='flex items-center gap-2 text-gray-500 text-sm'>
								Сортировать по:
								<button
									onClick={() => handleSort('name')}
									className={`px-3 py-1 rounded transition-colors ${
										sortField === 'name'
											? 'bg-blue-100 text-blue-700 font-semibold'
											: 'hover:bg-gray-100'
									}`}
								>
									Название{' '}
									{sortField === 'name'
										? sortDirection === 'asc'
											? '↑'
											: '↓'
										: ''}
								</button>
								<button
									onClick={() => handleSort('price')}
									className={`px-3 py-1 rounded transition-colors ${
										sortField === 'price'
											? 'bg-blue-100 text-blue-700 font-semibold'
											: 'hover:bg-gray-100'
									}`}
								>
									Цена{' '}
									{sortField === 'price'
										? sortDirection === 'asc'
											? '↑'
											: '↓'
										: ''}
								</button>
								<button
									onClick={() => handleSort('availability')}
									className={`px-3 py-1 rounded transition-colors ${
										sortField === 'availability'
											? 'bg-blue-100 text-blue-700 font-semibold'
											: 'hover:bg-gray-100'
									}`}
								>
									Наличие{' '}
									{sortField === 'availability'
										? sortDirection === 'asc'
											? '↑'
											: '↓'
										: ''}
								</button>
							</div>
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
							{/* Карточки товаров */}
							{getSortedProducts().map(product => (
								<div
									key={product.id}
									className='bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4 relative group hover:shadow-2xl transition-shadow duration-200'
								>
									{product.изображение ? (
										<a
											href={product.изображение}
											target='_blank'
											rel='noopener noreferrer'
											className='block mb-2 rounded-lg overflow-hidden border border-gray-100'
										>
											<img
												src={product.изображение}
												alt={product.название}
												className='w-full h-40 object-cover object-center'
											/>
										</a>
									) : (
										<div className='block mb-2 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex flex-col items-center justify-center h-40'>
											<Box className='h-10 w-10 text-gray-300 mb-2' />
											<span className='text-gray-400 text-xs'>Нет фото</span>
										</div>
									)}
									<div className='flex-1'>
										<h3 className='text-lg font-bold text-gray-800 mb-1 flex items-center gap-2'>
											{product.название}
										</h3>
										<div className='text-gray-500 text-sm mb-2'>
											{product.размер}
										</div>
										<div className='flex flex-wrap gap-2 mb-2'>
											<span className='bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs'>
												{product.типКартона}
											</span>
											<span className='bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-xs'>
												{product.марка}
											</span>
											<span className='bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs'>
												{product.категория}
											</span>
										</div>
										<div className='flex flex-wrap gap-2 mb-2'>
											{product.цвет.map(color => (
												<span
													key={color}
													className='bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs'
												>
													{color}
												</span>
											))}
										</div>
										<div className='flex items-center gap-2 mb-2'>
											<span className='text-xl font-bold text-green-600'>
												{product.цена} ₽
											</span>
											<span className='text-gray-500 text-xs'>/упак.</span>
										</div>
										<div className='flex items-center gap-2 mb-2'>
											<span className='text-gray-700 text-sm'>В упаковке:</span>
											<span className='font-semibold'>
												{product.количество} шт.
											</span>
										</div>
										<div className='flex items-center gap-2 mb-2'>
											{product.наличие === 'в наличии' ? (
												<BadgeCheck className='h-4 w-4 text-green-500' />
											) : (
												<AlertTriangle className='h-4 w-4 text-yellow-500' />
											)}
											<span
												className={`px-2 py-1 rounded-full text-xs font-semibold ${
													product.наличие === 'в наличии'
														? 'bg-green-100 text-green-800'
														: 'bg-yellow-100 text-yellow-800'
												}`}
											>
												{product.наличие}
											</span>
										</div>
									</div>
									<div className='flex gap-2 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity'>
										<button
											onClick={() => handleEdit(product)}
											className='p-2 bg-blue-100 hover:bg-blue-200 rounded-full'
											title='Редактировать'
										>
											<Pencil className='h-5 w-5 text-blue-600' />
										</button>
										<button
											onClick={() => handleDelete(product.id!)}
											className='p-2 bg-red-100 hover:bg-red-200 rounded-full'
											title='Удалить'
										>
											<Trash2 className='h-5 w-5 text-red-600' />
										</button>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className='mt-8 flex flex-col sm:flex-row gap-4 justify-end'>
						<button
							onClick={exportToExcel}
							className='w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg 
                hover:bg-green-700 transition-all duration-200 flex items-center 
                justify-center gap-2 shadow-sm'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
								<polyline points='7 10 12 15 17 10' />
								<line x1='12' y1='15' x2='12' y2='3' />
							</svg>
							Экспорт в Excel
						</button>

						<label
							className='w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg 
              hover:bg-blue-700 transition-all duration-200 flex items-center 
              justify-center gap-2 shadow-sm cursor-pointer'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
								<polyline points='17 8 12 3 7 8' />
								<line x1='12' y1='3' x2='12' y2='15' />
							</svg>
							Импорт из Excel
							<input
								type='file'
								accept='.xlsx, .xls'
								onChange={importFromExcel}
								className='hidden'
							/>
						</label>
					</div>
				</>
			)}

			{activeTab === 'warehouse' && (
				<div className='space-y-8'>
					{/* Warehouse Content */}
					{/* Форма добавления складской позиции */}
					<div className='flex justify-center items-center mb-8 px-2'>
						<div className='w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 sm:p-10 flex flex-col gap-6'>
							<div className='mb-2'>
								<h2 className='text-3xl font-bold text-gray-800 mb-1 text-center'>
									Добавить складскую позицию
								</h2>
								<p className='text-gray-500 text-center text-base'>
									Заполните все поля для добавления новой позиции на склад
								</p>
							</div>
							<form
								onSubmit={handleWarehouseSubmit}
								className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6'
							>
								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Размер листа (длина x ширина)
									</label>
									<input
										type='text'
										name='размерЛиста'
										placeholder='например: 1000x800'
										pattern='\d+x\d+'
										value={warehouseData.размерЛиста}
										onChange={handleWarehouseInputChange}
										className='w-full px-4 py-2 border border-gray-200 rounded-lg'
										required
									/>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Размер релевки (мм)
									</label>
									<input
										type='number'
										name='размерРелевки'
										placeholder='например: 100'
										min='0'
										value={warehouseData.размерРелевки}
										onChange={handleWarehouseInputChange}
										className='w-full px-4 py-2 border border-gray-200 rounded-lg'
										required
									/>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Связанные товары
									</label>
									<div className='relative'>
										<input
											type='text'
											placeholder='Поиск товаров...'
											value={searchQuery}
											onChange={e => setSearchQuery(e.target.value)}
											className='w-full px-4 py-2 border border-gray-200 rounded-lg'
										/>
										{searchQuery && (
											<div className='absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
												{getFilteredProducts().map(product => (
													<button
														key={product.id}
														type='button'
														onClick={() => {
															handleProductSelection(product.id!)
															setSearchQuery('')
														}}
														className='w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center'
													>
														<span>{product.название}</span>
														<span className='text-gray-500 text-sm'>
															{product.размер}
														</span>
													</button>
												))}
												{getFilteredProducts().length === 0 && (
													<div className='px-4 py-2 text-gray-500'>
														Ничего не найдено
													</div>
												)}
											</div>
										)}
									</div>

									{/* Список выбранных товаров */}
									<div className='mt-2 space-y-2'>
										{warehouseData.связанныеТовары.map(product => (
											<div
												key={product.id}
												className='flex items-center justify-between bg-gray-50 p-2 rounded'
											>
												<span>
													{product.название} ({product.размер})
												</span>
												<button
													type='button'
													onClick={() => handleRemoveLinkedProduct(product.id)}
													className='text-red-600 hover:text-red-700'
												>
													✕
												</button>
											</div>
										))}
									</div>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Количество (шт.)
									</label>
									<input
										type='number'
										name='количество'
										min='0'
										value={warehouseData.количество}
										onChange={handleWarehouseInputChange}
										className='w-full px-4 py-2 border border-gray-200 rounded-lg'
										required
									/>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Стоимость
									</label>
									<div className='relative'>
										<input
											type='number'
											name='стоимость'
											min='0'
											step='0.01'
											value={warehouseData.стоимость}
											onChange={handleWarehouseInputChange}
											className='w-full px-4 py-2 border border-gray-200 rounded-lg'
											required
										/>
										<span className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'>
											₽
										</span>
									</div>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Статус
									</label>
									<select
										name='статус'
										value={warehouseData.статус}
										onChange={handleWarehouseInputChange}
										className='w-full px-4 py-2 border border-gray-200 rounded-lg'
										required
									>
										{WAREHOUSE_STATUSES.map(status => (
											<option key={status} value={status}>
												{status}
											</option>
										))}
									</select>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Цвет
									</label>
									<div className='flex gap-4'>
										{COLORS.map(color => (
											<label key={color} className='flex items-center gap-2'>
												<input
													type='checkbox'
													name='цвет'
													value={color}
													checked={warehouseData.цвет.includes(color)}
													onChange={handleWarehouseInputChange}
													className='text-blue-600 focus:ring-blue-500'
												/>
												{color}
											</label>
										))}
									</div>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Тип картона
									</label>
									<input
										type='text'
										name='типКартона'
										value={warehouseData.типКартона}
										onChange={handleWarehouseInputChange}
										className='w-full px-4 py-2 border border-gray-200 rounded-lg'
										required
									/>
								</div>

								<div className='md:col-span-2'>
									<button
										type='submit'
										disabled={loading}
										className={`w-full mt-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-8 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg flex items-center justify-center gap-2 text-lg font-semibold ${
											loading ? 'opacity-50 cursor-not-allowed' : ''
										}`}
									>
										{loading ? (
											<>
												<svg
													className='animate-spin h-5 w-5 text-white'
													xmlns='http://www.w3.org/2000/svg'
													fill='none'
													viewBox='0 0 24 24'
												>
													<circle
														className='opacity-25'
														cx='12'
														cy='12'
														r='10'
														stroke='currentColor'
														strokeWidth='4'
													></circle>
													<path
														className='opacity-75'
														fill='currentColor'
														d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
													></path>
												</svg>
												Добавление...
											</>
										) : (
											<>
												<Plus className='h-5 w-5' />
												Добавить позицию
											</>
										)}
									</button>
								</div>
							</form>
						</div>
					</div>

					{/* Таблица складских позиций */}
					<div className='bg-white rounded-xl shadow-sm overflow-hidden'>
						<div className='p-6'>
							<h2 className='text-2xl font-semibold text-gray-800 mb-6'>
								Складские позиции
							</h2>

							{/* Десктопная версия таблицы */}
							<div className='hidden md:block overflow-x-auto'>
								<table className='w-full'>
									<thead>
										<tr className='border-b border-gray-200'>
											<th className='text-left p-3'>Размер листа</th>
											<th className='text-left p-3'>Размер релевки</th>{' '}
											{/* Новая колонка */}
											<th className='text-left p-3'>Связанные товары</th>
											<th className='text-left p-3'>Количество</th>
											<th className='text-left p-3'>Стоимость</th>
											<th className='text-left p-3'>Статус</th>
											<th className='text-left p-3'>Цвет</th>
											<th className='text-left p-3'>Тип картона</th>
											<th className='text-left p-3'>Действия</th>
										</tr>
									</thead>
									<tbody>
										{warehouseItems.map(item => (
											<tr key={item.id} className='border-b border-gray-100'>
												<td className='p-3'>{item.размерЛиста}</td>
												<td className='p-3'>{item.размерРелевки}</td>{' '}
												{/* Новая ячейка */}
												<td className='p-3'>
													<div className='space-y-1'>
														{item.связанныеТовары.map(product => (
															<div key={product.id}>
																{product.название} ({product.размер})
															</div>
														))}
													</div>
												</td>
												<td className='p-3'>{item.количество}</td>
												<td className='p-3'>{item.стоимость} ₽</td>
												<td className='p-3'>
													<span
														className={`px-2 py-1 rounded-full text-sm ${
															item.статус === 'В наличии'
																? 'bg-green-100 text-green-800'
																: item.статус === 'В пути'
																? 'bg-yellow-100 text-yellow-800'
																: 'bg-red-100 text-red-800'
														}`}
													>
														{item.статус}
													</span>
												</td>
												<td className='p-3'>{item.цвет.join(', ')}</td>
												<td className='p-3'>{item.типКартона}</td>
												<td className='p-3'>
													<div className='flex gap-2'>
														<button
															onClick={() => handleWarehouseEdit(item)}
															className='p-1 hover:bg-gray-100 rounded-full transition-colors duration-200'
															title='Редактировать'
														>
															<Pencil className='h-5 w-5 text-blue-600' />
														</button>
														<button
															onClick={() => handleWarehouseDelete(item.id!)}
															className='p-1 hover:bg-gray-100 rounded-full transition-colors duration-200'
															title='Удалить'
														>
															<Trash2 className='h-5 w-5 text-red-600' />
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Мобильная версия - карточки */}
							<div className='md:hidden space-y-4'>
								{warehouseItems.map(item => (
									<div
										key={item.id}
										className='bg-white rounded-lg border border-gray-200 p-4 relative shadow-sm flex flex-col gap-2'
									>
										{/* Верхняя строка: размер листа, статус, кнопки */}
										<div className='flex justify-between items-start mb-2'>
											<div className='flex items-center gap-2'>
												<Warehouse className='h-5 w-5 text-blue-500' />
												<span className='font-semibold text-lg'>
													{item.размерЛиста}
												</span>
											</div>
											<div className='flex items-center gap-2'>
												<span
													className={`inline-block w-3 h-3 rounded-full mr-1 ${
														item.статус === 'В наличии'
															? 'bg-green-500'
															: item.статус === 'В пути'
															? 'bg-yellow-400'
															: 'bg-red-500'
													}`}
													title={item.статус}
												></span>
												<span className='text-xs font-medium'>
													{item.статус}
												</span>
												<button
													onClick={() => handleWarehouseEdit(item)}
													className='p-1 hover:bg-gray-100 rounded-full transition-colors duration-200 ml-2'
													title='Редактировать'
												>
													<Pencil className='h-5 w-5 text-blue-600' />
												</button>
												<button
													onClick={() => handleWarehouseDelete(item.id!)}
													className='p-1 hover:bg-gray-100 rounded-full transition-colors duration-200'
													title='Удалить'
												>
													<Trash2 className='h-5 w-5 text-red-600' />
												</button>
											</div>
										</div>
										{/* Блок связанных товаров */}
										<div className='flex items-center gap-2 mb-2'>
											<Box className='h-4 w-4 text-gray-500' />
											<span className='text-gray-600 text-sm font-medium'>
												Связанные товары:
											</span>
										</div>
										<div className='flex flex-wrap gap-2 mb-2'>
											{item.связанныеТовары.map(product => (
												<span
													key={product.id}
													className='bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs flex items-center gap-1 border border-blue-100'
												>
													<Package className='h-3 w-3' /> {product.название} (
													{product.размер})
												</span>
											))}
										</div>
										{/* Характеристики */}
										<div className='grid grid-cols-2 gap-2 text-sm'>
											<div className='flex items-center gap-1 text-gray-500'>
												<BarChart2 className='h-4 w-4' />
												<span>Релевка:</span>
											</div>
											<div>{item.размерРелевки} мм</div>
											<div className='flex items-center gap-1 text-gray-500'>
												<Package className='h-4 w-4' />
												<span>Кол-во:</span>
											</div>
											<div>{item.количество} шт.</div>
											<div className='flex items-center gap-1 text-gray-500'>
												<BadgeCheck className='h-4 w-4' />
												<span>Стоимость:</span>
											</div>
											<div>{item.стоимость} ₽</div>
											<div className='flex items-center gap-1 text-gray-500'>
												<Box className='h-4 w-4' />
												<span>Цвет:</span>
											</div>
											<div className='flex flex-wrap gap-1'>
												{item.цвет.map(color => (
													<span
														key={color}
														className='bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs'
													>
														{color}
													</span>
												))}
											</div>
											<div className='flex items-center gap-1 text-gray-500'>
												<Warehouse className='h-4 w-4' />
												<span>Тип картона:</span>
											</div>
											<div>{item.типКартона}</div>
										</div>
									</div>
								))}
							</div>
						</div>
						{/* Добавляем блок с общей суммой */}
						<div className='mt-6 pt-4 border-t border-gray-200'>
							<div className='flex justify-end items-center'>
								<div className='text-lg font-medium text-gray-700'>
									Общая стоимость:{' '}
									<span className='text-xl font-semibold text-blue-600'>
										{new Intl.NumberFormat('ru-RU', {
											style: 'currency',
											currency: 'RUB',
											minimumFractionDigits: 2,
										}).format(calculateTotalWarehouseValue())}
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className='mt-8 flex flex-col sm:flex-row gap-4 justify-end'>
						<button
							onClick={exportWarehouseToExcel}
							className='w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg 
                hover:bg-green-700 transition-all duration-200 flex items-center 
                justify-center gap-2 shadow-sm'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
								<polyline points='7 10 12 15 17 10' />
								<line x1='12' y1='15' x2='12' y2='3' />
							</svg>
							Экспорт в Excel
						</button>

						<label
							className='w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg 
              hover:bg-blue-700 transition-all duration-200 flex items-center 
              justify-center gap-2 shadow-sm cursor-pointer'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
								<polyline points='17 8 12 3 7 8' />
								<line x1='12' y1='3' x2='12' y2='15' />
							</svg>
							Импорт из Excel
							<input
								type='file'
								accept='.xlsx, .xls'
								onChange={importWarehouseFromExcel}
								className='hidden'
							/>
						</label>
					</div>
				</div>
			)}

			{activeTab === 'profit' && (
				<div className='space-y-8'>
					{/* Profit Content */}
					{/* Форма добавления записи прибыли */}
					<div className='flex justify-center items-center mb-8 px-2'>
						<div className='w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 sm:p-10 flex flex-col gap-6'>
							<div className='mb-2'>
								<h2 className='text-3xl font-bold text-gray-800 mb-1 text-center'>
									Добавить запись прибыли
								</h2>
								<p className='text-gray-500 text-center text-base'>
									Заполните все поля для учета прибыли по товару
								</p>
							</div>
							<form
								onSubmit={handleProfitSubmit}
								className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6'
							>
								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Дата
									</label>
									<input
										type='date'
										value={profitData.дата}
										onChange={e =>
											setProfitData({
												...profitData,
												дата: e.target.value,
											})
										}
										className='w-full px-4 py-2 border border-gray-200 rounded-lg'
										required
									/>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Товар
									</label>
									<div className='relative'>
										<input
											type='text'
											placeholder='Поиск товара...'
											value={searchQuery}
											onChange={e => setSearchQuery(e.target.value)}
											className='w-full px-4 py-2 border border-gray-200 rounded-lg'
										/>
										{searchQuery && (
											<div className='absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
												{getFilteredProducts().map(product => (
													<button
														key={product.id}
														type='button'
														onClick={() => {
															setProfitData({
																...profitData,
																товар: {
																	id: product.id!,
																	название: product.название,
																	размер: product.размер,
																},
															})
															setSearchQuery('')
														}}
														className='w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center'
													>
														<span>{product.название}</span>
														<span className='text-gray-500 text-sm'>
															{product.размер}
														</span>
													</button>
												))}
											</div>
										)}
									</div>
									{profitData.товар.id && (
										<div className='mt-2 p-2 bg-gray-50 rounded'>
											{profitData.товар.название} ({profitData.товар.размер})
										</div>
									)}
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Лист
									</label>
									<div className='relative'>
										<input
											type='text'
											placeholder='Поиск листа...'
											value={warehouseSearchQuery}
											onChange={e => setWarehouseSearchQuery(e.target.value)}
											className='w-full px-4 py-2 border border-gray-200 rounded-lg'
										/>
										{warehouseSearchQuery && (
											<div className='absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
												{warehouseItems
													.filter(item =>
														item.размерЛиста
															.toLowerCase()
															.includes(warehouseSearchQuery.toLowerCase())
													)
													.map(item => (
														<button
															key={item.id}
															type='button'
															onClick={() => {
																setProfitData({
																	...profitData,
																	лист: {
																		id: item.id!,
																		размерЛиста: item.размерЛиста,
																		стоимость: item.стоимость,
																	},
																})
																setWarehouseSearchQuery('')
															}}
															className='w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center'
														>
															<span>{item.размерЛиста}</span>
															<span className='text-gray-500 text-sm'>
																{item.стоимость} ₽
															</span>
														</button>
													))}
											</div>
										)}
									</div>
									{profitData.лист && (
										<div className='mt-2 p-2 bg-gray-50 rounded'>
											Лист: {profitData.лист.размерЛиста} (Стоимость:{' '}
											{profitData.лист.стоимость} ₽)
										</div>
									)}
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Штук с одного листа
									</label>
									<input
										type='number'
										min='1'
										value={profitData.штукСЛиста}
										onChange={e =>
											setProfitData({
												...profitData,
												штукСЛиста: Number(e.target.value),
											})
										}
										className='w-full px-4 py-2 border border-gray-200 rounded-lg'
										required
									/>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Количество
									</label>
									<input
										type='number'
										min='1'
										value={profitData.количество}
										onChange={e =>
											setProfitData({
												...profitData,
												количество: Number(e.target.value),
											})
										}
										className='w-full px-4 py-2 border border-gray-200 rounded-lg'
										required
									/>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Цена продажи
									</label>
									<div className='relative'>
										<input
											type='number'
											min='0'
											step='0.01'
											value={profitData.ценаПродажи}
											onChange={e =>
												setProfitData({
													...profitData,
													ценаПродажи: Number(e.target.value),
												})
											}
											className='w-full px-4 py-2 border border-gray-200 rounded-lg'
											required
										/>
										<span className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'>
											₽
										</span>
									</div>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										Примечание
									</label>
									<textarea
										value={profitData.примечание}
										onChange={e =>
											setProfitData({
												...profitData,
												примечание: e.target.value,
											})
										}
										className='w-full px-4 py-2 border border-gray-200 rounded-lg'
										rows={3}
									/>
								</div>

								<div className='md:col-span-2'>
									<button
										type='submit'
										disabled={loading}
										className={`w-full mt-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-8 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg flex items-center justify-center gap-2 text-lg font-semibold ${
											loading ? 'opacity-50 cursor-not-allowed' : ''
										}`}
									>
										{loading ? (
											<>
												<svg
													className='animate-spin h-5 w-5 text-white'
													xmlns='http://www.w3.org/2000/svg'
													fill='none'
													viewBox='0 0 24 24'
												>
													<circle
														className='opacity-25'
														cx='12'
														cy='12'
														r='10'
														stroke='currentColor'
														strokeWidth='4'
													></circle>
													<path
														className='opacity-75'
														fill='currentColor'
														d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
													></path>
												</svg>
												Добавление...
											</>
										) : (
											<>
												<Plus className='h-5 w-5' />
												Добавить запись
											</>
										)}
									</button>
								</div>
							</form>
						</div>
					</div>

					{/* Таблица записей прибыли */}
					<div className='bg-white rounded-xl shadow-sm overflow-hidden mb-8'>
						<div className='p-6'>
							<div className='flex justify-between items-center mb-6'>
								<h2 className='text-2xl font-semibold text-gray-800'>
									Соотношение доходов и расходов
								</h2>
								<button
									onClick={exportProfitToExcel}
									className='px-4 py-2 bg-green-600 text-white rounded-lg 
                    hover:bg-green-700 transition-all duration-200 flex items-center gap-2'
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-5 w-5'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									>
										<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
										<polyline points='7 10 12 15 17 10' />
										<line x1='12' y1='15' x2='12' y2='3' />
									</svg>
									Экспорт в Excel
								</button>
							</div>

							{/* Круговой график */}
							<div className='h-[400px] flex justify-center'>
								<div className='w-full md:w-[400px]'>
									<Pie
										options={chartOptions}
										data={prepareChartData(
											profitRecords,
											calculateTotalWarehouseValue()
										)}
									/>
								</div>
							</div>

							{/* Информация о прибыли и расходах */}
							<div className='mt-4 text-center'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='p-4 bg-green-50 rounded-lg'>
										<div className='text-sm text-gray-600'>Общая прибыль</div>
										<div className='text-xl font-semibold text-green-600'>
											{new Intl.NumberFormat('ru-RU', {
												style: 'currency',
												currency: 'RUB',
												maximumFractionDigits: 0,
											}).format(
												profitRecords.reduce(
													(sum, record) => sum + (record.прибыль || 0),
													0
												)
											)}
										</div>
									</div>
									<div className='p-4 bg-red-50 rounded-lg'>
										<div className='text-sm text-gray-600'>Общие расходы</div>
										<div className='text-xl font-semibold text-red-600'>
											{new Intl.NumberFormat('ru-RU', {
												style: 'currency',
												currency: 'RUB',
												maximumFractionDigits: 0,
											}).format(calculateTotalWarehouseValue())}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Таблица с записями */}
					<div className='bg-white rounded-xl shadow-sm overflow-hidden'>
						<div className='p-6'>
							<h2 className='text-2xl font-semibold text-gray-800 mb-6'>
								Записи прибыли
							</h2>

							{/* Десктопная версия таблицы */}
							<div className='hidden md:block overflow-x-auto'>
								<table className='w-full'>
									<thead>
										<tr className='border-b border-gray-200'>
											<th className='text-left p-3'>Дата</th>
											<th className='text-left p-3'>Товар</th>
											<th className='text-left p-3'>Лист</th>
											<th className='text-left p-3'>Штук с листа</th>
											<th className='text-left p-3'>Количество</th>
											<th className='text-left p-3'>Цена продажи</th>
											<th className='text-left p-3'>Себестоимость</th>
											<th className='text-left p-3'>Прибыль</th>
											<th className='text-left p-3'>Примечание</th>
											<th className='text-left p-3'>Действия</th>
										</tr>
									</thead>
									<tbody>
										{profitRecords.map(record => (
											<tr key={record.id} className='border-b border-gray-100'>
												<td className='p-3'>{record.дата}</td>
												<td className='p-3'>
													{record.товар.название} ({record.товар.размер})
												</td>
												<td className='p-3'>
													{record.лист?.размерЛиста || '-'}
												</td>
												<td className='p-3'>{record.штукСЛиста}</td>
												<td className='p-3'>{record.количество}</td>
												<td className='p-3'>{record.ценаПродажи} ₽</td>
												<td className='p-3'>{record.себестоимость} ₽</td>
												<td className='p-3'>
													<span
														className={`${
															record.прибыль && record.прибыль > 0
																? 'text-green-600'
																: 'text-red-600'
														}`}
													>
														{record.прибыль} ₽
													</span>
												</td>
												<td className='p-3'>{record.примечание}</td>
												<td className='p-3'>
													<button
														onClick={() => handleProfitDelete(record.id!)}
														className='p-1 hover:bg-gray-100 rounded-full transition-colors duration-200'
														title='Удалить'
													>
														<Trash2 className='h-5 w-5 text-red-600' />
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Мобильная версия - карточки */}
							<div className='md:hidden space-y-4'>
								{profitRecords.map(record => (
									<div
										key={record.id}
										className='bg-white rounded-lg border border-gray-200 p-4'
									>
										<div className='flex justify-between items-start mb-4'>
											<div>
												<div className='font-medium'>
													{record.товар.название}
												</div>
												<div className='text-sm text-gray-500'>
													{record.дата}
												</div>
											</div>
											<button
												onClick={() => handleProfitDelete(record.id!)}
												className='p-1 hover:bg-gray-100 rounded-full transition-colors duration-200'
												title='Удалить'
											>
												<Trash2 className='h-5 w-5 text-red-600' />
											</button>
										</div>

										<div className='space-y-2 text-sm'>
											<div className='grid grid-cols-2 gap-2'>
												<div className='text-gray-500'>Размер:</div>
												<div>{record.товар.размер}</div>
											</div>

											<div className='grid grid-cols-2 gap-2'>
												<div className='text-gray-500'>Лист:</div>
												<div>{record.лист?.размерЛиста || '-'}</div>
											</div>

											<div className='grid grid-cols-2 gap-2'>
												<div className='text-gray-500'>Штук с листа:</div>
												<div>{record.штукСЛиста}</div>
											</div>

											<div className='grid grid-cols-2 gap-2'>
												<div className='text-gray-500'>Количество:</div>
												<div>{record.количество}</div>
											</div>

											<div className='grid grid-cols-2 gap-2'>
												<div className='text-gray-500'>Цена продажи:</div>
												<div>{record.ценаПродажи} ₽</div>
											</div>

											<div className='grid grid-cols-2 gap-2'>
												<div className='text-gray-500'>Себестоимость:</div>
												<div>{record.себестоимость} ₽</div>
											</div>

											<div className='grid grid-cols-2 gap-2'>
												<div className='text-gray-500'>Прибыль:</div>
												<div
													className={`${
														record.прибыль && record.прибыль > 0
															? 'text-green-600'
															: 'text-red-600'
													}`}
												>
													{record.прибыль} ₽
												</div>
											</div>

											{record.примечание && (
												<div className='grid grid-cols-2 gap-2'>
													<div className='text-gray-500'>Примечание:</div>
													<div>{record.примечание}</div>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Модальное окно редактирования товара */}
			{isEditModalOpen && editingProduct && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<div className='bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-in'>
						<button
							onClick={() => setIsEditModalOpen(false)}
							className='absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors text-2xl font-bold p-1 rounded-full focus:outline-none'
							title='Закрыть'
						>
							&times;
						</button>
						<h2 className='text-3xl font-bold mb-6 text-gray-800 text-center'>
							Редактировать товар
						</h2>
						<form
							onSubmit={e => {
								e.preventDefault()
								handleSaveEdit()
							}}
							className='space-y-5'
						>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Название</label>
								<input
									type='text'
									name='название'
									value={editingProduct.название}
									onChange={handleEditInputChange}
									className='w-full px-4 py-2 border rounded-lg'
									required
								/>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Размер</label>
								<input
									type='text'
									name='размер'
									value={editingProduct.размер}
									onChange={handleEditInputChange}
									className='w-full px-4 py-2 border rounded-lg'
									required
								/>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Цена</label>
								<input
									type='number'
									name='цена'
									value={editingProduct.цена}
									onChange={handleEditInputChange}
									className='w-full px-4 py-2 border rounded-lg'
									required
								/>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Цвет</label>
								<div className='flex gap-4'>
									{COLORS.map(color => (
										<label key={color} className='flex items-center gap-2'>
											<input
												type='checkbox'
												name='цвет'
												value={color}
												checked={editingProduct.цвет.includes(color)}
												onChange={handleEditInputChange}
											/>
											{color}
										</label>
									))}
								</div>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Тип картона</label>
								<select
									name='типКартона'
									value={editingProduct.типКартона}
									onChange={handleEditInputChange}
									className='w-full px-4 py-2 border rounded-lg'
									required
								>
									{CARDBOARD_TYPES.map(type => (
										<option key={type} value={type}>
											{type}
										</option>
									))}
								</select>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Марка</label>
								<input
									type='text'
									name='марка'
									value={editingProduct.марка}
									onChange={handleEditInputChange}
									className='w-full px-4 py-2 border rounded-lg'
									required
								/>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Категория</label>
								<select
									name='категория'
									value={editingProduct.категория}
									onChange={handleEditInputChange}
									className='w-full px-4 py-2 border rounded-lg'
									required
								>
									{CATEGORIES.map(category => (
										<option key={category} value={category}>
											{category}
										</option>
									))}
								</select>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Количество</label>
								<input
									type='number'
									name='количество'
									value={editingProduct.количество}
									onChange={handleEditInputChange}
									className='w-full px-4 py-2 border rounded-lg'
									required
								/>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Наличие</label>
								<select
									name='наличие'
									value={editingProduct.наличие}
									onChange={handleEditInputChange}
									className='w-full px-4 py-2 border rounded-lg'
									required
								>
									{AVAILABILITY_STATUS.map(status => (
										<option key={status} value={status}>
											{status}
										</option>
									))}
								</select>
							</div>
							<div className='flex justify-end gap-4 mt-8'>
								<button
									type='button'
									onClick={() => setIsEditModalOpen(false)}
									className='px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium shadow-sm'
								>
									Отмена
								</button>
								<button
									type='submit'
									className='px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm'
								>
									Сохранить
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Модальное окно редактирования складской позиции */}
			{isWarehouseEditModalOpen && editingWarehouseItem && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<div className='bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-in'>
						<button
							onClick={() => setIsWarehouseEditModalOpen(false)}
							className='absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors text-2xl font-bold p-1 rounded-full focus:outline-none'
							title='Закрыть'
						>
							&times;
						</button>
						<h2 className='text-3xl font-bold mb-6 text-gray-800 text-center'>
							Редактировать складскую позицию
						</h2>
						<form
							onSubmit={e => {
								e.preventDefault()
								handleSaveWarehouseEdit()
							}}
							className='space-y-5'
						>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Размер листа</label>
								<input
									type='text'
									name='размерЛиста'
									value={editingWarehouseItem.размерЛиста}
									onChange={handleEditWarehouseInputChange}
									className='w-full px-4 py-2 border rounded-lg'
									required
								/>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Размер релевки</label>
								<input
									type='number'
									name='размерРелевки'
									value={editingWarehouseItem.размерРелевки}
									onChange={handleEditWarehouseInputChange}
									className='w-full px-4 py-2 border rounded-lg'
									required
								/>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Количество</label>
								<input
									type='number'
									name='количество'
									value={editingWarehouseItem.количество}
									onChange={handleEditWarehouseInputChange}
									className='w-full px-4 py-2 border rounded-lg'
									required
								/>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Стоимость</label>
								<input
									type='number'
									name='стоимость'
									value={editingWarehouseItem.стоимость}
									onChange={handleEditWarehouseInputChange}
									className='w-full px-4 py-2 border rounded-lg'
									required
								/>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Статус</label>
								<select
									name='статус'
									value={editingWarehouseItem.статус}
									onChange={handleEditWarehouseInputChange}
									className='w-full px-4 py-2 border rounded-lg'
									required
								>
									{WAREHOUSE_STATUSES.map(status => (
										<option key={status} value={status}>
											{status}
										</option>
									))}
								</select>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Цвет</label>
								<div className='flex gap-4'>
									{COLORS.map(color => (
										<label key={color} className='flex items-center gap-2'>
											<input
												type='checkbox'
												name='цвет'
												value={color}
												checked={editingWarehouseItem.цвет.includes(color)}
												onChange={handleEditWarehouseInputChange}
											/>
											{color}
										</label>
									))}
								</div>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Тип картона</label>
								<select
									name='типКартона'
									value={editingWarehouseItem.типКартона}
									onChange={handleEditWarehouseInputChange}
									className='w-full px-4 py-2 border rounded-lg'
									required
								>
									{CARDBOARD_TYPES.map(type => (
										<option key={type} value={type}>
											{type}
										</option>
									))}
								</select>
							</div>
							<div className='flex justify-end gap-4 mt-8'>
								<button
									type='button'
									onClick={() => setIsWarehouseEditModalOpen(false)}
									className='px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium shadow-sm'
								>
									Отмена
								</button>
								<button
									type='submit'
									className='px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm'
								>
									Сохранить
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* После закрывающего тега таблицы, но перед закрывающим div.p-6 */}
			<div className='mt-6 pt-4 border-t border-gray-200'>
				<div className='bg-blue-50 rounded-lg p-4'>
					<h3 className='text-lg font-medium text-blue-800 mb-2'>
						Формула расчета прибыли:
					</h3>
					<div className='text-blue-700'>
						<p className='mb-2'>
							Прибыль = (Цена продажи × Количество) - (Стоимость листа ÷ Штук с
							листа × Количество)
						</p>
						<p className='text-sm text-blue-600'>
							где:
							<br />• Цена продажи - цена за единицу товара
							<br />• Количество - общее количество проданных единиц
							<br />• Стоимость листа - стоимость одного листа материала
							<br />• Штук с листа - количество единиц товара, получаемых из
							одного листа
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AdminPanel
