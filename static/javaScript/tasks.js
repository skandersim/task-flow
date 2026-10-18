document.addEventListener('DOMContentLoaded', () => {
    // управление модальными окнами
    const taskModal = document.querySelector('#taskModal');
    const editModal = document.querySelector('#editModal');
    const deleteModal = document.querySelector('#deleteModal');
    const deleteForm = document.querySelector('#deleteForm');

    // открытие окна новая задача
    document.querySelectorAll('.new-task-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (taskModal) taskModal.classList.add('active');
        });
    });

    // открытие окна редактирование
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!editModal) return;
            const taskId = btn.dataset.taskId;
            const card = btn.closest('.task-card');
            
            const editForm = editModal.querySelector('form');
            if (editForm) {
                editForm.action = `/tasks/edit/${taskId}`;

                if (card) {
                    const titleText = card.querySelector('.task-title-block h3')?.textContent.trim() || '';
                    const dateText = card.querySelector('.date p')?.textContent.trim() || '';

                    const titleInput = editForm.querySelector('input[name="title"]');
                    const dateInput = editForm.querySelector('input[name="due_date"]');

                    if (titleInput) {
                        titleInput.value = titleText;
                        
                        // сначала открываем модалку, потом фокусируемся и выделяем
                        setTimeout(() => {
                            titleInput.focus();  // ставит курсор в поле
                            titleInput.select(); // выделяет весь текст синим
                        }, 50);
                    };
                    if (dateInput) dateInput.value = (dateText === '—') ? '' : dateText;
                };
            };
            
            editModal.classList.add('active');
        });
    });

    // открытие окна удаление
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!deleteModal) return;
            const taskId = btn.dataset.taskId;
            
            if (deleteForm) {
                deleteForm.action = `/tasks/delete/${taskId}`;
            };
            
            deleteModal.classList.add('active');
        });
    });

    // универсальное закрытие окон (на крестик, кнопку отмены или клик по фону)
    document.querySelectorAll('.modal-overlay, .close-btn, .cancel-delete').forEach(el => {
        el.addEventListener('click', (e) => {
            // закрываем, если кликнули именно на фон (overlay) или на сами кнопки закрытия
            if (e.target.classList.contains('modal-overlay') || 
                e.target.closest('.close-btn') || 
                e.target.closest('.cancel-delete')) {
                
                const modal = el.closest('.modal-overlay') || el;
                if (modal) modal.classList.remove('active');
            };
        });
    });


    // управления статусами (Галочки и списки)

    // вспомогательная функция для текста статуса
    function statusLabel(status) {
        if (status === 'done') return 'Выполнено';
        if (status === 'process') return 'В процессе';
        return 'Не начато';
    };

    // применение визуального стиля
    function applyStatus(card, status) {
        const toggle = card.querySelector('.task-toggle');
        const condition = card.querySelector('.condition');

        card.classList.toggle('is-done', status === 'done');
        if (toggle) toggle.dataset.status = status;

        if (condition) {
            condition.className = `condition ${status}`;
            const textEl = condition.querySelector('.condition-trigger p');
            if (textEl) textEl.textContent = statusLabel(status);
            condition.classList.remove('open');
        };

        // мнгновенное обновление счётчиков на экране
        updateHeaderCounters();
        applyTaskFilters();
    };

    // функция перерасчета счетчиков
    function updateHeaderCounters() {
        const allCards = document.querySelectorAll('.task-card');
        if (!allCards.length) return;

        const total = allCards.length;
        const completed = document.querySelectorAll('.task-card.is-done').length;
        const pending = total - completed;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        // ищем элементы на странице и меняем их текст
        const completedEl = document.querySelector('#completed-counter, .completed-tasks-count');
        const pendingEl = document.querySelector('#pending-counter, .pending-tasks-count');
        const percentEl = document.querySelector('#percent-counter, .percent-tasks-count');

        if (completedEl) completedEl.textContent = completed;
        if (pendingEl) pendingEl.textContent = pending;
        if (percentEl) percentEl.textContent = percent + '%';
    };

    // отправка статуса на сервер
    function saveStatus(taskId, status) {
        fetch(`/tasks/${taskId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
        }).catch(err => {
            console.warn('Ошибка сохранения статуса:', err);
        });
    };

    // клик по круглому чекбоксу слева
    document.querySelectorAll('.task-toggle').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const card = btn.closest('.task-card');
            const newStatus = btn.dataset.status === 'done' ? 'not-started' : 'done';
            applyStatus(card, newStatus);
            saveStatus(btn.dataset.taskId, newStatus);
        });
    });

    // клик по кнопке статуса (В процессе / Не начато и т.д.)
    document.querySelectorAll('.condition').forEach(condition => {
        const trigger = condition.querySelector('.condition-trigger');

        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = condition.classList.contains('open');
            // Закрываем другие открытые меню
            document.querySelectorAll('.condition.open').forEach(c => c.classList.remove('open'));
            if (!isOpen) condition.classList.add('open');
        });

        // выбор конкретного статуса из выпадающего списка
        condition.querySelectorAll('.status-option').forEach(option => {
            option.addEventListener('click', function (e) {
                e.stopPropagation();
                const card = condition.closest('.task-card');
                const newStatus = option.dataset.value;
                applyStatus(card, newStatus);
                saveStatus(condition.dataset.taskId, newStatus);
            });
        });
    });

    // закрытие выпадающего списка при клике в любое другое место
    document.addEventListener('click', () => {
        document.querySelectorAll('.condition.open').forEach(c => c.classList.remove('open'));
    });

    // поиск и фильтры верхней панели
    const filterToolbar = document.querySelector(".new_task_subtitle");
    const searchInput = filterToolbar?.querySelector('input[name="search"]');
    const hobbyInput = filterToolbar?.querySelector('input[name="hobbies"]');
    const priorityInput = filterToolbar?.querySelector('input[name="priority"]');
    const statusInput = filterToolbar?.querySelector('input[name="status"]');

    const taskCards = [...document.querySelectorAll(".task-card[data-task-item]")];
    const noFilterResults = document.querySelector("#no-filter-results");

    const normalize = (value) =>
        String(value ?? "").trim().toLocaleLowerCase("ru");

    function applyTaskFilters() {
        const query = normalize(searchInput?.value);
        const hobby = hobbyInput?.value || "";
        const priority = priorityInput?.value || "";
        const status = statusInput?.value || "";

        let visibleCount = 0;

        taskCards.forEach((card) => {
            const titleAndDescription = normalize(
                card.querySelector(".task-title-block")?.textContent
            );
            const statusElement = card.querySelector(".condition");

            const matches =
                (!query || titleAndDescription.includes(query)) &&
                (!hobby || card.dataset.hobbies === hobby) &&
                (!priority || card.dataset.priority === priority) &&
                (!status || Boolean(statusElement?.classList.contains(status)));

            card.hidden = !matches;

            if (matches) {
            visibleCount++;
            }
        });

        if (noFilterResults) {
            noFilterResults.hidden = visibleCount > 0;
        }
    }

    searchInput?.addEventListener("input", applyTaskFilters);

    filterToolbar?.querySelectorAll(".custom-select-filter").forEach((select) => {
        const hiddenInput = select.querySelector('input[type="hidden"]');
        const label = select.querySelector(".custom-select-value");

        select.querySelectorAll(".custom-select-menu .status-option").forEach((option) => {
            option.addEventListener("click", () => {
                if (!hiddenInput) return;

                hiddenInput.value = option.dataset.value || "";
                if (label) label.textContent = option.textContent.trim();

                applyTaskFilters();
            });
        });
    });

    applyTaskFilters();

    function isValidTaskDate(value) {
        const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);

        if (!match) return false;

        const day = Number(match[1]);
        const month = Number(match[2]);
        const year = Number(match[3]);

        if (year < 1000) return false;

        const date = new Date(year, month - 1, day);

        return date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day;
    }

    function isValidTaskTime(value) {
        return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
    }

    document.querySelectorAll("#taskModal form, #editTaskForm").forEach((form) => {
        const dateInput = form.querySelector('input[name="due_date"]');
        const timeInput = form.querySelector('input[name="due_time"]');
        const errorBox = form.querySelector(".client-validation-error");

        if (!dateInput || !errorBox) return;

        form.addEventListener("submit", (event) => {
            errorBox.textContent = "";
            errorBox.hidden = true;

            const dateValue = dateInput.value.trim();
            const timeValue = timeInput ? timeInput.value.trim() : "";

            if (dateValue && !isValidTaskDate(dateValue)) {
                event.preventDefault();
                errorBox.textContent =
                    "Дата должна быть в формате ДД.ММ.ГГГГ, например 01.09.2026.";
                errorBox.hidden = false;
                dateInput.focus();
                return;
            }

            if (timeValue && !isValidTaskTime(timeValue)) {
                event.preventDefault();
                errorBox.textContent =
                    "Время должно быть в формате ЧЧ:ММ, например 18:00.";
                errorBox.hidden = false;
                timeInput.focus();
            }
        });
    });
});