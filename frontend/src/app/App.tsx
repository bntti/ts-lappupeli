import { type JSX, type PropsWithChildren, type ReactNode, useContext, useEffect } from 'react';
import { Navigate, RouterProvider, createBrowserRouter, useNavigate } from 'react-router-dom';

import Root from './Root';
import { UserContext, UserSchema } from './StateProvider';
import CardRoute from '../routes/Card';
import HomeRoute from '../routes/Home';
import LoginRoute from '../routes/Login';
import LogoutRoute from '../routes/Logout';
import RoomRoute from '../routes/Room';

const RequireAuth = ({ children }: PropsWithChildren): ReactNode => {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const storageUser = localStorage.getItem('user');

    useEffect(() => {
        if (user !== null) return;
        if (storageUser) {
            try {
                const newUser = UserSchema.parse(JSON.parse(storageUser));
                setUser(newUser);
            } catch (error) {
                console.error(error);
                navigate('/logout');
            }
        }
    }, [user, storageUser, setUser, navigate]);

    if (user !== null) return children;
    if (storageUser) return <p>Loading</p>;

    return <Navigate replace to="/login" state={{ from: location.pathname }} />;
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            {
                path: '/',
                element: (
                    <RequireAuth>
                        <HomeRoute />
                    </RequireAuth>
                ),
            },
            { path: 'login', element: <LoginRoute /> },
            { path: 'logout', element: <LogoutRoute /> },
            {
                path: 'room/:roomId',
                element: (
                    <RequireAuth>
                        <RoomRoute />
                    </RequireAuth>
                ),
            },
            {
                path: 'room/:roomId/card',
                element: (
                    <RequireAuth>
                        <CardRoute />
                    </RequireAuth>
                ),
            },
        ],
    },
]);

const App = (): JSX.Element => <RouterProvider router={router} />;

export default App;
