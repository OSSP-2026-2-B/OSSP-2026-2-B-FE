import { RouterProvider } from 'react-router/dom'
import { router } from './router/router'
import RouteSearchProvider from '../shared/RouteSearchProvider'

export default function App() {
  return <RouteSearchProvider><RouterProvider router={router} /></RouteSearchProvider>
}
