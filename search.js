const sitePages = [
    {
        title: '关于我',
        description: '认识 Nick：电子类学生，正在学习嵌入式、HTML、CSS 和 JavaScript。',
        url: 'about.html',
        keywords: 'Nick 个人 联系方式 兴趣 摄影 动漫 游戏 嵌入式 前端'
    },
    {
        title: '标签',
        description: '通过关键词浏览博客内容。',
        url: 'index.html',
        keywords: '标签 文章 关键词 首页'
    },
    {
        title: '文章归档',
        description: '按年份和日期查看博客发布的文章。',
        url: 'archives.html',
        keywords: '归档 时间 年份 日期 文章'
    },
    {
        title: '文章分类',
        description: '按主题浏览嵌入式、前端学习、摄影与生活随笔。',
        url: 'categories.html',
        keywords: '分类 嵌入式 前端 摄影 生活 随笔'
    }
];

const articlePages = (window.BLOG_ARTICLES || []).map((article) => ({
    title: article.title,
    description: article.excerpt,
    url: article.url,
    keywords: `${article.category} ${article.tags.join(' ')} ${article.dateLabel}`
}));

const searchablePages = [...articlePages, ...sitePages];

const form = document.querySelector('#search-form');
const input = document.querySelector('#search-input');
const status = document.querySelector('#search-status');
const results = document.querySelector('#search-results');

function renderResults(matches, query) {
    results.replaceChildren();

    if (matches.length === 0) {
        status.textContent = `没有找到与“${query}”相关的内容。`;
        const message = document.createElement('div');
        message.className = 'no-results';
        message.textContent = '换一个更简短的关键词试试看吧。';
        results.append(message);
        return;
    }

    status.textContent = `找到 ${matches.length} 个相关结果。`;
    matches.forEach((page) => {
        const link = document.createElement('a');
        link.className = 'result-item';
        link.href = page.url;

        const title = document.createElement('strong');
        title.textContent = page.title;

        const description = document.createElement('span');
        description.textContent = page.description;

        const arrow = document.createElement('span');
        arrow.className = 'result-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '→';

        link.append(title, description, arrow);
        results.append(link);
    });
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim().toLocaleLowerCase('zh-CN');

    if (!query) {
        results.replaceChildren();
        status.textContent = '请先输入一个关键词。';
        input.focus();
        return;
    }

    const matches = searchablePages.filter((page) => {
        const searchableText = `${page.title} ${page.description} ${page.keywords}`.toLocaleLowerCase('zh-CN');
        return searchableText.includes(query);
    });

    renderResults(matches, input.value.trim());
});
