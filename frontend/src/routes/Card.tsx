import { type JSX, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { Room } from '../../../common/types';
import { SocketEventContext, UserContext } from '../app/StateProvider';

const CardRoute = (): JSX.Element => {
    const { user } = useContext(UserContext);
    const { room } = useContext(SocketEventContext) as {
        room: Room | null;
    };
    const { roomId } = useParams() as { roomId: string };

    if (room?.data.roundInProgress === false || user === null) return <p>Virhe</p>;

    return (
        <>
            <h1>Lappusi</h1>
            {room === null ? (
                <p>Ladataan lappua</p>
            ) : (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>
                    {user.username === room.data.noCardUsername ? (
                        <h2 className="word">Sait tyhjän lapun!</h2>
                    ) : (
                        <h2 className="word">{room.data.card}</h2>
                    )}
                </>
            )}
            <Link to={`/room/${roomId}`}>
                <button type="button">Takaisin</button>
            </Link>
        </>
    );
};

export default CardRoute;
