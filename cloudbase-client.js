(function initBlogCloudBase() {
    const config = window.BLOG_CLOUDBASE_CONFIG;
    const placeholderUid = 'REPLACE_WITH_ADMIN_UID';

    function assertReady() {
        if (!config || !config.envId) {
            throw new Error('CloudBase 环境尚未配置。');
        }
        if (!window.cloudbase) {
            throw new Error('CloudBase SDK 加载失败，请检查网络连接后重试。');
        }
    }

    assertReady();

    const initOptions = {
        env: config.envId,
        region: config.region || 'ap-shanghai'
    };
    if (config.accessKey && config.accessKey !== 'REPLACE_WITH_PUBLISHABLE_KEY') {
        initOptions.accessKey = config.accessKey;
    }
    const app = window.cloudbase.init(initOptions);
    const auth = app.auth();
    const db = app.database();
    const diaryImageBucket = config.diaryImageBucket || 'diary-images';
    const storage = app.storage.from(diaryImageBucket);
    const diaryCollection = db.collection(config.diaryCollection || 'diary_posts');

    function getUserUid(user) {
        return user && (user.uid || user.id || user._id || user.openid || user.openId || '');
    }

    async function getCurrentUser() {
        if (typeof auth.getSession === 'function') {
            const result = await auth.getSession();
            if (result && result.error) throw result.error;
            const session = result && result.data ? result.data.session : null;
            return session && session.user ? session.user : null;
        }
        const result = await auth.getUser();
        if (result && result.error) throw result.error;
        return result && result.data ? result.data.user || null : result || null;
    }

    async function signInWithPassword(username, password) {
        if (typeof auth.signInWithPassword === 'function') {
            const result = await auth.signInWithPassword({ username, password });
            if (result && result.error) throw result.error;
            return result;
        }
        return auth.signIn({ username, password });
    }

    function isAdmin(user) {
        const uid = getUserUid(user);
        return Boolean(uid && config.adminUid !== placeholderUid && uid === config.adminUid);
    }

    function isAuthenticatedAccount(user) {
        return Boolean(
            getUserUid(user)
            && user.isAnonymous !== true
            && user.is_anonymous !== true
        );
    }

    function isAdminConfigured() {
        return Boolean(config.adminUid && config.adminUid !== placeholderUid);
    }

    async function resolveImageUrls(images) {
        const list = Array.isArray(images) ? images : [];
        if (!list.some((image) => image.fileId)) return list;

        try {
            return await Promise.all(list.map(async (image) => {
                if (!image.fileId) return image;
                const result = storage.getPublicUrl(image.fileId);
                return {
                    ...image,
                    url: result.data && result.data.publicUrl
                        ? result.data.publicUrl
                        : image.url || ''
                };
            }));
        } catch (error) {
            console.warn('日记图片地址解析失败：', error);
            return list;
        }
    }

    async function uploadDiaryImage(cloudPath, file) {
        const result = await storage.upload(cloudPath, file, {
            contentType: file.type || 'application/octet-stream',
            upsert: false
        });
        if (result.error) throw result.error;
        if (!result.data || !result.data.id) {
            throw new Error('CloudBase 没有返回图片文件 ID。');
        }
        return result.data.path;
    }

    async function getPublishedDiaries() {
        const result = await diaryCollection
            .where({ status: 'published' })
            .orderBy('publishedAt', 'desc')
            .limit(100)
            .get();
        return result.data || [];
    }

    async function getPublishedDiary(id) {
        if (!id) return null;
        const result = await diaryCollection
            .where({ _id: id, status: 'published' })
            .limit(1)
            .get();
        const diary = result.data && result.data[0];
        return diary || null;
    }

    window.BlogCloudBase = Object.freeze({
        app,
        auth,
        db,
        config,
        diaryCollection,
        getUserUid,
        getCurrentUser,
        signInWithPassword,
        isAdmin,
        isAuthenticatedAccount,
        isAdminConfigured,
        resolveImageUrls,
        uploadDiaryImage,
        getPublishedDiaries,
        getPublishedDiary
    });
})();
