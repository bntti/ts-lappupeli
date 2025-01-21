import { type Socket, io } from 'socket.io-client';

import type { ClientToServerEvents, ServerToClientEvents } from '../../common/types';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
