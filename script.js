```javascript
// ==================================================
// LINKA + SUPABASE
// ==================================================


// ==================================================
// 1. SUPABASE SETTINGS
// ==================================================

const SUPABASE_URL =
    "https://mpzdmdcqjaxdlfhsevyd.supabase.co";


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

        if (authPage) {
            authPage.classList.remove("hidden");
        }

        if (homePage) {
            homePage.classList.add("hidden");
        }

        if (logoutButton) {
            logoutButton.style.display = "none";
        }

        return;

    }


    if (authPage) {
        authPage.classList.add("hidden");
    }

    if (homePage) {
        homePage.classList.remove("hidden");
    }

    if (logoutButton) {
        logoutButton.style.display = "block";
    }


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

        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");

        loginTab.classList.add("active");
        registerTab.classList.remove("active");

    } else {

        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");

        loginTab.classList.remove("active");
        registerTab.classList.add("active");

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

        console.error(profileError);

        message.textContent =
            "تم إنشاء الحساب ولكن حدث خطأ في الملف الشخصي.";

        return;

    }


    message.textContent =
        "تم إنشاء الحساب بنجاح!";


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


    const sideUsername =
        document.getElementById(
            "sideUsername"
        );

    const profileName =
        document.getElementById(
            "profileName"
        );

    const profileUsername =
        document.getElementById(
            "profileUsername"
        );

    const profileBio =
        document.getElementById(
            "profileBio"
        );


    if (sideUsername) {
        sideUsername.textContent =
            data.username;
    }

    if (profileName) {
        profileName.textContent =
            data.full_name ||
            data.username;
    }

    if (profileUsername) {
        profileUsername.textContent =
            "@" + data.username;
    }

    if (profileBio) {
        profileBio.textContent =
            data.bio ||
            "مرحبًا بك في Linka!";
    }

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


    if (!container) return;


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


    if (!container) return;


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
// 15. SEARCH POSTS
// ==================================================

function searchPosts() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) return;


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

        const authPage =
            document.getElementById(
                "authPage"
            );

        if (authPage) {
            authPage.classList.remove("hidden");
        }

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


    if (page === "friends") {

        loadFriendsPage();

    }

}


// ==================================================
// 18. FRIENDS PAGE
// ==================================================

async function loadFriendsPage() {

    const page =
        document.getElementById(
            "friendsPage"
        );


    if (!page || !currentUser) return;


    page.innerHTML = `

        <div class="post">

            <h2>👥 الأصدقاء</h2>

            <p>
                ابحث عن مستخدم لإرسال طلب صداقة.
            </p>

            <div style="
                display:flex;
                gap:10px;
                margin-top:15px;
                flex-wrap:wrap;
            ">

                <input
                    id="friendSearchInput"
                    type="text"
                    placeholder="ابحث باسم المستخدم..."
                    style="
                        flex:1;
                        min-width:200px;
                        padding:12px;
                        border-radius:10px;
                        border:1px solid #ccc;
                    "
                >

                <button
                    onclick="searchUsers()"
                    style="
                        padding:12px 20px;
                        border:0;
                        border-radius:10px;
                        cursor:pointer;
                    "
                >
                    🔎 بحث
                </button>

            </div>

        </div>


        <div
            id="friendSearchResults"
        ></div>


        <div class="post">

            <h2>📨 طلبات الصداقة</h2>

            <div id="friendRequests">
                جاري التحميل...
            </div>

        </div>


        <div class="post">

            <h2>👥 أصدقائي</h2>

            <div id="friendsList">
                جاري التحميل...
            </div>

        </div>

    `;


    await loadFriendRequests();
    await loadFriendsList();

}


// ==================================================
// 19. SEARCH USERS
// ==================================================

async function searchUsers() {

    if (!currentUser) return;


    const input =
        document.getElementById(
            "friendSearchInput"
        );


    const results =
        document.getElementById(
            "friendSearchResults"
        );


    if (!input || !results) return;


    const query =
        input.value.trim();


    if (!query) {

        results.innerHTML = `
            <div class="post">
                اكتب اسم مستخدم للبحث.
            </div>
        `;

        return;

    }


    results.innerHTML = `
        <div class="post">
            جاري البحث...
        </div>
    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "id, username, full_name, bio"
            )
            .ilike(
                "username",
                `%${query}%`
            )
            .neq(
                "id",
                currentUser.id
            )
            .limit(20);


    if (error) {

        console.error(error);

        results.innerHTML = `
            <div class="post">
                حدث خطأ أثناء البحث.
            </div>
        `;

        return;

    }


    if (!data || !data.length) {

        results.innerHTML = `
            <div class="post">
                لم يتم العثور على مستخدمين.
            </div>
        `;

        return;

    }


    const friendshipIds =
        data.map(
            user => user.id
        );


    const {
        data: friendships,
        error: friendshipError
    } =
        await supabaseClient
            .from("friendships")
            .select("*")
            .or(
                `requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`
            );


    if (friendshipError) {

        console.error(friendshipError);

    }


    results.innerHTML = `
        <div class="post">

            <h2>🔎 نتائج البحث</h2>

            <div id="usersResults"></div>

        </div>
    `;


    const usersResults =
        document.getElementById(
            "usersResults"
        );


    data.forEach(
        user => {

            const relation =
                (friendships || []).find(
                    friendship =>
                        (
                            friendship.requester_id === currentUser.id &&
                            friendship.addressee_id === user.id
                        )
                        ||
                        (
                            friendship.requester_id === user.id &&
                            friendship.addressee_id === currentUser.id
                        )
                );


            let buttonText =
                "➕ إضافة صديق";

            let disabled =
                false;


            if (relation) {

                if (
                    relation.status ===
                    "accepted"
                ) {

                    buttonText =
                        "✅ أصدقاء";

                    disabled = true;

                } else if (
                    relation.requester_id ===
                    currentUser.id
                ) {

                    buttonText =
                        "⏳ طلب مرسل";

                    disabled = true;

                } else {

                    buttonText =
                        "📨 قبول الطلب";

                }

            }


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "post";


            card.style.marginBottom =
                "10px";


            card.innerHTML = `

                <div style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:15px;
                    flex-wrap:wrap;
                ">

                    <div>

                        <div style="font-size:20px;">
                            👤
                        </div>

                        <strong>
                            ${escapeHTML(
                                user.full_name ||
                                user.username
                            )}
                        </strong>

                        <div>
                            @${escapeHTML(
                                user.username
                            )}
                        </div>

                        <small>
                            ${escapeHTML(
                                user.bio || ""
                            )}
                        </small>

                    </div>

                    <button
                        ${
                            disabled
                                ? "disabled"
                                : ""
                        }
                        onclick="handleFriendButton(
                            '${user.id}'
                        )"
                        style="
                            padding:10px 15px;
                            border:0;
                            border-radius:10px;
                            cursor:pointer;
                        "
                    >
                        ${buttonText}
                    </button>

                </div>

            `;


            usersResults.appendChild(
                card
            );

        }
    );

}


