import { type JSX, type SyntheticEvent, useContext, useEffect, useState } from 'react';
import { Navigate, useBeforeUnload, useNavigate, useParams } from 'react-router-dom';

import type { Room } from '@/common/types';
import { SocketEventContext, type User, UserContext } from '../app/StateProvider';
import { socket } from '../socket';

const RoomRoute = (): JSX.Element => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext) as { user: User };
    const { room } = useContext(SocketEventContext) as {
        room: Room | null;
    };
    const { roomId: roomIdParam } = useParams() as { roomId: string };
    const roomId = parseInt(roomIdParam);

    const [newCard, setNewCard] = useState<string>('');

    // Automatically join and leave room
    useEffect(() => {
        socket.emit('joinRoom', roomId);
    }, [roomId]);
    useBeforeUnload(() => socket.emit('leaveRoom', roomId));

    const joinGame = (): void => {
        socket.emit('joinGame', roomId, user.username);
    };
    const leaveGame = (): void => {
        socket.emit('leaveGame', roomId, user.username);
    };
    const kickPlayer = (username: string): void => {
        socket.emit('kickPlayer', roomId, username);
    };
    const addCard = (event: SyntheticEvent): void => {
        event.preventDefault();
        socket.emit('addCard', roomId, { card: newCard, player: user.username });
        setNewCard('');
    };
    const viewCard = (event: SyntheticEvent): void => {
        event.preventDefault();
        socket.emit('viewCard', roomId, user.username);
        navigate(`/room/${roomId}/card`);
    };
    const beAdmin = (): void => {
        socket.emit('beAdmin', roomId, user.username);
    };
    const revokeAdmin = (): void => {
        socket.emit('revokeAdmin', roomId);
    };

    const startRound = (): void => {
        socket.emit('startRound', roomId);
    };
    const endRound = (): void => {
        if (confirm('Lopeta kierros?')) {
            socket.emit('endRound', roomId);
        }
    };
    const resetRoom = (): void => {
        if (confirm('Nollaa huone?')) {
            socket.emit('resetRoom', roomId);
        }
    };
    const deleteRoom = (): void => {
        if (confirm('Poista huone?')) {
            socket.emit('deleteRoom', roomId);
        }
    };

    if (room === null) return <p>Ladataan huonetta...</p>;
    if (room.hidden) return <Navigate to="/" />;

    const inGame = room.data.players.includes(user.username);
    const inRound = room.data.roundInProgress && room.data.roundPlayers.includes(user.username);
    const cardSeen = room.data.roundInProgress && room.data.seen.includes(user.username);
    const roundCanStart = room.data.cards.length > 0 && room.data.players.length >= 2;
    return (
        <>
            <h1>{room.name}</h1>
            <div className="table-container">
                <table>
                    <tbody>
                        <tr>
                            <td>Sanojen määrä</td>
                            <td id="word_count">{room.data.cards.length}</td>
                        </tr>

                        {room.data.roundInProgress && (
                            <>
                                <tr>
                                    <td>Aloittaja</td>
                                    <td>{room.data.starterUsername}</td>
                                </tr>
                                <tr>
                                    <td>Lapun lukeneet</td>
                                    <td id="seen_count">{room.data.seen.length}</td>
                                </tr>
                            </>
                        )}
                        <tr>
                            <td>Pelaajien määrä</td>
                            <td id="player_count">{room.data.players.length}</td>
                        </tr>

                        <tr>
                            <td>Edellinen sana</td>
                            {room.data.previousWord ? <td>{room.data.previousWord}</td> : <td />}
                        </tr>
                    </tbody>
                </table>
            </div>

            {room.data.roundInProgress ? (
                <form className="main-action" onSubmit={viewCard}>
                    {inRound && !cardSeen && <input type="submit" value="Katso uusi lappu" />}
                    {inRound && cardSeen && <input type="submit" value="Katso lappusi" />}
                    {!inRound && <input type="submit" disabled value="Et ole kierroksella mukana" />}
                </form>
            ) : (
                <>
                    {inGame ? (
                        <button className="red" type="button" onClick={() => leaveGame()}>
                            Poistu pelistä
                        </button>
                    ) : (
                        <button className="green" type="button" onClick={() => joinGame()}>
                            Liity peliin
                        </button>
                    )}
                    <br />
                </>
            )}

            <br />
            <form onSubmit={addCard}>
                <label htmlFor="word">Lisää sana:</label>
                <br />
                <div className="input-container">
                    <input
                        type="text"
                        placeholder="Sana"
                        value={newCard}
                        onChange={(e) => setNewCard(e.target.value)}
                    />
                    <input type="submit" value="Lisää" />
                </div>
            </form>

            {/* Admin area / button to get admin */}
            {user.username !== room.data.adminUsername ? (
                <>
                    <br />

                    {room.data.adminUsername ? (
                        <p>
                            Tämänhetkinen GM on <strong>{room.data.adminUsername}</strong>
                        </p>
                    ) : (
                        <p>Kukaan ei ole GM</p>
                    )}

                    <button type="button" onClick={() => beAdmin()}>
                        Ole GM
                    </button>
                </>
            ) : (
                <>
                    <h2 style={{ marginBottom: 10 }}>GMAlue</h2>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th colSpan={2}>Pelissä olevat pelaajat</th>
                                </tr>
                            </thead>
                            <tbody id="players" className="players">
                                {room.data.players.map((player) => (
                                    <tr key={player}>
                                        <td>{player}</td>
                                        <td>
                                            <button type="button" className="red" onClick={() => kickPlayer(player)}>
                                                POISTA
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {room.data.roundInProgress ? (
                        <button type="button" onClick={() => endRound()}>
                            Lopeta kierros
                        </button>
                    ) : (
                        <button type="button" disabled={!roundCanStart} onClick={() => startRound()}>
                            Aloita kierros
                        </button>
                    )}

                    <button type="button" onClick={() => revokeAdmin()}>
                        Älä ole GM
                    </button>
                    <button type="button" className="red" onClick={() => resetRoom()}>
                        NOLLAA HUONE
                    </button>
                    <button type="button" className="red" onClick={() => deleteRoom()}>
                        POISTA HUONE
                    </button>
                </>
            )}
        </>
    );
};

export default RoomRoute;
