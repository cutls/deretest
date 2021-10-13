export interface IQuestion {
    title: string
    description: string
    questions: IQuiz[]
}
export interface IQuiz {
    uniqueId: string
    string: string
    attached?: string
    answerType: 'select' | 'input' | 'idol' | 'card' | 'song'
    config?: IConfig
    inputTypeRegExp?: string
    questionType: 'normal' | 'withImage' | 'withAudio'
    correctAnswer: string | string[]
    answers?: string[]
    allowToUseTerminal?: boolean
    point: number
}

export interface IConfig {
    filter: 'allSsr' | 'ssr' | 'sr' | 'r' | 'ssr+' | 'sr+' | 'r+' | 'n' | 'n+' | 'all'
    showImage: boolean
    clickToDetail: boolean
}
export interface IFujiwarahajime {
    name: string,
    type: 'music',
    music_type: 'cg',
    song_id: number,
    link: string,
    api: string
}
export interface IKirara {
    result: ICard[]
}
export interface ICard {
    title: string | null
    name_only: string
    rarity_dep: Rarity
    id: number
    evolution_id: number
}
export interface AppCard {
    title: string
    id: number
    plus: boolean
}
interface Rarity {
    rarity: number
    [key: string]: number
}
export interface ENV {
    uploader: string
    post: string
    get: string
    auth: string
}