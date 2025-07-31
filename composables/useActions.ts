import { ref, reactive, readonly, onUnmounted } from 'vue'
import { API_BASE_URL } from '../constants'
import type { Action } from '../types'
import { useApiCache } from './useApiCache'

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

// Track active fetch requests for cleanup
const activeRequests = new Set<AbortController>()

export function useActions() {
  const { cachedFetch } = useApiCache()
  
  const fetchActions = async () => {
    // Don't fetch if already loaded
    if (actionsState.isLoaded && actionsState.actions.length > 0) {
      return
    }

    actionsState.isLoading = true
    actionsState.error = null

    const controller = new AbortController()
    activeRequests.add(controller)

    try {
      const data: ActionsData = await cachedFetch(`${API_BASE_URL}/actions`, {
        signal: controller.signal
      }, 300000) // 5 minute TTL for actions data
      
      actionsState.actions = data.actions
      actionsState.categories = data.categories
      actionsState.rankBonuses = data.rankBonuses
      actionsState.isLoaded = true
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Actions fetch cancelled')
        return
      }
      console.error('Error fetching actions:', error)
      actionsState.error = error instanceof Error ? error.message : 'Failed to fetch actions'
    } finally {
      actionsState.isLoading = false
      activeRequests.delete(controller)
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

  const cleanup = () => {
    // Cancel all active requests
    for (const controller of activeRequests) {
      controller.abort()
    }
    activeRequests.clear()
  }

  // Cleanup on unmount if used in a component context
  if (typeof onUnmounted === 'function') {
    onUnmounted(cleanup)
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
    clearError,
    cleanup
  }
}