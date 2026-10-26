export type ApiResponse<T = undefined> = {
  success: boolean
  message?: string
  data?: T
  token?: string
  user?: UserProfile
}

export type UserProfile = {
  id: number
  fullname: string
  email: string
  profileImageUrl: string | null
  createdAt: string
}

export type RegisterInput = {
  fullname: string
  email: string
  password: string
}

export type LoginInput = {
  email: string
  password: string
}
