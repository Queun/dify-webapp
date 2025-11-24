import { useState } from 'react'
import produce from 'immer'
import { useGetState } from 'ahooks'
import type { ConversationItem } from '@/types/app'
import { getChatStorageKey } from '@/utils/auth'

const storageConversationIdKey = 'conversationIdInfo'

// 获取当前用户的conversation storage key
function getUserConversationKey() {
  const chatKey = getChatStorageKey()
  if (!chatKey) { return storageConversationIdKey }
  // 为每个用户创建独立的conversation key
  return `${chatKey}_conversations`
}

type ConversationInfoType = Omit<ConversationItem, 'inputs' | 'id'>
function useConversation() {
  const [conversationList, setConversationList] = useState<ConversationItem[]>([])
  const [currConversationId, doSetCurrConversationId, getCurrConversationId] = useGetState<string>('-1')

  // when set conversation id, we do not have set appId
  const setCurrConversationId = (id: string, appId: string, isSetToLocalStroge = true, newConversationName = '') => {
    doSetCurrConversationId(id)
    if (isSetToLocalStroge && id !== '-1') {
      // 使用用户隔离的storage key
      const userConversationKey = getUserConversationKey()
      // conversationIdInfo: {[appId1]: conversationId1, [appId2]: conversationId2}
      const conversationIdInfo = globalThis.localStorage?.getItem(userConversationKey) ? JSON.parse(globalThis.localStorage?.getItem(userConversationKey) || '') : {}
      conversationIdInfo[appId] = id
      globalThis.localStorage?.setItem(userConversationKey, JSON.stringify(conversationIdInfo))
    }
  }

  const getConversationIdFromStorage = (appId: string) => {
    // 使用用户隔离的storage key
    const userConversationKey = getUserConversationKey()
    const conversationIdInfo = globalThis.localStorage?.getItem(userConversationKey) ? JSON.parse(globalThis.localStorage?.getItem(userConversationKey) || '') : {}
    const id = conversationIdInfo[appId]
    return id
  }

  const isNewConversation = currConversationId === '-1'
  // input can be updated by user
  const [newConversationInputs, setNewConversationInputs] = useState<Record<string, any> | null>(null)
  const resetNewConversationInputs = () => {
    if (!newConversationInputs) { return }
    setNewConversationInputs(produce(newConversationInputs, (draft) => {
      Object.keys(draft).forEach((key) => {
        draft[key] = ''
      })
    }))
  }
  const [existConversationInputs, setExistConversationInputs] = useState<Record<string, any> | null>(null)
  const currInputs = isNewConversation ? newConversationInputs : existConversationInputs
  const setCurrInputs = isNewConversation ? setNewConversationInputs : setExistConversationInputs

  // info is muted
  const [newConversationInfo, setNewConversationInfo] = useState<ConversationInfoType | null>(null)
  const [existConversationInfo, setExistConversationInfo] = useState<ConversationInfoType | null>(null)
  const currConversationInfo = isNewConversation ? newConversationInfo : existConversationInfo

  return {
    conversationList,
    setConversationList,
    currConversationId,
    getCurrConversationId,
    setCurrConversationId,
    getConversationIdFromStorage,
    isNewConversation,
    currInputs,
    newConversationInputs,
    existConversationInputs,
    resetNewConversationInputs,
    setCurrInputs,
    currConversationInfo,
    setNewConversationInfo,
    setExistConversationInfo,
  }
}

export default useConversation
