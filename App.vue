<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <header class="my-8 text-center">
      <h1 class="text-4xl font-bold text-sky-500 tracking-tight">
        Collaborative Dice Roller
      </h1>
      <p class="text-slate-400">Roll with friends, backed by a robust backend!</p>
    </header>

    <div 
      v-if="appError" 
      class="mb-4 p-3 bg-red-500/20 border border-red-700 text-red-300 rounded-md flex justify-between items-center" 
      role="alert"
    >
      <span><strong>Application Error:</strong> {{ appError }}</span>
      <Button @click="appError = null" variant="danger" size="sm" class="ml-2 px-2 py-1 text-xs">
        Dismiss
      </Button>
    </div>

    <UserInput 
      v-if="!userName" 
      @setUser="handleSetUserName" 
      :currentName="userName || ''" 
    />
    
    <div v-else>
      <div class="mb-6 p-4 bg-slate-800 rounded-lg shadow-md flex justify-between items-center">
        <div>
          <p class="text-slate-300">Welcome, <span class="font-semibold text-sky-400">{{ userName }}</span>!</p>
        </div>
        <Button @click="handleChangeUser" variant="secondary" size="sm">
          Change User
        </Button>
      </div>
      
      <div v-if="!currentActiveRoom && !activeRoomState.isLoading">
        <RoomCreator @createRoom="handleCreateRoom" />
        
        <p v-if="roomsState.isLoading" class="text-center text-sky-400 py-4">Loading rooms...</p>
        
        <div 
          v-if="!roomsState.isLoading && roomsState.error"
          class="my-4 p-3 bg-red-500/10 border border-red-600 text-red-400 rounded-md text-center" 
          role="alert"
        >
          <p>Error loading rooms: {{ roomsState.error }}</p>
          <Button 
            @click="retryLoadRooms"
            variant="secondary"
            size="sm"
            class="mt-2"
          >
            Retry
          </Button>
        </div>
        
        <RoomList 
          v-if="!roomsState.isLoading && !roomsState.error"
          :rooms="roomsState.data" 
          :activeRoomId="activeRoomId" 
          @selectRoom="handleSelectRoom" 
        />
      </div>

      <p v-if="activeRoomState.isLoading" class="text-center text-sky-400 py-4">Loading room details...</p>
      
      <div 
        v-if="!activeRoomState.isLoading && activeRoomState.error && !currentActiveRoom"
        class="my-4 p-3 bg-red-500/10 border border-red-600 text-red-400 rounded-md text-center" 
        role="alert"
      >
        <p>Error loading room: {{ activeRoomState.error }}</p>
        <Button 
          @click="retryLoadActiveRoom"
          variant="secondary"
          size="sm"
          class="mt-2"
        >
          Retry
        </Button>
      </div>

      <RoomView
        v-if="currentActiveRoom && !activeRoomState.isLoading"
        :room="currentActiveRoom"
        :userName="userName"
        @roll="handleAddRoll"
        @actionRoll="handleAddActionRoll"
        @leaveRoom="handleLeaveRoom"
        :isSubmittingRoll="isSubmitting"
      />
    </div>
    
    <footer class="mt-12 text-center text-sm text-slate-500">
      <p>&copy; {{ new Date().getFullYear() }} Warwolfer.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useLocalStorage } from './composables/useLocalStorage'
import { Room, Dice, Roll, Action, Rank, ActionRoll } from './types'
import UserInput from './components/UserInput.vue'
import RoomCreator from './components/RoomCreator.vue'
import RoomList from './components/RoomList.vue'
import RoomView from './components/RoomView.vue'
import Button from './components/Button.vue'
import { API_BASE_URL } from './constants'

// Local storage state
const [userName, setUserName] = useLocalStorage<string | null>('diceRollerUser', null)
const [activeRoomId, setActiveRoomId] = useLocalStorage<string | null>('diceRollerActiveRoom', null)

// Reactive state
const roomsState = reactive<{ data: Room[]; isLoading: boolean; error: string | null }>({
  data: [],
  isLoading: false,
  error: null,
})

const activeRoomState = reactive<{ data: Room | null; isLoading: boolean; error: string | null }>({
  data: null,
  isLoading: false,
  error: null,
})

const isSubmitting = ref(false)
const appError = ref<string | null>(null)

// Computed
const currentActiveRoom = computed(() => activeRoomState.data)

