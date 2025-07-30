<template>
  <form @submit="handleSubmit" class="mb-6 p-4 bg-slate-800 rounded-lg shadow-md">
    <label for="username" class="block text-sm font-medium text-slate-300 mb-1">
      Enter Your Name:
    </label>
    <div class="flex space-x-2">
      <input
        id="username"
        type="text"
        v-model="name"
        placeholder="E.g., DungeonMaster"
        class="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100"
        aria-label="Username"
      />
      <Button type="submit" variant="primary">
        Set Name
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from './Button.vue'

interface UserInputProps {
  currentName?: string | null
}

const props = defineProps<UserInputProps>()
const emit = defineEmits<{
  setUser: [name: string]
}>()

const name = ref('')

const handleSubmit = (e: Event) => {
  e.preventDefault()
  if (name.value.trim()) {
    emit('setUser', name.value.trim())
  }
}

onMounted(() => {
  name.value = props.currentName || ''
})
</script>