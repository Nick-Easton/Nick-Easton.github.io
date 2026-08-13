(async function renderDiaryDetail() {
    const root = document.querySelector('#diary-detail');
    const id = new URLSearchParams(window.location.search).get('id');
    if (!root) return;

    function formatDate(value) {
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
        }).format(new Date(value));
    }

    try {
        const diary = await window.BlogCloudBase.getPublishedDiary(id);
        if (!diary) {
            root.innerHTML = '<div class="diary-state-card error"><strong>没有找到这篇日记</strong><p>它可能还在草稿箱，或者已经被撤回。</p><a href="diary.html">返回日记列表</a></div>';
            return;
        }

        const images = await window.BlogCloudBase.resolveImageUrls(diary.images);
        document.title = `${diary.title} - Nick の Blog`;
        const metaBits = [formatDate(diary.publishedAt), diary.mood, diary.weather, diary.location].filter(Boolean);
        const gallery = images.map((image, index) => `
            <figure>
                <img src="${window.DiaryMarkdown.escapeHtml(image.url)}" alt="${window.DiaryMarkdown.escapeHtml(image.alt || `${diary.title}的图片 ${index + 1}`)}" loading="lazy">
                ${image.caption ? `<figcaption>${window.DiaryMarkdown.escapeHtml(image.caption)}</figcaption>` : ''}
            </figure>
        `).join('');

        root.innerHTML = `
            <article class="diary-detail-card">
                <a class="diary-back-link" href="diary.html">← 返回全部日记</a>
                <header>
                    <div class="diary-card-meta">${metaBits.map((bit) => `<span>${window.DiaryMarkdown.escapeHtml(bit)}</span>`).join('')}</div>
                    <h1>${window.DiaryMarkdown.escapeHtml(diary.title)}</h1>
                    ${diary.summary ? `<p class="diary-lead">${window.DiaryMarkdown.escapeHtml(diary.summary)}</p>` : ''}
                </header>
                <div class="diary-prose">${window.DiaryMarkdown.render(diary.content)}</div>
                ${gallery ? `<div class="diary-gallery">${gallery}</div>` : ''}
                <footer class="diary-detail-footer">
                    <div>${(diary.tags || []).map((tag) => `<span>#${window.DiaryMarkdown.escapeHtml(tag)}</span>`).join('')}</div>
                    <p>记录于 ${formatDate(diary.publishedAt)}</p>
                </footer>
            </article>
        `;
    } catch (error) {
        console.error(error);
        root.innerHTML = '<div class="diary-state-card error"><strong>日记暂时无法打开</strong><p>请稍后重试，或返回日记列表。</p><a href="diary.html">返回日记列表</a></div>';
    }
})();
