import type { Card, Room } from './room';

export type ServerToClientEvents = {
    rooms: (rooms: Room[]) => void;
    roomState: (roomState: Room) => void;
};

export type ClientToServerEvents = {
    createRoom: (name: string, callback: (roomId: number) => void) => void;
    joinRoom: (roomId: number) => void;
    leaveRoom: (roomId: number) => void;
    joinGame: (roomId: number, username: string) => void;
    leaveGame: (roomId: number, username: string) => void;
    addCard: (roomId: number, card: Card) => void;
    viewCard: (roomId: number, username: string) => void;
    beAdmin: (roomId: number, username: string) => void;
    revokeAdmin: (roomId: number) => void;
    kickPlayer: (roomId: number, username: string) => void;
    startRound: (roomId: number) => void;
    endRound: (roomId: number) => void;
    resetRoom: (roomId: number) => void;
    deleteRoom: (roomId: number) => void;
};
