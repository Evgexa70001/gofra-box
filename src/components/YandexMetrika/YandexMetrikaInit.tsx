declare global {
	interface Window {
		ym: (id: number, action: string, params: any) => void
	}
}

import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const YandexMetrikaInit = () => {
	const location = useLocation()
	const METRIKA_ID = import.meta.env.VITE_YANDEX_METRIKA_ID
	const isDevelopment = import.meta.env.DEV

	useEffect(() => {
		if (isDevelopment) {
			console.log('Yandex.Metrika disabled in development mode')
			return
		}

		if (typeof window.ym === 'function' && METRIKA_ID) {
			try {
				window.ym(
					Number(METRIKA_ID),
					'hit',
					window.location.pathname + window.location.search
				)
			} catch (error) {
				console.error('Yandex.Metrika error:', error)
			}
		}
	}, [location, METRIKA_ID, isDevelopment])

	return null
}

export default YandexMetrikaInit
