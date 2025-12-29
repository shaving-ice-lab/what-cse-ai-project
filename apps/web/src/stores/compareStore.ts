import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Position {
  id: number
  position_name: string
  department_name: string
  work_location: string
  education_requirement: string
  major_requirement: string
  political_requirement: string
  work_experience_requirement: string
  recruit_count: number
  exam_type: string
}

interface CompareState {
  compareList: Position[]
  maxCompareCount: number
  
  addToCompare: (position: Position) => boolean
  removeFromCompare: (positionId: number) => void
  clearCompare: () => void
  isInCompare: (positionId: number) => boolean
  canAddMore: () => boolean
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      compareList: [],
      maxCompareCount: 4,

      addToCompare: (position) => {
        const state = get()
        if (state.compareList.length >= state.maxCompareCount) {
          return false
        }
        if (state.compareList.some(p => p.id === position.id)) {
          return false
        }
        set({ compareList: [...state.compareList, position] })
        return true
      },

      removeFromCompare: (positionId) => {
        set((state) => ({
          compareList: state.compareList.filter(p => p.id !== positionId)
        }))
      },

      clearCompare: () => {
        set({ compareList: [] })
      },

      isInCompare: (positionId) => {
        return get().compareList.some(p => p.id === positionId)
      },

      canAddMore: () => {
        const state = get()
        return state.compareList.length < state.maxCompareCount
      },
    }),
    {
      name: 'position-compare-storage',
    }
  )
)
