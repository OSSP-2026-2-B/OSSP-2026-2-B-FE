import { createBrowserRouter } from 'react-router'
import LandingPage from '../../pages/LandingPage'
import MainPage from '../../pages/MainPage/mainpage'
import HomePage from '../../pages/HomePage/HomePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/home',
    element: <HomePage />,
  },
  {
    path: '/main',
    element: <MainPage />,
  },
])
