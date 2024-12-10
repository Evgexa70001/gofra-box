const ProductSkeleton = () => {
	return (
		<div className='bg-white rounded-xl shadow-md border border-gray-200 animate-pulse'>
			<div className='p-4'>
				<div className='bg-gray-200 h-40 -mx-4 -mt-4 mb-4'></div>

				<div className='h-6 bg-gray-200 rounded w-3/4 mb-3'></div>

				<div className='grid grid-cols-2 gap-x-4 gap-y-2'>
					<div className='space-y-2'>
						<div>
							<div className='h-4 bg-gray-200 rounded w-20 mb-1'></div>
							<div className='h-5 bg-gray-200 rounded w-24'></div>
						</div>

						<div>
							<div className='h-4 bg-gray-200 rounded w-16 mb-1'></div>
							<div className='h-5 bg-gray-200 rounded w-28'></div>
						</div>

						<div>
							<div className='h-4 bg-gray-200 rounded w-24 mb-1'></div>
							<div className='h-5 bg-gray-200 rounded w-32'></div>
						</div>
					</div>

					<div className='space-y-2'>
						<div>
							<div className='h-4 bg-gray-200 rounded w-16 mb-1'></div>
							<div className='h-5 bg-gray-200 rounded w-28'></div>
						</div>

						<div>
							<div className='h-4 bg-gray-200 rounded w-20 mb-1'></div>
							<div className='h-5 bg-gray-200 rounded w-24'></div>
						</div>

						<div>
							<div className='h-4 bg-gray-200 rounded w-16 mb-1'></div>
							<div className='h-5 bg-gray-200 rounded w-28'></div>
						</div>
					</div>
				</div>
			</div>

			<div className='px-4 pb-4'>
				<div className='pt-3 border-t border-gray-100'>
					<div className='flex items-end gap-3'>
						<div className='flex-1'>
							<div className='h-4 bg-gray-200 rounded w-24 mb-1'></div>
							<div className='h-9 bg-gray-200 rounded w-full'></div>
						</div>
						<div className='h-9 bg-gray-200 rounded w-24'></div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ProductSkeleton
