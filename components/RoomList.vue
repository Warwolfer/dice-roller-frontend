<template>
  <div v-if="rooms.length === 0" class="text-slate-400 text-center py-4">
    No rooms created yet. Create one above!
  </div>
  <div v-else class="mb-6 p-4 bg-slate-800 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold text-sky-400 mb-3">Available Rooms</h2>
    <ul class="space-y-2">
      <li v-for="room in rooms" :key="room.id">
        <Button
          @click="onSelectRoom(room.id)"
          :variant="room.id === activeRoomId ? 'primary' : 'secondary'"
          class="w-full text-left justify-start"
          :aria-pressed="room.id === activeRoomId"
        >
          {{ room.name }}
        </Button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Room } from '../types'
import Button from './Button.vue'

interface RoomListProps {
  rooms: Room[]
  activeRoomId: string | null
}

defineProps<RoomListProps>()
const emit = defineEmits<{
  selectRoom: [id: string]
}>()

const onSelectRoom = (id: string) => {
  emit('selectRoom', id)
}
</script>