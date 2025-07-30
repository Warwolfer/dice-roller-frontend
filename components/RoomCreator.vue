<template>
  <form @submit="handleSubmit" class="mb-6 p-4 bg-slate-800 rounded-lg shadow-md">
    <label for="roomName" class="block text-sm font-medium text-slate-300 mb-1">
      Create New Room:
    </label>
    <div class="flex space-x-2">
      <input
        id="roomName"
        type="text"
        v-model="roomName"
        placeholder="E.g., Dragon's Lair"
        class="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100"
        aria-label="New room name"
      />
      <Button type="submit" variant="primary">
        Create Room
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from './Button.vue'

const emit = defineEmits<{
  createRoom: [name: string]
}>()

const roomName = ref('')

const handleSubmit = (e: Event) => {
  e.preventDefault()
  if (roomName.value.trim()) {
    emit('createRoom', roomName.value.trim())
    roomName.value = ''
  }
}
</script>