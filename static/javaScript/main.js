document.addEventListener('DOMContentLoaded', () => {
    
    // перерасчет статистики на главной
    function updateMainStats() {
        const total = parseInt(document.getElementById('total-counter')?.textContent || '0', 10);
        const completed = document.querySelectorAll('.main-task-item.is-done').length;
        const pending = Math.max(0, total - completed);
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        // обновляем цифры выполненных и оставшихся задач
        const completedEl = document.getElementById('completed-counter');
        const pendingEl = document.getElementById('pending-counter');
        if (completedEl) completedEl.textContent = completed;
        if (pendingEl) pendingEl.textContent = pending;

        // обновляем процент и анимацию круга
        const progressCircle = document.querySelector('.progress-circle');
        const progressSpan = progressCircle ? progressCircle.querySelector('span') : null;
        if (progressSpan) progressSpan.textContent = percent + '%';
        if (progressCircle) progressCircle.style.setProperty('--progress', percent + '%');
    };

    // применение статуса к карточке
    function applyStatus(card, status) {
        const toggle = card.querySelector('.task-toggle');
        card.classList.toggle('is-done', status === 'done');
        if (toggle) toggle.dataset.status = status;

        updateMainStats();
    };

    // отправка нового статуса на сервер
    function saveStatus(taskId, status) {
        fetch(`/tasks/${taskId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
        }).catch(err => console.warn('Ошибка сохранения статуса:', err));
    };

    // обработка клика по галочкам
    document.querySelectorAll('.main-task-item .task-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.main-task-item');
            const newStatus = btn.dataset.status === 'done' ? 'not-started' : 'done';
            applyStatus(card, newStatus);
            saveStatus(btn.dataset.taskId, newStatus);
        });
    });
});