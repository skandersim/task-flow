document.addEventListener('DOMContentLoaded', () => {
    const bigGrid = document.getElementById('calendarGrid');

    if (!bigGrid) return;

    let currentDate = new Date();
    let currentView = 'month';

    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель',
        'Май', 'Июнь', 'Июль', 'Август',
        'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    const mainTitle = document.querySelector('.calendar-board-header-nav h3');
    const viewButtons = document.querySelectorAll('.calendar-board-header-views button');
    const prevButtons = document.querySelectorAll('.prev-btn');
    const nextButtons = document.querySelectorAll('.next-btn');

    function getTasks() {
        return typeof userTasks !== 'undefined' && Array.isArray(userTasks)
            ? userTasks
            : [];
    }

    function updateCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        if (mainTitle) {
            mainTitle.textContent = `${monthNames[month]} ${year}`;
        }

        bigGrid.classList.toggle('is-week', currentView === 'week');

        const days = currentView === 'month'
            ? buildMonthDays(year, month)
            : buildWeekDays(currentDate);

        renderCalendar(days, year, month);
        renderUpcomingEvents();
    }

    function changeMonth(amount) {
        const oldDay = currentDate.getDate();

        currentDate.setDate(1);
        currentDate.setMonth(currentDate.getMonth() + amount);

        const lastDay = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
        ).getDate();

        currentDate.setDate(Math.min(oldDay, lastDay));
        updateCalendar();
    }

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentView === 'month') {
                changeMonth(-1);
            } else {
                currentDate.setDate(currentDate.getDate() - 7);
                updateCalendar();
            }
        });
    });

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentView === 'month') {
                changeMonth(1);
            } else {
                currentDate.setDate(currentDate.getDate() + 7);
                updateCalendar();
            }
        });
    });

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            viewButtons.forEach(item => item.classList.remove('active'));
            button.classList.add('active');

            const text = button.textContent.trim();

            if (text.includes('Месяц')) {
                currentView = 'month';
            } else if (text.includes('Неделя')) {
                currentView = 'week';
            }

            updateCalendar();
        });
    });

    function buildMonthDays(year, month) {
        const days = [];
        const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPreviousMonth = new Date(year, month, 0).getDate();
        const today = new Date();

        for (let i = firstWeekday; i > 0; i--) {
            days.push({
                dayNumber: daysInPreviousMonth - i + 1,
                isCurrentMonth: false,
                isToday: false
            });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push({
                dayNumber: day,
                isCurrentMonth: true,
                isToday:
                    day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear()
            });
        }

        let nextMonthDay = 1;
        while (days.length < 42) {
            days.push({
                dayNumber: nextMonthDay++,
                isCurrentMonth: false,
                isToday: false
            });
        }

        return days;
    }

    function buildWeekDays(date) {
        const days = [];
        const today = new Date();
        const monday = new Date(date);
        const offset = (monday.getDay() + 6) % 7;

        monday.setDate(monday.getDate() - offset);

        for (let i = 0; i < 7; i++) {
            const day = new Date(monday);

            day.setDate(monday.getDate() + i);

            days.push({
                dayNumber: day.getDate(),
                fullDate: day,
                isCurrentMonth: true,
                isToday:
                    day.getDate() === today.getDate() &&
                    day.getMonth() === today.getMonth() &&
                    day.getFullYear() === today.getFullYear()
            });
        }

        return days;
    }

    function renderCalendar(days, year, month) {
        bigGrid.innerHTML = '';
        const tasks = getTasks();

        days.forEach(day => {
            const cell = document.createElement('div');
            cell.className = 'day-cell';

            if (!day.isCurrentMonth) cell.classList.add('other-month');
            if (day.isToday) cell.classList.add('today');

            const number = document.createElement('span');
            number.className = 'day-number';
            number.textContent = day.dayNumber;
            cell.appendChild(number);

            let cellDateString = null;

            if (day.fullDate) {
                const date = day.fullDate;
                const dd = String(date.getDate()).padStart(2, '0');
                const mm = String(date.getMonth() + 1).padStart(2, '0');

                cellDateString = `${dd}.${mm}.${date.getFullYear()}`;
            } else if (day.isCurrentMonth) {
                const dd = String(day.dayNumber).padStart(2, '0');
                const mm = String(month + 1).padStart(2, '0');

                cellDateString = `${dd}.${mm}.${year}`;
            }

            if (cellDateString) {
                const dayTasks = tasks.filter(
                    task => task.due_date === cellDateString
                );

                if (dayTasks.length) {
                    const events = document.createElement('div');
                    events.className = 'cell-events';

                    dayTasks.slice(0, 3).forEach(task => {
                        const chip = document.createElement('div');
                        chip.className = `event-chip prio-${task.priority || 'low'}`;

                        const time = task.due_time
                            ? `<span class="event-time">${task.due_time}</span>`
                            : '';

                        chip.innerHTML = `
                            <span class="chip-dot"></span>
                            <span class="event-title">${task.title}</span>
                            ${time}
                        `;

                        events.appendChild(chip);
                    });

                    cell.appendChild(events);
                }
            }

            bigGrid.appendChild(cell);
        });
    }

    function renderUpcomingEvents() {
        const list = document.getElementById('upcomingList');
        if (!list) return;

        list.innerHTML = '';

        const today = new Date();
        const todayStart = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

        const upcoming = getTasks()
            .filter(task => task.due_date)
            .map(task => {
                const [day, month, year] = task.due_date.split('.').map(Number);
                const [hours = 0, minutes = 0] = (task.due_time || '00:00')
                    .split(':')
                    .map(Number);

                return {
                    ...task,
                    dateObj: new Date(year, month - 1, day, hours, minutes)
                };
            })
            .filter(task => task.dateObj >= todayStart)
            .sort((a, b) => a.dateObj - b.dateObj)
            .slice(0, 5);

        if (!upcoming.length) {
            list.innerHTML = '<p class="upcoming-empty">Ближайших событий нет</p>';
            return;
        }

        upcoming.forEach(task => {
            const item = document.createElement('div');
            item.className = `upcoming-item prio-${task.priority || 'low'}`;

            const time = task.due_time ? ` ${task.due_time}` : '';

            item.innerHTML = `
                <span class="upcoming-dot"></span>
                <div class="upcoming-content">
                    <div class="upcoming-item-title">${task.title}</div>
                    <div class="upcoming-item-date">${task.due_date}${time}</div>
                </div>
            `;

            list.appendChild(item);
        });
    }

    updateCalendar();
});