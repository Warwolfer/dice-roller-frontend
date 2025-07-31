<template>
  <div class="p-6 bg-slate-800 rounded-lg shadow-xl">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-sky-400">{{ room.name }}</h2>
      <Button @click="onLeaveRoom" variant="secondary" size="sm" :disabled="isLoading">
        Leave Room
      </Button>
    </div>
    
    <div class="mb-6 bg-slate-700/50 rounded-md">
      <!-- Collapsible Header -->
      <div 
        class="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-700/70 transition-colors rounded-md"
        @click="isRollSectionExpanded = !isRollSectionExpanded"
      >
        <h3 class="text-lg font-semibold text-sky-400">Roll</h3>
        <svg 
          class="w-5 h-5 text-slate-300 transition-transform duration-200"
          :class="{ 'rotate-180': isRollSectionExpanded }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      <!-- Collapsible Content -->
      <div v-show="isRollSectionExpanded" class="px-4 pb-4">
        <!-- Roll Type Toggle -->
        <div class="mb-4 flex items-center space-x-4">
        <span class="text-slate-300 font-medium">Roll Type:</span>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            value="dice"
            v-model="rollType"
            :disabled="isLoading"
            class="text-sky-500 bg-slate-700 border-slate-600 focus:ring-sky-500"
          />
          <span class="text-slate-300">Dice Roll</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            value="action"
            v-model="rollType"
            :disabled="isLoading"
            class="text-sky-500 bg-slate-700 border-slate-600 focus:ring-sky-500"
          />
          <span class="text-slate-300">Action Roll</span>
        </label>
      </div>

      <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div class="flex-grow w-full sm:w-auto">
          <!-- Dice Selector (shown when rollType is 'dice') -->
          <DiceSelector 
            v-if="rollType === 'dice'"
            :selectedDice="selectedDice" 
            @change="setSelectedDice" 
            :disabled="isLoading" 
          />
          
          <!-- Action Selector (shown when rollType is 'action') -->
          <ActionSelector
            v-if="rollType === 'action'"
            :selectedAction="selectedAction"
            :weaponRank="weaponRank"
            :masteryRank="masteryRank"
            :disabled="isLoading"
            @actionChange="setSelectedAction"
            @weaponRankChange="setWeaponRank"
            @masteryRankChange="setMasteryRank"
          />
          
          <div class="mt-3">
            <label for="rollComment" class="block text-xs font-medium text-slate-400 mb-1">
              Comment (optional):
            </label>
            <input
              id="rollComment"
              type="text"
              v-model="rollComment"
              placeholder="E.g., Attacking the goblin"
              class="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 text-sm"
              :disabled="isLoading"
              aria-label="Roll comment"
            />
          </div>
        </div>
        <Button 
          @click="handleRoll" 
          :disabled="isLoading || !userName || (rollType === 'action' && !selectedAction)" 
          variant="primary" 
          size="lg" 
          class="w-full sm:w-auto sm:self-end mt-3 sm:mt-0"
          aria-live="polite"
        >
          {{ buttonText }}
        </Button>
      </div>
        <div 
          v-if="isAnimatingRoll || animatedRollResult !== null" 
          class="mt-4 text-center p-3 bg-slate-600 rounded-md"
        >
          <span v-if="isAnimatingRoll" class="text-slate-300 animate-pulse">
            Rolling...
          </span>
          <span v-else-if="animatedRollResult !== null">
            <span class="text-slate-300">You rolled: </span>
            <span class="text-3xl font-bold text-amber-400">{{ animatedRollResult }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Participants Section -->
    <RoomParticipants 
      :participants="room.participants" 
      :current-user-name="userName" 
    />

    <RollHistory :rolls="room.rolls" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Room, Dice, Roll, Action, Rank } from '../types'
import DiceSelector from './DiceSelector.vue'
import ActionSelector from './ActionSelector.vue'
import RollHistory from './RollHistory.vue'
import RoomParticipants from './RoomParticipants.vue'
import Button from './Button.vue'
import { DICE_OPTIONS, RANK_OPTIONS } from '../constants'
import { useActions } from '../composables/useActions'