// ==================================================
// 20. HANDLE FRIEND BUTTON
// ==================================================

async function handleFriendButton(
    userId
) {

    if (!currentUser) return;


    const {
        data: existing,
        error
    } =
        await supabaseClient
            .from("friendships")
            .select("*")
            .or(
                `and(requester_id.eq.${currentUser.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${currentUser.id})`
            );


    if (error) {

        console.error(error);

        alert(
            "حدث خطأ أثناء فحص طلب الصداقة."
        );

        return;

    }


    const relation =
        existing &&
        existing.length
            ? existing[0]
            : null;


    if (!relation) {

        const {
            error: insertError
        } =
            await supabaseClient
                .from("friendships")
                .insert({

                    requester_id:
                        currentUser.id,

                    addressee_id:
                        userId,

                    status:
                        "pending"

                });


        if (insertError) {

            console.error(
                insertError
            );

            alert(
                "حدث خطأ أثناء إرسال طلب الصداقة."
            );

            return;

        }


        alert(
            "تم إرسال طلب الصداقة ✅"
        );


        await loadFriendsPage();

        return;

    }


    if (
        relation.addressee_id ===
        currentUser.id &&
        relation.status ===
        "pending"
    ) {

        const {
            error: updateError
        } =
            await supabaseClient
                .from("friendships")
                .update({
                    status: "accepted"
                })
                .eq(
                    "id",
                    relation.id
                );


        if (updateError) {

            console.error(
                updateError
            );

            alert(
                "حدث خطأ أثناء قبول الطلب."
            );

            return;

        }


        alert(
            "تم قبول طلب الصداقة ✅"
        );


        await loadFriendsPage();

    }

}


// ==================================================
// 21. LOAD FRIEND REQUESTS
// ==================================================

