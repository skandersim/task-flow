document.addEventListener('DOMContentLoaded', () => {

    const progressBars = document.querySelectorAll('.progress-bar-fill');
    const circle = document.getElementById('goalCircle');
    const percentText = document.getElementById('goalPercentText');

    setTimeout(() => {
        // 1. Полоски категорий
        progressBars.forEach(bar => {
            const targetPercent = bar.dataset.percent || 0;
            bar.style.width = `${targetPercent}%`;
        });

        // 2. Синхронная 60 FPS анимация круга и текста
        if (circle && percentText) {
            const targetPercent = parseInt(circle.dataset.percent || '0', 10);

            if (targetPercent > 0) {
                const duration = 1000; // 1 секунда
                const startTime = performance.now();

                function animateGoal(now) {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Плавное замедление в конце
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(easeOut * targetPercent);

                    // ДВИГАЕМ КРУГ И ЦИФРЫ СТРОГО ОДНОВРЕМЕННО
                    circle.style.setProperty('--progress', `${current}%`);
                    percentText.textContent = `${current}%`;

                    if (progress < 1) {
                        requestAnimationFrame(animateGoal);
                    }
                }

                requestAnimationFrame(animateGoal);
            }
        }
    }, 150);
});