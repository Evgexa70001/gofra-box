import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/Pages/HomePage'
import Login from './components/Pages/Login'
import AdminPanel from './components/Pages/AdminPanel'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import MainLayout from './components/Layout/MainLayout'
import { AuthProvider } from './contexts/AuthContext'
import ProductDetail from './components/Pages/ProductDetail'
import { CartProvider } from './context/CartContext'
import { HelmetProvider } from 'react-helmet-async'

/* eslint-disable react/function-component-definition */
const App = () => {
	return (
		<HelmetProvider>
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
							<Route
								path='/product/:id'
								element={
									<MainLayout>
										<ProductDetail />
									</MainLayout>
								}
							/>
						</Routes>
					</Router>
				</AuthProvider>
			</CartProvider>
		</HelmetProvider>
	)
}
/* eslint-enable react/function-component-definition */

export default App
