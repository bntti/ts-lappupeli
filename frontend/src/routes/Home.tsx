import { type JSX, type SyntheticEvent, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { SocketEventContext } from '../app/StateProvider';
import { socket } from '../socket';

const HomeRoute = (): JSX.Element => {
    const { rooms } = useContext(SocketEventContext);

    const [newRoom, setNewRoom] = useState<string>('');
    const navigate = useNavigate();

    const createRoom = (event: SyntheticEvent): void => {
        event.preventDefault();

        // TODO: Show error?
        if (newRoom.trim() === '') return;

        socket.emit('createRoom', newRoom, async (roomId) => navigate(`/room/${roomId}`));
    };

    if (rooms === null) return <p>Ladataan huoneita...</p>;
    return (
        <>
            <h1>Lappupeli</h1>

            <h3>Valitse huone tai luo uusi huone</h3>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Huoneet</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.length === 0 && (
                            <tr>
                                <td>Ei huoneita</td>
                            </tr>
                        )}
                        {rooms.map((room) => (
                            <tr className="room" key={room.id}>
                                <td>
                                    <Link to={`/room/${room.id}`}>{room.name}</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <br />

            <form onSubmit={createRoom}>
                <label htmlFor="room_name">Lisää huone:</label>
                <br />
                <div className="input-container">
                    <input
                        type="text"
                        name="room_name"
                        placeholder="Huoneen nimi"
                        onChange={(e) => setNewRoom(e.target.value)}
                    />
                    <input type="submit" value="Lisää huone" />
                </div>
            </form>
        </>
    );
};

export default HomeRoute;
