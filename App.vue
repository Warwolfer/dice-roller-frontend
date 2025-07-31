<template>
  <div class="container mx-auto p-4 max-w-[950px]">
    <header class="my-8 text-center">
      <h1 class="text-4xl font-bold text-sky-500 tracking-tight">
        Collaborative Dice Roller
      </h1>
      <p class="text-slate-400">Don't roll 4</p>
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
        <div class="flex items-center space-x-3">
          <div v-if="userAvatar" class="w-10 h-10 rounded-full overflow-hidden bg-slate-600 flex-shrink-0">
            <img :src="userAvatar" :alt="`${userName} avatar`" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
            <span class="text-slate-300 text-sm font-medium">{{ userName?.charAt(0).toUpperCase() }}</span>
          </div>
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
        :defaultWeaponRank="weaponRank"
        :defaultMasteryRank="null"
        :userAvatar="userAvatar"
        :selectedParticipantFilter="selectedParticipantFilter"
        @participantSelect="handleParticipantSelect"
      />
    </div>
    
    <footer class="mt-12 text-center text-sm text-slate-500">
      <p>&copy; {{ currentYear }} Warwolfer.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useLocalStorage } from './composables/useLocalStorage'
import { useApiCache } from './composables/useApiCache'
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
const [terraRPData, setTerraRPData] = useLocalStorage<any>('diceRollerTerraRPData', null)

// API cache
const { cachedFetch, invalidateCachePattern } = useApiCache()

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
const selectedParticipantFilter = ref<string | null>(null)

// Computed
const currentActiveRoom = computed(() => activeRoomState.data)
const currentYear = computed(() => new Date().getFullYear())

// Memoized computed properties for expensive calculations
const terraRPEquipment = computed(() => terraRPData.value?.equipment || [])

const userAvatar = computed(() => {
  const avatarUrl = terraRPData.value?.avatar_urls?.s
  if (avatarUrl) {
    console.log('Using TerraRP avatar:', avatarUrl)
    return avatarUrl
  }
  return null
})

const weaponRank = computed(() => {
  const equipment = terraRPEquipment.value
  if (equipment.length === 0) return null
  
  const weaponItem = equipment.find((item: any) => item.Weapon)
  if (weaponItem?.Weapon) {
    console.log('Extracted weapon rank:', weaponItem.Weapon)
    return weaponItem.Weapon
  }
  return null
})

const armorRank = computed(() => {
  const equipment = terraRPEquipment.value
  if (equipment.length === 0) return null
  
  // Look for armor in different possible formats
  const armorItem = equipment.find((item: any) => 
    item['Heavy Armor'] || item['Medium Armor'] || item['Light Armor'] || item.Armor
  )
  if (armorItem) {
    const rank = armorItem['Heavy Armor'] || armorItem['Medium Armor'] || armorItem['Light Armor'] || armorItem.Armor
    console.log('Extracted armor rank:', rank)
    return rank
  }
  return null
})

// Note: armorRank is kept for display purposes in participants, but not used for mastery rank defaults

// Background TerraRP data refresh with rate limiting
let lastRefreshTime = 0
const REFRESH_COOLDOWN = 30000 // 30 seconds cooldown
let refreshController: AbortController | null = null

const refreshTerraRPData = async () => {
  if (!terraRPData.value?.user_id) return
  
  const now = Date.now()
  if (now - lastRefreshTime < REFRESH_COOLDOWN) {
    console.log('TerraRP refresh skipped - cooldown active')
    return
  }
  
  // Cancel previous request if still pending
  if (refreshController) {
    refreshController.abort()
  }
  
  refreshController = new AbortController()
  
  try {
    console.log('Background refreshing TerraRP data for user ID:', terraRPData.value.user_id)
    const freshData = await cachedFetch(`${API_BASE_URL}/terrarp-user/${terraRPData.value.user_id}`, {
      signal: refreshController.signal
    }, 60000) // 1 minute TTL for TerraRP data
    console.log('Fresh TerraRP data received:', freshData)
      
    // Update the stored data if it's different
    const currentDataString = JSON.stringify(terraRPData.value)
    const freshDataString = JSON.stringify(freshData)
    
    if (currentDataString !== freshDataString) {
      console.log('TerraRP data has changed, updating...')
      setTerraRPData(freshData)
    } else {
      console.log('TerraRP data unchanged')
    }
    lastRefreshTime = now
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('TerraRP refresh cancelled')
    } else {
      console.log('Background TerraRP refresh failed:', error)
    }
  } finally {
    refreshController = null
  }
}

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
    
    const roomsData = await cachedFetch(`${API_BASE_URL}/rooms`, {
      signal: controller.signal
    }, 30000) // 30 second TTL for rooms list
    clearTimeout(timeoutId)
    const processedRooms = roomsData.map((room: any) => ({ 
      ...room, 
      rolls: room.rolls || [], 
      participants: room.participants || [],
      created_at: new Date(room.created_at),
      updated_at: new Date(room.updated_at),
    }))
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

  // Only set isLoading if we don't already have data for this room
  if (!activeRoomState.data || activeRoomState.data.id !== roomId) {
    activeRoomState.isLoading = true
  }
  activeRoomState.error = null
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout
    
    const roomData = await cachedFetch(`${API_BASE_URL}/rooms/${roomId}`, {
      signal: controller.signal
    }, 15000) // 15 second TTL for room details
    clearTimeout(timeoutId)
    const processedRoomData: Room = {
      ...roomData,
      created_at: new Date(roomData.created_at),
      updated_at: new Date(roomData.updated_at),
      rolls: roomData.rolls.map((roll: any) => ({
        ...roll,
        timestamp: new Date(roll.timestamp),
        comment: roll.comment || undefined,
      })).sort((a: Roll, b: Roll) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      participants: (roomData.participants || []).map((participant: any) => ({
        ...participant,
        joinedAt: new Date(participant.joinedAt),
        lastActivity: new Date(participant.lastActivity),
      })),
    }
    activeRoomState.data = processedRoomData
    activeRoomState.isLoading = false
    activeRoomState.error = null
  } catch (e) {
    const error = e as Error
    // Only clear data if the error is critical and we don't have valid data for this room
    if (activeRoomState.data?.id !== roomId) {
      activeRoomState.data = null
    }
    activeRoomState.isLoading = false
    const errorMessage = error.name === 'AbortError' 
      ? 'Request timed out - please check your connection'
      : error.message
    activeRoomState.error = errorMessage
    appError.value = errorMessage
  }
}

