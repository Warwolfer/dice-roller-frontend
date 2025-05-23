import React, { useState } from 'react';
import Button from './Button';

interface UserInputProps {
  onSetUser: (name: string) => void;
  currentName?: string | null;
}

const UserInput: React.FC<UserInputProps> = ({ onSetUser, currentName }) => {
  const [name, setName] = useState(currentName || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSetUser(name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-800 rounded-lg shadow-md">
      <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">
        Enter Your Name:
      </label>
      <div className="flex space-x-2">
        <input
          id="username"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="E.g., DungeonMaster"
          className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100"
          aria-label="Username"
        />
        <Button type="submit" variant="primary">
          Set Name
        </Button>
      </div>
    </form>
  );
};

export default UserInput;