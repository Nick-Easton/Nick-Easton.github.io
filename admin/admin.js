(async function setupDiaryAdmin() {
    const cloud = window.BlogCloudBase;
    const layout = document.querySelector('#admin-layout');
    const loading = document.querySelector('#admin-loading-screen');
    const form = document.querySelector('#diary-editor-form');
    const listRoot = document.querySelector('#admin-diary-list');
    const setupWarning = document.querySelector('#admin-setup-warning');
    const uidOutput = document.querySelector('#current-admin-uid');
    const preview = document.querySelector('#content-preview');
    const message = document.querySelector('#editor-message');
    const status = document.querySelector('#draft-status');
    const imageList = document.querySelector('#admin-image-list');
    const uploadStatus = document.querySelector('#upload-status');
    const deleteButton = document.querySelector('#delete-diary-button');
    const saveButton = document.querySelector('#save-draft-button');
    const publishButton = document.querySelector('#publish-diary-button');
    let currentUser = null;
    let currentUid = '';
    let currentImages = [];
    let diaries = [];

    function setMessage(text, type = '') {
        message.textContent = text;
        message.className = `admin-form-message ${type}`.trim();
    }

    function toLocalDateTime(value) {
        const date = value ? new Date(value) : new Date();
        const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return adjusted.toISOString().slice(0, 16);
    }

    function setButtonsDisabled(disabled) {
        saveButton.disabled = disabled;
        publishButton.disabled = disabled;
    }

    function resetEditor() {
        form.reset();
        form.elements.id.value = '';
        form.elements.publishedAt.value = toLocalDateTime();
        currentImages = [];
        renderImages();
        preview.innerHTML = '<p>正文会在这里预览。</p>';
        document.querySelector('#editor-mode-label').textContent = 'NEW ENTRY';
        document.querySelector('#editor-heading').textContent = '写一篇新日记';
        status.textContent = '尚未保存';
        deleteButton.hidden = true;
        setMessage('');
    }

    function renderImages() {
        imageList.replaceChildren();
        currentImages.forEach((image, index) => {
            const item = document.createElement('article');
            item.className = 'admin-image-item';

            const img = document.createElement('img');
            img.src = image.url || '';
            img.alt = image.alt || `已上传图片 ${index + 1}`;

            const fields = document.createElement('div');
            const altInput = document.createElement('input');
            altInput.type = 'text';
            altInput.placeholder = '图片替代文字';
            altInput.value = image.alt || '';
            altInput.addEventListener('input', () => { currentImages[index].alt = altInput.value; });
            const captionInput = document.createElement('input');
            captionInput.type = 'text';
            captionInput.placeholder = '图片说明（可选）';
            captionInput.value = image.caption || '';
            captionInput.addEventListener('input', () => { currentImages[index].caption = captionInput.value; });
            fields.append(altInput, captionInput);

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.textContent = '移除';
            remove.addEventListener('click', () => {
                currentImages.splice(index, 1);
                renderImages();
            });
            item.append(img, fields, remove);
            imageList.append(item);
        });
    }

    function renderList() {
        listRoot.replaceChildren();
        if (!diaries.length) {
            const empty = document.createElement('p');
            empty.className = 'admin-empty-state';
            empty.textContent = '还没有日记，点击右上角的＋开始记录。';
            listRoot.append(empty);
            return;
        }

        diaries.forEach((diary) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'admin-diary-item';
            button.dataset.id = diary._id;
            const title = document.createElement('strong');
            title.textContent = diary.title || '未命名日记';
            const meta = document.createElement('span');
            meta.textContent = `${diary.status === 'published' ? '已发布' : '草稿'} · ${new Date(diary.publishedAt || diary.createdAt).toLocaleDateString('zh-CN')}`;
            button.append(title, meta);
            button.addEventListener('click', () => openDiary(diary));
            listRoot.append(button);
        });
    }

    async function loadDiaries() {
        const result = await cloud.diaryCollection
            .where({ authorUid: currentUid })
            .orderBy('updatedAt', 'desc')
            .limit(100)
            .get();
        diaries = result.data || [];
        renderList();
    }

    async function openDiary(diary) {
        form.elements.id.value = diary._id;
        form.elements.title.value = diary.title || '';
        form.elements.summary.value = diary.summary || '';
        form.elements.content.value = diary.content || '';
        form.elements.publishedAt.value = toLocalDateTime(diary.publishedAt);
        form.elements.mood.value = diary.mood || '';
        form.elements.weather.value = diary.weather || '';
        form.elements.location.value = diary.location || '';
        form.elements.tags.value = (diary.tags || []).join(', ');
        currentImages = await cloud.resolveImageUrls(diary.images);
        renderImages();
        preview.innerHTML = window.DiaryMarkdown.render(diary.content);
        document.querySelector('#editor-mode-label').textContent = diary.status === 'published' ? 'PUBLISHED' : 'DRAFT';
        document.querySelector('#editor-heading').textContent = '编辑这篇日记';
        status.textContent = diary.status === 'published' ? '当前已发布' : '当前为草稿';
        deleteButton.hidden = false;
        setMessage('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function collectDiary(statusValue) {
        const data = new FormData(form);
        const title = String(data.get('title') || '').trim();
        const content = String(data.get('content') || '').trim();
        if (!title || !content) throw new Error('请先填写标题和正文。');

        return {
            title,
            summary: String(data.get('summary') || '').trim(),
            content,
            mood: String(data.get('mood') || '').trim(),
            weather: String(data.get('weather') || '').trim(),
            location: String(data.get('location') || '').trim(),
            tags: String(data.get('tags') || '')
                .split(/[,，]/)
                .map((tag) => tag.trim())
                .filter(Boolean)
                .slice(0, 10),
            images: currentImages.map(({ fileId, alt, caption }) => ({ fileId, alt, caption })),
            status: statusValue,
            authorUid: currentUid,
            publishedAt: new Date(String(data.get('publishedAt'))).toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    async function saveDiary(statusValue) {
        if (!cloud.isAdmin(currentUser)) {
            throw new Error('管理员 UID 尚未完成绑定，暂时不能保存。');
        }
        const id = form.elements.id.value;
        const diary = collectDiary(statusValue);
        setButtonsDisabled(true);
        setMessage(statusValue === 'published' ? '正在发布……' : '正在保存草稿……');

        try {
            if (id) {
                await cloud.diaryCollection.doc(id).update(diary);
            } else {
                diary.createdAt = new Date().toISOString();
                const result = await cloud.diaryCollection.add(diary);
                form.elements.id.value = result.id;
            }
            status.textContent = statusValue === 'published' ? '已发布' : '草稿已保存';
            setMessage(statusValue === 'published' ? '发布成功，公开日记页已经可以读取这篇内容。' : '草稿保存成功。', 'success');
            await loadDiaries();
        } finally {
            setButtonsDisabled(false);
        }
    }

    document.querySelector('#logout-button').addEventListener('click', async () => {
        await cloud.auth.signOut();
        window.location.replace('login.html');
    });

    document.querySelector('#new-diary-button').addEventListener('click', resetEditor);
    form.elements.content.addEventListener('input', () => {
        preview.innerHTML = window.DiaryMarkdown.render(form.elements.content.value) || '<p>正文会在这里预览。</p>';
    });

    saveButton.addEventListener('click', () => saveDiary('draft').catch((error) => {
        console.error(error);
        setMessage(error.message || '草稿保存失败。', 'error');
    }));
    publishButton.addEventListener('click', () => saveDiary('published').catch((error) => {
        console.error(error);
        setMessage(error.message || '发布失败。', 'error');
    }));

    deleteButton.addEventListener('click', async () => {
        const id = form.elements.id.value;
        if (!id || !window.confirm('确定删除这篇日记吗？这个操作无法撤销。')) return;
        try {
            await cloud.diaryCollection.doc(id).remove();
            resetEditor();
            await loadDiaries();
            setMessage('日记已删除。', 'success');
        } catch (error) {
            setMessage(error.message || '删除失败。', 'error');
        }
    });

    document.querySelector('#diary-image-input').addEventListener('change', async (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        if (!cloud.isAdmin(currentUser)) {
            uploadStatus.textContent = '管理员 UID 尚未绑定，暂时不能上传。';
            return;
        }

        for (const file of files) {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
                uploadStatus.textContent = `${file.name} 格式不支持或超过 8 MB。`;
                continue;
            }
            uploadStatus.textContent = `正在上传 ${file.name}……`;
            const extension = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
            const cloudPath = `diary-public/${currentUid}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
            try {
                const result = await cloud.app.uploadFile({ cloudPath, filePath: file });
                const fileId = result.fileID;
                const resolved = await cloud.resolveImageUrls([{ fileId }]);
                currentImages.push({
                    fileId,
                    url: resolved[0] ? resolved[0].url : '',
                    alt: '',
                    caption: ''
                });
                renderImages();
                uploadStatus.textContent = `${file.name} 上传成功。`;
            } catch (error) {
                console.error(error);
                uploadStatus.textContent = `${file.name} 上传失败：${error.message || '请检查存储权限。'}`;
            }
        }
        event.target.value = '';
    });

    try {
        currentUser = await cloud.getCurrentUser();
        if (!cloud.isAuthenticatedAccount(currentUser)) {
            window.location.replace('login.html');
            return;
        }
        currentUid = cloud.getUserUid(currentUser);
        if (cloud.isAdminConfigured() && !cloud.isAdmin(currentUser)) {
            await cloud.auth.signOut();
            window.location.replace('login.html?error=unauthorized');
            return;
        }

        if (!cloud.isAdminConfigured()) {
            setupWarning.hidden = false;
            uidOutput.textContent = currentUid;
            setButtonsDisabled(true);
        }

        resetEditor();
        if (cloud.isAdmin(currentUser)) await loadDiaries();
        else listRoot.innerHTML = '<p class="admin-empty-state">完成管理员 UID 与安全规则配置后，这里会显示日记列表。</p>';
        loading.hidden = true;
        layout.hidden = false;
    } catch (error) {
        console.error(error);
        loading.innerHTML = '<strong>管理员验证失败</strong><p>请返回登录页重试，并检查 CloudBase 安全来源设置。</p><a href="login.html">返回登录</a>';
    }
})();
