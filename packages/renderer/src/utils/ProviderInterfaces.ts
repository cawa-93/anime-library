interface HasID {
  id: NumberLike
}

interface HasTitle {
  title: string
}

export interface Series extends HasID, HasTitle {

}

export interface Episode extends HasID, HasTitle {
  /**
   * Порядковый номер эпизода в сериале
   */
  number: number
}

export type TranslationType = 'sub' | 'voice'

export interface Translation extends HasID, HasTitle {
  /**
   * Тип перевода: Озвучка или субтитры
   */
  type: TranslationType
}

export interface Video {
  quality: number
  url: string
}