interface RoomViewProps {
  room: Room
  userName: string
  isSubmittingRoll: boolean
  defaultWeaponRank?: Rank | null
  defaultMasteryRank?: Rank | null
  userAvatar?: string | null
}

const props = defineProps<RoomViewProps>()
const emit = defineEmits<{
  roll: [roomId: string, diceType: Dice, userName: string, comment?: string, avatarUrl?: string]
  actionRoll: [roomId: string, action: Action, userName: string, weaponRank: Rank, masteryRank: Rank, comment?: string, avatarUrl?: string]
  leaveRoom: []
}>()

const { fetchActions } = useActions()

// Roll type toggle
const rollType = ref<'dice' | 'action'>('dice')

// Dice roll state
const selectedDice = ref<Dice>(DICE_OPTIONS[0].value)

// Action roll state
const selectedAction = ref<Action | null>(null)
const weaponRank = ref<Rank>(props.defaultWeaponRank || Rank.E)
const masteryRank = ref<Rank>(props.defaultMasteryRank || Rank.E)

// Common state
const rollComment = ref('')
const isAnimatingRoll = ref(false)
const animatedRollResult = ref<number | null>(null)
const isRollSectionExpanded = ref(false) // Start collapsed

const isLoading = computed(() => props.isSubmittingRoll || isAnimatingRoll.value)

const buttonText = computed(() => {
  if (isAnimatingRoll.value) return 'Rolling...'
  if (props.isSubmittingRoll) return 'Submitting...'
  
  if (rollType.value === 'dice') {
    return `Roll ${DICE_OPTIONS.find(d => d.value === selectedDice.value)?.label || ''}`
  } else {
    return selectedAction.value ? `Roll ${selectedAction.value.name}` : 'Select Action'
  }
})

const setSelectedDice = (dice: Dice) => {
  selectedDice.value = dice
}

const setSelectedAction = (action: Action | null) => {
  selectedAction.value = action
}

const setWeaponRank = (rank: Rank) => {
  weaponRank.value = rank
}

const setMasteryRank = (rank: Rank) => {
  masteryRank.value = rank
}

const onLeaveRoom = () => {
  emit('leaveRoom')
}

const handleRoll = async () => {
  isAnimatingRoll.value = true
  animatedRollResult.value = null

  try {
    if (rollType.value === 'dice') {
      emit('roll', props.room.id, selectedDice.value, props.userName, rollComment.value, props.userAvatar || undefined)
    } else if (selectedAction.value) {
      emit('actionRoll', props.room.id, selectedAction.value, props.userName, weaponRank.value, masteryRank.value, rollComment.value, props.userAvatar || undefined)
    }
    rollComment.value = '' // Clear comment input after emitting roll
  } catch (error) {
    console.error("Error during roll execution in RoomView:", error)
    isAnimatingRoll.value = false
    animatedRollResult.value = null
  }
}

onMounted(() => {
  fetchActions()
})

// Watch for changes in default ranks (e.g., from TerraRP data updates)
watch([() => props.defaultWeaponRank, () => props.defaultMasteryRank], ([newWeaponRank, newMasteryRank]) => {
  // Only update weapon rank if we have a valid TerraRP weapon rank
  if (newWeaponRank && newWeaponRank !== weaponRank.value) {
    weaponRank.value = newWeaponRank
  }
  // Don't automatically set mastery rank - let user choose manually
  // Mastery rank is not tied to equipment/armor
})

// Watch for changes in room id, selected dice, or roll type to reset animation
watch([() => props.room.id, selectedDice, rollType], () => {
  animatedRollResult.value = null
  isAnimatingRoll.value = false
})

// Watch for new rolls from the current user to show the result (shallow watch for better performance)
watch(() => [props.room.rolls.length, props.room.rolls[0]?.id], ([newLength, newLatestId], [oldLength, oldLatestId]) => {
  if (newLength > (oldLength || 0) && newLatestId !== oldLatestId) {
    const latestRoll = props.room.rolls[0] // Rolls are sorted by timestamp desc
    if (latestRoll.userName === props.userName) {
      // Show the actual roll result and stop rolling animation
      animatedRollResult.value = latestRoll.result
      isAnimatingRoll.value = false
    }
  }
})
</script>