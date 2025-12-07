document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.toggle-button');

    toggleButtons.forEach(button => {
        const content = button.parentElement.nextElementSibling;
        // Initially hide content and set button to '▼'
        content.classList.add('hidden');
        button.textContent = '▼'; // Arrow down for closed state

        button.addEventListener('click', () => {
            content.classList.toggle('hidden');

            if (content.classList.contains('hidden')) {
                button.textContent = '▼'; // Arrow down for closed state
            } else {
                button.textContent = '▲'; // Arrow up for open state
            }
        });
    });
});