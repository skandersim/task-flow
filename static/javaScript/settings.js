// переключение тем
window.selectTheme = function(clickedCard) {
    document.querySelectorAll('.theme-card').forEach(card => card.classList.remove('active'));
    clickedCard.classList.add('active');

    const isLight = clickedCard.textContent.includes('Светлая');

    if (isLight) {
        document.body.classList.add('light-theme');
        localStorage.setItem('taskflow_theme', 'light');
    } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem('taskflow_theme', 'dark');
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
};

// переключение цветов акцента
window.selectColor = function(clickedDot) {
    document.querySelectorAll('.color-dot').forEach(dot => dot.classList.remove('active'));
    clickedDot.classList.add('active');

    const color = clickedDot.getAttribute('data-color');
    const hover = clickedDot.getAttribute('data-hover') || color;
    const alpha = clickedDot.getAttribute('data-alpha') || 'rgba(245, 158, 11, 0.15)';
    const glow = clickedDot.getAttribute('data-glow') || 'rgba(245, 158, 11, 0.35)';

    if (color) {
        document.documentElement.style.setProperty('--accent-color', color);
        document.documentElement.style.setProperty('--accent-hover', hover);
        document.documentElement.style.setProperty('--accent-alpha', alpha);
        document.documentElement.style.setProperty('--accent-glow', glow);

        localStorage.setItem('taskflow_accent', color);
        localStorage.setItem('taskflow_accent_hover', hover);
        localStorage.setItem('taskflow_accent_alpha', alpha);
        localStorage.setItem('taskflow_accent_glow', glow);
    }
};

