document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.toggle-password');

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const inputGroup = button.closest('.input-group');
            const passwordInput = inputGroup ? inputGroup.querySelector('input') : null;
            if (!passwordInput) return;

            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';

            const iconName = isPassword ? 'eye-off' : 'eye';
            button.innerHTML = `<i data-lucide="${iconName}"></i>`;

            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    });
});