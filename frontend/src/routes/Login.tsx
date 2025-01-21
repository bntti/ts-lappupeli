import { type JSX, type SyntheticEvent, useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { UserContext } from '../app/StateProvider';

const LoginRoute = (): JSX.Element => {
    const { state } = useLocation() as { state?: { from: string } };
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [username, setUsername] = useState<string>('');

    const handleSetUsername = (event: SyntheticEvent): void => {
        event.preventDefault();

        const user = { username };
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));

        if (state?.from) navigate(state.from);
        else navigate('/');
    };

    return (
        <>
            <h1>Valitse Käyttäjänimi</h1>

            <form onSubmit={handleSetUsername}>
                <label htmlFor="username">Käyttäjänimi:</label>
                <br />
                <div className="input-container">
                    <input
                        type="text"
                        name="username"
                        placeholder="Käyttäjänimi"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input type="submit" value="Kirjaudu sisään" />
                </div>
            </form>
        </>
    );
};

export default LoginRoute;
