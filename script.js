// ============================================================
// LINKA - SUPABASE + FRONTEND
// ============================================================

// ============================================================
// 1. SUPABASE SETTINGS
// ============================================================

const SUPABASE_URL =
    "https://mpzdmdcqjaxdlfhsevyd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "YOUR_PUBLISHABLE_KEY";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ============================================================
// 2. GLOBAL VARIABLES
// ============================================================

let currentUser = null;
let currentProfile = null;


// ============================================================
// 3. GET ELEMENT
// ============================================================

function $(id) {
    return document.getElementById(id);
}


// ============================================================
// 4. SHOW PAGE
// ============================================================

function showPage(pageName) {

    console.log("Opening page:", pageName);

    // Hide all pages
    document.querySelectorAll(".page").forEach(page => {
        page.style.display = "none";
    });

    // Show requested page
    const page = $(pageName);

    if (!page) {
        console.error("Page not found:", pageName);
        return;
    }

    page.style.display = "block";

    // Page-specific loading
    if (pageName === "homePage") {
        loadPosts();
    }

    if (pageName === "profilePage") {
        loadProfilePage();
    }

    if (pageName === "friendsPage") {
        loadFriendsPage();
    }

    if (pageName === "messagesPage") {
        loadMessagesPage();
    }

    if (pageName === "notificationsPage") {
        loadNotificationsPage();
    }

    if (pageName === "settingsPage") {
        loadSettingsPage();
    }
}


// ============================================================
// 5. AUTH PAGE
// ============================================================

function showAuth() {

    const authPage = $("authPage");
    const mainApp = $("mainApp");

    if (authPage) {
        authPage.style.display = "flex";
    }

    if (mainApp) {
        mainApp.style.display = "none";
    }
}


function showApp() {

    const authPage = $("authPage");
    const mainApp = $("mainApp");

    if (authPage) {
        authPage.style.display = "none";
    }

    if (mainApp) {
        mainApp.style.display = "block";
    }

    showPage("homePage");
}


// ============================================================
// 6. LOGIN / REGISTER TABS
// ============================================================

function showLogin() {

    const loginForm = $("loginForm");
    const registerForm = $("registerForm");

    if (loginForm) {
        loginForm.style.display = "block";
    }

    if (registerForm) {
        registerForm.style.display = "none";
    }
}


function showRegister() {

    const loginForm = $("loginForm");
    const registerForm = $("registerForm");

    if (loginForm) {
        loginForm.style.display = "none";
    }

    if (registerForm) {
        registerForm.style.display = "block";
    }
}


// ============================================================
// 7. REGISTER
// ============================================================

async function register() {

    const email = $("registerEmail")?.value.trim();
    const password = $("registerPassword")?.value;
    const username = $("registerUsername")?.value.trim();
    const fullName = $("registerName")?.value.trim();

    if (!email || !password || !username) {
        alert("يرجى ملء جميع الحقول المطلوبة.");
        return;
    }

    try {

        const { data, error } =
            await supabaseClient.auth.signUp({
                email: email,
                password: password
            });

        if (error) {
            throw error;
        }

        if (!data.user) {
            alert("حدثت مشكلة أثناء إنشاء الحساب.");
            return;
        }

        const { error: profileError } =
            await supabaseClient
                .from("profiles")
                .insert({
                    id: data.user.id,
                    username: username,
                    full_name: fullName || username,
                    bio: ""
                });

        if (profileError) {
            console.error(profileError);

            alert(
                "تم إنشاء الحساب، لكن حدثت مشكلة في إنشاء الملف الشخصي."
            );

            return;
        }

        alert("تم إنشاء الحساب بنجاح!");

        showLogin();

    } catch (error) {

        console.error(error);

        alert("خطأ: " + error.message);
    }
}


// ============================================================
// 8. LOGIN
// ============================================================

async function login() {

    const email = $("loginEmail")?.value.trim();
    const password = $("loginPassword")?.value;

    if (!email || !password) {
        alert("أدخل البريد الإلكتروني وكلمة المرور.");
        return;
    }

    try {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            throw error;
        }

        currentUser = data.user;

        await loadCurrentProfile();

        showApp();

    } catch (error) {

        console.error(error);

        alert("خطأ في تسجيل الدخول: " + error.message);
    }
}


