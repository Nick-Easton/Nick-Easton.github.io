const articles = window.BLOG_ARTICLES || [];

const articleCount = document.querySelector('#article-count');
const categoryCount = document.querySelector('#category-count');
const tagCount = document.querySelector('#tag-count');

const categories = new Set(articles.map((article) => article.category));
const tags = new Set(articles.flatMap((article) => article.tags));

articleCount.textContent = articles.length;
categoryCount.textContent = categories.size;
tagCount.textContent = tags.size;

const latestArticle = [...articles].sort((a, b) => b.date.localeCompare(a.date))[0];
const latestCard = document.querySelector('#latest-post');

if (latestArticle && latestCard) {
    const titleLink = latestCard.querySelector('[data-article-title]');
    const excerpt = latestCard.querySelector('[data-article-excerpt]');
    const meta = latestCard.querySelector('[data-article-meta]');
    const tagList = latestCard.querySelector('[data-article-tags]');
    const mark = latestCard.querySelector('.post-card-mark');

    titleLink.textContent = latestArticle.title;
    titleLink.href = latestArticle.url;
    excerpt.textContent = latestArticle.excerpt;
    meta.textContent = `${latestArticle.category} · ${latestArticle.dateLabel} · 阅读 ${latestArticle.readingTime}`;
    mark.textContent = String(articles.length).padStart(2, '0');
    tagList.replaceChildren();

    latestArticle.tags.forEach((tag) => {
        const item = document.createElement('span');
        item.textContent = tag;
        tagList.append(item);
    });
}
