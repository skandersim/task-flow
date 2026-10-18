document.addEventListener('DOMContentLoaded', () => {
    // счётчик символов цели
    const goalTextarea = document.querySelector('textarea[name="goals"]');
    const charCounter = document.querySelector('.char-counter');

    if (goalTextarea && charCounter) {
        goalTextarea.addEventListener('input', () => {
            const currentLength = goalTextarea.value.length;
            charCounter.textContent = `${currentLength}/500`;

            if (currentLength >= 500) {
                charCounter.classList.add('limit-reached');
            } else {
                charCounter.classList.remove('limit-reached');
            }
        });
    }

    // превью аватара
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarContainer = document.getElementById('avatarContainer');

    if (!avatarInput || !avatarPreview || !avatarContainer) return;

    avatarInput.addEventListener('change', () => {
        const file = avatarInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            avatarPreview.src = reader.result;
            avatarPreview.style.display = 'block';

            const icon = avatarContainer.querySelector('svg');
            if (icon) icon.style.display = 'none';
        };
        reader.readAsDataURL(file);
    });
});