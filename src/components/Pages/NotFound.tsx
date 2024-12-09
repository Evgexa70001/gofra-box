import React from 'react'
import { Link } from 'react-router-dom'

const NotFound: React.FC = () => {
	return (
		<div className='flex flex-col items-center justify-center min-h-[60vh] text-center'>
			<h1 className='text-4xl font-bold mb-4'>404</h1>
			<p className='text-xl mb-6'>Страница не найдена</p>
			<Link
				to='/'
				className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
			>
				Вернуться на главную
			</Link>
		</div>
	)
}

export default NotFound