const handleSetUserName = (name: string, terrapData?: any) => {
  appError.value = null
  roomsState.error = null
  activeRoomState.error = null
  setUserName(name)
  setTerraRPData(terrapData || null)
}

const handleChangeUser = () => {
  appError.value = null
  setUserName(null)
  setActiveRoomId(null)
  setTerraRPData(null)
}

const handleCreateRoom = async (name: string, roomCode?: string) => {
  if (!userName.value) return
  isSubmitting.value = true
  appError.value = null
  
  try {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, 
        roomCode,
        creator_name: userName.value,
        creator_terrarp_id: terraRPData.value?.user_id
      }),
    })
    if (!response.ok) throw new Error(`Failed to create room: ${response.statusText}`)
    const newRoomData = await response.json()
    const newRoom: Room = { 
      ...newRoomData,
      created_at: new Date(newRoomData.created_at),
      updated_at: new Date(newRoomData.updated_at),
      participants: newRoomData.participants || [],
      rolls: newRoomData.rolls || [],
    }
    
    roomsState.data = [...roomsState.data, newRoom]
    
    // Invalidate rooms cache since we created a new room
    invalidateCachePattern(new RegExp(`${API_BASE_URL}/rooms`))
    
    // Join as participant when creating a room (since creating implies participation)
    await joinRoomAsParticipant(newRoom.id, userName.value, terraRPData.value)
    
    // Now that we've joined, set the room as active to trigger a fetch
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
  setActiveRoomId(id)
}

const joinRoomAsParticipant = async (roomId: string, userName: string, terraRPData?: any) => {
  // Check if the participant already exists in the current room's participants
  const currentParticipants = activeRoomState.data?.participants || []
  const participantExists = currentParticipants.some(p => 
    p.name === userName || (terraRPData?.user_id && p.terraRP?.user_id === terraRPData.user_id)
  )

  if (participantExists) {
    console.log(`Participant ${userName} (TerraRP ID: ${terraRPData?.user_id || 'N/A'}) already in room ${roomId}. Skipping join API call.`)
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, terraRPData }),
    })
    
    if (!response.ok) {
      console.warn(`Failed to join room as participant: ${response.statusText}`)
      return
    }
    
    const participant = await response.json()
    console.log('Joined room as participant:', participant)
    
    // Invalidate room cache to get updated participant list
    invalidateCachePattern(new RegExp(`${API_BASE_URL}/rooms/${roomId}`))
    // Immediately re-fetch room data to update participant list
    await fetchActiveRoomData(roomId)
    
  } catch (error) {
    console.warn('Error joining room as participant:', error)
    // Don't show error to user as this is not critical
  }
}

const handleLeaveRoom = () => {
  if (activeRoomId.value) {
    invalidateCachePattern(new RegExp(`${API_BASE_URL}/rooms/${activeRoomId.value}`))
  }
  appError.value = null
  selectedParticipantFilter.value = null
  setActiveRoomId(null)
}

const handleParticipantSelect = (participantName: string | null) => {
  selectedParticipantFilter.value = participantName
}

const handleAddRoll = async (roomId: string, diceType: Dice, rollerUserName: string, comment?: string, avatarUrl?: string): Promise<Roll | null> => {
  if (!rollerUserName || !roomId) return null
  isSubmitting.value = true
  appError.value = null
  activeRoomState.error = null
  
  // Join as participant on first roll
  await joinRoomAsParticipant(roomId, rollerUserName, terraRPData.value)
  
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/rolls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: rollerUserName, diceType, comment, avatarUrl }),
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
      
      // Invalidate room cache since rolls were updated
      invalidateCachePattern(new RegExp(`${API_BASE_URL}/rooms/${roomId}`))
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

const handleAddActionRoll = async (roomId: string, action: Action, rollerUserName: string, weaponRank: Rank, masteryRank: Rank, comment?: string, avatarUrl?: string, bonus?: number): Promise<ActionRoll | null> => {
  if (!rollerUserName || !roomId) return null
  isSubmitting.value = true
  appError.value = null
  activeRoomState.error = null
  
  // Join as participant on first roll
  await joinRoomAsParticipant(roomId, rollerUserName, terraRPData.value)
  
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
        comment,
        avatarUrl,
        bonus: bonus || 0
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
      
      // Invalidate room cache since rolls were updated
      invalidateCachePattern(new RegExp(`${API_BASE_URL}/rooms/${roomId}`))
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
  
  // Background refresh TerraRP data if user has it stored
  if (terraRPData.value?.user_id) {
    // Delay refresh to not interfere with initial room loading
    setTimeout(() => {
      refreshTerraRPData()
    }, 1000)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  // Cancel any pending TerraRP refresh
  if (refreshController) {
    refreshController.abort()
  }
})
</script>