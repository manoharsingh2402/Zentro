import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client' 
import "stream-chat-react/dist/css/v2/index.css";
import './index.css' 
import {BrowserRouter} from 'react-router'
import App from './App.jsx'  

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient(); 

// react-query or tanstack query :-> 
// using tanstack query for data fetching and caching, it provides a powerful and efficient way to manage server state in React applications. It simplifies the process of fetching, caching, and updating data, making it easier to build responsive and performant applications. With features like automatic caching, background updates, and query invalidation, TanStack Query helps developers handle server state with ease and improves the overall user experience.

// useQuery (for get requests):-> is a hook provided by TanStack Query that allows you to fetch and manage data in your React components. It takes a query key and a function that returns a promise, and it handles the fetching, caching, and updating of the data for you. The useQuery hook provides an easy way to access the data, loading state, and error state in your components, making it simple to build responsive and efficient applications.

// useMutation (for post, put, delete requests):-> is a hook provided by TanStack Query that allows you to perform mutations (such as POST, PUT, DELETE requests) in your React components. It takes a mutation function that returns a promise and provides methods to trigger the mutation and manage its state. The useMutation hook helps you handle the process of sending data to the server, managing loading and error states, and updating the cache after a successful mutation, making it easier to build interactive and responsive applications.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>  
      {/* TANSTACK QUERY IN ENTIRE APP  */}
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
