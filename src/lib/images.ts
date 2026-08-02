import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

// src/assets 안의 원본. 빌드 시 webp로 변환·리사이즈된다.
const assets = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/**/*.{webp,jpg,jpeg,png,avif,gif}',
  { eager: true },
);

/**
 * 관리자에 저장된 이미지 경로 목록 → 실제 표시할 URL 목록.
 *
 * 관리자에서 실수하기 쉬운 두 경우를 여기서 흡수한다.
 *  - 외부 URL을 붙여넣은 경우: 최적화는 못 하지만 그대로 보여준다(사진이 말없이 사라지지 않도록).
 *  - 파일을 찾을 수 없는 경우(경로 오타, 지원하지 않는 확장자 등): 빌드 로그에 경고를 남긴다.
 *    조용히 빠지면 사진 한 장이 없어진 걸 아무도 모른 채 배포된다.
 */
export async function resolvePhotos(paths: string[] = [], width = 1600): Promise<string[]> {
  const out: string[] = [];
  for (const path of paths) {
    if (!path) continue;

    if (/^https?:\/\//i.test(path)) {
      console.warn(`[이미지 안내] 외부 URL을 그대로 사용합니다(최적화 안 됨): ${path}`);
      out.push(path);
      continue;
    }

    const mod = assets[path];
    if (!mod) {
      console.warn(
        `[이미지 없음] ${path} — 파일이 없거나 지원하지 않는 형식입니다. ` +
          `관리자에서 해당 사진을 다시 업로드하세요. (지원: webp, jpg, png, avif, gif)`,
      );
      continue;
    }

    const img = await getImage({ src: mod.default, width, format: 'webp' });
    out.push(img.src);
  }
  return out;
}
