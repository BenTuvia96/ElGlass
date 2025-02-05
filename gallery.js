document.addEventListener('DOMContentLoaded', function () {
    const slider = document.querySelector('.gallery-slider');
    const items = document.querySelectorAll('.gallery-item');
    const prevBtn = document.querySelector('.gallery-nav.prev');
    const nextBtn = document.querySelector('.gallery-nav.next');
    const dotsContainer = document.querySelector('.gallery-dots');
    
    let currentIndex = 0;
    const totalItems = items.length;
    let isAnimating = false;

    // Initialize dots
    items.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('gallery-dot');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    // Setup titles and videos
    items.forEach((item, index) => {
        // Set initial visibility
        item.style.display = index === 0 ? 'flex' : 'none';
        
        // Remove any existing titles first
        const existingTitle = item.querySelector('.gallery-title');
        if (existingTitle) {
            existingTitle.remove();
        }
        
        // Add title
        const titleElement = document.createElement('div');
        titleElement.className = 'gallery-title';
        
        // Define titles for each item
        const titles = [
            'מקלחון זכוכית בעיצוב מודרני',
            'מקלחון מסגרת שחורה תמונת צד',
            'מקלחון מסגרת שחורה',
            'מקלחון זכוכית שקוף',
            'מקלחון זכוכית חלל קטן',
            'התקנת זכוכית',
            'התקנת זכוכית מותאמת לצורך'
        ];
        
        const video = item.querySelector('video');
        if (video) {
            item.classList.add('video-item');
            titleElement.textContent = titles[index] + ' - וידאו';
            
            // Remove any existing play buttons
            const existingPlayBtn = item.querySelector('.play-pause-btn');
            if (existingPlayBtn) {
                existingPlayBtn.remove();
            }
            
            const playBtn = document.createElement('button');
            playBtn.className = 'play-pause-btn';
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            item.appendChild(playBtn);

            // Reset video state
            video.currentTime = 0;
            video.pause();

            // Add hover detection for video container
            item.addEventListener('mouseenter', () => {
                if (!video.paused) {
                    playBtn.style.opacity = '1';
                    playBtn.style.transform = 'translate(-50%, -50%) scale(1)';
                }
            });

            item.addEventListener('mouseleave', () => {
                if (!video.paused) {
                    playBtn.style.opacity = '0';
                    playBtn.style.transform = 'translate(-50%, -50%) scale(0.8)';
                }
            });

            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (video.paused) {
                    video.play();
                    playBtn.querySelector('i').className = 'fas fa-pause';
                    // Hide button after starting playback
                    playBtn.style.opacity = '0';
                    playBtn.style.transform = 'translate(-50%, -50%) scale(0.8)';
                } else {
                    video.pause();
                    playBtn.querySelector('i').className = 'fas fa-play';
                    // Show button when paused
                    playBtn.style.opacity = '1';
                    playBtn.style.transform = 'translate(-50%, -50%) scale(1)';
                }
            });

            video.addEventListener('ended', () => {
                playBtn.querySelector('i').className = 'fas fa-play';
                playBtn.style.opacity = '1';
                playBtn.style.transform = 'translate(-50%, -50%) scale(1)';
            });
        } else {
            titleElement.textContent = titles[index];
        }
        
        item.appendChild(titleElement);
    });

    const dots = document.querySelectorAll('.gallery-dot');
    updateDots();

    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function goToSlide(index, direction = null) {
        if (isAnimating) return;
        isAnimating = true;

        // Pause any playing videos
        items.forEach(item => {
            const video = item.querySelector('video');
            const playBtn = item.querySelector('.play-pause-btn i');
            if (video) {
                video.pause();
                video.currentTime = 0;
                if (playBtn) {
                    playBtn.className = 'fas fa-play';
                }
            }
        });

        const previousIndex = currentIndex;
        currentIndex = index;

        // Normalize indices for circular movement
        if (currentIndex >= totalItems) currentIndex = 0;
        if (currentIndex < 0) currentIndex = totalItems - 1;

        // Hide previous item and show new item with transition
        items[previousIndex].style.opacity = '0';
        items[previousIndex].style.transition = 'opacity 0.3s ease-out';
        
        setTimeout(() => {
            items[previousIndex].style.display = 'none';
            items[currentIndex].style.display = 'flex';
            items[currentIndex].style.opacity = '0';
            
            // Trigger reflow
            items[currentIndex].offsetHeight;
            
            items[currentIndex].style.opacity = '1';
            items[currentIndex].style.transition = 'opacity 0.3s ease-in';
            
            updateDots();
            
            setTimeout(() => {
                isAnimating = false;
            }, 300);
        }, 300);
    }

    // Navigation button handlers
    nextBtn.addEventListener('click', () => {
        goToSlide(currentIndex - 1, 'prev');
    });

    prevBtn.addEventListener('click', () => {
        goToSlide(currentIndex + 1, 'next');
    });

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;

    slider.addEventListener('touchstart', e => {
        if (isAnimating) return;
        touchStartX = e.touches[0].clientX;
        isDragging = true;
    });

    slider.addEventListener('touchmove', e => {
        if (!isDragging || isAnimating) return;
        e.preventDefault();
    });

    slider.addEventListener('touchend', e => {
        if (!isDragging || isAnimating) return;
        isDragging = false;
        touchEndX = e.changedTouches[0].clientX;
        
        const diff = touchEndX - touchStartX;
        const threshold = slider.offsetWidth * 0.2;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                goToSlide(currentIndex - 1, 'prev');
            } else {
                goToSlide(currentIndex + 1, 'next');
            }
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') {
            goToSlide(currentIndex + 1, 'next');
        } else if (e.key === 'ArrowRight') {
            goToSlide(currentIndex - 1, 'prev');
        }
    });

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setupCarousel, 250);
    });
});