// ============================================================
// 9. LOGOUT
// ============================================================

async function logout() {

    try {

        await supabaseClient.auth.signOut();

        currentUser = null;
        currentProfile = null;

        showAuth();

    } catch (error) {

        console.error(error);

        alert("حدث خطأ أثناء تسجيل الخروج.");
    }
}


// ============================================================
// 10. LOAD CURRENT PROFILE
// ============================================================

async function loadCurrentProfile() {

    if (!currentUser) {
        return;
    }

    const { data, error } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .single();

    if (error) {

        console.error("Profile error:", error);

        return;
    }

    currentProfile = data;

    updateProfileUI();
}


// ============================================================
// 11. UPDATE PROFILE UI
// ============================================================

function updateProfileUI() {

    if (!currentProfile) {
        return;
    }

    const usernameElements =
        document.querySelectorAll("[data-profile-username]");

    usernameElements.forEach(element => {
        element.textContent =
            "@" + currentProfile.username;
    });

    const nameElements =
        document.querySelectorAll("[data-profile-name]");

    nameElements.forEach(element => {
        element.textContent =
            currentProfile.full_name ||
            currentProfile.username;
    });

    const bioElements =
        document.querySelectorAll("[data-profile-bio]");

    bioElements.forEach(element => {
        element.textContent =
            currentProfile.bio || "";
    });
}


// ============================================================
// 12. CREATE POST
// ============================================================

async function createPost() {

    if (!currentUser) {
        alert("يجب تسجيل الدخول أولًا.");
        return;
    }

    const textarea =
        $("postContent") ||
        $("createPostInput") ||
        $("postText");

    if (!textarea) {
        alert("لم يتم العثور على مربع المنشور.");
        return;
    }

    const content = textarea.value.trim();

    if (!content) {
        alert("اكتب شيئًا قبل نشر المنشور.");
        return;
    }

    try {

        const { error } =
            await supabaseClient
                .from("posts")
                .insert({
                    user_id: currentUser.id,
                    content: content
                });

        if (error) {
            throw error;
        }

        textarea.value = "";

        await loadPosts();

    } catch (error) {

        console.error(error);

        alert("حدث خطأ أثناء نشر المنشور: " + error.message);
    }
}


// ============================================================
// 13. LOAD POSTS
// ============================================================

async function loadPosts() {

    const container =
        $("postsContainer") ||
        $("postsList");

    if (!container) {
        return;
    }

    container.innerHTML =
        "<p>جاري تحميل المنشورات...</p>";

    try {

        const { data, error } =
            await supabaseClient
                .from("posts")
                .select(`
                    id,
                    user_id,
                    content,
                    created_at
                `)
                .order("created_at", {
                    ascending: false
                });

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {

            container.innerHTML =
                "<p>لا توجد منشورات حتى الآن.</p>";

            return;
        }

        container.innerHTML = "";

        for (const post of data) {

            let username = "مستخدم";

            const { data: profile } =
                await supabaseClient
                    .from("profiles")
                    .select("username, full_name")
                    .eq("id", post.user_id)
                    .single();

            if (profile) {
                username =
                    profile.full_name ||
                    profile.username;
            }

            const article =
                document.createElement("div");

            article.className = "post";

            article.innerHTML = `
                <div class="post-header">
                    <strong>${escapeHTML(username)}</strong>
                </div>

                <div class="post-content">
                    ${escapeHTML(post.content)}
                </div>

                <div class="post-date">
                    ${formatDate(post.created_at)}
                </div>
            `;

            container.appendChild(article);
        }

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>حدث خطأ أثناء تحميل المنشورات.</p>";
    }
}


// ============================================================
// 14. SEARCH POSTS
// ============================================================

