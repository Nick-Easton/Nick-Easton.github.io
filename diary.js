(async function renderDiaryFeed() {
    const feed = document.querySelector('#diary-feed');
    if (!feed) return;

    function formatDate(value) {
        const date = value ? new Date(value) : new Date();
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric', month: 'long', day: 'numeric'
        }).format(date);
    }

    try {
        const diaries = await window.BlogCloudBase.getPublishedDiaries();
        if (!diaries.length) {
            feed.innerHTML = '<div class="diary-state-card"><strong>日记页准备好了</strong><p>第一篇生活记录发布后，会出现在这里。</p></div>';
            return;
        }

        feed.replaceChildren();
        for (const diary of diaries) {
            const images = await window.BlogCloudBase.resolveImageUrls(diary.images);
            const card = document.createElement('article');
            card.className = 'diary-card';

            const metaBits = [formatDate(diary.publishedAt), diary.mood, diary.weather, diary.location]
                .filter(Boolean);
            const imageMarkup = images.slice(0, 4).map((image, index) => `
                <figure class="diary-card-image ${images.length === 1 ? 'single' : ''}">
                    <img src="${window.DiaryMarkdown ? window.DiaryMarkdown.escapeHtml(image.url) : image.url}" alt="${window.DiaryMarkdown ? window.DiaryMarkdown.escapeHtml(image.alt || `${diary.title}的图片 ${index + 1}`) : ''}" loading="lazy">
                </figure>
            `).join('');

            card.innerHTML = `
                <div class="diary-card-meta">${metaBits.map((bit) => `<span>${window.DiaryMarkdown ? window.DiaryMarkdown.escapeHtml(bit) : bit}</span>`).join('')}</div>
                <h2><a href="diary-post.html?id=${encodeURIComponent(diary._id)}">${window.DiaryMarkdown ? window.DiaryMarkdown.escapeHtml(diary.title) : diary.title}</a></h2>
                <p>${window.DiaryMarkdown ? window.DiaryMarkdown.escapeHtml(diary.summary || '') : diary.summary || ''}</p>
                ${imageMarkup ? `<div class="diary-card-gallery">${imageMarkup}</div>` : ''}
                <div class="diary-card-footer">
                    <div>${(diary.tags || []).map((tag) => `<span>#${window.DiaryMarkdown ? window.DiaryMarkdown.escapeHtml(tag) : tag}</span>`).join('')}</div>
                    <a href="diary-post.html?id=${encodeURIComponent(diary._id)}">继续阅读 →</a>
                </div>
            `;
            feed.append(card);
        }
    } catch (error) {
        console.error(error);
        feed.innerHTML = '<div class="diary-state-card error"><strong>日记暂时没有加载出来</strong><p>请稍后刷新；如果这是首次配置，请先完成 CloudBase 数据库和安全来源设置。</p></div>';
    }
})();
