import React from 'react';
import { Room } from '../types';
import Button from './Button';

interface RoomListProps {
  rooms: Room[];
  activeRoomId: string | null;
  onSelectRoom: (id: string) => void;
}

const RoomList: React.FC<RoomListProps> = ({ rooms, activeRoomId, onSelectRoom }) => {
  if (rooms.length === 0) {
    return <p className="text-slate-400 text-center py-4">No rooms created yet. Create one above!</p>;
  }

  return (
    <div className="mb-6 p-4 bg-slate-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-sky-400 mb-3">Available Rooms</h2>
      <ul className="space-y-2">
        {rooms.map((room) => (
          <li key={room.id}>
            <Button
              onClick={() => onSelectRoom(room.id)}
              variant={room.id === activeRoomId ? 'primary' : 'secondary'}
              className="w-full text-left justify-start"
              aria-pressed={room.id === activeRoomId}
            >
              {room.name}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomList;