<template>
  <div class="mb-6">
    <!-- Collapsible Header -->
    <div class="flex items-center justify-between mb-3">
      <div 
        class="flex items-center cursor-pointer hover:bg-slate-800/30 transition-colors rounded-md p-2 flex-1"
        @click="isExpanded = !isExpanded"
      >
        <h3 class="text-lg font-semibold text-white">
          Participants ({{ participants.length }})
        </h3>
        <svg 
          class="w-5 h-5 text-slate-300 transition-transform duration-200 ml-2"
          :class="{ 'rotate-180': isExpanded }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      <!-- Compact View Toggle -->
      <button
        v-if="isExpanded"
        @click.stop="isCompactView = !isCompactView"
        class="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
        :class="{ 'bg-sky-600 text-white': isCompactView }"
      >
        {{ isCompactView ? 'Detailed' : 'Compact' }}
      </button>
    </div>
    
    <!-- Collapsible Content -->
    <div v-show="isExpanded" :class="isCompactView ? 'flex flex-wrap gap-2' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'">
      <div 
        v-for="participant in participants" 
        :key="participant.id"
        class="transition-all duration-200 cursor-pointer"
        :class="[
          isCompactView 
            ? 'p-2 bg-transparentbg rounded-lg border flex items-center space-x-2 min-w-0' 
            : 'p-3 bg-transparentbg rounded-lg border',
          {
            'border-sky-500 bg-sky-500/10': selectedParticipantFilter === participant.name,
            'border-slate-700 hover:border-slate-600': selectedParticipantFilter !== participant.name
          }
        ]"
        @click="handleParticipantClick(participant.name)"
      >
        <!-- Compact View: Just avatar and name -->
        <template v-if="isCompactView">
          <div class="relative">
            <div 
              v-if="participant.terraRP?.avatar_url" 
              class="w-10 h-10 rounded-full overflow-hidden bg-slate-600 flex-shrink-0 ring-2 ring-slate-600"
            >
              <img 
                :src="participant.terraRP.avatar_url" 
                :alt="`${participant.name} avatar`" 
                class="w-full h-full object-cover" 
              />
            </div>
            <div 
              v-else 
              class="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0 ring-2 ring-slate-600"
            >
              <span class="text-slate-200 text-sm font-bold">
                {{ participant.name.charAt(0).toUpperCase() }}
              </span>
            </div>
            
            <!-- TerraRP indicator -->
            <div 
              v-if="participant.terraRP" 
              class="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-slate-800 flex items-center justify-center"
              title="TerraRP User"
            >
              <span class="text-xs text-slate-900 font-bold">T</span>
            </div>
          </div>
          
          <div class="flex items-center space-x-2 min-w-0">
            <h4 class="font-semibold text-slate-200 truncate text-sm">
              {{ participant.name }}
            </h4>
            <span 
              v-if="isCurrentUser(participant.name)"
              class="px-1.5 py-0.5 text-xs bg-[#a7357b] text-white rounded-full flex-shrink-0"
            >
              You
            </span>
            <span 
              v-if="isCreator(participant)"
              class="px-1.5 py-0.5 text-xs bg-amber-600 text-white rounded-full flex-shrink-0"
            >
              Creator
            </span>
          </div>
        </template>

        <!-- Detailed View: Full participant card -->
        <template v-else>
          <!-- Header with avatar and name -->
          <div class="flex items-center space-x-3 mb-2">
            <div class="relative">
              <div 
                v-if="participant.terraRP?.avatar_url" 
                class="w-12 h-12 rounded-full overflow-hidden bg-slate-600 flex-shrink-0 ring-2 ring-slate-600"
              >
                <img 
                  :src="participant.terraRP.avatar_url" 
                  :alt="`${participant.name} avatar`" 
                  class="w-full h-full object-cover" 
                />
              </div>
              <div 
                v-else 
                class="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0 ring-2 ring-slate-600"
              >
                <span class="text-slate-200 text-lg font-bold">
                  {{ participant.name.charAt(0).toUpperCase() }}
                </span>
              </div>
              
              <!-- TerraRP indicator -->
              <div 
                v-if="participant.terraRP" 
                class="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-slate-800 flex items-center justify-center"
                title="TerraRP User"
              >
                <span class="text-xs text-slate-900 font-bold">T</span>
              </div>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2">
                <h4 class="font-semibold text-slate-200 truncate">
                  {{ participant.name }}
                </h4>
                <span 
                  v-if="isCurrentUser(participant.name)"
                  class="px-2 py-0.5 text-xs bg-[#a7357b] text-white rounded-full"
                >
                  You
                </span>
                <span 
                  v-if="isCreator(participant)"
                  class="px-2 py-0.5 text-xs bg-amber-600 text-white rounded-full"
                >
                  Creator
                </span>
              </div>
              
              <!-- Custom title -->
              <p 
                v-if="participant.terraRP?.custom_title" 
                class="text-xs font-semibold truncate"
                v-html="stripHtml(participant.terraRP.custom_title)"
              />
              
              <!-- Race -->
              <p 
                v-if="participant.terraRP?.race" 
                class="text-xs text-slate-400"
              >
                {{ participant.terraRP.race }}
              </p>
            </div>
          </div>
          <!-- TerraRP Details -->
          <div v-if="participant.terraRP" class="space-y-2">
          <!-- Equipment -->
          <div v-if="participant.terraRP.weapon_rank || participant.terraRP.armor_rank" class="grid grid-cols-2 justify-between gap-1">
            <span 
              v-if="participant.terraRP.weapon_rank"
              class="flex justify-between px-2 py-1 text-xs bg-[#6335a7] text-white rounded border border-red-600/30"
            >
              Weapon <span class="font-bold" :class="getRankColor(participant.terraRP.weapon_rank)">{{ participant.terraRP.weapon_rank }}</span>
            </span>
            <span 
              v-if="participant.terraRP.armor_rank"
              class="flex justify-between px-2 py-1 text-xs bg-[#6335a7] text-white rounded border border-blue-600/30"
            >
              <span>{{ participant.terraRP.armor_type || 'Armor' }}</span> <span class="font-bold" :class="getRankColor(participant.terraRP.armor_rank)">{{ participant.terraRP.armor_rank }}</span>
            </span>
          </div>

          <!-- Masteries -->
          <div v-if="participant.terraRP.masteries?.length > 0" class="space-y-1">
            <p class="text-xs text-slate-400 font-medium">Masteries:</p>
            <div class="grid grid-cols-2 justify-between gap-1">
              <span 
                v-for="mastery in participant.terraRP.masteries"
                :key="mastery.Mastery"
                class="flex justify-between px-2 py-0.5 text-xs bg-[#4273c5] text-white rounded border border-purple-600/30"
                :title="`${mastery.Mastery}: ${mastery.Rank}`"
              >
                <span>{{ mastery.Mastery }}</span> <span class="font-bold" :class="getRankColor(mastery.Rank)">{{ mastery.Rank }}</span>
              </span>
            </div>
          </div>
          </div>

          <!-- Join time -->
          <div class="mt-2 pt-2 border-t border-slate-700">
            <p class="text-xs text-slate-500">
              Joined {{ formatRelativeTime(participant.joinedAt) }}
            </p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RoomParticipant } from '../types'

