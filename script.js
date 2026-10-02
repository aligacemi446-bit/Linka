// ==================================================
// LINKA + SUPABASE
// ==================================================


// ==================================================
// 1. SUPABASE SETTINGS
// ==================================================

const SUPABASE_URL =
    "https://mpzdmdcqjaxdlfhsevyd.supabase.co/rest/v1/";


// ضع Publishable key الخاص بك هنا
const SUPABASE_KEY =
    "sb_publishable_-Vbi1NmSWSciLOLMIvBY7w_INm0qo0w";


// إنشاء اتصال Supabase
const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==================================================
// 2. VARIABLES
// ==================================================

let currentUser = null;

let allPosts = [];


// ==================================================
// 3. START
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkUser();

        loadDarkMode();

    }
);


// ==================================================
// 4. CHECK USER
// ==================================================

async function checkUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getSession();


    if (error) {

        console.error(error);

        return;

    }


    currentUser =
        data.session
            ? data.session.user
            : null;


    updateInterface();

}


// ==================================================
// 5. AUTH STATE
// ==================================================

supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        currentUser =
            session
                ? session.user
                : null;

        updateInterface();

    }
);


// ==================================================
// 6. UPDATE INTERFACE
// ==================================================

function updateInterface() {

    const authPage =
        document.getElementById(
            "authPage"
        );

    const homePage =
        document.getElementById(
            "homePage"
        );

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (!currentUser) {

        authPage.classList.remove(
            "hidden"
        );

        homePage.classList.add(
            "hidden"
        );

        logoutButton.style.display =
            "none";

        return;

    }


    authPage.classList.add(
        "hidden"
    );

    homePage.classList.remove(
        "hidden"
    );

    logoutButton.style.display =
        "block";


    loadProfile();

    loadPosts();

}


// ==================================================
// 7. AUTH TABS
// ==================================================

function showAuth(type) {

    const loginForm =
        document.getElementById(
            "loginForm"
        );

    const registerForm =
        document.getElementById(
            "registerForm"
        );

    const loginTab =
        document.getElementById(
            "loginTab"
        );

    const registerTab =
        document.getElementById(
            "registerTab"
        );


    if (type === "login") {

        loginForm.classList.remove(
            "hidden"
        );

        registerForm.classList.add(
            "hidden"
        );

        loginTab.classList.add(
            "active"
        );

        registerTab.classList.remove(
            "active"
        );

    } else {

        loginForm.classList.add(
            "hidden"
        );

        registerForm.classList.remove(
            "hidden"
        );

        loginTab.classList.remove(
            "active"
        );

        registerTab.classList.add(
            "active"
        );

    }

}


// ==================================================
// 8. REGISTER
// ==================================================

