import type {Ref} from 'vue';
import type {Video} from '/@/utils/videoProvider';
import {clearVideosCache, getVideo} from '/@/utils/videoProvider';
import {ref, unref, watch} from 'vue';


const preloadedVideos = new Map<number, Video>();

type useVideosReturn = {
  readonly reload: (quality?: number, clearCache?: boolean) => Promise<void>;
  readonly isEvaluating: Ref<boolean>;
  readonly video: Ref<Video | undefined>;
  readonly preload: (id: (number | string)) => Promise<Video | undefined>
}


export function useVideos(translationId: Ref<number | string | undefined | null>): useVideosReturn {
  const evaluating = ref(true);

  const $video = ref<Video | undefined>();
  const reload = async (quality?: number, clearCache = false) => {
    evaluating.value = true;
    try {
      const id = unref(translationId);

      if (!id) {
        $video.value = undefined;
        return;
      }

      if (clearCache) {
        preloadedVideos.delete(Number(id));
        await clearVideosCache(id);
      }

      const video = preloadedVideos.get(Number(id)) || await getVideo(id);

      preloadedVideos.delete(Number(id));

      if (!video) {
        $video.value = undefined;
        return;
      }

      if (quality === undefined) {
        $video.value = video;
        return;
      }

      const targetQualityURL = video.qualities.get(quality);

      if (!targetQualityURL) {
        $video.value = video;
      } else {
        $video.value?.qualities.set(quality, targetQualityURL);
      }
    } finally {
      evaluating.value = false;
    }
  };

  watch(translationId, () => reload(), {immediate: true});

  const preload = async (id: number | string) => {
    const cached = preloadedVideos.get(Number(id));
    if (cached) {
      return cached;
    }

    const video = await getVideo(id);
    if (!video) {
      return undefined;
    }

    preloadedVideos.set(Number(id), video);

    // Предзагрузка медиа-файла
    const link = document.createElement('video');
    link.preload = 'auto';
    link.crossOrigin = 'anonymous';
    link.src = video.qualities.values().next().value;

    return video;
  };

  return {
    reload,
    video: $video,
    isEvaluating: evaluating,
    preload,
  };
}