async function searchPosts() {

    const input =
        $("searchInput");

    if (!input) {
        return;
    }

    const text =
        input.value.trim().toLowerCase();

    if (!text) {
        loadPosts();
        return;
    }

    const container =
        $("postsContainer") ||
        $("postsList");

    if (!container) {
        return;
    }

    const { data, error } =
        await supabaseClient
            .from("posts")
            .select("*")
            .ilike("content", `%${text}%`)
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(error);

        return;
    }

    container.innerHTML = "";

    if (!data || data.length === 0) {

        container.innerHTML =
            "<p>لم يتم العثور على نتائج.</p>";

        return;
    }

    data.forEach(post => {

        const article =
            document.createElement("div");

        article.className = "post";

        article.innerHTML = `
            <div class="post-content">
                ${escapeHTML(post.content)}
            </div>

            <div class="post-date">
                ${formatDate(post.created_at)}
            </div>
        `;

        container.appendChild(article);
    });
}


// ============================================================
// 15. PROFILE PAGE
// ============================================================

async function loadProfilePage() {

    if (!currentProfile) {
        await loadCurrentProfile();
    }

    const name =
        $("profileName");

    const username =
        $("profileUsername");

    const bio =
        $("profileBio");

    if (name) {
        name.textContent =
            currentProfile?.full_name || "";
    }

    if (username) {
        username.textContent =
            "@" + (currentProfile?.username || "");
    }

    if (bio) {
        bio.textContent =
            currentProfile?.bio || "";
    }
}


// ============================================================
// 16. FRIENDS PAGE
// ============================================================

async function loadFriendsPage() {

    const page =
        $("friendsPage");

    if (!page) {
        return;
    }

    page.innerHTML = `
        <div class="friends-wrapper">

            <h2>👥 الأصدقاء</h2>

            <div class="friend-search">
                <input
                    id="friendSearchInput"
                    type="text"
                    placeholder="ابحث عن مستخدم..."
                >

                <button onclick="searchUsers()">
                    بحث
                </button>
            </div>

            <div id="userSearchResults"></div>

            <hr>

            <h3>طلبات الصداقة</h3>

            <div id="friendRequests">
                جاري التحميل...
            </div>

            <hr>

            <h3>أصدقائي</h3>

            <div id="friendsList">
                جاري التحميل...
            </div>

        </div>
    `;

    await loadFriendRequests();
    await loadFriendsList();
}


// ============================================================
// 17. SEARCH USERS
// ============================================================

async function searchUsers() {

    const input =
        $("friendSearchInput");

    const results =
        $("userSearchResults");

    if (!input || !results) {
        return;
    }

    const text =
        input.value.trim();

    if (!text) {

        results.innerHTML =
            "<p>اكتب اسم المستخدم للبحث.</p>";

        return;
    }

    try {

        const { data, error } =
            await supabaseClient
                .from("profiles")
                .select("id, username, full_name, bio")
                .or(
                    `username.ilike.%${text}%,full_name.ilike.%${text}%`
                )
                .neq("id", currentUser.id)
                .limit(20);

        if (error) {
            throw error;
        }

        results.innerHTML = "";

        if (!data || data.length === 0) {

            results.innerHTML =
                "<p>لم يتم العثور على مستخدمين.</p>";

            return;
        }

        for (const user of data) {

            const card =
                document.createElement("div");

            card.className =
                "user-card";

            card.innerHTML = `
                <div>
                    <strong>
                        ${escapeHTML(user.full_name || user.username)}
                    </strong>

                    <div>
                        @${escapeHTML(user.username)}
                    </div>

                    <small>
                        ${escapeHTML(user.bio || "")}
                    </small>
                </div>

                <button onclick="handleFriendButton('${user.id}')">
                    إضافة صديق
                </button>
            `;

            results.appendChild(card);
        }

    } catch (error) {

        console.error(error);

        results.innerHTML =
            "<p>حدث خطأ أثناء البحث.</p>";
    }
}


// ============================================================
// 18. SEND FRIEND REQUEST
// ============================================================