// Methods
const fetchRooms = async () => {
  if (!userName.value) { 
    roomsState.data = []
    roomsState.isLoading = false
    roomsState.error = null
    return
  }

  roomsState.isLoading = true
  roomsState.error = null
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout
    
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const errorMessage = response.status === 404 
        ? 'No rooms found or server unavailable'
        : response.status >= 500 
        ? 'Server error - please try again later'
        : `Failed to fetch rooms: ${response.statusText}`
      throw new Error(errorMessage)
    }
    const roomsData = await response.json()
    const processedRooms = roomsData.map((room: any) => ({ ...room, rolls: room.rolls || [] })).sort((a: Room, b: Room) => a.name.localeCompare(b.name))
    roomsState.data = processedRooms
    roomsState.isLoading = false
    roomsState.error = null
  } catch (e) {
    const error = e as Error
    roomsState.isLoading = false
    const errorMessage = error.name === 'AbortError' 
      ? 'Request timed out - please check your connection'
      : error.message
    roomsState.error = errorMessage
    appError.value = errorMessage
  }
}

const fetchActiveRoomData = async (roomId: string) => {
  if (!userName.value || !roomId) { 
    activeRoomState.data = null
    activeRoomState.isLoading = false
    activeRoomState.error = null
    return
  }

  activeRoomState.isLoading = true
  activeRoomState.error = null
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout
    
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      if (response.status === 404) {
        setActiveRoomId(null)
        throw new Error(`Room not found (ID: ${roomId}). It may have been deleted.`)
      }
      const errorMessage = response.status >= 500 
        ? 'Server error - please try again later'
        : `Failed to fetch room details: ${response.statusText}`
      throw new Error(errorMessage)
    }
    const roomData = await response.json()
    const processedRoomData: Room = {
      ...roomData,
      rolls: roomData.rolls.map((roll: any) => ({
        ...roll,
        timestamp: new Date(roll.timestamp),
        comment: roll.comment || undefined,
      })).sort((a: Roll, b: Roll) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    }
    activeRoomState.data = processedRoomData
    activeRoomState.isLoading = false
    activeRoomState.error = null
  } catch (e) {
    const error = e as Error
    activeRoomState.data = activeRoomState.data?.id === roomId ? activeRoomState.data : null
    activeRoomState.isLoading = false
    const errorMessage = error.name === 'AbortError' 
      ? 'Request timed out - please check your connection'
      : error.message
    activeRoomState.error = errorMessage
    appError.value = errorMessage
  }
}

const handleSetUserName = (name: string) => {
  appError.value = null
  roomsState.error = null
  activeRoomState.error = null
  setUserName(name)
}

const handleChangeUser = () => {
  appError.value = null
  setUserName(null)
  setActiveRoomId(null)
}

const handleCreateRoom = async (name: string) => {
  if (!userName.value) return
  isSubmitting.value = true
  appError.value = null
  
  try {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!response.ok) throw new Error(`Failed to create room: ${response.statusText}`)
    const newRoom: Room = await response.json()
    roomsState.data = [...roomsState.data, newRoom].sort((a, b) => a.name.localeCompare(b.name))
    setActiveRoomId(newRoom.id)
  } catch (e) {
    const error = e as Error
    appError.value = `Failed to create room: ${error.message}`
  } finally {
    isSubmitting.value = false
  }
}

const handleSelectRoom = (id: string) => {
  activeRoomState.error = null
  activeRoomState.data = null
  activeRoomState.isLoading = true
  setActiveRoomId(id)
}

const handleLeaveRoom = () => {
  appError.value = null
  setActiveRoomId(null)
}

