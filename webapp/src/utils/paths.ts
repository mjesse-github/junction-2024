// Default to empty string for local development
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

export const getImagePath = (path: string) => `${BASE_PATH}/${path}`
