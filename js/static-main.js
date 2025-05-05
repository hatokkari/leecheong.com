document.addEventListener('DOMContentLoaded', () => {
    // 변수 초기화
    let columnCount = 1;
    let isInitialLoad = true;
    let gridAnimationInterval;
    
    // DOM 요소
    const imageGrid = document.getElementById('image-grid');
    const loadingIndicator = document.getElementById('loading-indicator');
    const galleryModal = document.getElementById('gallery-modal');
    const galleryImage = document.getElementById('gallery-image');
    const galleryClose = document.getElementById('gallery-close');
    const galleryPrev = document.getElementById('gallery-prev');
    const galleryNext = document.getElementById('gallery-next');
    const gridToggle = document.getElementById('grid-toggle');
    const loadingPage = document.getElementById('loading-page');
    
    // 이미지 경로 배열 (실제 파일명 모두 추가)
    const imageList = [
        // glass-eye
        "/images/webp/glass-eye/glass-eye_1-min.webp",
        "/images/webp/glass-eye/glass-eye_10-min.webp",
        "/images/webp/glass-eye/glass-eye_100-min.webp",
        "/images/webp/glass-eye/glass-eye_101-min.webp",
        "/images/webp/glass-eye/glass-eye_102-min.webp",
        "/images/webp/glass-eye/glass-eye_103-min.webp",
        "/images/webp/glass-eye/glass-eye_104-min.webp",
        "/images/webp/glass-eye/glass-eye_105-min.webp",
        "/images/webp/glass-eye/glass-eye_106-min.webp",
        "/images/webp/glass-eye/glass-eye_107-min.webp",
        "/images/webp/glass-eye/glass-eye_108-min.webp",
        "/images/webp/glass-eye/glass-eye_109-min.webp",
        "/images/webp/glass-eye/glass-eye_11-min.webp",
        "/images/webp/glass-eye/glass-eye_110-min.webp",
        "/images/webp/glass-eye/glass-eye_111-min.webp",
        "/images/webp/glass-eye/glass-eye_112-min.webp",
        "/images/webp/glass-eye/glass-eye_113-min.webp",
        "/images/webp/glass-eye/glass-eye_114-min.webp",
        "/images/webp/glass-eye/glass-eye_115-min.webp",
        "/images/webp/glass-eye/glass-eye_116-min.webp",
        "/images/webp/glass-eye/glass-eye_117-min.webp",
        "/images/webp/glass-eye/glass-eye_118-min.webp",
        "/images/webp/glass-eye/glass-eye_119-min.webp",
        "/images/webp/glass-eye/glass-eye_12-min.webp",
        "/images/webp/glass-eye/glass-eye_120-min.webp",
        "/images/webp/glass-eye/glass-eye_121-min.webp",
        "/images/webp/glass-eye/glass-eye_122-min.webp",
        "/images/webp/glass-eye/glass-eye_123-min.webp",
        "/images/webp/glass-eye/glass-eye_124-min.webp",
        "/images/webp/glass-eye/glass-eye_125-min.webp",
        "/images/webp/glass-eye/glass-eye_126-min.webp",
        "/images/webp/glass-eye/glass-eye_127-min.webp",
        "/images/webp/glass-eye/glass-eye_128-min.webp",
        "/images/webp/glass-eye/glass-eye_129-min.webp",
        "/images/webp/glass-eye/glass-eye_13-min.webp",
        "/images/webp/glass-eye/glass-eye_130-min.webp",
        "/images/webp/glass-eye/glass-eye_131-min.webp",
        "/images/webp/glass-eye/glass-eye_132-min.webp",
        "/images/webp/glass-eye/glass-eye_133-min.webp",
        "/images/webp/glass-eye/glass-eye_134-min.webp",
        "/images/webp/glass-eye/glass-eye_135-min.webp",
        "/images/webp/glass-eye/glass-eye_136-min.webp",
        "/images/webp/glass-eye/glass-eye_137-min.webp",
        "/images/webp/glass-eye/glass-eye_138-min.webp",
        "/images/webp/glass-eye/glass-eye_139-min.webp",
        "/images/webp/glass-eye/glass-eye_14-min.webp",
        "/images/webp/glass-eye/glass-eye_140-min.webp",
        "/images/webp/glass-eye/glass-eye_141-min.webp",
        "/images/webp/glass-eye/glass-eye_142-min.webp",
        "/images/webp/glass-eye/glass-eye_143-min.webp",
        "/images/webp/glass-eye/glass-eye_144-min.webp",
        "/images/webp/glass-eye/glass-eye_145-min.webp",
        "/images/webp/glass-eye/glass-eye_146-min.webp",
        "/images/webp/glass-eye/glass-eye_147-min.webp",
        "/images/webp/glass-eye/glass-eye_148-min.webp",
        "/images/webp/glass-eye/glass-eye_149-min.webp",
        "/images/webp/glass-eye/glass-eye_15-min.webp",
        "/images/webp/glass-eye/glass-eye_150-min.webp",
        "/images/webp/glass-eye/glass-eye_151-min.webp",
        "/images/webp/glass-eye/glass-eye_152-min.webp",
        "/images/webp/glass-eye/glass-eye_153-min.webp",
        "/images/webp/glass-eye/glass-eye_154-min.webp",
        "/images/webp/glass-eye/glass-eye_155-min.webp",
        "/images/webp/glass-eye/glass-eye_156-min.webp",
        "/images/webp/glass-eye/glass-eye_157-min.webp",
        "/images/webp/glass-eye/glass-eye_158-min.webp",
        "/images/webp/glass-eye/glass-eye_159-min.webp",
        "/images/webp/glass-eye/glass-eye_16-min.webp",
        "/images/webp/glass-eye/glass-eye_160-min.webp",
        "/images/webp/glass-eye/glass-eye_161-min.webp",
        "/images/webp/glass-eye/glass-eye_162-min.webp",
        "/images/webp/glass-eye/glass-eye_163-min.webp",
        "/images/webp/glass-eye/glass-eye_164-min.webp",
        "/images/webp/glass-eye/glass-eye_165-min.webp",
        "/images/webp/glass-eye/glass-eye_166-min.webp",
        "/images/webp/glass-eye/glass-eye_167-min.webp",
        "/images/webp/glass-eye/glass-eye_168-min.webp",
        "/images/webp/glass-eye/glass-eye_169-min.webp",
        "/images/webp/glass-eye/glass-eye_17-min.webp",
        "/images/webp/glass-eye/glass-eye_170-min.webp",
        "/images/webp/glass-eye/glass-eye_171-min.webp",
        "/images/webp/glass-eye/glass-eye_172-min.webp",
        "/images/webp/glass-eye/glass-eye_173-min.webp",
        "/images/webp/glass-eye/glass-eye_174-min.webp",
        "/images/webp/glass-eye/glass-eye_175-min.webp",
        "/images/webp/glass-eye/glass-eye_176-min.webp",
        "/images/webp/glass-eye/glass-eye_177-min.webp",
        "/images/webp/glass-eye/glass-eye_178-min.webp",
        "/images/webp/glass-eye/glass-eye_179-min.webp",
        "/images/webp/glass-eye/glass-eye_18-min.webp",
        "/images/webp/glass-eye/glass-eye_180-min.webp",
        "/images/webp/glass-eye/glass-eye_181-min.webp",
        "/images/webp/glass-eye/glass-eye_182-min.webp",
        "/images/webp/glass-eye/glass-eye_183-min.webp",
        "/images/webp/glass-eye/glass-eye_184-min.webp",
        "/images/webp/glass-eye/glass-eye_185-min.webp",
        "/images/webp/glass-eye/glass-eye_186-min.webp",
        "/images/webp/glass-eye/glass-eye_187-min.webp",
        "/images/webp/glass-eye/glass-eye_188-min.webp",
        "/images/webp/glass-eye/glass-eye_189-min.webp",
        "/images/webp/glass-eye/glass-eye_19-min.webp",
        "/images/webp/glass-eye/glass-eye_190-min.webp",
        "/images/webp/glass-eye/glass-eye_191-min.webp",
        "/images/webp/glass-eye/glass-eye_192-min.webp",
        "/images/webp/glass-eye/glass-eye_193-min.webp",
        "/images/webp/glass-eye/glass-eye_194-min.webp",
        "/images/webp/glass-eye/glass-eye_195-min.webp",
        "/images/webp/glass-eye/glass-eye_196-min.webp",
        "/images/webp/glass-eye/glass-eye_197-min.webp",
        "/images/webp/glass-eye/glass-eye_198-min.webp",
        "/images/webp/glass-eye/glass-eye_199-min.webp",
        "/images/webp/glass-eye/glass-eye_2-min.webp",
        "/images/webp/glass-eye/glass-eye_20-min.webp",
        "/images/webp/glass-eye/glass-eye_200-min.webp",
        "/images/webp/glass-eye/glass-eye_201-min.webp",
        "/images/webp/glass-eye/glass-eye_202-min.webp",
        "/images/webp/glass-eye/glass-eye_21-min.webp",
        "/images/webp/glass-eye/glass-eye_22-min.webp",
        "/images/webp/glass-eye/glass-eye_23-min.webp",
        "/images/webp/glass-eye/glass-eye_24-min.webp",
        "/images/webp/glass-eye/glass-eye_25-min.webp",
        "/images/webp/glass-eye/glass-eye_26-min.webp",
        "/images/webp/glass-eye/glass-eye_27-min.webp",
        "/images/webp/glass-eye/glass-eye_28-min.webp",
        "/images/webp/glass-eye/glass-eye_29-min.webp",
        "/images/webp/glass-eye/glass-eye_3-min.webp",
        "/images/webp/glass-eye/glass-eye_30-min.webp",
        "/images/webp/glass-eye/glass-eye_31-min.webp",
        "/images/webp/glass-eye/glass-eye_32-min.webp",
        "/images/webp/glass-eye/glass-eye_33-min.webp",
        "/images/webp/glass-eye/glass-eye_34-min.webp",
        "/images/webp/glass-eye/glass-eye_35-min.webp",
        "/images/webp/glass-eye/glass-eye_36-min.webp",
        "/images/webp/glass-eye/glass-eye_37-min.webp",
        "/images/webp/glass-eye/glass-eye_38-min.webp",
        "/images/webp/glass-eye/glass-eye_39-min.webp",
        "/images/webp/glass-eye/glass-eye_4-min.webp",
        "/images/webp/glass-eye/glass-eye_40-min.webp",
        "/images/webp/glass-eye/glass-eye_41-min.webp",
        "/images/webp/glass-eye/glass-eye_42-min.webp",
        "/images/webp/glass-eye/glass-eye_43-min.webp",
        "/images/webp/glass-eye/glass-eye_44-min.webp",
        "/images/webp/glass-eye/glass-eye_45-min.webp",
        "/images/webp/glass-eye/glass-eye_46-min.webp",
        "/images/webp/glass-eye/glass-eye_47-min.webp",
        "/images/webp/glass-eye/glass-eye_48-min.webp",
        "/images/webp/glass-eye/glass-eye_49-min.webp",
        "/images/webp/glass-eye/glass-eye_5-min.webp",
        "/images/webp/glass-eye/glass-eye_50-min.webp",
        "/images/webp/glass-eye/glass-eye_51-min.webp",
        "/images/webp/glass-eye/glass-eye_52-min.webp",
        "/images/webp/glass-eye/glass-eye_53-min.webp",
        "/images/webp/glass-eye/glass-eye_54-min.webp",
        "/images/webp/glass-eye/glass-eye_55-min.webp",
        "/images/webp/glass-eye/glass-eye_56-min.webp",
        "/images/webp/glass-eye/glass-eye_57-min.webp",
        "/images/webp/glass-eye/glass-eye_58-min.webp",
        "/images/webp/glass-eye/glass-eye_59-min.webp",
        "/images/webp/glass-eye/glass-eye_6-min.webp",
        "/images/webp/glass-eye/glass-eye_60-min.webp",
        "/images/webp/glass-eye/glass-eye_61-min.webp",
        "/images/webp/glass-eye/glass-eye_62-min.webp",
        "/images/webp/glass-eye/glass-eye_63-min.webp",
        "/images/webp/glass-eye/glass-eye_64-min.webp",
        "/images/webp/glass-eye/glass-eye_65-min.webp",
        "/images/webp/glass-eye/glass-eye_66-min.webp",
        "/images/webp/glass-eye/glass-eye_67-min.webp",
        "/images/webp/glass-eye/glass-eye_68-min.webp",
        "/images/webp/glass-eye/glass-eye_69-min.webp",
        "/images/webp/glass-eye/glass-eye_7-min.webp",
        "/images/webp/glass-eye/glass-eye_70-min.webp",
        "/images/webp/glass-eye/glass-eye_71-min.webp",
        "/images/webp/glass-eye/glass-eye_72-min.webp",
        "/images/webp/glass-eye/glass-eye_73-min.webp",
        "/images/webp/glass-eye/glass-eye_74-min.webp",
        "/images/webp/glass-eye/glass-eye_75-min.webp",
        "/images/webp/glass-eye/glass-eye_76-min.webp",
        "/images/webp/glass-eye/glass-eye_77-min.webp",
        "/images/webp/glass-eye/glass-eye_78-min.webp",
        "/images/webp/glass-eye/glass-eye_79-min.webp",
        "/images/webp/glass-eye/glass-eye_8-min.webp",
        "/images/webp/glass-eye/glass-eye_80-min.webp",
        "/images/webp/glass-eye/glass-eye_81-min.webp",
        "/images/webp/glass-eye/glass-eye_82-min.webp",
        "/images/webp/glass-eye/glass-eye_83-min.webp",
        "/images/webp/glass-eye/glass-eye_84-min.webp",
        "/images/webp/glass-eye/glass-eye_85-min.webp",
        "/images/webp/glass-eye/glass-eye_86-min.webp",
        "/images/webp/glass-eye/glass-eye_87-min.webp",
        "/images/webp/glass-eye/glass-eye_88-min.webp",
        "/images/webp/glass-eye/glass-eye_89-min.webp",
        "/images/webp/glass-eye/glass-eye_9-min.webp",
        "/images/webp/glass-eye/glass-eye_90-min.webp",
        "/images/webp/glass-eye/glass-eye_91-min.webp",
        "/images/webp/glass-eye/glass-eye_92-min.webp",
        "/images/webp/glass-eye/glass-eye_93-min.webp",
        "/images/webp/glass-eye/glass-eye_94-min.webp",
        "/images/webp/glass-eye/glass-eye_95-min.webp",
        "/images/webp/glass-eye/glass-eye_96-min.webp",
        "/images/webp/glass-eye/glass-eye_97-min.webp",
        "/images/webp/glass-eye/glass-eye_98-min.webp",
        "/images/webp/glass-eye/glass-eye_99-min.webp",
        // imperfect-jeonju
        "/images/webp/imperfect-jeonju/imperfect-jeonju_1-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_10-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_11-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_12-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_13-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_14-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_15-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_16-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_17-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_18-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_19-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_2-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_20-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_21-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_22-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_23-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_24-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_25-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_26-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_27-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_28-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_29-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_3-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_30-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_31-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_32-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_33-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_34-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_35-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_36-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_37-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_38-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_39-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_4-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_40-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_41-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_42-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_43-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_44-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_45-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_46-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_47-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_48-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_49-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_5-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_50-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_51-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_52-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_53-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_54-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_55-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_56-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_57-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_58-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_59-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_6-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_60-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_61-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_62-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_63-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_64-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_65-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_66-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_67-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_68-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_69-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_70-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_71-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_72-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_73-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_74-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_75-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_76-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_77-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_78-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_79-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_8-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_80-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_81-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_82-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_83-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_84-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_85-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_86-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_87-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_88-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_89-min.webp",
        "/images/webp/imperfect-jeonju/imperfect-jeonju_9-min.webp",
        // shade-of-blue
        "/images/webp/shade-of-blue/shade-of-blue_1-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_10-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_11-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_12-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_13-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_14-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_15-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_16-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_17-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_18-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_19-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_2-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_20-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_3-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_4-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_41-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_42-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_43-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_44-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_45-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_46-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_47-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_48-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_49-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_5-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_50-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_51-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_52-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_53-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_54-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_55-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_56-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_57-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_58-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_59-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_6-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_60-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_61-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_62-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_63-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_64-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_65-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_66-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_67-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_7-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_8-min.webp",
        "/images/webp/shade-of-blue/shade-of-blue_9-min.webp",
        // the-faceless
        "/images/webp/the-faceless/the-faceless_1-min.webp",
        "/images/webp/the-faceless/the-faceless_10-min.webp",
        "/images/webp/the-faceless/the-faceless_11-min.webp",
        "/images/webp/the-faceless/the-faceless_12-min.webp",
        "/images/webp/the-faceless/the-faceless_13-min.webp",
        "/images/webp/the-faceless/the-faceless_14-min.webp",
        "/images/webp/the-faceless/the-faceless_15-min.webp",
        "/images/webp/the-faceless/the-faceless_16-min.webp",
        "/images/webp/the-faceless/the-faceless_17-min.webp",
        "/images/webp/the-faceless/the-faceless_18-min.webp",
        "/images/webp/the-faceless/the-faceless_19-min.webp",
        "/images/webp/the-faceless/the-faceless_2-min.webp",
        "/images/webp/the-faceless/the-faceless_20-min.webp",
        "/images/webp/the-faceless/the-faceless_21-min.webp",
        "/images/webp/the-faceless/the-faceless_22-min.webp",
        "/images/webp/the-faceless/the-faceless_23-min.webp",
        "/images/webp/the-faceless/the-faceless_24-min.webp",
        "/images/webp/the-faceless/the-faceless_25-min.webp",
        "/images/webp/the-faceless/the-faceless_26-min.webp",
        "/images/webp/the-faceless/the-faceless_27-min.webp",
        "/images/webp/the-faceless/the-faceless_28-min.webp",
        "/images/webp/the-faceless/the-faceless_29-min.webp",
        "/images/webp/the-faceless/the-faceless_3-min.webp",
        "/images/webp/the-faceless/the-faceless_30-min.webp",
        "/images/webp/the-faceless/the-faceless_31-min.webp",
        "/images/webp/the-faceless/the-faceless_32-min.webp",
        "/images/webp/the-faceless/the-faceless_33-min.webp",
        "/images/webp/the-faceless/the-faceless_34-min.webp",
        "/images/webp/the-faceless/the-faceless_35-min.webp",
        "/images/webp/the-faceless/the-faceless_36-min.webp",
        "/images/webp/the-faceless/the-faceless_37-min.webp",
        "/images/webp/the-faceless/the-faceless_38-min.webp",
        "/images/webp/the-faceless/the-faceless_39-min.webp",
        "/images/webp/the-faceless/the-faceless_4-min.webp",
        "/images/webp/the-faceless/the-faceless_40-min.webp",
        "/images/webp/the-faceless/the-faceless_41-min.webp",
        "/images/webp/the-faceless/the-faceless_42-min.webp",
        "/images/webp/the-faceless/the-faceless_43-min.webp",
        "/images/webp/the-faceless/the-faceless_44-min.webp",
        "/images/webp/the-faceless/the-faceless_45-min.webp",
        "/images/webp/the-faceless/the-faceless_46-min.webp",
        "/images/webp/the-faceless/the-faceless_47-min.webp",
        "/images/webp/the-faceless/the-faceless_48-min.webp",
        "/images/webp/the-faceless/the-faceless_49-min.webp",
        "/images/webp/the-faceless/the-faceless_5-min.webp",
        "/images/webp/the-faceless/the-faceless_50-min.webp",
        "/images/webp/the-faceless/the-faceless_51-min.webp",
        "/images/webp/the-faceless/the-faceless_6-min.webp",
        "/images/webp/the-faceless/the-faceless_7-min.webp",
        "/images/webp/the-faceless/the-faceless_8-min.webp",
        "/images/webp/the-faceless/the-faceless_9-min.webp",
    ];
    
    // Fisher-Yates 셔플
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // 1. 이미지 그리드에 동적으로 이미지 삽입
    function renderImages() {
        imageGrid.innerHTML = '';
        const images = [...imageList];
        shuffle(images);
        images.forEach(src => {
            const div = document.createElement('div');
            div.className = 'image-item';
            const img = document.createElement('img');
            img.src = src;
            img.alt = '이청의 사진';
            img.loading = 'lazy';
            div.appendChild(img);
            imageGrid.appendChild(div);
        });
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
        } else {
            columnCount = columnCount >= 10 ? 1 : columnCount + 1;
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
        
        // 버튼 텍스트 업데이트
        gridToggle.textContent = columnCount;
    }
    
    // 초기 로딩 애니메이션
    function startInitialAnimation() {
        // 로딩 페이지 표시
        loadingPage.style.display = 'flex';
        
        // 이미지 로드가 완료되면 슬라이드 업 애니메이션 실행
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
        }, 1800);
    }
    
    // 그리드 열 변환 애니메이션 시작
    function startGridColumnAnimation() {
        let currentColumn = 1;
        
        // 2초 동안 1열부터 10열까지 순차적으로 변경
        gridAnimationInterval = setInterval(() => {
            currentColumn++;
            if (currentColumn > 10) {
                clearInterval(gridAnimationInterval);
                columnCount = 10; // 최종적으로 10열로 설정
                changeGridColumns(10);
                isInitialLoad = false;
                return;
            }
            
            changeGridColumns(currentColumn);
        }, 2000 / 9); // 2초를 9단계로 나눔 (1->2->3->4->5->6->7->8->9->10)
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
        
        // 그리드 열 수 변경 버튼
        gridToggle.addEventListener('click', () => changeGridColumns());
    }
    
    // 페이지 초기화
    renderImages();
    setupImageEvents();
    startInitialAnimation();
    setupEventListeners();
}); 