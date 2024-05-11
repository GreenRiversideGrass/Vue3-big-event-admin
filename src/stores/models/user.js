// 用户模块的 token setToken removeToken
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userGetInfoService } from '@/api/user.js'
// 用户模块
export const useUserStore = defineStore(
  'big-user',
  () => {
    const token = ref('') // 定义 token
    const setToken = (newToken) => (token.value = newToken) // 设置 token
    const removeToken = () => (token.value = '')

    const user = ref({})
    const getUser = async () => {
      const res = await userGetInfoService() //请求获取数据
      user.value = res.data.data
    }
    const setUser = (obj) => {
      user.value = obj
    }
    return { token, setToken, removeToken, user, getUser, setUser }
  },
  {
    persist: true // 持久化
  }
)
