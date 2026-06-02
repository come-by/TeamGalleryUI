export interface InteractionStatus {
  is_liked: boolean
  is_favorited: boolean
}

export interface InteractionListParams {
  page?: number
  page_size?: number
}
