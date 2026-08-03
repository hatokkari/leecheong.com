$(function() {
    // 서브 메뉴 동작
    $('.submenu-btn').on('click', function() {
        var target = $(this).data('target');
        // 버튼 active 처리
        $('.submenu-btn').removeClass('active');
        $(this).addClass('active');
        // 섹션 표시/숨김
        $('.submenu-content').hide();
        $('#' + target).show();
    });

    // 페이지 진입 시 PHOTOS가 먼저 보이도록 강제
    $('.submenu-btn[data-target="photos-section"]').addClass('active');
    $('.submenu-btn[data-target="books-section"]').removeClass('active');
    $('#photos-section').show();
    $('#books-section').hide();
});

document.addEventListener('DOMContentLoaded', () => {
    // 모든 프로젝트를 위한 이미지 폴더 매핑
    const projectFolders = {
        'backward-drift': 'backward-drift',
        'glass-eye': 'glass-eye',
        'the-faceless': 'the-faceless',
        'shade-of-blue': 'shade-of-blue',
        'imperfect-jeonju': 'imperfect-jeonju',
        'glass-eye-book': 'glass-eye',
        'shade-of-blue-book': 'shade-of-blue'
    };

    // 이미지 형식 매핑
    const imageFormat = {
        'backward-drift': 'webp',
        'glass-eye': 'webp',
        'the-faceless': 'webp',
        'shade-of-blue': 'webp',
        'imperfect-jeonju': 'webp',
        'glass-eye-book': 'webp',
        'shade-of-blue-book': 'webp'
    };

    // 이미지 기본 경로 매핑
    const imagePath = {
        'backward-drift': '/src/images/photos/',
        'glass-eye': '/src/images/photos/',
        'the-faceless': '/src/images/photos/',
        'shade-of-blue': '/src/images/photos/',
        'imperfect-jeonju': '/src/images/photos/',
        'glass-eye-book': '/src/images/books/',
        'shade-of-blue-book': '/src/images/books/'
    };

    // 각 프로젝트별 이미지 목록을 저장할 객체
    const projectImages = {};
    
    // 각 프로젝트별 현재 인덱스와 로드된 이미지 수 추적
    const projectState = {};
    
    // 로딩 상태 추적
    const loadingState = {
        totalProjects: Object.keys(projectFolders).length,
        loadedProjects: 0,
        isInitialized: false
    };

    // 모든 프로젝트 이미지 동시 로딩 시작
    initializeAllProjects();

    // 모든 프로젝트 초기화 함수
    async function initializeAllProjects() {
        console.log('🚀 모든 프로젝트 이미지 로딩 시작...');
        
        // 모든 프로젝트의 이미지 목록을 동시에 생성
        const projectPromises = Object.keys(projectFolders).map(project => {
            return generateImageList(project);
        });

        // 모든 이미지 목록 생성 완료 대기
        await Promise.all(projectPromises);
        
        // 모든 프로젝트의 이미지를 동시에 로딩
        const loadingPromises = Object.keys(projectFolders).map(project => {
            return loadImagesForProject(project);
        });

        // 모든 프로젝트 로딩 완료 대기
        await Promise.all(loadingPromises);
        
        console.log('✅ 모든 프로젝트 이미지 로딩 완료!');
        loadingState.isInitialized = true;
    }

    // 프로젝트별 이미지 목록 생성 함수
    function generateImageList(projectId) {
        return new Promise((resolve) => {
            // 이미지 목록은 Astro가 빌드 시 최적화(webp)해 window에 주입한다.
            // (CMS 컬렉션 기반, 프론트매터 순서 그대로 — 셔플 없음)
            const injected = (typeof window !== 'undefined' && window.__WORKS_IMAGES__) || {};
            projectImages[projectId] = injected[projectId] || [];

            // 프로젝트 상태 초기화
            projectState[projectId] = {
                currentIndex: 0,
                loadedImages: 0,
                loadedPaths: [],
                isLoaded: false
            };

            resolve();
        });
    }

    // 프로젝트별 이미지 로드 함수 (개선된 버전)
    async function loadImagesForProject(projectId) {
        return new Promise((resolve) => {
            const galleryCol = document.querySelector(`.project-gallery-col[data-project="${projectId}"]`);
            if (!galleryCol) {
                resolve();
                return;
            }
            
            const sliderContainer = galleryCol.querySelector('.slider-container');

            if (!sliderContainer) {
                resolve();
                return;
            }

            const imagePaths = projectImages[projectId];
            if (!imagePaths || imagePaths.length === 0) {
                resolve();
                return;
            }

            // Books 섹션은 모든 이미지를 미리 로딩, Photos는 초기 5개만 로딩
            const initialLoadCount = projectId.includes('book') ? imagePaths.length : 5;
            
            // 이미지 프리로딩 (Books 섹션용)
            if (projectId.includes('book')) {
                preloadImages(projectId, imagePaths).then(() => {
                    // 모든 이미지가 로딩된 후 슬라이더에 추가
                    addImagesToSlider(projectId, imagePaths);
                    setupSliderControls(projectId);
                    projectState[projectId].isLoaded = true;
                    loadingState.loadedProjects++;
                    console.log(`📚 ${projectId} 로딩 완료 (${imagePaths.length}개 이미지)`);
                    resolve();
                });
            } else {
                // Photos 섹션은 초기 이미지만 로딩
                addImagesToSlider(projectId, imagePaths.slice(0, initialLoadCount));
                setupSliderControls(projectId);
                projectState[projectId].isLoaded = true;
                loadingState.loadedProjects++;
                console.log(`📸 ${projectId} 초기 로딩 완료 (${initialLoadCount}개 이미지)`);
                resolve();
            }
        });
    }

    // 이미지 프리로딩 함수 (Books 섹션용)
    function preloadImages(projectId, imagePaths) {
        return new Promise((resolve) => {
            let loadedCount = 0;
            const totalImages = imagePaths.length;

            imagePaths.forEach((path, index) => {
                const img = new Image();
                img.onload = () => {
                    projectState[projectId].loadedPaths.push(path);
                    loadedCount++;
                    
                    if (loadedCount === totalImages) {
                        resolve();
                    }
                };
                img.onerror = () => {
                    console.warn(`⚠️ 이미지 로드 실패: ${path}`);
                    loadedCount++;
                    
                    if (loadedCount === totalImages) {
                        resolve();
                    }
                };
                img.src = path;
            });
        });
    }

    // 슬라이더에 이미지 추가 함수
    function addImagesToSlider(projectId, imagePaths) {
        const galleryCol = document.querySelector(`.project-gallery-col[data-project="${projectId}"]`);
        if (!galleryCol) return;
        
        const sliderContainer = galleryCol.querySelector('.slider-container');
        if (!sliderContainer) return;

        // 기존 이미지 제거
        sliderContainer.innerHTML = '';

        imagePaths.forEach((path, index) => {
            const img = document.createElement('img');
            img.src = path;
            img.alt = `${projectId} image ${index + 1}`;
            img.dataset.index = index;
            
            // 첫 번째 이미지만 표시
            if (index === 0) {
                img.style.display = 'block';
            } else {
                img.style.display = 'none';
            }
            
            sliderContainer.appendChild(img);
        });

        projectState[projectId].loadedImages = imagePaths.length;
        updateSlider(projectId);
    }

    // 슬라이더 조작: 좌우 절반 클릭/탭으로 넘기고, 현재 번호를 원형 배지로 보여준다.
    // 마우스 환경에서는 배지가 커서를 대신하고, 터치 환경에서는 사진을 가리지 않는
    // 검은 여백 쪽에 잠깐 떴다 사라진다.
    function setupSliderControls(projectId) {
        const galleryCol = document.querySelector(`.project-gallery-col[data-project="${projectId}"]`);
        if (!galleryCol) return;

        const slider = galleryCol.querySelector('.gallery-slider');
        const counter = galleryCol.querySelector('.slider-counter');
        if (!slider) return;
        // 조작·호버 영역은 사진 둘레의 검은 여백까지 포함한 영역 전체다.
        const area = galleryCol;

        const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        let suppressClick = false; // 스와이프 직후 따라오는 click 무시용
        let hideTimer;

        function setNumber() {
            if (counter) counter.textContent = String(projectState[projectId].currentIndex + 1);
        }

        // 터치 환경에서 배지를 놓을 자리: 사진이 실제로 그려진 영역을 피해 검은 여백에 둔다.
        // (object-fit: contain 이라 이미지 요소 크기와 그려진 크기가 다르다)
        function placeInMargin() {
            if (!counter) return;
            const sr = area.getBoundingClientRect();
            const gap = 10;
            let top = gap;
            let right = gap;

            const img = Array.from(slider.querySelectorAll('.slider-container img'))
                .find((i) => i.style.display === 'block');

            if (img && img.naturalWidth && img.naturalHeight) {
                const cs = getComputedStyle(img);
                const padL = parseFloat(cs.paddingLeft) || 0;
                const padR = parseFloat(cs.paddingRight) || 0;
                const padT = parseFloat(cs.paddingTop) || 0;
                const padB = parseFloat(cs.paddingBottom) || 0;
                const ir = img.getBoundingClientRect();
                const cw = ir.width - padL - padR;
                const ch = ir.height - padT - padB;
                if (cw > 0 && ch > 0) {
                    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
                    const pw = img.naturalWidth * scale;
                    const ph = img.naturalHeight * scale;
                    const paintedTop = ir.top - sr.top + padT + (ch - ph) / 2;
                    const paintedRight = ir.left - sr.left + padL + (cw + pw) / 2;
                    const bw = counter.offsetWidth || 28;
                    const bh = counter.offsetHeight || 28;
                    const rightBand = sr.width - paintedRight;

                    if (paintedTop >= bh + gap) {
                        // 사진 위쪽 검은 띠 안에, 사진 오른쪽 끝에 맞춰 놓는다
                        top = Math.max(gap, (paintedTop - bh) / 2);
                        right = Math.max(gap, rightBand);
                    } else if (rightBand >= bw + gap) {
                        // 위 띠가 좁으면 오른쪽 검은 띠 안에
                        top = gap;
                        right = Math.max(gap, (rightBand - bw) / 2);
                    }
                }
            }

            counter.style.left = 'auto';
            counter.style.top = top + 'px';
            counter.style.right = right + 'px';
        }

        // 넘길 때마다: 번호 갱신 + (터치) 잠깐 보였다 사라짐
        function refreshCounter() {
            setNumber();
            if (!counter || hasMouse) return;
            placeInMargin();
            counter.classList.add('show');
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => counter.classList.remove('show'), 1400);
        }

        function go(delta) {
            const st = projectState[projectId];
            if (delta > 0) {
                if (st.currentIndex >= st.loadedImages - 1 && !projectId.includes('book')) {
                    loadMoreImages(projectId, 3);
                }
                if (st.currentIndex < st.loadedImages - 1) {
                    st.currentIndex++;
                    updateSlider(projectId);
                    refreshCounter();
                    if (!projectId.includes('book') && st.currentIndex >= st.loadedImages - 2) {
                        loadMoreImages(projectId, 3);
                    }
                }
            } else if (st.currentIndex > 0) {
                st.currentIndex--;
                updateSlider(projectId);
                refreshCounter();
            }
        }

        // 오른쪽 절반 = 다음, 왼쪽 절반 = 이전
        area.addEventListener('click', (e) => {
            if (suppressClick) { suppressClick = false; return; }
            const rect = area.getBoundingClientRect();
            go(e.clientX - rect.left > rect.width / 2 ? 1 : -1);
        });

        if (hasMouse && counter) {
            // 배지가 커서 자리를 대신한다
            counter.classList.add('as-cursor');
            const moveTo = (e) => {
                const rect = area.getBoundingClientRect();
                counter.style.right = 'auto';
                counter.style.left = e.clientX - rect.left + 'px';
                counter.style.top = e.clientY - rect.top + 'px';
            };
            area.addEventListener('mouseenter', (e) => {
                area.classList.add('cursor-badge');
                moveTo(e);
                counter.classList.add('show');
            });
            area.addEventListener('mousemove', moveTo);
            area.addEventListener('mouseleave', () => {
                area.classList.remove('cursor-badge');
                counter.classList.remove('show');
            });
        } else if (counter) {
            // 터치: 처음에 한 번 살짝 보여 조작 방식을 알린다
            refreshCounter();
            window.addEventListener('resize', () => {
                if (counter.classList.contains('show')) placeInMargin();
            });
        }

        // 스와이프도 유지
        let startX = 0;
        let currentX = 0;
        let dragging = false;

        area.addEventListener('touchstart', (e) => {
            startX = currentX = e.touches[0].clientX;
            dragging = true;
        }, { passive: true });

        area.addEventListener('touchmove', (e) => {
            if (dragging) currentX = e.touches[0].clientX;
        }, { passive: true });

        area.addEventListener('touchend', () => {
            if (!dragging) return;
            dragging = false;
            const diff = startX - currentX;
            if (Math.abs(diff) > 50) {
                suppressClick = true;
                go(diff > 0 ? 1 : -1);
            }
        });

        setNumber();
    }

    // 추가 이미지 로드 함수 (Photos 섹션용)
    function loadMoreImages(projectId, count) {
        const galleryCol = document.querySelector(`.project-gallery-col[data-project="${projectId}"]`);
        if (!galleryCol) return;
        
        const sliderContainer = galleryCol.querySelector('.slider-container');
        if (!sliderContainer) return;
        
        const currentLoadedCount = sliderContainer.children.length;
        const projectImageList = projectImages[projectId];
        
        // 이미 모든 이미지가 로드된 경우
        if (currentLoadedCount >= projectImageList.length) return;
        
        // 추가로 로드할 이미지 수 계산
        const remainingImages = projectImageList.length - currentLoadedCount;
        const imagesToLoad = Math.min(count, remainingImages);
        
        for (let i = 0; i < imagesToLoad; i++) {
            const index = currentLoadedCount + i;
            const img = document.createElement('img');
            img.src = projectImageList[index];
            img.alt = `${projectId} image ${index + 1}`;
            img.style.display = 'none';
            img.dataset.index = index;
            
            sliderContainer.appendChild(img);
        }
        
        projectState[projectId].loadedImages = currentLoadedCount + imagesToLoad;
    }
    
    // 슬라이더 업데이트 함수
    function updateSlider(projectId) {
        const galleryCol = document.querySelector(`.project-gallery-col[data-project="${projectId}"]`);
        if (!galleryCol) return;
        
        const sliderContainer = galleryCol.querySelector('.slider-container');
        if (!sliderContainer) return;
        
        const images = sliderContainer.querySelectorAll('img');
        const currentIndex = projectState[projectId].currentIndex;
        
        // 모든 이미지 숨기기
        images.forEach(img => {
            img.style.display = 'none';
        });
        
        // 현재 인덱스 이미지만 표시
        if (images[currentIndex]) {
            images[currentIndex].style.display = 'block';
        }
    }
}); 