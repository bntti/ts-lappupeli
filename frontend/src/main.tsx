import './css/index.css';
import './css/layout.css';
import './css/room.css';
import './css/word.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './app/App.js';
import { SocketEventStateProvider, UserStateProvider } from './app/StateProvider';

createRoot(document.querySelector('#root')!).render(
    <StrictMode>
        <UserStateProvider>
            <SocketEventStateProvider>
                <App />
            </SocketEventStateProvider>
        </UserStateProvider>
    </StrictMode>,
);