// переключение языков
window.selectLang = function(clickedCard) {
    const isEnglish = clickedCard.querySelector('span').textContent.includes('English');

    if (isEnglish) {
        alert('Локализация находится в разработке! Ожидайте в версии 2.0 🚀');
        return;
    }

    document.querySelectorAll('.lang-card').forEach(card => card.classList.remove('active'));
    clickedCard.classList.add('active');
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

document.addEventListener('DOMContentLoaded', () => {

    // проверяем сохраненную тему 
    const savedTheme = localStorage.getItem('taskflow_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');

        const themeCards = document.querySelectorAll('.theme-card');
        themeCards.forEach(card => card.classList.remove('active'));

        if (themeCards[1]) {
            themeCards[1].classList.add('active');
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // проверяем сохраненный цвет акцента 
    const savedAccent = localStorage.getItem('taskflow_accent');
    if (savedAccent) {
        document.querySelectorAll('.color-dot').forEach(dot => {
            if (dot.getAttribute('data-color') === savedAccent) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // переключение вкладок
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(btn.getAttribute('data-target'));
            if (targetPane) targetPane.classList.add('active');
        });
    });

    // функция обновления сайдбара
    function updateSidebar(fieldName, newValue) {
        if (fieldName === 'name') {
            const el = document.getElementById('sidebarName');
            if (el) el.textContent = newValue || 'Пользователь';
        }

        if (fieldName === 'login') {
            const el = document.getElementById('sidebarLogin');
            if (el) {
                if (!newValue) {
                    el.textContent = '—';
                } else {
                    el.textContent = newValue.startsWith('@') ? newValue : '@' + newValue;
                }
            }
        }

        if (fieldName === 'daily_goal') {
            const el = document.getElementById('sidebarDailyGoal');
            if (el) el.textContent = newValue || '—';
        }
    }

    // редактирование полей по карандашу
    const editBtns = document.querySelectorAll('.settings-grid-form .edit-input-btn');
    let activeInputGroup = null;
    let originalValue = '';

    function cancelEditing() {
        if (!activeInputGroup) return;

        const isGoalGroup = activeInputGroup.classList.contains('goal-input-group');
        const viewInput = activeInputGroup.querySelector('.goal-view-input');
        const editTextarea = activeInputGroup.querySelector('.goal-textarea');
        const regularInput = activeInputGroup.querySelector('input:not(.goal-view-input)');
        const btn = activeInputGroup.querySelector('.edit-input-btn');

        activeInputGroup.classList.remove('is-editing');

        if (isGoalGroup && viewInput && editTextarea) {
            editTextarea.style.display = 'none';
            editTextarea.style.height = '48px';
            viewInput.style.display = 'block';
            viewInput.value = originalValue || 'Основная цель отсутствует';
        } else if (regularInput) {
            regularInput.setAttribute('readonly', 'readonly');
            regularInput.value = originalValue;
        }

        if (btn) {
            btn.innerHTML = `<i data-lucide="pencil"></i>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        activeInputGroup = null;
    }

    editBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();

            const inputGroup = btn.closest('.input-group');
            if (!inputGroup) return;

            const isGoalGroup = inputGroup.classList.contains('goal-input-group');
            const isEditing = inputGroup.classList.contains('is-editing');

            if (!isEditing) {
                cancelEditing();

                activeInputGroup = inputGroup;

                if (isGoalGroup) {
                    const viewInput = inputGroup.querySelector('.goal-view-input');
                    const editTextarea = inputGroup.querySelector('.goal-textarea');

                    originalValue = (viewInput.value === 'Основная цель отсутствует') ? '' : viewInput.value;

                    viewInput.style.display = 'none';
                    editTextarea.style.display = 'block';
                    editTextarea.value = originalValue;

                    inputGroup.classList.add('is-editing');
                    editTextarea.focus();

                    editTextarea.style.height = '48px';
                    editTextarea.oninput = function () {
                        this.style.height = '48px';
                        if (this.scrollHeight > 48) {
                            this.style.height = this.scrollHeight + 'px';
                        }
                    };
                } else {
                    const input = inputGroup.querySelector('input');
                    originalValue = input.value;

                    inputGroup.classList.add('is-editing');
                    input.removeAttribute('readonly');
                    input.focus();
                    input.select();
                }

                btn.innerHTML = `<i data-lucide="check"></i>`;
                if (typeof lucide !== 'undefined') lucide.createIcons();

            } else {
                let fieldName = 'goal';
                let newValue = '';

                if (isGoalGroup) {
                    const editTextarea = inputGroup.querySelector('.goal-textarea');
                    newValue = editTextarea.value.trim();
                } else {
                    const input = inputGroup.querySelector('input');
                    fieldName = input.name;
                    newValue = input.value.trim();
                }

                try {
                    const response = await fetch('/update_profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ field: fieldName, value: newValue })
                    });

                    const data = await response.json().catch(() => ({}));

                    if (response.ok) {
                        inputGroup.classList.remove('is-editing');

                        if (isGoalGroup) {
                            const viewInput = inputGroup.querySelector('.goal-view-input');
                            const editTextarea = inputGroup.querySelector('.goal-textarea');

                            editTextarea.style.display = 'none';
                            editTextarea.style.height = '48px';
                            viewInput.style.display = 'block';
                            viewInput.value = newValue || 'Основная цель отсутствует';
                        } else {
                            const input = inputGroup.querySelector('input');
                            input.setAttribute('readonly', 'readonly');
                        }

                        btn.innerHTML = `<i data-lucide="pencil"></i>`;
                        if (typeof lucide !== 'undefined') lucide.createIcons();

                        updateSidebar(fieldName, newValue);
                        activeInputGroup = null;
                    } else {
                        alert(data.error || 'Ошибка сохранения');
                    }
                } catch (err) {
                    console.error('Ошибка сети:', err);
                    alert('Ошибка сети при сохранении');
                }
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (activeInputGroup && !activeInputGroup.contains(e.target)) {
            cancelEditing();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cancelEditing();
    });

    // кастомные селекты
    const customSelects = document.querySelectorAll('.settings-grid-form .custom-select');

    customSelects.forEach(select => {
        const hiddenInput = select.querySelector('input[type="hidden"]');
        const options = select.querySelectorAll('.status-option');

        if (!hiddenInput) return;

        options.forEach(option => {
            option.addEventListener('click', async () => {
                const fieldName = hiddenInput.name; 
                const newValue = option.dataset.value;
 
                if (!fieldName || !newValue) return;

                try {
                    const response = await fetch('/update_profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ field: fieldName, value: newValue })
                    });

                    const data = await response.json().catch(() => ({}));

                    if (response.ok) {
                        updateSidebar(fieldName, newValue);
                    } else {
                        alert(data.error || 'Ошибка сохранения селекта');
                    }
                } catch (err) {
                    console.error('Ошибка сети при сохранении селекта:', err);
                }
            });
        });
    });

    // загрузка и обновление аватара
    const avatarInput = document.getElementById('avatarUpload');
    if (avatarInput) {
        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('avatar', file);

            try {
                const response = await fetch('/upload_avatar', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (response.ok && data.avatar_url) {
                    const sidebarImg = document.querySelector('#sidebarAvatar img');
                    if (sidebarImg) sidebarImg.src = data.avatar_url;

                    const mainImg = document.querySelector('.avatar-circle img');
                    if (mainImg) mainImg.src = data.avatar_url;
                }
            } catch (err) {
                console.error('Ошибка загрузки аватара:', err);
            }
        });
    }

    // глазик паролей
    const eyeBtns = document.querySelectorAll('.toggle-eye-btn');

    eyeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const inputGroup = btn.closest('.input-group');
            const input = inputGroup ? inputGroup.querySelector('input') : null;

            if (input) {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';

                btn.innerHTML = `<i data-lucide="${isPassword ? 'eye-off' : 'eye'}"></i>`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    });

    // смена пароля
    const passwordButton = document.querySelector('#passwordButton');
    const passwordMessage = document.querySelector('#passwordMessage');

    function showMessage(text, type) {
        if (!passwordMessage) return;
        passwordMessage.textContent = text;
        passwordMessage.style.display = 'flex';

        if (type === 'success') {
            passwordMessage.style.color = '#10b981';
        } else {
            passwordMessage.style.color = '#ef4444'; 
        }

        setTimeout(() => {
            passwordMessage.style.display = 'none';
        }, 5000);
    }

    if (passwordButton) {
        passwordButton.addEventListener('click', async () => {
            const newPasswordInput = document.querySelector('input[name="new_password"]');
            const confirmPasswordInput = document.querySelector('input[name="confirm_password"]');

            const newPassword = newPasswordInput ? newPasswordInput.value.trim() : '';
            const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value.trim() : '';

            if (!newPassword) { showMessage('Введите новый пароль', 'error'); return; }
            if (newPassword.length < 6) { showMessage('Пароль слишком короткий', 'error'); return; }
            if (newPassword !== confirmPassword) { showMessage('Пароли не совпадают', 'error'); return; }

            try {
                const response = await fetch('/update_profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ field: 'password', value: newPassword })
                });

                if (response.ok) {
                    showMessage('Пароль успешно изменён', 'success');

                    newPasswordInput.value = '';
                    confirmPasswordInput.value = '';

                    const currentPassView = document.getElementById('currentPasswordView');
                    if (currentPassView) currentPassView.value = newPassword;
                } else {
                    const data = await response.json().catch(() => ({}));
                    showMessage(data.error || 'Не удалось обновить пароль', 'error');
                }
            } catch (err) {
                console.error('Ошибка при смене пароля:', err);
                showMessage('Ошибка сети при отправке запроса', 'error');
            }
        });
    }

    // смена почты
    const emailButton = document.querySelector('#emailButton');
    const emailMessage = document.querySelector('#emailMessage');

    function showMessageEmail(text, type) {
        if (!emailMessage) return;
        emailMessage.textContent = text;
        emailMessage.style.display = 'flex';

        if (type === 'success') {
            emailMessage.style.color = '#10b981';
        } else {
            emailMessage.style.color = '#ef4444';
        }

        setTimeout(() => {
            emailMessage.style.display = 'none';
        }, 5000);
    }

    if (emailButton) {
        emailButton.addEventListener('click', async () => {
            const newEmailInput = document.querySelector('input[name="new_email"]');
            const newEmail = newEmailInput ? newEmailInput.value.trim() : '';

            if (!newEmail) { 
                showMessageEmail('Введите новую почту', 'error'); 
                return; 
            }

            if (!newEmail.includes('@') || !newEmail.includes('.')) {
                showMessageEmail('Введите корректную почту', 'error'); 
                return;
            }

            try {
                const response = await fetch('/update_profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ field: 'email', value: newEmail })
                }); 

                if (response.ok) {
                    showMessageEmail('Почта успешно изменена!', 'success');

                    newEmailInput.value = '';

                    const currentEmailView = document.getElementById('emailViewInput');
                    if (currentEmailView) {
                        currentEmailView.value = newEmail;
                    }
                } else {
                    const data = await response.json().catch(() => ({}));
                    showMessageEmail(data.error || 'Не удалось обновить почту', 'error');
                }
            } catch (err) {
                console.error('Ошибка при смене почты:', err);
                showMessageEmail('Ошибка сети при отправке запроса', 'error');
            }
        });
    }

    // модалка удаления аккаунта
    const delModal = document.getElementById('deleteAccountModal');
    const openDelBtn = document.getElementById('openDeleteAccountBtn');

    if (openDelBtn && delModal) {
        openDelBtn.addEventListener('click', () => delModal.classList.add('active'));
    }

    document.querySelectorAll('#closeDeleteAccountBtn, #cancelDeleteAccountBtn').forEach(btn => {
        btn?.addEventListener('click', () => delModal?.classList.remove('active'));
    });

});