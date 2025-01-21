import { type JSX, useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';

import { UserContext } from './StateProvider';

const Root = (): JSX.Element => {
    const { user } = useContext(UserContext);

    return (
        <>
            <Outlet />
            {user && (
                <div className="footer">
                    <p>{user.username}</p>
                    <Link to="/logout">
                        <button type="button">Kirjaudu ulos</button>
                    </Link>
                    <Link to="/">
                        <button type="button">Takaisin etusivulle</button>
                    </Link>
                </div>
            )}
        </>
    );
};

export default Root;
