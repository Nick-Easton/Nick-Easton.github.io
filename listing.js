const blogArticles = window.BLOG_ARTICLES || [];

function createArchiveItem(article) {
    const link = document.createElement('a');
    link.className = 'archive-item';
    link.href = article.url;

    const date = document.createElement('time');
    date.dateTime = article.date;
    date.textContent = article.date.slice(5).replace('-', ' / ');

    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = article.title;
    const meta = document.createElement('span');
    meta.textContent = `${article.category} · ${article.readingTime}`;
    copy.append(title, meta);

    const arrow = document.createElement('span');
    arrow.className = 'archive-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';

    link.append(date, copy, arrow);
    return link;
}

function renderArchives() {
    const container = document.querySelector('#archive-list');
    const count = document.querySelector('#archive-count');
    if (!container || !count) return;

    count.textContent = `${blogArticles.length} 篇文章`;
    container.replaceChildren();

    const grouped = blogArticles.reduce((years, article) => {
        const year = article.date.slice(0, 4);
        years[year] = years[year] || [];
        years[year].push(article);
        return years;
    }, {});

    Object.keys(grouped).sort().reverse().forEach((year) => {
        const group = document.createElement('section');
        group.className = 'archive-year';

        const heading = document.createElement('h3');
        heading.textContent = year;
        group.append(heading);

        grouped[year]
            .sort((a, b) => b.date.localeCompare(a.date))
            .forEach((article) => group.append(createArchiveItem(article)));

        container.append(group);
    });
}

function renderCategories() {
    const container = document.querySelector('#category-list');
    const count = document.querySelector('#category-count-page');
    if (!container || !count) return;

    const grouped = blogArticles.reduce((categories, article) => {
        categories[article.category] = categories[article.category] || [];
        categories[article.category].push(article);
        return categories;
    }, {});

    const names = Object.keys(grouped).sort((a, b) => a.localeCompare(b, 'zh-CN'));
    count.textContent = `${names.length} 个分类`;
    container.replaceChildren();

    names.forEach((name) => {
        const card = document.createElement('article');
        card.className = 'category-card';

        const head = document.createElement('div');
        const symbol = document.createElement('span');
        symbol.className = 'category-symbol';
        symbol.textContent = '◇';
        const number = document.createElement('small');
        number.textContent = `${grouped[name].length} 篇`;
        head.append(symbol, number);

        const title = document.createElement('h3');
        title.textContent = name;

        const articleList = document.createElement('ul');
        articleList.className = 'category-article-list';

        [...grouped[name]]
            .sort((a, b) => b.date.localeCompare(a.date))
            .forEach((article) => {
                const item = document.createElement('li');
                const link = document.createElement('a');
                link.className = 'category-article-link';
                link.href = article.url;

                const articleTitle = document.createElement('span');
                articleTitle.className = 'category-article-title';
                articleTitle.textContent = article.title;

                const date = document.createElement('time');
                date.className = 'category-article-date';
                date.dateTime = article.date;
                date.textContent = article.date.slice(5).replace('-', '/');

                link.append(articleTitle, date);
                item.append(link);
                articleList.append(item);
            });

        card.append(head, title, articleList);
        container.append(card);
    });
}

renderArchives();
renderCategories();
