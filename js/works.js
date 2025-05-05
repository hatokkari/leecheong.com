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
        'glass-eye': 'glass-eye',
        'the-faceless': 'the-faceless',
        'shade-of-blue': 'shade-of-blue',
        'imperfect-jeonju': 'imperfect-jeonju',
        'glass-eye-book': 'glass-eye',
        'shade-of-blue-book': 'shade-of-blue'
    };

    // 이미지 형식 매핑
    const imageFormat = {
        'glass-eye': 'webp',
        'the-faceless': 'webp',
        'shade-of-blue': 'webp',
        'imperfect-jeonju': 'webp',
        'glass-eye-book': 'jpg',
        'shade-of-blue-book': 'jpg'
    };

    // 이미지 기본 경로 매핑
    const imagePath = {
        'glass-eye': '/src/images/webp/',
        'the-faceless': '/src/images/webp/',
        'shade-of-blue': '/src/images/webp/',
        'imperfect-jeonju': '/src/images/webp/',
        'glass-eye-book': '/src/images/jpg/books/',
        'shade-of-blue-book': '/src/images/jpg/books/'
    };

    // 각 프로젝트별 이미지 목록을 저장할 객체
    const projectImages = {};
    
    // 각 프로젝트별 현재 인덱스와 로드된 이미지 수 추적
    const projectState = {};
    
    // 각 프로젝트 슬라이더 초기화
    Object.keys(projectFolders).forEach(project => {
        // 초기에는 빈 배열로 설정
        projectImages[project] = [];
        projectState[project] = {
            currentIndex: 0,
            loadedImages: 0,
            loadedPaths: [] // 성공적으로 로드된 이미지 경로 추적
        };
        
        // 이미지 목록 구성 및 슬라이더 초기화
        loadImagesForProject(project);
    });

    // 프로젝트별 이미지 로드 함수
    function loadImagesForProject(projectId) {
        const galleryCol = document.querySelector(`.project-gallery-col[data-project="${projectId}"]`);
        if (!galleryCol) return;
        
        const sliderContainer = galleryCol.querySelector('.slider-container');
        const prevBtn = galleryCol.querySelector('.prev-btn');
        const nextBtn = galleryCol.querySelector('.next-btn');
        
        if (!sliderContainer || !prevBtn || !nextBtn) return;
        
        // 이미지 배열
        let imagePaths = [];
        
        // 프로젝트별 예상 이미지 수
        const expectedImageCount = {
            'glass-eye': 100, // 실제 개수에 맞게 조정
            'the-faceless': 30, 
            'shade-of-blue': 30,
            'imperfect-jeonju': 30,
            'glass-eye-book': 8,
            'shade-of-blue-book': 6
        };
        
        // 이미지 경로 생성
        for (let i = 1; i <= expectedImageCount[projectId]; i++) {
            if (projectId.includes('book')) {
                // books 섹션은 jpg 파일 사용, 파일명 형식이 다름
                imagePaths.push(`${imagePath[projectId]}${projectFolders[projectId]}/${projectFolders[projectId]}-${i.toString().padStart(2, '0')}-min.${imageFormat[projectId]}`);
            } else {
                // photos 섹션은 webp 파일 사용
                imagePaths.push(`${imagePath[projectId]}${projectFolders[projectId]}/${projectFolders[projectId]}_${i}-min.${imageFormat[projectId]}`);
            }
        }
        
        // photos 섹션만 이미지 배열 섞기
        if (!projectId.includes('book')) {
            imagePaths = shuffleArray(imagePaths);
        }
        // books 섹션은 순서대로 표시
        
        // 프로젝트 이미지 목록에 저장
        projectImages[projectId] = imagePaths;
        
        // 성공적으로 로드된 이미지 경로 추적
        projectState[projectId].loadedPaths = [];
        
        // 이미지 로드 - books는 모두 로드, photos는 최초 5개만 로드
        const initialLoadCount = projectId.includes('book') ? expectedImageCount[projectId] : 5;
        loadMoreImages(projectId, initialLoadCount);
        
        // 이전 이미지 버튼 클릭 이벤트
        prevBtn.addEventListener('click', () => {
            if (projectState[projectId].currentIndex > 0) {
                projectState[projectId].currentIndex--;
                updateSlider(projectId);
            }
        });

        // 다음 이미지 버튼 클릭 이벤트
        nextBtn.addEventListener('click', () => {
            if (projectImages[projectId].length > 0 && 
                projectState[projectId].currentIndex < projectState[projectId].loadedImages - 1) {
                projectState[projectId].currentIndex++;
                updateSlider(projectId);
                
                // 끝에 가까워지면 더 많은 이미지 로드 (books 섹션은 이미 모두 로드됨)
                if (!projectId.includes('book') && projectState[projectId].currentIndex >= projectState[projectId].loadedImages - 2) {
                    loadMoreImages(projectId, 3);
                }
            }
        });
    }
    
    // 이미지 로드 함수
    function loadMoreImages(projectId, count) {
        const galleryCol = document.querySelector(`.project-gallery-col[data-project="${projectId}"]`);
        if (!galleryCol) return;
        
        const sliderContainer = galleryCol.querySelector('.slider-container');
        if (!sliderContainer) return;
        
        const currentLoadedCount = sliderContainer.children.length;
        const projectImageList = projectImages[projectId];
        let imagesAdded = 0;
        let successfullyLoadedCount = 0;
        
        // 아직 로드되지 않은 이미지 중에서 count만큼 로드
        for (let i = 0; i < count; i++) {
            const index = currentLoadedCount + i;
            if (index < projectImageList.length) {
                const img = document.createElement('img');
                img.src = projectImageList[index];
                img.alt = `${projectId} image ${index + 1}`;
                img.loading = 'lazy'; // 지연 로딩 적용
                img.dataset.index = index; // 이미지 인덱스 저장
                
                // 첫 번째 이미지는 바로 표시, 나머지는 숨김
                if (currentLoadedCount === 0 && i === 0) {
                    img.style.display = 'block';
                } else {
                    img.style.display = 'none';
                }
                
                // 이미지가 로드되면 처리
                img.onload = function() {
                    // 성공적으로 로드된 이미지 경로 저장
                    projectState[projectId].loadedPaths.push(projectImageList[index]);
                    successfullyLoadedCount++;
                    
                    // 이미지 로드 완료
                    if (currentLoadedCount === 0 && i === 0 && sliderContainer.children.length === 1) {
                        // 첫 이미지가 로드되면 보이게 설정
                        img.style.display = 'block';
                    }
                };
                
                img.onerror = function() {
                    // 이미지 로드 실패 처리
                    console.error(`Failed to load image: ${projectImageList[index]}`);
                    
                    // 성공적으로 로드된 이미지가 있는 경우, 그 중 하나로 대체
                    if (projectState[projectId].loadedPaths.length > 0) {
                        // 성공적으로 로드된 이미지 중 랜덤하게 하나 선택
                        const randomIndex = Math.floor(Math.random() * projectState[projectId].loadedPaths.length);
                        const replacementSrc = projectState[projectId].loadedPaths[randomIndex];
                        
                        console.log(`Replacing with: ${replacementSrc}`);
                        img.src = replacementSrc;
                        
                        // 첫 번째 이미지인 경우 표시
                        if (currentLoadedCount === 0 && i === 0) {
                            img.style.display = 'block';
                        }
                    } else {
                        // 아직 성공적으로 로드된 이미지가 없는 경우, 더미 이미지 사용
                        img.src = 'https://dummyimage.com/600x400/cccccc/ffffff&text=Loading...';
                        
                        // 첫 번째 이미지인 경우 표시
                        if (currentLoadedCount === 0 && i === 0) {
                            img.style.display = 'block';
                        }
                    }
                };
                
                sliderContainer.appendChild(img);
                imagesAdded++;
            }
        }
        
        // 로드된 이미지 수 업데이트
        projectState[projectId].loadedImages = currentLoadedCount + imagesAdded;
        
        // 첫 이미지가 로드되면 슬라이더 초기화
        if (currentLoadedCount === 0 && imagesAdded > 0) {
            updateSlider(projectId);
        }
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