async function handleFriendButton(userId) {

    if (!currentUser) {
        return;
    }

    if (currentUser.id === userId) {
        return;
    }

    try {

        const { data: existing, error: checkError } =
            await supabaseClient
                .from("friendships")
                .select("*")
                .or(
                    `and(requester_id.eq.${currentUser.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${currentUser.id})`
                )
                .limit(1);

        if (checkError) {
            throw checkError;
        }

        if (existing && existing.length > 0) {

            const friendship =
                existing[0];

            if (friendship.status === "accepted") {

                alert("أنتم أصدقاء بالفعل.");

            } else if (
                friendship.requester_id === currentUser.id
            ) {

                alert("لقد أرسلت طلب صداقة بالفعل.");

            } else {

                alert("لديك طلب صداقة من هذا المستخدم.");
            }

            return;
        }

        const { error } =
            await supabaseClient
                .from("friendships")
                .insert({
                    requester_id: currentUser.id,
                    addressee_id: userId,
                    status: "pending"
                });

        if (error) {
            throw error;
        }

        alert("تم إرسال طلب الصداقة.");

        searchUsers();

    } catch (error) {

        console.error(error);

        alert(
            "حدث خطأ أثناء إرسال طلب الصداقة: " +
            error.message
        );
    }
}


// ============================================================
// 19. LOAD FRIEND REQUESTS
// ============================================================

async function loadFriendRequests() {

    const container =
        $("friendRequests");

    if (!container || !currentUser) {
        return;
    }

    try {

        const { data, error } =
            await supabaseClient
                .from("friendships")
                .select("*")
                .eq("addressee_id", currentUser.id)
                .eq("status", "pending")
                .order("created_at", {
                    ascending: false
                });

        if (error) {
            throw error;
        }

        container.innerHTML = "";

        if (!data || data.length === 0) {

            container.innerHTML =
                "<p>لا توجد طلبات صداقة.</p>";

            return;
        }

        for (const request of data) {

            const { data: profile } =
                await supabaseClient
                    .from("profiles")
                    .select("username, full_name")
                    .eq("id", request.requester_id)
                    .single();

            const name =
                profile?.full_name ||
                profile?.username ||
                "مستخدم";

            const item =
                document.createElement("div");

            item.className =
                "friend-request";

            item.innerHTML = `
                <strong>
                    ${escapeHTML(name)}
                </strong>

                <button onclick="acceptFriendRequest('${request.id}')">
                    قبول
                </button>

                <button onclick="rejectFriendRequest('${request.id}')">
                    رفض
                </button>
            `;

            container.appendChild(item);
        }

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>حدث خطأ أثناء تحميل طلبات الصداقة.</p>";
    }
}


// ============================================================
// 20. ACCEPT FRIEND REQUEST
// ============================================================

async function acceptFriendRequest(requestId) {

    try {

        const { error } =
            await supabaseClient
                .from("friendships")
                .update({
                    status: "accepted"
                })
                .eq("id", requestId)
                .eq("addressee_id", currentUser.id);

        if (error) {
            throw error;
        }

        await loadFriendRequests();
        await loadFriendsList();

    } catch (error) {

        console.error(error);

        alert(
            "حدث خطأ أثناء قبول الطلب: " +
            error.message
        );
    }
}


// ============================================================
// 21. REJECT FRIEND REQUEST
// ============================================================

async function rejectFriendRequest(requestId) {

    try {

        const { error } =
            await supabaseClient
                .from("friendships")
                .delete()
                .eq("id", requestId)
                .eq("addressee_id", currentUser.id);

        if (error) {
            throw error;
        }

        await loadFriendRequests();

    } catch (error) {

        console.error(error);

        alert(
            "حدث خطأ أثناء رفض الطلب: " +
            error.message
        );
    }
}


// ============================================================
// 22. LOAD FRIENDS LIST
// ============================================================

async function loadFriendsList() {

    const container =
        $("friendsList");

    if (!container || !currentUser) {
        return;
    }

    try {

        const { data, error } =
            await supabaseClient
                .from("friendships")
                .select("*")
                .eq("status", "accepted")
                .or(
                    `requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`
                )
                .order("created_at", {
                    ascending: false
                });

        if (error) {
            throw error;
        }

        container.innerHTML = "";

        if (!data || data.length === 0) {

            container.innerHTML =
                "<p>ليس لديك أصدقاء حتى الآن.</p>";

            return;
        }

        for (const friendship of data) {

            const friendId =
                friendship.requester_id === currentUser.id
                    ? friendship.addressee_id
                    : friendship.requester_id;

            const { data: profile } =
                await supabaseClient
                    .from("profiles")
                    .select("username, full_name, bio")
                    .eq("id", friendId)
                    .single();

            if (!profile) {
                continue;
            }

            const item =
                document.createElement("div");

            item.className =
                "friend-card";

            item.innerHTML = `
                <strong>
                    ${escapeHTML(profile.full_name || profile.username)}
                </strong>

                <div>
                    @${escapeHTML(profile.username)}
                </div>

                <small>
                    ${escapeHTML(profile.bio || "")}
                </small>
            `;

            container.appendChild(item);
        }

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>حدث خطأ أثناء تحميل الأصدقاء.</p>";
    }
}


