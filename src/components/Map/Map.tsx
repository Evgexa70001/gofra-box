import { YMaps, Map as YMap, Placemark } from '@pbe/react-yandex-maps'

const Map = () => {
	const defaultState = {
		center: [44.050804, 43.153162],
		zoom: 13,
	}

	const MARKER_COORDINATES = [44.050804, 43.153162]

	return (
		<section className='w-full mb-20'>
			<h2 className='text-3xl font-bold mb-8'>Наш адрес</h2>
			<div className='h-[400px]'>
				<YMaps>
					<YMap defaultState={defaultState} width='100%' height='400px'>
						<Placemark
							geometry={MARKER_COORDINATES}
							options={{
								preset: 'islands#redDotIcon',
								iconColor: '#FF0000',
							}}
							properties={{
								balloonContent: 'Наш адрес',
								hintContent: 'Мы находимся здесь',
							}}
						/>
					</YMap>
				</YMaps>
			</div>
		</section>
	)
}

export default Map
