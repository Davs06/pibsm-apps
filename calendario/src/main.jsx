import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 1. Importamos o QueryClient e o Provider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 2. Criamos o nosso "Garçom" (o cliente que vai gerir o cache)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Os dados ficam "frescos" por 5 minutos antes de precisar buscar de novo no fundo
      refetchOnWindowFocus: true, // Se o usuário sair da aba do navegador e voltar, ele atualiza sozinho
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. Envolvemos o App com o Provider */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
