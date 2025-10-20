import assert from 'node:assert';

import type { Room } from '@/common/types';

export const generateRoom = (id: number, name: string): Room => ({
    id,
    name,
    hidden: false,
    data: {
        players: [],
        cards: [],
        previousWord: null,
        adminUsername: null,
        roundInProgress: false,
    },
});

export const handleJoin = (room: Room, player: string): void => {
    assert.ok(!room.data.roundInProgress);
    assert.ok(!room.data.players.includes(player));

    room.data.players.push(player);
};

export const handleLeave = (room: Room, player: string): void => {
    assert.ok(!room.data.roundInProgress);
    assert.ok(room.data.players.includes(player));

    const playerI = room.data.players.indexOf(player);
    room.data.players.splice(playerI, 1);
};

export const startRound = (room: Room): void => {
    assert.ok(!room.data.roundInProgress);
    assert.ok(room.data.players.length >= 2);
    assert.ok(room.data.cards.length > 0);

    const cardI = Math.floor(Math.random() * room.data.cards.length);
    const card = room.data.cards.splice(cardI, 1)[0];

    room.data = {
        ...room.data,
        roundInProgress: true,
        roundPlayers: structuredClone(room.data.players),
        seen: [],
        card,
        starterUsername: room.data.players[Math.floor(Math.random() * room.data.players.length)],
        noCardUsername: room.data.players[Math.floor(Math.random() * room.data.players.length)],
    };
};

export const endRound = (room: Room): void => {
    assert.ok(room.data.roundInProgress);

    room.data = {
        players: room.data.players,
        cards: room.data.cards,
        previousWord: room.data.card,
        adminUsername: room.data.adminUsername,
        roundInProgress: false,
    };
};
