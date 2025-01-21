import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';

import {
    type ClientToServerEvents,
    type Room,
    type ServerToClientEvents,
    roomIdSchema,
    usernameSchema,
} from '@/common/types';
import { endRound, generateRoom, handleJoin, handleLeave, startRound } from './logic';

const rooms: Room[] = [];

const getRoomIdError = (roomId: number, socketRooms: Set<string> | null = null, joining: boolean): string => {
    if (!roomIdSchema.safeParse(roomId).success) return `Invalid room id ${roomId}`;

    if (socketRooms !== null) {
        if (!joining && socketRooms.size === 1) return 'Client not in any room';
        if (!joining && !socketRooms.has(roomId.toString())) return 'Client not in roomId';
        if (socketRooms.size > 2) {
            const badRooms = [];
            for (const room of socketRooms) {
                if (/^\d+$/u.test(room) && parseInt(room) !== roomId) badRooms.push(room);
            }
            for (const badRoom of badRooms) socketRooms.delete(badRoom);
        }
    }
    if (roomId < 0 || roomId >= rooms.length) return 'roomId not in rooms';
    return '';
};

const validateRoomId = (roomId: number, socketRooms: Set<string> | null = null, joining: boolean = false): boolean => {
    const error = getRoomIdError(roomId, socketRooms, joining);
    if (error !== '') console.warn(error);
    return error === '';
};

const runServer = (): void => {
    const app = express();
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const server = http.createServer(app);
    const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, { connectionStateRecovery: {} });
    server.listen(5000);

    io.on('connection', (socket) => {
        socket.emit('rooms', rooms);

        socket.on('createRoom', (name, callback) => {
            if (!(typeof callback === 'function')) return;

            const roomId = rooms.length;
            rooms.push(generateRoom(roomId, name));
            io.emit('rooms', rooms);

            callback(roomId);
        });

        socket.on('joinRoom', async (roomId) => {
            if (!validateRoomId(roomId, socket.rooms, true)) return;

            await socket.join(roomId.toString());

            socket.emit('roomState', rooms[roomId]);
        });

        socket.on('leaveRoom', async (roomId) => {
            if (!validateRoomId(roomId, socket.rooms)) return;

            await socket.leave(roomId.toString());
        });

        socket.on('joinGame', (roomId, username) => {
            if (!validateRoomId(roomId, socket.rooms, true)) return;
            if (!usernameSchema.safeParse(username).success) return;

            const room = rooms[roomId];
            if (room.data.players.includes(username)) return;

            handleJoin(room, username);

            io.to(roomId.toString()).emit('roomState', rooms[roomId]);
        });

        socket.on('leaveGame', (roomId, username) => {
            if (!validateRoomId(roomId, socket.rooms)) return;
            if (!usernameSchema.safeParse(username).success) return;

            const room = rooms[roomId];
            handleLeave(room, username);

            io.to(roomId.toString()).emit('roomState', rooms[roomId]);
        });

        socket.on('addCard', (roomId, card) => {
            if (!validateRoomId(roomId, socket.rooms)) return;

            const room = rooms[roomId];
            if (card.trim().length > 0) room.data.cards.push(card);

            io.to(roomId.toString()).emit('roomState', rooms[roomId]);
        });

        socket.on('viewCard', (roomId, username) => {
            if (!validateRoomId(roomId, socket.rooms)) return;
            if (!usernameSchema.safeParse(username).success) return;

            const room = rooms[roomId];
            if (!room.data.roundInProgress) return;
            if (!room.data.roundPlayers.includes(username)) return;
            if (room.data.seen.includes(username)) return;

            room.data.seen.push(username);
            io.to(roomId.toString()).emit('roomState', rooms[roomId]);
        });

        socket.on('beAdmin', (roomId, username) => {
            if (!validateRoomId(roomId, socket.rooms)) return;
            if (!usernameSchema.safeParse(username).success) return;

            const room = rooms[roomId];
            room.data.adminUsername = username;

            io.to(roomId.toString()).emit('roomState', rooms[roomId]);
        });

        socket.on('revokeAdmin', (roomId) => {
            if (!validateRoomId(roomId, socket.rooms)) return;

            const room = rooms[roomId];
            room.data.adminUsername = null;

            io.to(roomId.toString()).emit('roomState', rooms[roomId]);
        });

        socket.on('kickPlayer', (roomId, username) => {
            if (!validateRoomId(roomId, socket.rooms)) return;
            if (!usernameSchema.safeParse(username).success) return;

            handleLeave(rooms[roomId], username);

            io.to(roomId.toString()).emit('roomState', rooms[roomId]);
        });

        socket.on('startRound', (roomId) => {
            if (!validateRoomId(roomId, socket.rooms)) return;
            if (rooms[roomId].data.roundInProgress) return;

            // TODO: Error handling

            if (rooms[roomId].data.players.length < 2) return;
            if (rooms[roomId].data.cards.length === 0) return;

            startRound(rooms[roomId]);
            io.to(roomId.toString()).emit('roomState', rooms[roomId]);
        });

        socket.on('endRound', (roomId) => {
            if (!validateRoomId(roomId, socket.rooms)) return;
            if (!rooms[roomId].data.roundInProgress) return;

            endRound(rooms[roomId]);

            io.to(roomId.toString()).emit('roomState', rooms[roomId]);
        });

        socket.on('resetRoom', (roomId) => {
            if (!validateRoomId(roomId, socket.rooms)) return;

            rooms[roomId] = generateRoom(rooms[roomId].id, rooms[roomId].name);
            io.to(roomId.toString()).emit('roomState', rooms[roomId]);
        });

        socket.on('deleteRoom', (roomId) => {
            if (!validateRoomId(roomId, socket.rooms)) return;

            rooms[roomId].hidden = true;
            io.to(roomId.toString()).emit('roomState', rooms[roomId]);
            io.emit('rooms', rooms);
        });
    });
};

runServer();