interface RoomParticipantsProps {
  participants: RoomParticipant[]
  currentUserName: string
  selectedParticipantFilter?: string | null
  creatorName?: string | null
  creatorTerraRpId?: string | null
}

const emit = defineEmits<{
  participantSelect: [participantName: string | null]
}>()

const props = defineProps<RoomParticipantsProps>()

// Collapsible state - start expanded
const isExpanded = ref(true)

// Compact view state - start with detailed view
const isCompactView = ref(false)

const isCurrentUser = (name: string) => {
  return name === props.currentUserName
}

const isCreator = (participant: RoomParticipant) => {
  // Check by name first, then by TerraRP ID if available
  if (props.creatorName && participant.name === props.creatorName) {
    return true
  }
  if (props.creatorTerraRpId && participant.terraRP?.user_id && 
      participant.terraRP.user_id.toString() === props.creatorTerraRpId.toString()) {
    return true
  }
  return false
}

const handleParticipantClick = (participantName: string) => {
  if (props.selectedParticipantFilter === participantName) {
    emit('participantSelect', null)
  } else {
    emit('participantSelect', participantName)
  }
}

const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, '')
}

const getAdditionalMasteriesText = (masteries: { Mastery: string; Rank: string }[]) => {
  return masteries.map(m => `${m.Mastery}: ${m.Rank}`).join('\n')
}

const getRankColor = (rank: string) => {
  switch (rank.toUpperCase()) {
    case 'S': return 'text-yellow-400' // Gold
    case 'A': return 'text-orange-400' // Orange  
    case 'B': return 'text-pink-400'   // Pink
    case 'C': return 'text-green-400'  // Green
    case 'D': return 'text-blue-400'   // Blue
    case 'E': return 'text-gray-400'   // Grey
    default: return 'text-yellow-400'  // Default to gold
  }
}

const formatRelativeTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}
</script>