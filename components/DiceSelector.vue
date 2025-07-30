<template>
  <div class="flex items-center space-x-2">
    <label for="dice-type" class="text-slate-300 font-medium">
      Select Dice:
    </label>
    <select
      id="dice-type"
      :value="selectedDice"
      @change="onChange"
      :disabled="disabled"
      class="p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 disabled:opacity-50"
    >
      <option
        v-for="option in DICE_OPTIONS"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { Dice } from '../types'
import { DICE_OPTIONS } from '../constants'

interface DiceSelectorProps {
  selectedDice: Dice
  disabled?: boolean
}

defineProps<DiceSelectorProps>()
const emit = defineEmits<{
  change: [dice: Dice]
}>()

const onChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  emit('change', parseInt(target.value) as Dice)
}
</script>