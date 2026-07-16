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
            // 프로젝트별 예상 이미지 수
            const expectedImageCount = {
                'glass-eye': 165,
                'the-faceless': 51, 
                'shade-of-blue': 67,
                'imperfect-jeonju': 89,
                'glass-eye-book': 18,
                'shade-of-blue-book': 7
            };
            
            // 이미지 경로 생성
            let imagePaths = [];
            for (let i = 1; i <= expectedImageCount[projectId]; i++) {
                if (projectId.includes('book')) {
                    // books 섹션은 webp 파일 사용, 파일명 형식이 다름
                    if (projectId === 'glass-eye-book') {
                        // glass-eye-book: glass-eye-book_1-min.webp 형식
                        imagePaths.push(`${imagePath[projectId]}${projectFolders[projectId]}/glass-eye-book_${i}-min.${imageFormat[projectId]}`);
                    } else if (projectId === 'shade-of-blue-book') {
                        // shade-of-blue-book: shade-of-blue_1-min.webp 형식
                        imagePaths.push(`${imagePath[projectId]}${projectFolders[projectId]}/shade-of-blue_${i}-min.${imageFormat[projectId]}`);
                    }
                } else {
                    // photos 섹션은 webp 파일 사용
                    imagePaths.push(`${imagePath[projectId]}${projectFolders[projectId]}/${projectFolders[projectId]}_${i}-min.${imageFormat[projectId]}`);
                }
            }
            
            // photos 섹션만 이미지 배열 섞기
            if (!projectId.includes('book')) {
                imagePaths = shuffleArray(imagePaths);
            }
            
            // 프로젝트 이미지 목록에 저장
            projectImages[projectId] = imagePaths;
            
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
            const prevBtn = galleryCol.querySelector('.prev-btn');
            const nextBtn = galleryCol.querySelector('.next-btn');
            
            if (!sliderContainer || !prevBtn || !nextBtn) {
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
                    setupSliderControls(projectId, prevBtn, nextBtn);
                    projectState[projectId].isLoaded = true;
                    loadingState.loadedProjects++;
                    console.log(`📚 ${projectId} 로딩 완료 (${imagePaths.length}개 이미지)`);
                    resolve();
                });
            } else {
                // Photos 섹션은 초기 이미지만 로딩
                addImagesToSlider(projectId, imagePaths.slice(0, initialLoadCount));
                setupSliderControls(projectId, prevBtn, nextBtn);
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

    // 슬라이더 컨트롤 설정 함수
    function setupSliderControls(projectId, prevBtn, nextBtn) {
        const galleryCol = document.querySelector(`.project-gallery-col[data-project="${projectId}"]`);
        const sliderContainer = galleryCol.querySelector('.slider-container');
        
        // 터치 스와이프 변수
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        // 이전 이미지 버튼 클릭 이벤트
        prevBtn.addEventListener('click', () => {
            if (projectState[projectId].currentIndex > 0) {
                projectState[projectId].currentIndex--;
                updateSlider(projectId);
            }
        });

        // 다음 이미지 버튼 클릭 이벤트
        nextBtn.addEventListener('click', () => {
            if (projectState[projectId].currentIndex < projectState[projectId].loadedImages - 1) {
                projectState[projectId].currentIndex++;
                updateSlider(projectId);
                
                // Photos 섹션에서 끝에 가까워지면 더 많은 이미지 로드
                if (!projectId.includes('book') && 
                    projectState[projectId].currentIndex >= projectState[projectId].loadedImages - 2) {
                    loadMoreImages(projectId, 3);
                }
            }
        });

        // 터치 스와이프 이벤트 (모바일)
        sliderContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        sliderContainer.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            currentX = e.touches[0].clientX;
        });

        sliderContainer.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            const diffX = startX - currentX;
            const threshold = 50; // 스와이프 감지 임계값
            
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    // 왼쪽으로 스와이프 (다음 이미지)
                    if (projectState[projectId].currentIndex < projectState[projectId].loadedImages - 1) {
                        projectState[projectId].currentIndex++;
                        updateSlider(projectId);
                        
                        // Photos 섹션에서 끝에 가까워지면 더 많은 이미지 로드
                        if (!projectId.includes('book') && 
                            projectState[projectId].currentIndex >= projectState[projectId].loadedImages - 2) {
                            loadMoreImages(projectId, 3);
                        }
                    }
                } else {
                    // 오른쪽으로 스와이프 (이전 이미지)
                    if (projectState[projectId].currentIndex > 0) {
                        projectState[projectId].currentIndex--;
                        updateSlider(projectId);
                    }
                }
            }
        });

        // 마우스 드래그 이벤트 (데스크톱)
        sliderContainer.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            isDragging = true;
            sliderContainer.style.cursor = 'grabbing';
        });

        sliderContainer.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            currentX = e.clientX;
        });

        sliderContainer.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            sliderContainer.style.cursor = 'grab';
            
            const diffX = startX - currentX;
            const threshold = 50;
            
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    // 왼쪽으로 드래그 (다음 이미지)
                    if (projectState[projectId].currentIndex < projectState[projectId].loadedImages - 1) {
                        projectState[projectId].currentIndex++;
                        updateSlider(projectId);
                        
                        if (!projectId.includes('book') && 
                            projectState[projectId].currentIndex >= projectState[projectId].loadedImages - 2) {
                            loadMoreImages(projectId, 3);
                        }
                    }
                } else {
                    // 오른쪽으로 드래그 (이전 이미지)
                    if (projectState[projectId].currentIndex > 0) {
                        projectState[projectId].currentIndex--;
                        updateSlider(projectId);
                    }
                }
            }
        });

        // 마우스가 슬라이더를 벗어날 때
        sliderContainer.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                sliderContainer.style.cursor = 'grab';
            }
        });
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
    
    // 배열을 무작위로 섞는 함수
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
}); 