async function register() {

    const username =
        document.getElementById(
            "registerUsername"
        ).value.trim();


    const email =
        document.getElementById(
            "registerEmail"
        ).value.trim();


    const password =
        document.getElementById(
            "registerPassword"
        ).value;


    const message =
        document.getElementById(
            "authMessage"
        );


    if (
        !username ||
        !email ||
        !password
    ) {

        message.textContent =
            "املأ جميع الحقول.";

        return;

    }


    if (password.length < 6) {

        message.textContent =
            "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";

        return;

    }


    message.textContent =
        "جاري إنشاء الحساب...";


    // إنشاء حساب Auth

    const {
        data,
        error
    } =
        await supabaseClient.auth.signUp({

            email: email,

            password: password

        });


    if (error) {

        console.error(error);

        message.textContent =
            error.message;

        return;

    }


    if (!data.user) {

        message.textContent =
            "حدث خطأ أثناء إنشاء الحساب.";

        return;

    }


    // إنشاء Profile

    const {
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .insert({

                id: data.user.id,

                username: username,

                full_name: username,

                bio: "مرحبًا بك في Linka!"

            });


    if (profileError) {

        console.error(
            profileError
        );

        message.textContent =
            "تم إنشاء الحساب ولكن حدث خطأ في الملف الشخصي.";

        return;

    }


    message.textContent =
        "تم إنشاء الحساب بنجاح!";


    // تنظيف الحقول

    document.getElementById(
        "registerUsername"
    ).value = "";

    document.getElementById(
        "registerEmail"
    ).value = "";

    document.getElementById(
        "registerPassword"
    ).value = "";

}


// ==================================================
// 9. LOGIN
// ==================================================

async function login() {

    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();


    const password =
        document.getElementById(
            "loginPassword"
        ).value;


    const message =
        document.getElementById(
            "authMessage"
        );


    if (!email || !password) {

        message.textContent =
            "أدخل البريد وكلمة المرور.";

        return;

    }


    message.textContent =
        "جاري تسجيل الدخول...";


    const {
        data,
        error
    } =
        await supabaseClient.auth
            .signInWithPassword({

                email: email,

                password: password

            });


    if (error) {

        console.error(error);

        message.textContent =
            error.message;

        return;

    }


    currentUser =
        data.user;


    message.textContent = "";

    updateInterface();

}


// ==================================================
// 10. LOGOUT
// ==================================================

async function logout() {

    const {
        error
    } =
        await supabaseClient.auth.signOut();


    if (error) {

        console.error(error);

        return;

    }


    currentUser = null;

    updateInterface();

}


// ==================================================
// 11. LOAD PROFILE
// ==================================================

async function loadProfile() {

    if (!currentUser) return;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq(
                "id",
                currentUser.id
            )
            .single();


    if (error) {

        console.error(error);

        return;

    }


    document.getElementById(
        "sideUsername"
    ).textContent =
        data.username;


    document.getElementById(
        "profileName"
    ).textContent =
        data.full_name ||
        data.username;


    document.getElementById(
        "profileUsername"
    ).textContent =
        "@" + data.username;


    document.getElementById(
        "profileBio"
    ).textContent =
        data.bio ||
        "مرحبًا بك في Linka!";

}


// ==================================================
// 12. CREATE POST
// ==================================================

async function createPost() {

    if (!currentUser) {

        alert(
            "يجب تسجيل الدخول أولًا."
        );

        return;

    }


    const textarea =
        document.getElementById(
            "postContent"
        );


    const content =
        textarea.value.trim();


    if (!content) {

        alert(
            "اكتب شيئًا قبل النشر."
        );

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("posts")
            .insert({

                user_id:
                    currentUser.id,

                content:
                    content

            });


    if (error) {

        console.error(error);

        alert(
            "حدث خطأ أثناء نشر المنشور."
        );

        return;

    }


    textarea.value = "";


    await loadPosts();

}


// ==================================================
// 13. LOAD POSTS
// ==================================================

async function loadPosts() {

    if (!currentUser) return;


    const container =
        document.getElementById(
            "postsContainer"
        );


    container.innerHTML =
        "<p>جاري تحميل المنشورات...</p>";


    const {
        data,
        error
    } =
        await supabaseClient
            .from("posts")
            .select(`
                id,
                content,
                created_at,
                user_id,
                profiles (
                    username,
                    full_name
                )
            `)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(error);

        container.innerHTML =
            "<p>حدث خطأ أثناء تحميل المنشورات.</p>";

        return;

    }


    allPosts =
        data || [];


    renderPosts(allPosts);

}


// ==================================================
// 14. DISPLAY POSTS
// ==================================================

function renderPosts(posts) {

    const container =
        document.getElementById(
            "postsContainer"
        );


    container.innerHTML = "";


    if (!posts.length) {

        container.innerHTML = `
            <div class="post">
                لا توجد منشورات حتى الآن.
                كن أول شخص ينشر شيئًا!
            </div>
        `;

        return;

    }


    posts.forEach(
        post => {

            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "post";


            const username =
                post.profiles?.username ||
                "مستخدم";


            const fullName =
                post.profiles?.full_name ||
                username;


            const date =
                new Date(
                    post.created_at
                ).toLocaleString(
                    "ar-DZ"
                );


            article.innerHTML = `

                <div class="post-header">

                    <div class="post-avatar">
                        👤
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(fullName)}
                        </strong>

                        <div class="post-date">
                            @${escapeHTML(username)}
                        </div>

                    </div>

                </div>


                <div class="post-content">
                    ${escapeHTML(post.content)}
                </div>


                <div class="post-date">
                    ${date}
                </div>

            `;


            container.appendChild(
                article
            );

        }
    );

}


// ==================================================
// 15. SEARCH
// ==================================================

function searchPosts() {

    const input =
        document.getElementById(
            "searchInput"
        );


    const query =
        input.value
            .trim()
            .toLowerCase();


    if (!query) {

        renderPosts(allPosts);

        return;

    }


    const filtered =
        allPosts.filter(
            post =>
                post.content
                    .toLowerCase()
                    .includes(query)
        );


    renderPosts(filtered);

}


// ==================================================
// 16. SECURITY
// ==================================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


// ==================================================
// 17. PAGE NAVIGATION
// ==================================================

function showPage(page) {

    if (!currentUser) {

        showAuth("login");

        document.getElementById(
            "authPage"
        ).classList.remove(
            "hidden"
        );

        return;

    }


    const pages = [

        "home",
        "profile",
        "friends",
        "messages",
        "notifications",
        "settings"

    ];


    pages.forEach(
        name => {

            const element =
                document.getElementById(
                    name + "Page"
                );


            if (element) {

                element.classList.add(
                    "hidden"
                );

            }

        }
    );


    const selected =
        document.getElementById(
            page + "Page"
        );


    if (selected) {

        selected.classList.remove(
            "hidden"
        );

    }


    if (page === "home") {

        loadPosts();

    }

}


// ==================================================
// 18. DARK MODE
// ==================================================

function toggleDarkMode() {

    document.body.classList.toggle(
        "dark"
    );


    localStorage.setItem(
        "linkaDarkMode",
        document.body.classList.contains(
            "dark"
        )
    );

}


function loadDarkMode() {

    const dark =
        localStorage.getItem(
            "linkaDarkMode"
        );


    if (dark === "true") {

        document.body.classList.add(
            "dark"
        );

    }

}


// ==================================================
// 19. LOCAL CHAT DEMO
// ==================================================

function sendMessage() {

    const input =
        document.getElementById(
            "messageInput"
        );


    const text =
        input.value.trim();


    if (!text) return;


    const container =
        document.getElementById(
            "chatMessages"
        );


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "sent";


    message.textContent =
        text;


    container.appendChild(
        message
    );


    input.value = "";


    container.scrollTop =
        container.scrollHeight;

}
