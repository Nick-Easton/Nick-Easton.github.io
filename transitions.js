const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let navigationInProgress = false;

function shouldAnimateLink(link, event) {
    if (!link || event.defaultPrevented || event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.target || link.hasAttribute('download')) return false;
    if (prefersReducedMotion.matches) return false;

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin) return false;
    if (!['http:', 'https:'].includes(destination.protocol)) return false;

    const sameDocument = destination.pathname === window.location.pathname
        && destination.search === window.location.search;

    if (sameDocument && destination.hash) return false;
    return destination.href !== window.location.href;
}

document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!shouldAnimateLink(link, event) || navigationInProgress) return;

    event.preventDefault();
    navigationInProgress = true;
    document.body.classList.add('page-leaving');

    window.setTimeout(() => {
        window.location.assign(link.href);
    }, 230);
});

window.addEventListener('pageshow', () => {
    navigationInProgress = false;
    document.body.classList.remove('page-leaving');
});
