export interface MalEpisode {
    episode_id: number
    title: string
    filler: boolean,
    recap: boolean,
}


export interface MalResponse {
    episodes_last_page?: number;
    episodes?: MalEpisode[];
}
