import { createBrowserRouter } from 'react-router'
import HomePage from '../../pages/HomePage/homepage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
])
