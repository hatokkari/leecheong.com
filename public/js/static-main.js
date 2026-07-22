document.addEventListener('DOMContentLoaded', () => {
    // 변수 초기화
    let columnCount = 1;
    let isInitialLoad = true;
    let gridAnimationInterval;
    let shuffledImageList = []; // 셔플된 이미지 리스트 저장
    let loadedImages = []; // 로딩된 이미지들 저장
    let filterMode = 'blue'; // 색상 필터 상태: 'blue', 'grayscale', 'none'
    
    // 모바일 최적화 변수
    const isMobile = window.innerWidth <= 768;
    const isSlowConnection = navigator.connection && 
        (navigator.connection.effectiveType === 'slow-2g' || 
         navigator.connection.effectiveType === '2g' ||
         navigator.connection.effectiveType === '3g');
    const isFastConnection = navigator.connection && 
        (navigator.connection.effectiveType === '4g' || 
         navigator.connection.effectiveType === '5g');
    
    // 네트워크 상태에 따른 로딩 수 조정
    const initialLoadCount = isMobile ? (isSlowConnection ? 10 : 20) : 50;
    const loadMoreCount = isMobile ? (isSlowConnection ? 5 : 10) : 20;
    let currentLoadedCount = 0;
    let isLoading = false;
    let sequentialLoadingActive = false; // 순차적 로딩 활성화 상태
    
    // DOM 요소
    const imageGrid = document.getElementById('image-grid');
    const loadingIndicator = document.getElementById('loading-indicator');
    const galleryModal = document.getElementById('gallery-modal');
    const galleryImage = document.getElementById('gallery-image');
    const galleryClose = document.getElementById('gallery-close');
    const galleryPrev = document.getElementById('gallery-prev');
    const galleryNext = document.getElementById('gallery-next');
    const gridDecrease = document.getElementById('grid-decrease');
    const gridIncrease = document.getElementById('grid-increase');
    const colorFilterToggle = document.getElementById('color-filter-toggle');
    const loadingPage = document.getElementById('loading-page');
    
    // 이미지 목록은 Astro가 빌드 시 최적화(webp)해 window에 주입한다.
    // (기존 하드코딩/생성기 대신 CMS 컬렉션 기반)
    const imageList = (typeof window !== 'undefined' && window.__HOME_IMAGES__) || [];
    
    // Fisher-Yates 셔플
    function shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // 이미지 미리 로딩
    function preloadImages(imageList) {
        return new Promise((resolve) => {
            let loadedCount = 0;
            const totalImages = imageList.length;
            
            // 로딩 인디케이터 표시
            loadingIndicator.style.display = 'flex';
            
            imageList.forEach((src, index) => {
                const img = new Image();
                img.onload = () => {
                    loadedImages[index] = {
                        src: src,
                        element: img,
                        loaded: true
                    };
                    loadedCount++;
                    
                    // 모든 이미지가 로딩되면 resolve
                    if (loadedCount === totalImages) {
                        loadingIndicator.style.display = 'none';
                        resolve();
                    }
                };
                img.onerror = () => {
                    // 로딩 실패 시에도 카운트 증가
                    loadedImages[index] = {
                        src: src,
                        element: null,
                        loaded: false
                    };
                    loadedCount++;
                    
                    if (loadedCount === totalImages) {
                        loadingIndicator.style.display = 'none';
                        resolve();
                    }
                };
                img.src = src;
            });
        });
    }
    
    // 1. 이미지 그리드에 동적으로 이미지 삽입 (점진적 로딩 지원)
    function renderImages() {
        imageGrid.innerHTML = '';
        
        // 로드된 이미지만 그리드에 삽입
        const loadedImageElements = loadedImages
            .filter(img => img && img.loaded && img.element)
            .map(img => img.element);
        
        loadedImageElements.forEach((img, index) => {
            const div = document.createElement('div');
            div.className = 'image-item';
            div.dataset.index = index;
            
            const imgClone = img.cloneNode(true);
            imgClone.alt = '이청의 사진';
            imgClone.loading = 'lazy';
            imgClone.style.filter = getCurrentFilter();
            div.appendChild(imgClone);
            imageGrid.appendChild(div);
        });
        
        // 현재 로드된 이미지 수 업데이트
        currentLoadedCount = loadedImageElements.length;
    }
    
    // 2. 이미지 삽입 후, 갤러리/애니메이션/이벤트 연결
    let allImages = [];
    let currentImageIndex = 0;
    
    function setupImageEvents() {
        const allImageItems = document.querySelectorAll('.image-item');
        allImages = Array.from(allImageItems).map(item => ({
            element: item,
            path: item.querySelector('img').src
        }));
        
        allImageItems.forEach((imageItem, idx) => {
            const img = imageItem.querySelector('img');
            
            // 이미 loaded 클래스가 있는 경우 애니메이션 적용하지 않음
            if (imageItem.classList.contains('loaded')) {
                return;
            }
            
            if (img.complete) {
                setTimeout(() => {
                    imageItem.classList.add('loaded');
                }, Math.random() * 500);
            } else {
                img.onload = function() {
                    setTimeout(() => {
                        imageItem.classList.add('loaded');
                    }, Math.random() * 500);
                };
            }
            imageItem.addEventListener('click', () => {
                openGallery(img.src);
            });
        });
    }
    
    // 갤러리 뷰 열기
    function openGallery(imagePath) {
        galleryImage.src = imagePath;
        galleryModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // 스크롤 방지
        currentImageIndex = allImages.findIndex(img => img.path === imagePath);
    }
    
    // 갤러리 뷰 닫기
    function closeGallery() {
        galleryModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // 이전 이미지로 이동
    function prevImage() {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            galleryImage.src = allImages[currentImageIndex].path;
        }
    }
    
    // 다음 이미지로 이동
    function nextImage() {
        if (currentImageIndex < allImages.length - 1) {
            currentImageIndex++;
            galleryImage.src = allImages[currentImageIndex].path;
        }
    }
    
    // 그리드 열 변경
    function changeGridColumns(targetColumns = null) {
        if (targetColumns) {
            columnCount = targetColumns;
        }
        
        // 그리드 클래스 업데이트 (loaded 클래스 유지)
        const currentClasses = imageGrid.className.split(' ');
        const loadedClass = currentClasses.includes('loaded') ? 'loaded' : '';
        
        // 모든 columns- 클래스 제거
        currentClasses.forEach(className => {
            if (className.startsWith('columns-')) {
                imageGrid.classList.remove(className);
            }
        });
        
        // 기본 클래스와 loaded 클래스 설정
        imageGrid.className = 'image-grid';
        if (loadedClass) {
            imageGrid.classList.add(loadedClass);
        }
        
        // 새로운 columns- 클래스 추가
        imageGrid.classList.add(`columns-${columnCount}`);
        
        // 그리드 변경 시 애니메이션 재실행 방지
        const allImageItems = imageGrid.querySelectorAll('.image-item');
        allImageItems.forEach(imageItem => {
            if (!imageItem.classList.contains('loaded')) {
                imageItem.classList.add('loaded');
            }
        });
        
        // 버튼 상태 업데이트
        updateGridButtonStates();
    }

    // 화면 크기에 따른 최대 열 수 계산
    function getMaxColumns() {
        const screenWidth = window.innerWidth;
        
        if (screenWidth <= 360) {
            return 2;
        } else if (screenWidth <= 480) {
            return 3;
        } else if (screenWidth <= 576) {
            return 4;
        } else if (screenWidth <= 768) {
            return 5;
        } else if (screenWidth <= 992) {
            return 6;
        } else if (screenWidth <= 1200) {
            return 7;
        } else if (screenWidth <= 1400) {
            return 8;
        } else {
            return 10;
        }
    }

    // 그리드 버튼 상태 업데이트
    function updateGridButtonStates() {
        if (gridDecrease && gridIncrease) {
            const maxColumns = getMaxColumns();
            
            // 최소값(1)에 도달하면 감소 버튼 비활성화
            gridDecrease.disabled = columnCount <= 1;
            
            // 현재 화면 크기의 최대값에 도달하면 증가 버튼 비활성화
            gridIncrease.disabled = columnCount >= maxColumns;
            
            // 현재 값이 최대값을 초과하면 조정
            if (columnCount > maxColumns) {
                columnCount = maxColumns;
                changeGridColumns();
            }
        }
    }

    // 그리드 열 감소
    function decreaseGridColumns() {
        if (columnCount > 1) {
            columnCount--;
            changeGridColumns();
        }
    }

    // 그리드 열 증가
    function increaseGridColumns() {
        const maxColumns = getMaxColumns();
        if (columnCount < maxColumns) {
            columnCount++;
            changeGridColumns();
        }
    }

    // 색상 필터 토글 (3단계: 블루 → 흑백 → 필터없음 → 블루)
    function toggleColorFilter() {
        // 필터 모드 순환
        switch (filterMode) {
            case 'blue':
                filterMode = 'grayscale';
                break;
            case 'grayscale':
                filterMode = 'none';
                break;
            case 'none':
                filterMode = 'blue';
                break;
        }
        
        // 버튼 상태 업데이트
        if (colorFilterToggle) {
            colorFilterToggle.classList.remove('grayscale', 'no-filter');
            if (filterMode === 'grayscale') {
                colorFilterToggle.classList.add('grayscale');
            } else if (filterMode === 'none') {
                colorFilterToggle.classList.add('no-filter');
            }
        }
        
        // 모든 이미지에 필터 적용 (점진적 로딩 지원)
        const allImages = document.querySelectorAll('.image-item img');
        allImages.forEach(img => {
            img.style.filter = getCurrentFilter();
        });
        
        // 필터 변경 시 애니메이션 재실행 방지
        const allImageItems = document.querySelectorAll('.image-item');
        allImageItems.forEach(imageItem => {
            if (!imageItem.classList.contains('loaded')) {
                imageItem.classList.add('loaded');
            }
        });
    }
    
    // 초기 로딩 애니메이션 (개선된 버전)
    function startInitialAnimation() {
        // 로딩 페이지 표시
        loadingPage.style.display = 'flex';
        
        // 1.5초 후 로딩 페이지를 올림 (모바일 최적화)
        setTimeout(() => {
            loadingPage.classList.add('slide-up');
            
            // 애니메이션 완료 후 로딩 페이지 숨기기
            setTimeout(() => {
                loadingPage.style.display = 'none';
                loadingPage.classList.remove('slide-up');
                
                // 이미지 그리드 표시
                imageGrid.classList.add('loaded');
                
                // 그리드 열 변환 애니메이션 시작
                startGridColumnAnimation();
            }, 1000);
        }, 1500); // 모바일에서 더 빠른 로딩
    }


    
    // 그리드 열 변환 애니메이션 시작
    function startGridColumnAnimation() {
        let currentColumn = 1;
        const maxColumns = getMaxColumns();
        
        // 2초 동안 1열부터 최대 열까지 순차적으로 변경
        gridAnimationInterval = setInterval(() => {
            currentColumn++;
            if (currentColumn > maxColumns-1) {
                clearInterval(gridAnimationInterval);
                columnCount = maxColumns-1; // 최종적으로 최대 열로 설정
                changeGridColumns(maxColumns-1);
                isInitialLoad = false;
                return;
            }
            
            changeGridColumns(currentColumn);
        }, 2000 / (maxColumns - 1)); // 2초를 단계로 나눔
    }
    
    // 이벤트 리스너 설정
    function setupEventListeners() {
        // 갤러리 닫기 버튼
        galleryClose.addEventListener('click', closeGallery);
        
        // 갤러리 오버레이 클릭 시 닫기
        document.querySelector('.gallery-overlay').addEventListener('click', closeGallery);
        
        // 갤러리 네비게이션 버튼
        galleryPrev.addEventListener('click', prevImage);
        galleryNext.addEventListener('click', nextImage);
        
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            if (galleryModal.classList.contains('active')) {
                if (e.key === 'Escape') {
                    closeGallery();
                } else if (e.key === 'ArrowLeft') {
                    prevImage();
                } else if (e.key === 'ArrowRight') {
                    nextImage();
                }
            }
        });
        
        // 그리드 열 수 변경 버튼들
        gridDecrease.addEventListener('click', decreaseGridColumns);
        gridIncrease.addEventListener('click', increaseGridColumns);
        
        // 색상 필터 토글 버튼
        colorFilterToggle.addEventListener('click', toggleColorFilter);
        
        // 윈도우 리사이즈 이벤트
        window.addEventListener('resize', handleWindowResize);
    }
    
    // 윈도우 리사이즈 핸들러
    function handleWindowResize() {
        // 디바운싱을 위한 타이머
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(() => {
            updateGridButtonStates();
        }, 250);
    }
    
    // 페이지 초기화 (개선된 버전)
    async function initializePage() {
        // 1. 이미지 리스트 셔플
        shuffledImageList = shuffle(imageList);
        
        // 2. 초기 애니메이션 시작 (2초 후 로딩 페이지 올라감)
        startInitialAnimation();
        
        // 3. 점진적 이미지 로딩 (모바일 최적화)
        await loadImagesProgressively();
        
        // 4. 이벤트 설정
        setupImageEvents();
        
        // 5. 이벤트 리스너 설정
        setupEventListeners();
        
        // 6. 스크롤 이벤트 리스너 추가 (무한 스크롤)
        setupScrollListener();
        
        // 7. 초기 버튼 상태 설정
        updateGridButtonStates();
    }
    
    // 점진적 이미지 로딩 함수
    async function loadImagesProgressively() {
        const connectionInfo = isSlowConnection ? '느린 네트워크' : '일반 네트워크';
        console.log(`🚀 점진적 이미지 로딩 시작 (${isMobile ? '모바일' : '데스크톱'} 모드, ${connectionInfo})`);
        console.log(`📊 초기 로딩: ${initialLoadCount}개, 추가 로딩: ${loadMoreCount}개`);
        
        // 초기 이미지만 먼저 로드
        const initialImages = shuffledImageList.slice(0, initialLoadCount);
        await loadImageBatch(initialImages, 0);
        
        // 초기 그리드 렌더링
        renderImages();
        
        console.log(`✅ 초기 ${initialLoadCount}개 이미지 로딩 완료`);
        
        // 백그라운드에서 순차적 로딩 시작
        startSequentialLoading();
    }
    
    // 이미지 배치 로딩 함수
    async function loadImageBatch(imagePaths, startIndex) {
        return new Promise((resolve) => {
            let loadedCount = 0;
            const totalImages = imagePaths.length;
            
            if (totalImages === 0) {
                resolve();
                return;
            }
            
            imagePaths.forEach((src, index) => {
                const img = new Image();
                
                img.onload = () => {
                    const actualIndex = startIndex + index;
                    loadedImages[actualIndex] = {
                        src: src,
                        element: img,
                        loaded: true
                    };
                    loadedCount++;
                    
                    // 진행률 로그 (10개마다)
                    if (loadedCount % 10 === 0 || loadedCount === totalImages) {
                        const progress = ((loadedCount / totalImages) * 100).toFixed(1);
                        console.log(`📸 배치 로딩 진행률: ${progress}% (${loadedCount}/${totalImages})`);
                    }
                    
                    if (loadedCount === totalImages) {
                        resolve();
                    }
                };
                
                img.onerror = () => {
                    console.warn(`⚠️ 이미지 로드 실패: ${src}`);
                    loadedImages[startIndex + index] = {
                        src: src,
                        element: null,
                        loaded: false
                    };
                    loadedCount++;
                    
                    if (loadedCount === totalImages) {
                        resolve();
                    }
                };
                
                img.src = src;
            });
        });
    }
    
    // 스크롤 리스너 설정
    function setupScrollListener() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                checkAndLoadMoreImages();
            }, 100);
        });
    }
    
    // 순차적 로딩 시작
    function startSequentialLoading() {
        // 이미 모든 이미지가 로드되었거나 이미 로딩 중이면 중단
        if (currentLoadedCount >= shuffledImageList.length || isLoading || sequentialLoadingActive) {
            return;
        }
        
        sequentialLoadingActive = true;
        console.log(`🔄 순차적 로딩 시작 (현재: ${currentLoadedCount}/${shuffledImageList.length})`);
        
        // 백그라운드에서 순차적으로 로딩
        loadNextBatch();
    }
    
    // 다음 배치 로딩
    async function loadNextBatch() {
        if (isLoading || currentLoadedCount >= shuffledImageList.length) {
            return;
        }
        
        isLoading = true;
        const startIndex = currentLoadedCount;
        const endIndex = Math.min(currentLoadedCount + loadMoreCount, shuffledImageList.length);
        const newImages = shuffledImageList.slice(startIndex, endIndex);
        
        console.log(`📥 순차적 로딩: ${startIndex + 1}~${endIndex} (${newImages.length}개)`);
        
        await loadImageBatch(newImages, startIndex);
        currentLoadedCount = endIndex;
        
        // 그리드 업데이트
        updateImageGrid();
        
        isLoading = false;
        
        const progress = ((currentLoadedCount / shuffledImageList.length) * 100).toFixed(1);
        console.log(`✅ 순차적 로딩 완료. 총 ${currentLoadedCount}/${shuffledImageList.length}개 로드됨 (${progress}%)`);
        
        // 아직 로드할 이미지가 있으면 다음 배치 로딩
        if (currentLoadedCount < shuffledImageList.length) {
            // 네트워크 상태에 따른 지연 시간 설정
            let delay;
            if (isSlowConnection) {
                delay = 2000; // 느린 네트워크에서는 더 긴 지연
            } else if (isFastConnection) {
                delay = 200; // 빠른 네트워크에서는 짧은 지연
            } else {
                delay = 500; // 일반 네트워크
            }
            
            setTimeout(() => {
                loadNextBatch();
            }, delay);
        } else {
            sequentialLoadingActive = false;
            console.log(`🎉 모든 이미지 로딩 완료!`);
        }
    }
    
    // 추가 이미지 로딩 체크 (스크롤 기반)
    async function checkAndLoadMoreImages() {
        if (isLoading || currentLoadedCount >= shuffledImageList.length) {
            return;
        }
        
        // 순차적 로딩이 활성화되어 있으면 스크롤 기반 로딩은 건너뛰기
        if (sequentialLoadingActive) {
            return;
        }
        
        // 스크롤이 하단에 가까워지면 추가 로딩
        const scrollPosition = window.scrollY + window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        if (scrollPosition >= documentHeight - 500) { // 500px 전에 로딩 시작
            await loadMoreImages();
        }
    }
    
    // 추가 이미지 로딩 (스크롤 기반 - 순차적 로딩과 병행)
    async function loadMoreImages() {
        if (isLoading) return;
        
        // 이미 순차적 로딩으로 모든 이미지가 로드되었으면 스킵
        if (currentLoadedCount >= shuffledImageList.length) {
            return;
        }
        
        isLoading = true;
        const startIndex = currentLoadedCount;
        const endIndex = Math.min(currentLoadedCount + loadMoreCount, shuffledImageList.length);
        const newImages = shuffledImageList.slice(startIndex, endIndex);
        
        console.log(`📥 스크롤 기반 추가 로딩: ${startIndex + 1}~${endIndex} (${newImages.length}개)`);
        
        await loadImageBatch(newImages, startIndex);
        currentLoadedCount = endIndex;
        
        // 그리드 업데이트
        updateImageGrid();
        
        isLoading = false;
        
        console.log(`✅ 스크롤 기반 로딩 완료. 총 ${currentLoadedCount}/${shuffledImageList.length}개 로드됨`);
        
        // 아직 로드할 이미지가 있으면 순차적 로딩 재시작
        if (currentLoadedCount < shuffledImageList.length) {
            setTimeout(() => {
                loadNextBatch();
            }, 100);
        }
    }
    
    // 현재 필터 상태 반환
    function getCurrentFilter() {
        switch (filterMode) {
            case 'grayscale':
                return 'grayscale(100%)';
            case 'none':
                return 'none';
            default:
                return 'sepia(100%) hue-rotate(180deg) saturate(200%)';
        }
    }
    
    // 새로 추가된 이미지들에만 이벤트 설정
    function setupNewImageEvents(startIndex) {
        const newImageItems = imageGrid.querySelectorAll('.image-item');
        const newItems = Array.from(newImageItems).slice(startIndex);
        
        newItems.forEach((imageItem) => {
            const img = imageItem.querySelector('img');
            
            // 새 이미지에 애니메이션 적용
            if (img.complete) {
                setTimeout(() => {
                    imageItem.classList.add('loaded');
                }, Math.random() * 500);
            } else {
                img.onload = function() {
                    setTimeout(() => {
                        imageItem.classList.add('loaded');
                    }, Math.random() * 500);
                };
            }
            
            // 클릭 이벤트 추가
            imageItem.addEventListener('click', () => {
                openGallery(img.src);
            });
        });
        
        // allImages 배열 업데이트 (새 이미지들만 추가)
        const newImageData = newItems.map(item => ({
            element: item,
            path: item.querySelector('img').src
        }));
        
        allImages = allImages.concat(newImageData);
    }
    
    // 이미지 그리드 업데이트 (기존 이미지 유지, 새 이미지만 추가)
    function updateImageGrid() {
        const loadedImageElements = loadedImages
            .filter(img => img && img.loaded && img.element)
            .map(img => img.element);
        
        // 현재 그리드에 있는 이미지 수 확인
        const currentGridItems = imageGrid.querySelectorAll('.image-item');
        const currentCount = currentGridItems.length;
        
        // 새로 추가할 이미지만 처리
        const newImages = loadedImageElements.slice(currentCount);
        
        // 새 이미지들만 그리드에 추가
        newImages.forEach((img, index) => {
            const actualIndex = currentCount + index;
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            imageItem.dataset.index = actualIndex;
            
            const imgClone = img.cloneNode(true);
            imgClone.style.filter = getCurrentFilter();
            imageItem.appendChild(imgClone);
            
            imageGrid.appendChild(imageItem);
        });
        
        // 새로 추가된 이미지들에만 이벤트 설정
        setupNewImageEvents(currentCount);
    }
    
    // 페이지 초기화 실행
    initializePage();
});