async function loadFriendRequests() {

    if (!currentUser) return;


    const container =
        document.getElementById(
            "friendRequests"
        );


    if (!container) return;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("friendships")
            .select(`
                id,
                requester_id,
                addressee_id,
                status,
                created_at,
                profiles:requester_id (
                    username,
                    full_name,
                    bio
                )
            `)
            .eq(
                "addressee_id",
                currentUser.id
            )
            .eq(
                "status",
                "pending"
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(error);

        container.innerHTML =
            "حدث خطأ أثناء تحميل الطلبات.";

        return;

    }


    if (!data || !data.length) {

        container.innerHTML =
            "لا توجد طلبات صداقة جديدة.";

        return;

    }


    container.innerHTML = "";


    data.forEach(
        request => {

            const profile =
                request.profiles;


            const card =
                document.createElement(
                    "div"
                );


            card.style.padding =
                "12px 0";

            card.style.borderBottom =
                "1px solid #ddd";


            card.innerHTML = `

                <div>

                    <strong>
                        ${escapeHTML(
                            profile?.full_name ||
                            profile?.username ||
                            "مستخدم"
                        )}
                    </strong>

                    <div>
                        @${escapeHTML(
                            profile?.username ||
                            ""
                        )}
                    </div>

                </div>

                <div style="
                    display:flex;
                    gap:8px;
                    margin-top:10px;
                ">

                    <button
                        onclick="acceptFriendRequest(
                            '${request.id}'
                        )"
                    >
                        ✅ قبول
                    </button>

                    <button
                        onclick="rejectFriendRequest(
                            '${request.id}'
                        )"
                    >
                        ❌ رفض
                    </button>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


// ==================================================
// 22. ACCEPT FRIEND REQUEST
// ==================================================

async function acceptFriendRequest(
    friendshipId
) {

    if (!currentUser) return;


    const {
        error
    } =
        await supabaseClient
            .from("friendships")
            .update({
                status: "accepted"
            })
            .eq(
                "id",
                friendshipId
            )
            .eq(
                "addressee_id",
                currentUser.id
            );


    if (error) {

        console.error(error);

        alert(
            "حدث خطأ أثناء قبول الطلب."
        );

        return;

    }


    await loadFriendsPage();

}


// ==================================================
// 23. REJECT FRIEND REQUEST
// ==================================================

async function rejectFriendRequest(
    friendshipId
) {

    if (!currentUser) return;


    const {
        error
    } =
        await supabaseClient
            .from("friendships")
            .delete()
            .eq(
                "id",
                friendshipId
            )
            .eq(
                "addressee_id",
                currentUser.id
            );


    if (error) {

        console.error(error);

        alert(
            "حدث خطأ أثناء رفض الطلب."
        );

        return;

    }


    await loadFriendsPage();

}


// ==================================================
// 24. LOAD FRIENDS LIST
// ==================================================

async function loadFriendsList() {

    if (!currentUser) return;


    const container =
        document.getElementById(
            "friendsList"
        );


    if (!container) return;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("friendships")
            .select(`
                id,
                requester_id,
                addressee_id,
                status
            `)
            .eq(
                "status",
                "accepted"
            )
            .or(
                `requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`
            );


    if (error) {

        console.error(error);

        container.innerHTML =
            "حدث خطأ أثناء تحميل الأصدقاء.";

        return;

    }


    if (!data || !data.length) {

        container.innerHTML =
            "ليس لديك أصدقاء بعد.";

        return;

    }


    const friendIds =
        data.map(
            friendship =>
                friendship.requester_id ===
                currentUser.id
                    ? friendship.addressee_id
                    : friendship.requester_id
        );


    const {
        data: profiles,
        error: profilesError
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "id, username, full_name, bio"
            )
            .in(
                "id",
                friendIds
            );


    if (profilesError) {

        console.error(
            profilesError
        );

        container.innerHTML =
            "حدث خطأ أثناء تحميل ملفات الأصدقاء.";

        return;

    }


    container.innerHTML = "";


    profiles.forEach(
        friend => {

            const card =
                document.createElement(
                    "div"
                );


            card.style.padding =
                "12px 0";

            card.style.borderBottom =
                "1px solid #ddd";


            card.innerHTML = `

                <div>

                    <div style="font-size:20px;">
                        👤
                    </div>

                    <strong>
                        ${escapeHTML(
                            friend.full_name ||
                            friend.username
                        )}
                    </strong>

                    <div>
                        @${escapeHTML(
                            friend.username
                        )}
                    </div>

                    <small>
                        ${escapeHTML(
                            friend.bio || ""
                        )}
                    </small>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


// ==================================================
// 25. DARK MODE
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
// 26. LOCAL CHAT DEMO
// ==================================================

function sendMessage() {

    const input =
        document.getElementById(
            "messageInput"
        );


    if (!input) return;


    const text =
        input.value.trim();


    if (!text) return;


    const container =
        document.getElementById(
            "chatMessages"
        );


    if (!container) return;


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
```

### بعد استبدال الملف

1. احفظ `script.js` في GitHub بـ **Commit changes**.
2. انتظر حوالي دقيقة.
3. افتح Linka واضغط **Ctrl + F5**.
4. سجّل الدخول.
5. اضغط **👥 الأصدقاء**.

ستظهر لك صفحة جديدة فيها **البحث عن المستخدمين + إرسال طلب صداقة + قبول/رفض الطلبات + قائمة الأصدقاء**.

### ⚠️ ملاحظة مهمة

في الكود أعلاه وضعت:

```javascript
"ضع_PUBLISHABLE_KEY_هنا"
```

لأنني لا أريدك أن تنشر مفتاحك الحقيقي هنا. في ملفك على GitHub، **اترك مفتاح Publishable الحقيقي الموجود عندك كما هو**.

بعدها جرّب من الحساب الأول البحث عن **اسم المستخدم الخاص بالحساب الثاني** وإرسال طلب صداقة.

إذا ظهرت لك رسالة خطأ، **لا تغيّر شيئًا آخر**؛ أرسل لي الخطأ وسنصلحه.

// ==========================================
// FIX: Make functions available to HTML onclick
// ==========================================

window.showPage = showPage;
window.logout = logout;
window.createPost = createPost;
window.searchPosts = searchPosts;
window.toggleDarkMode = toggleDarkMode;
