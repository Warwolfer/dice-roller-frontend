<template>
  <form @submit="handleSubmit" class="mb-6 p-4 bg-transparentbg rounded-lg shadow-md">
    <div class="grid grid-cols-3 md:grid-cols-2 gap-4">
      <div class="col-span-2">
        <label for="roomName" class="block text-sm font-medium text-slate-300 mb-1">
          Room Name:
        </label>
        <input
          id="roomName"
          type="text"
          v-model="roomName"
          placeholder="E.g., Dragon's Lair"
          class="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100"
          aria-label="New room name"
          required
        />
      </div>
      <div class="col-span-1">
        <label for="roomCode" class="block text-sm font-medium text-slate-300 mb-1">
          Room Code (Optional):
        </label>
        <input
          id="roomCode"
          type="text"
          v-model="roomCode"
          placeholder="E.g., 1234"
          class="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100"
          aria-label="New room code"
        />
      </div>
    </div>
    <div class="mt-4">
      <Button type="submit" variant="primary" class="w-full">
        Create Room
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from './Button.vue'

const emit = defineEmits<{
  createRoom: [name: string, roomCode?: string]
}>()

const roomName = ref('')
const roomCode = ref('')

const handleSubmit = (e: Event) => {
  e.preventDefault()
  if (roomName.value.trim()) {
    emit('createRoom', roomName.value.trim(), roomCode.value.trim())
    roomName.value = ''
    roomCode.value = ''
  }
}
</script>