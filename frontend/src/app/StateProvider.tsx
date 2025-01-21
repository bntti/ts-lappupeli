/* eslint-disable react-refresh/only-export-components */

import {
    type Dispatch,
    type JSX,
    type ReactNode,
    type SetStateAction,
    createContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { z } from 'zod';

import type { Room } from '../../../common/types';
import { socket } from '../socket';

export const UserSchema = z.strictObject({ username: z.string() });
export type User = z.infer<typeof UserSchema>;
type UserContextType = {
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
};
export const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserStateProvider = ({ children }: { children: ReactNode }): JSX.Element => {
    const [user, setUser] = useState<User | null>(null);
    const providerState = useMemo(() => ({ user, setUser }), [user]);
    return <UserContext.Provider value={providerState}>{children}</UserContext.Provider>;
};

type SocketEventContextType = { rooms: Room[] | null; room: Room | null };
export const SocketEventContext = createContext<SocketEventContextType>({} as SocketEventContextType);

export const SocketEventStateProvider = ({ children }: { children: ReactNode }): JSX.Element => {
    const [rooms, setRooms] = useState<Room[] | null>(null);
    const [room, setRoom] = useState<Room | null>(null);

    useEffect(() => {
        socket.on('rooms', (newRooms) => {
            setRooms(newRooms);
        });

        socket.on('roomState', (roomState) => setRoom(roomState));

        return () => {
            socket.off('rooms');
            socket.off('roomState');
        };
    }, []);

    const providerState = useMemo(() => ({ rooms, room }), [room, rooms]);
    return <SocketEventContext.Provider value={providerState}>{children}</SocketEventContext.Provider>;
};

type ThemeContextType = { colorMode: { toggleTheme: () => void } };
export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);
