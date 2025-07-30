import { ref, reactive, readonly } from 'vue'
import { API_BASE_URL } from '../constants'
import type { Action } from '../types'

interface ActionsData {
  actions: Action[]
  categories: string[]
  rankBonuses: Record<string, number>
}

// Global state for actions
const actionsState = reactive({
  actions: [] as Action[],
  categories: [] as string[],
  rankBonuses: {} as Record<string, number>,
  isLoading: false,
  error: null as string | null,
  isLoaded: false
})

export function useActions() {
  const fetchActions = async () => {
    // Don't fetch if already loaded
    if (actionsState.isLoaded && actionsState.actions.length > 0) {
      return
    }

    actionsState.isLoading = true
    actionsState.error = null

    try {
      const response = await fetch(`${API_BASE_URL}/actions`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch actions: ${response.status} ${response.statusText}`)
      }

      const data: ActionsData = await response.json()
      
      actionsState.actions = data.actions
      actionsState.categories = data.categories
      actionsState.rankBonuses = data.rankBonuses
      actionsState.isLoaded = true
      
    } catch (error) {
      console.error('Error fetching actions:', error)
      actionsState.error = error instanceof Error ? error.message : 'Failed to fetch actions'
    } finally {
      actionsState.isLoading = false
    }
  }

  const getActionsByCategory = (category: string) => {
    return actionsState.actions.filter(action => action.category === category)
  }

  const getActionByName = (name: string) => {
    return actionsState.actions.find(action => action.name === name)
  }

  const getRankOptions = () => {
    const ranks = ['E', 'D', 'C', 'B', 'A', 'S'] as const
    return ranks.map(rank => ({
      label: rank,
      value: rank,
      bonus: actionsState.rankBonuses[rank] || 0
    }))
  }

  const clearError = () => {
    actionsState.error = null
  }

  return {
    // State
    actions: actionsState.actions,
    categories: actionsState.categories,
    rankBonuses: actionsState.rankBonuses,
    isLoading: readonly(ref(() => actionsState.isLoading)),
    error: readonly(ref(() => actionsState.error)),
    isLoaded: readonly(ref(() => actionsState.isLoaded)),
    
    // Methods
    fetchActions,
    getActionsByCategory,
    getActionByName,
    getRankOptions,
    clearError
  }
}