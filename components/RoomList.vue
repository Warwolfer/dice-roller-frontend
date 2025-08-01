<template>
  <div v-if="sortedRooms.length === 0" class="text-slate-400 text-center py-4">
    No rooms created yet. Create one above!
  </div>
  <div v-else class="mb-6 p-4 bg-transparentbg rounded-lg shadow-md">
    <h2 class="text-xl font-semibold text-white mb-3">Available Rooms</h2>
    <ul class="space-y-2">
      <li v-for="room in sortedRooms" :key="room.id">
        <Button
          @click="onSelectRoom(room.id)"
          :variant="room.id === activeRoomId ? 'primary' : 'secondary'"
          class="w-full flex justify-between items-center"
          :aria-pressed="room.id === activeRoomId"
        >
          <div><span>{{ room.name }}</span> - <span class="bg-red text-green-500">{{ room.room_code }}</span></div>
          <span class="text-xs text-slate-400">{{ formatDate(room.created_at) }}</span>
        </Button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Room } from '../types'
import Button from './Button.vue'

interface RoomListProps {
  rooms: Room[]
  activeRoomId: string | null
}

const props = defineProps<RoomListProps>()
const emit = defineEmits<{
  selectRoom: [id: string]
}>()

const onSelectRoom = (id: string) => {
  emit('selectRoom', id)
}

const sortedRooms = computed(() => {
  return [...props.rooms].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString()
}
</script>