(function createDiaryMarkdownRenderer() {
    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function inlineFormat(value) {
        return escapeHtml(value)
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
    }

    function render(markdown) {
        const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
        const output = [];
        let paragraph = [];
        let listType = '';

        function flushParagraph() {
            if (!paragraph.length) return;
            output.push(`<p>${paragraph.map(inlineFormat).join('<br>')}</p>`);
            paragraph = [];
        }

        function closeList() {
            if (!listType) return;
            output.push(`</${listType}>`);
            listType = '';
        }

        lines.forEach((line) => {
            const heading = line.match(/^(#{1,3})\s+(.+)$/);
            const unordered = line.match(/^[-*]\s+(.+)$/);
            const ordered = line.match(/^\d+\.\s+(.+)$/);
            const quote = line.match(/^>\s?(.+)$/);

            if (!line.trim()) {
                flushParagraph();
                closeList();
            } else if (heading) {
                flushParagraph();
                closeList();
                const level = heading[1].length + 1;
                output.push(`<h${level}>${inlineFormat(heading[2])}</h${level}>`);
            } else if (unordered || ordered) {
                flushParagraph();
                const nextType = unordered ? 'ul' : 'ol';
                if (listType && listType !== nextType) closeList();
                if (!listType) {
                    listType = nextType;
                    output.push(`<${listType}>`);
                }
                output.push(`<li>${inlineFormat((unordered || ordered)[1])}</li>`);
            } else if (quote) {
                flushParagraph();
                closeList();
                output.push(`<blockquote>${inlineFormat(quote[1])}</blockquote>`);
            } else {
                closeList();
                paragraph.push(line);
            }
        });

        flushParagraph();
        closeList();
        return output.join('');
    }

    window.DiaryMarkdown = Object.freeze({ render, escapeHtml });
})();
