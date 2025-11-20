import { z } from 'zod';

const card = z.object({ card: z.string(), player: z.string() });
const roomDataBase = z.object({
    players: z.array(z.string()),
    cards: z.array(card),
    previousWord: z.string().nullable(),
    adminUsername: z.string().nullable(),
});
const roomDataSchema = z.discriminatedUnion('roundInProgress', [
    roomDataBase.extend({
        roundInProgress: z.literal(false),
    }),
    roomDataBase.extend({
        roundInProgress: z.literal(true),
        card: z.string().nullable(),
        roundPlayers: z.array(z.string()),
        seen: z.array(z.string()),
        starterUsername: z.string(),
        noCardUsername: z.string(),
    }),
]);
const roomSchema = z.object({
    id: z.number().int().nonnegative(),
    name: z.string(),
    data: roomDataSchema,
    hidden: z.boolean(),
});

export const roomsSchema = z.array(roomSchema);

export type Card = z.infer<typeof card>;
export type Room = z.infer<typeof roomSchema>;