const handleAddRoll = async (roomId: string, diceType: Dice, rollerUserName: string, comment?: string): Promise<Roll | null> => {
  if (!rollerUserName || !roomId) return null
  isSubmitting.value = true
  appError.value = null
  activeRoomState.error = null
  
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/rolls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: rollerUserName, diceType, comment }),
    })
    if (!response.ok) throw new Error(`Failed to add roll: ${response.statusText}`)
    const newRollData = await response.json()
    const newRoll: Roll = {
      ...newRollData,
      timestamp: new Date(newRollData.timestamp),
      comment: newRollData.comment || undefined,
    }

    if (activeRoomState.data && activeRoomState.data.id === roomId) {
      // Insert new roll at the correct position to maintain sort order
      const existingRolls = activeRoomState.data.rolls
      const newRollTime = newRoll.timestamp.getTime()
      let insertIndex = 0
      
      // Find correct insertion point (rolls are sorted desc by timestamp)
      while (insertIndex < existingRolls.length && 
             existingRolls[insertIndex].timestamp.getTime() > newRollTime) {
        insertIndex++
      }
      
      const updatedRolls = [
        ...existingRolls.slice(0, insertIndex),
        newRoll,
        ...existingRolls.slice(insertIndex)
      ]
      
      activeRoomState.data = {
        ...activeRoomState.data,
        rolls: updatedRolls,
      }
      activeRoomState.error = null
    }
    return newRoll
  } catch (e) {
    const error = e as Error
    const errorMessage = `Failed to add roll: ${error.message}`
    appError.value = errorMessage
    activeRoomState.error = errorMessage
    return null
  } finally {
    isSubmitting.value = false
  }
}

const handleAddActionRoll = async (roomId: string, action: Action, rollerUserName: string, weaponRank: Rank, masteryRank: Rank, comment?: string): Promise<ActionRoll | null> => {
  if (!rollerUserName || !roomId) return null
  isSubmitting.value = true
  appError.value = null
  activeRoomState.error = null
  
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/rolls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userName: rollerUserName, 
        actionName: action.name,
        weaponRank,
        masteryRank,
        rollFormula: action.rollFormula,
        comment 
      }),
    })
    if (!response.ok) throw new Error(`Failed to add action roll: ${response.statusText}`)
    const newRollData = await response.json()
    const newActionRoll: ActionRoll = {
      ...newRollData,
      timestamp: new Date(newRollData.timestamp),
      comment: newRollData.comment || undefined,
      actionName: action.name,
      weaponRank,
      masteryRank,
      rollFormula: action.rollFormula,
    }

    if (activeRoomState.data && activeRoomState.data.id === roomId) {
      // Insert new roll at the correct position to maintain sort order
      const existingRolls = activeRoomState.data.rolls
      const newRollTime = newActionRoll.timestamp.getTime()
      let insertIndex = 0
      
      // Find correct insertion point (rolls are sorted desc by timestamp)
      while (insertIndex < existingRolls.length && 
             existingRolls[insertIndex].timestamp.getTime() > newRollTime) {
        insertIndex++
      }
      
      const updatedRolls = [
        ...existingRolls.slice(0, insertIndex),
        newActionRoll as any, // Cast to Roll type for compatibility
        ...existingRolls.slice(insertIndex)
      ]
      
      activeRoomState.data = {
        ...activeRoomState.data,
        rolls: updatedRolls,
      }
      activeRoomState.error = null
    }
    return newActionRoll
  } catch (e) {
    const error = e as Error
    const errorMessage = `Failed to add action roll: ${error.message}`
    appError.value = errorMessage
    activeRoomState.error = errorMessage
    return null
  } finally {
    isSubmitting.value = false
  }
}

const retryLoadRooms = () => {
  roomsState.error = null
  roomsState.isLoading = false
  fetchRooms()
}

const retryLoadActiveRoom = () => {
  activeRoomState.error = null
  activeRoomState.isLoading = false
  if (activeRoomId.value) fetchActiveRoomData(activeRoomId.value)
}

// Watchers
watch(userName, (newUserName) => {
  if (newUserName) {
    const needsInitialLoad = roomsState.data.length === 0 && !roomsState.isLoading && !roomsState.error
    if (needsInitialLoad) {
      fetchRooms()
    }
  } else {
    roomsState.data = []
    roomsState.isLoading = false
    roomsState.error = null
  }
})

watch(activeRoomId, (newRoomId) => {
  if (newRoomId && userName.value) {
    const needsInitialLoadForRoom = (!activeRoomState.data || activeRoomState.data.id !== newRoomId) && 
                                    !activeRoomState.isLoading && !activeRoomState.error
    if (needsInitialLoadForRoom) {
      fetchActiveRoomData(newRoomId)
    }
  } else {
    activeRoomState.data = null
    activeRoomState.isLoading = false
    activeRoomState.error = null
  }
})

// Initial load
onMounted(() => {
  if (userName.value) {
    fetchRooms()
  }
  if (activeRoomId.value && userName.value) {
    fetchActiveRoomData(activeRoomId.value)
  }
})
</script>