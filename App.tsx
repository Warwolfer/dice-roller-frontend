
import React, { useState, useEffect, useCallback, useRef } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { Room, Dice, Roll } from './types';
import UserInput from './components/UserInput';
import RoomCreator from './components/RoomCreator';
import RoomList from './components/RoomList';
import RoomView from './components/RoomView';
import Button from './components/Button';
import { API_BASE_URL } from './constants';

const App: React.FC = () => {
  const [userName, setUserName] = useLocalStorage<string | null>('diceRollerUser', null);
  const [activeRoomId, setActiveRoomId] = useLocalStorage<string | null>('diceRollerActiveRoom', null);

  const [roomsState, setRoomsState] = useState<{ data: Room[]; isLoading: boolean; error: string | null }>({
    data: [],
    isLoading: false,
    error: null,
  });
  const [activeRoomState, setActiveRoomState] = useState<{ data: Room | null; isLoading: boolean; error: string | null }>({
    data: null,
    isLoading: false,
    error: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // For create room, add roll
  const [appError, setAppError] = useState<string | null>(null);

  const prevUserNameRef = useRef<string | null | undefined>(undefined);
  const prevActiveRoomIdRef = useRef<string | null | undefined>(undefined);
  const prevUserNameForActiveRoomRef = useRef<string | null | undefined>(undefined);


  const fetchRooms = useCallback(async () => {
    if (!userName) { 
      setRoomsState({ data: [], isLoading: false, error: null });
      return;
    }

    setRoomsState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`);
      if (!response.ok) throw new Error(`Failed to fetch rooms: ${response.statusText} (status ${response.status})`);
      const roomsData = await response.json();
      const processedRooms = roomsData.map((room: any) => ({ ...room, rolls: room.rolls || [] })).sort((a,b) => a.name.localeCompare(b.name));
      setRoomsState({ data: processedRooms, isLoading: false, error: null });
    } catch (e) {
      const error = e as Error;
      setRoomsState(prev => ({ ...prev, data: prev.data, isLoading: false, error: error.message })); 
      setAppError(error.message);
    }
  }, [userName]); 

  useEffect(() => {
    if (userName) {
      const userNameJustChanged = prevUserNameRef.current !== userName;
      const needsInitialLoad = roomsState.data.length === 0 && !roomsState.isLoading && !roomsState.error;

      if (userNameJustChanged || needsInitialLoad) {
        fetchRooms();
      }
      prevUserNameRef.current = userName;
    } else {
      setRoomsState({ data: [], isLoading: false, error: null });
      prevUserNameRef.current = null; 
    }
  }, [userName, fetchRooms, roomsState.data.length, roomsState.isLoading, roomsState.error]);


  const fetchActiveRoomData = useCallback(async (roomId: string) => {
    if (!userName || !roomId) { 
        setActiveRoomState(prev => ({...prev, data: null, isLoading: false, error: null}));
        return;
    }

    setActiveRoomState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setActiveRoomId(null); 
          throw new Error(`Room not found (ID: ${roomId}). It may have been deleted.`);
        }
        throw new Error(`Failed to fetch room details: ${response.statusText} (status ${response.status})`);
      }
      const roomData = await response.json();
      const processedRoomData: Room = {
        ...roomData,
        rolls: roomData.rolls.map((roll: any) => ({
          ...roll,
          timestamp: new Date(roll.timestamp),
          comment: roll.comment || undefined,
        })).sort((a: Roll, b: Roll) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      };
      setActiveRoomState({ data: processedRoomData, isLoading: false, error: null });
    } catch (e) {
      const error = e as Error;
      setActiveRoomState(prev => ({ 
        ...prev, 
        data: prev.data?.id === roomId ? prev.data : null, 
        isLoading: false, 
        error: error.message 
      }));
      setAppError(error.message);
    }
  }, [userName, setActiveRoomId]); 

  useEffect(() => {
    const currentRoomId = activeRoomId; 

    if (currentRoomId && userName) {
      const dependenciesJustChanged = prevActiveRoomIdRef.current !== currentRoomId || prevUserNameForActiveRoomRef.current !== userName;
      const needsInitialLoadForRoom = (!activeRoomState.data || activeRoomState.data.id !== currentRoomId) && 
                                      !activeRoomState.isLoading && !activeRoomState.error;

      if (dependenciesJustChanged || needsInitialLoadForRoom) {
        fetchActiveRoomData(currentRoomId);
      }
    } else {
      setActiveRoomState({ data: null, isLoading: false, error: null });
    }
    prevActiveRoomIdRef.current = currentRoomId;
    prevUserNameForActiveRoomRef.current = userName;
  }, [activeRoomId, userName, fetchActiveRoomData, activeRoomState.data, activeRoomState.isLoading, activeRoomState.error]);


  const handleSetUserName = (name: string) => {
    setAppError(null); 
    setRoomsState(prev => ({ ...prev, error: null })); 
    setActiveRoomState(prev => ({ ...prev, error: null }));
    setUserName(name); 
  };

  const handleChangeUser = () => {
    setAppError(null);
    setUserName(null); 
    setActiveRoomId(null); 
  };

  const handleCreateRoom = async (name: string) => {
    if (!userName) return;
    setIsSubmitting(true);
    setAppError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error(`Failed to create room: ${response.statusText}`);
      const newRoom: Room = await response.json();
      setRoomsState((prev) => ({ ...prev, data: [...prev.data, newRoom].sort((a,b) => a.name.localeCompare(b.name)) }));
      setActiveRoomId(newRoom.id); 
    } catch (e) {
      const error = e as Error;
      setAppError(`Failed to create room: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectRoom = (id: string) => {
    setActiveRoomState(prev => ({ ...prev, error: null, data: null, isLoading: true })); 
    setActiveRoomId(id); 
  };

  const handleLeaveRoom = () => {
    setAppError(null);
    setActiveRoomId(null); 
  };

  const handleAddRoll = async (roomId: string, diceType: Dice, rollerUserName: string, comment?: string): Promise<Roll | null> => {
    if (!rollerUserName || !roomId) return null;
    setIsSubmitting(true);
    setAppError(null);
    setActiveRoomState(prev => ({ ...prev, error: null })); 
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/rolls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: rollerUserName, diceType, comment }), // Include comment
      });
      if (!response.ok) throw new Error(`Failed to add roll: ${response.statusText}`);
      const newRollData = await response.json();
      const newRoll: Roll = {
        ...newRollData,
        timestamp: new Date(newRollData.timestamp),
        comment: newRollData.comment || undefined, // Ensure comment is part of the Roll object
      };

      setActiveRoomState((prev) => {
        if (prev.data && prev.data.id === roomId) {
          return {
            ...prev,
            data: {
              ...prev.data,
              rolls: [newRoll, ...prev.data.rolls].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
            },
            error: null, 
          };
        }
        return prev;
      });
      return newRoll;
    } catch (e) {
      const error = e as Error;
      const errorMessage = `Failed to add roll: ${error.message}`;
      setAppError(errorMessage);
      setActiveRoomState(prev => ({...prev, error: errorMessage}));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const currentActiveRoom = activeRoomState.data;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <header className="my-8 text-center">
        <h1 className="text-4xl font-bold text-sky-500 tracking-tight">
          Collaborative Dice Roller
        </h1>
        <p className="text-slate-400">Roll with friends, backed by a robust backend!</p>
      </header>

      {appError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-700 text-red-300 rounded-md flex justify-between items-center" role="alert">
          <span><strong>Application Error:</strong> {appError}</span>
          <Button onClick={() => setAppError(null)} variant="danger" size="sm" className="ml-2 px-2 py-1 text-xs">Dismiss</Button>
        </div>
      )}

      {!userName ? (
        <UserInput onSetUser={handleSetUserName} currentName={userName || ''} />
      ) : (
        <>
          <div className="mb-6 p-4 bg-slate-800 rounded-lg shadow-md flex justify-between items-center">
            <div>
              <p className="text-slate-300">Welcome, <span className="font-semibold text-sky-400">{userName}</span>!</p>
            </div>
            <Button onClick={handleChangeUser} variant="secondary" size="sm">
              Change User
            </Button>
          </div>
          
          {!currentActiveRoom && !activeRoomState.isLoading && ( 
            <>
              <RoomCreator onCreateRoom={handleCreateRoom} />
              {roomsState.isLoading && <p className="text-center text-sky-400 py-4">Loading rooms...</p>}
              {!roomsState.isLoading && roomsState.error && (
                 <div className="my-4 p-3 bg-red-500/10 border border-red-600 text-red-400 rounded-md text-center" role="alert">
                   <p>Error loading rooms: {roomsState.error}</p>
                   <Button onClick={() => {
                       setRoomsState(prev => ({ ...prev, error: null, isLoading: false })); 
                       fetchRooms(); 
                     }}
                     variant="secondary"
                     size="sm"
                     className="mt-2"
                   >
                     Retry
                   </Button>
                 </div>
              )}
              {!roomsState.isLoading && !roomsState.error && (
                <RoomList rooms={roomsState.data} activeRoomId={activeRoomId} onSelectRoom={handleSelectRoom} />
              )}
            </>
          )}

          {activeRoomState.isLoading && <p className="text-center text-sky-400 py-4">Loading room details...</p>}
          
          {!activeRoomState.isLoading && activeRoomState.error && !currentActiveRoom && ( 
             <div className="my-4 p-3 bg-red-500/10 border border-red-600 text-red-400 rounded-md text-center" role="alert">
               <p>Error loading room: {activeRoomState.error}</p>
                <Button onClick={() => {
                    setActiveRoomState(prev => ({ ...prev, error: null, isLoading: false }));
                    if (activeRoomId) fetchActiveRoomData(activeRoomId);
                  }}
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                >
                  Retry
                </Button>
             </div>
          )}

          {currentActiveRoom && !activeRoomState.isLoading && (
            <RoomView
              room={currentActiveRoom}
              userName={userName}
              onRoll={handleAddRoll}
              onLeaveRoom={handleLeaveRoom}
              isSubmittingRoll={isSubmitting}
            />
          )}
        </>
      )}
       <footer className="mt-12 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Warwolfer.</p>
      </footer>
    </div>
  );
};

export default App;