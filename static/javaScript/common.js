document.addEventListener('DOMContentLoaded', () => {
    // проверяем сохраненную тему при загрузке любой страницы
    const savedTheme = localStorage.getItem('taskflow_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }

    // применяем сохраненный цвет акцента и свечения
    const savedAccent = localStorage.getItem('taskflow_accent');
    if (savedAccent) {
        document.documentElement.style.setProperty('--accent-color', savedAccent);

        const savedHover = localStorage.getItem('taskflow_accent_hover');
        if (savedHover) document.documentElement.style.setProperty('--accent-hover', savedHover);

        const savedAlpha = localStorage.getItem('taskflow_accent_alpha');
        if (savedAlpha) document.documentElement.style.setProperty('--accent-alpha', savedAlpha);

        const savedGlow = localStorage.getItem('taskflow_accent_glow');
        if (savedGlow) document.documentElement.style.setProperty('--accent-glow', savedGlow);
    }

    // инициализация иконок
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // анимация элементов reveal
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach((element) => {
        observer.observe(element);
    });

    // безопасный перехват кнопки выход
    const logoutModal = document.querySelector('#logoutModal');
    const logoutTriggers = document.querySelectorAll('a[href="/logout"], .logout-btn');

    logoutTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            // если модалка есть на странице - отменяем прямой переход и открываем окно
            if (logoutModal) {
                e.preventDefault();
                logoutModal.classList.add('active');
            }
        });
    });

    // хакрытие модалки выхода
    if (logoutModal) {
        logoutModal.addEventListener('click', (e) => {
            if (
                e.target.classList.contains('modal-overlay') || 
                e.target.closest('.logout-close') || 
                e.target.closest('.cancel-logout')
            ) {
                logoutModal.classList.remove('active');
            }
        });
    }
});

function initCustomSelects(root = document) {
    root.querySelectorAll('.custom-select').forEach(select => {
        if (select.dataset.inited === '1') return;
        select.dataset.inited = '1';

        const trigger = select.querySelector('.custom-select-trigger');
        const valueEl = select.querySelector('.custom-select-value');
        const hiddenInput = select.querySelector('input[type="hidden"]');
        const options = select.querySelectorAll('.status-option');
        if (!trigger || !valueEl || !hiddenInput) return;

        if (hiddenInput.value) valueEl.classList.add('is-selected');

        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.custom-select.open').forEach(s => {
                if (s !== select) s.classList.remove('open');
            });
            select.classList.toggle('open');
        });

        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                valueEl.textContent = option.textContent.trim();
                valueEl.classList.add('is-selected');
                hiddenInput.value = option.dataset.value || '';
                select.classList.remove('open');
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initCustomSelects();

    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select.open').forEach(s => s.classList.remove('open'));
    });
});