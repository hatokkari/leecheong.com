import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

// src/assets 안의 원본. 빌드 시 webp로 변환·리사이즈된다.
const assets = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/**/*.{webp,jpg,jpeg,png,avif,gif}',
  { eager: true },
);

export interface Photo {
  /** 격자용 작은 이미지 */
  thumb: string;
  /** 슬라이더 등 중간 크기 */
  mid: string;
  /** 확대해서 볼 때 쓰는 큰 이미지 */
  full: string;
  /** 브라우저가 표시 크기에 맞춰 고르도록 */
  srcset: string;
}

const WIDTHS = { thumb: 400, mid: 800, full: 1600 } as const;

/**
 * 관리자에 저장된 이미지 경로 목록 → 화면에서 쓸 URL 묶음.
 *
 * 한 장을 여러 크기로 만들어 두고 표시 크기에 맞는 것을 쓰게 한다.
 * 격자에 1600px 원본을 그대로 넣으면 보이는 크기의 열 배짜리를 내려받게 된다.
 *
 * 관리자에서 실수하기 쉬운 두 경우도 여기서 흡수한다.
 *  - 외부 URL: 최적화는 못 하지만 그대로 보여준다(사진이 말없이 사라지지 않도록).
 *  - 파일을 찾을 수 없는 경우: 빌드 로그에 경고를 남긴다.
 */
export async function resolvePhotos(paths: string[] = []): Promise<Photo[]> {
  const out: Photo[] = [];

  for (const path of paths) {
    if (!path) continue;

    if (/^https?:\/\//i.test(path)) {
      console.warn(`[이미지 안내] 외부 URL을 그대로 사용합니다(최적화 안 됨): ${path}`);
      out.push({ thumb: path, mid: path, full: path, srcset: '' });
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

    const src = mod.default;
    // 원본보다 크게 늘리지 않는다
    const cap = (w: number) => Math.min(w, src.width || w);
    const [thumb, mid, full] = await Promise.all([
      getImage({ src, width: cap(WIDTHS.thumb), format: 'webp' }),
      getImage({ src, width: cap(WIDTHS.mid), format: 'webp' }),
      getImage({ src, width: cap(WIDTHS.full), format: 'webp' }),
    ]);

    out.push({
      thumb: thumb.src,
      mid: mid.src,
      full: full.src,
      // 격자에서 고를 후보는 작은 두 가지만. 큰 이미지는 확대해서 볼 때만 쓴다.
      srcset: [
        `${thumb.src} ${cap(WIDTHS.thumb)}w`,
        `${mid.src} ${cap(WIDTHS.mid)}w`,
      ].join(', '),
    });
  }

  return out;
}
