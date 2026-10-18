document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.querySelector('.mini-calendar');
    if (!calendar) return;

    const title = calendar.querySelector('.mini-calendar-header h3');
    const grid = calendar.querySelector('#miniCalendarGrid');
    const prevButton = calendar.querySelector('.prev-btn');
    const nextButton = calendar.querySelector('.next-btn');

    if (!title || !grid || !prevButton || !nextButton) return;

    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель',
        'Май', 'Июнь', 'Июль', 'Август',
        'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    const today = new Date();
    let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    function renderMiniCalendar() {
        const year = displayedMonth.getFullYear();
        const month = displayedMonth.getMonth();
        const offset = (new Date(year, month, 1).getDay() + 6) % 7;

        title.textContent = `${monthNames[month]} ${year}`;
        grid.innerHTML = '';

        // 42 ячейки: 6 строк по 7 дней
        for (let i = 0; i < 42; i++) {
            const date = new Date(year, month, i - offset + 1);
            const cell = document.createElement('div');

            cell.className = 'day-cell';

            if (date.getMonth() !== month) {
                cell.classList.add('other-month');
            }

            if (
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()
            ) {
                cell.classList.add('today');
            }

            const number = document.createElement('span');
            number.className = 'day-number';
            number.textContent = date.getDate();

            cell.appendChild(number);
            grid.appendChild(cell);
        }
    }

    prevButton.addEventListener('click', () => {
        displayedMonth = new Date(
            displayedMonth.getFullYear(),
            displayedMonth.getMonth() - 1,
            1
        );
        renderMiniCalendar();
    });

    nextButton.addEventListener('click', () => {
        displayedMonth = new Date(
            displayedMonth.getFullYear(),
            displayedMonth.getMonth() + 1,
            1
        );
        renderMiniCalendar();
    });

    renderMiniCalendar();
});