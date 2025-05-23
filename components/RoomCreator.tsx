import React, { useState } from 'react';
import Button from './Button';

interface RoomCreatorProps {
  onCreateRoom: (name: string) => void;
}

const RoomCreator: React.FC<RoomCreatorProps> = ({ onCreateRoom }) => {
  const [roomName, setRoomName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      onCreateRoom(roomName.trim());
      setRoomName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-800 rounded-lg shadow-md">
      <label htmlFor="roomName" className="block text-sm font-medium text-slate-300 mb-1">
        Create New Room:
      </label>
      <div className="flex space-x-2">
        <input
          id="roomName"
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="E.g., Dragon's Lair"
          className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100"
          aria-label="New room name"
        />
        <Button type="submit" variant="primary">
          Create Room
        </Button>
      </div>
    </form>
  );
};

export default RoomCreator;