// ============================================================
// 23. MESSAGES PAGE
// ============================================================

async function loadMessagesPage() {

    const page =
        $("messagesPage");

    if (!page) {
        return;
    }

    page.innerHTML = `
        <div class="messages-wrapper">

            <h2>💬 Messenger</h2>

            <p>
                قسم الرسائل جاهز للربط مع الأصدقاء.
            </p>

            <p>
                سنضيف المحادثات الحقيقية في الخطوة التالية.
            </p>

        </div>
    `;
}


// ============================================================
// 24. NOTIFICATIONS PAGE
// ============================================================

async function loadNotificationsPage() {

    const page =
        $("notificationsPage");

    if (!page) {
        return;
    }

    page.innerHTML = `
        <div class="notifications-wrapper">

            <h2>🔔 الإشعارات</h2>

            <p>
                لا توجد إشعارات جديدة.
            </p>

        </div>
    `;
}


// ============================================================
// 25. SETTINGS PAGE
// ============================================================

function loadSettingsPage() {

    const page =
        $("settingsPage");

    if (!page) {
        return;
    }

    console.log("Settings page loaded");
}


// ============================================================
// 26. DARK MODE
// ============================================================

function toggleDarkMode() {

    document.body.classList.toggle("dark-mode");

    const enabled =
        document.body.classList.contains("dark-mode");

    localStorage.setItem(
        "linkaDarkMode",
        enabled ? "true" : "false"
    );
}


function loadDarkMode() {

    const enabled =
        localStorage.getItem("linkaDarkMode");

    if (enabled === "true") {
        document.body.classList.add("dark-mode");
    }
}


// ============================================================
// 27. ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// 28. FORMAT DATE
// ============================================================

function formatDate(date) {

    if (!date) {
        return "";
    }

    try {

        return new Date(date).toLocaleString(
            "ar-DZ",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    } catch {

        return date;
    }
}


// ============================================================
// 29. AUTH STATE
// ============================================================

async function initializeApp() {

    loadDarkMode();

    try {

        const {
            data: {
                session
            }
        } =
            await supabaseClient.auth.getSession();

        if (session?.user) {

            currentUser =
                session.user;

            await loadCurrentProfile();

            showApp();

        } else {

            showAuth();
        }

    } catch (error) {

        console.error(
            "Initialization error:",
            error
        );

        showAuth();
    }
}


// ============================================================
// 30. AUTH STATE LISTENER
// ============================================================

supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

        console.log(
            "Auth event:",
            event
        );

        if (session?.user) {

            currentUser =
                session.user;

            await loadCurrentProfile();

            showApp();

        } else {

            currentUser = null;
            currentProfile = null;

            showAuth();
        }
    }
);


// ============================================================
// 31. MAKE FUNCTIONS GLOBAL
// IMPORTANT FOR onclick="" IN index.html
// ============================================================

window.showPage = showPage;
window.showAuth = showAuth;
window.showApp = showApp;

window.showLogin = showLogin;
window.showRegister = showRegister;

window.login = login;
window.register = register;
window.logout = logout;

window.createPost = createPost;
window.searchPosts = searchPosts;

window.toggleDarkMode = toggleDarkMode;

window.loadProfilePage = loadProfilePage;

window.loadFriendsPage = loadFriendsPage;
window.searchUsers = searchUsers;
window.handleFriendButton = handleFriendButton;

window.acceptFriendRequest =
    acceptFriendRequest;

window.rejectFriendRequest =
    rejectFriendRequest;

window.loadFriendRequests =
    loadFriendRequests;

window.loadFriendsList =
    loadFriendsList;


// ============================================================
// 32. START LINKA
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "LINKA JavaScript loaded successfully."
        );

        initializeApp();

    }
);
