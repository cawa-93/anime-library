export async function* getFramesFromVideo(timestamps: number[], videoSource: string): AsyncGenerator<{ time: number, data: string }, void> {
  const video = document.createElement('video');
  video.height = 100;
  video.preload = 'metadata';
  video.src = videoSource + '#t=' + timestamps[0];
  video.crossOrigin = 'anonymous';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Не удалось создать 2d контекст для canvas для отрисовки привью видео-таймлайна');
  }

  const loadedmetadata = new Promise(r => video.onloadedmetadata = r);
  const getFrame = (time: number) => new Promise<string>(resolve => {
    video.onseeked = () => {
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      resolve(canvas.toDataURL());
    };
    video.currentTime = time;
  });

  for (const timestamp of timestamps) {
    await loadedmetadata;
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;

    yield {
      time: timestamp,
      data: await getFrame(timestamp),
    };
  }

}

