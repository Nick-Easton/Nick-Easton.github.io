function initializeArticlePage() {
    const progressBar = document.querySelector('#reading-progress');

    function updateReadingProgress() {
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = documentHeight > 0 ? (window.scrollY / documentHeight) * 100 : 0;
        if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;
    }

    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    updateReadingProgress();

    document.querySelectorAll('pre:not([data-copy-ready])').forEach((codeBlock) => {
        codeBlock.dataset.copyReady = 'true';
        const button = document.createElement('button');
        button.className = 'copy-code';
        button.type = 'button';
        button.textContent = '复制';
        button.setAttribute('aria-label', '复制代码');

        button.addEventListener('click', async () => {
            const code = codeBlock.querySelector('code').textContent;
            let copied = false;

            try {
                await navigator.clipboard.writeText(code);
                copied = true;
            } catch {
                const helper = document.createElement('textarea');
                helper.value = code;
                helper.setAttribute('readonly', '');
                helper.style.position = 'fixed';
                helper.style.opacity = '0';
                document.body.append(helper);
                helper.select();
                copied = document.execCommand('copy');
                helper.remove();
            }

        if (copied) {
            button.textContent = '已复制';
            window.setTimeout(() => {
                button.textContent = '复制';
            }, 1600);
        } else {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(codeBlock.querySelector('code'));
            selection.removeAllRanges();
            selection.addRange(range);
            button.textContent = '已选中，请按 Ctrl+C';
        }
        });

        codeBlock.append(button);
    });

    const tocLinks = [...document.querySelectorAll('.article-toc nav a')];
    const sections = tocLinks
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                tocLinks.forEach((link) => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
                });
            });
        }, { rootMargin: '-20% 0px -65% 0px' });

        sections.forEach((section) => observer.observe(section));
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeArticlePage, { once: true });
} else {
    initializeArticlePage();
}
