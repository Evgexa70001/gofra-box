import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/Pages/HomePage'
import Login from './components/Auth/Login'
import AdminPanel from './components/Admin/AdminPanel'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import MainLayout from './components/Layout/MainLayout'
import { AuthProvider } from './contexts/AuthContext'
import ProductDetail from './components/Product/ProductDetail'
import { CartProvider } from './context/CartContext'

const App = () => {
	return (
		<CartProvider>
			<AuthProvider>
				<Router basename={import.meta.env.BASE_URL || '/'}>
					<Routes>
						<Route
							path='/'
							element={
								<MainLayout>
									<HomePage />
								</MainLayout>
							}
						/>
						<Route path='/login' element={<Login />} />
						<Route
							path='/admin'
							element={
								<ProtectedRoute>
									<AdminPanel />
								</ProtectedRoute>
							}
						/>
						<Route path='/product/:id' element={<ProductDetail />} />
					</Routes>
				</Router>
			</AuthProvider>
		</CartProvider>
	)
}

export default App
