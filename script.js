// ========================================
// التنقل بين الصفحات
// ========================================

const pages = {
    home: document.getElementById("homePage"),
    profile: document.getElementById("profilePage"),
    friends: document.getElementById("friendsPage"),
    messages: document.getElementById("messagesPage"),
    notifications: document.getElementById("notificationsPage"),
    settings: document.getElementById("settingsPage")
};


const navigationButtons = document.querySelectorAll(
    "[data-page]"
);


function showPage(pageName) {

    Object.values(pages).forEach(function(page) {
        page.classList.remove("active-page");
    });


    if (pages[pageName]) {
        pages[pageName].classList.add("active-page");
    }


    navigationButtons.forEach(function(button) {

        button.classList.remove("active");

        if (button.dataset.page === pageName) {
            button.classList.add("active");
        }

    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    mobileSidebar.classList.remove("open");
}


navigationButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        showPage(button.dataset.page);

    });

});


// ========================================
// أزرار الشريط العلوي
// ========================================

document
    .getElementById("homeButton")
    .addEventListener("click", function() {

        showPage("home");

    });


document
    .getElementById("messagesButton")
    .addEventListener("click", function() {

        showPage("messages");

    });


document
    .getElementById("notificationsButton")
    .addEventListener("click", function() {

        showPage("notifications");

    });


document
    .getElementById("profileButton")
    .addEventListener("click", function() {

        showPage("profile");

    });


// ========================================
// نشر منشور
// ========================================

const publishButton =
    document.getElementById("publishButton");

const postInput =
    document.getElementById("postInput");

const posts =
    document.getElementById("posts");


publishButton.addEventListener("click", function() {

    const text = postInput.value.trim();


    if (text === "") {

        alert("اكتب شيئًا أولًا!");

        return;
    }


    const post = document.createElement("article");

    post.className = "post";


    post.innerHTML = `

        <div class="post-header">

            <div class="avatar">
                A
            </div>

            <div>

                <strong>Alex</strong>

                <span>
                    الآن
                </span>

            </div>

        </div>


        <p>
            ${escapeHTML(text)}
        </p>


        <div class="post-footer">

            <button class="like-button">

                ❤️ <span>0</span>

            </button>

            <button>
                💬 0
            </button>

            <button>
                ↗️ مشاركة
            </button>

        </div>
    `;


    posts.prepend(post);


    postInput.value = "";


    setupLikeButton(
        post.querySelector(".like-button")
    );

});


// ========================================
// الإعجاب
// ========================================

function setupLikeButton(button) {

    button.addEventListener("click", function() {

        const counter =
            button.querySelector("span");


        let likes =
            Number(counter.textContent);


        if (button.classList.contains("liked")) {

            likes--;

            button.classList.remove("liked");

        } else {

            likes++;

            button.classList.add("liked");

        }


        counter.textContent = likes;

    });

}


document
    .querySelectorAll(".like-button")
    .forEach(function(button) {

        setupLikeButton(button);

    });


// ========================================
// البحث
// ========================================

const searchInput =
    document.getElementById("searchInput");


searchInput.addEventListener("input", function() {

    const value =
        searchInput.value.toLowerCase().trim();


    document
        .querySelectorAll(".post")
        .forEach(function(post) {

            const text =
                post.textContent.toLowerCase();


            if (text.includes(value)) {

                post.style.display = "";

            } else {

                post.style.display = "none";

            }

        });

});


// ========================================
// Messenger
// ========================================

const messageInput =
    document.getElementById("messageInput");

const sendMessage =
    document.getElementById("sendMessage");

const chatMessages =
    document.getElementById("chatMessages");


function sendChatMessage() {

    const text =
        messageInput.value.trim();


    if (text === "") {
        return;
    }


    const message =
        document.createElement("div");


    message.className =
        "message sent";


    message.textContent =
        text;


    chatMessages.appendChild(message);


    messageInput.value = "";


    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


sendMessage.addEventListener(
    "click",
    sendChatMessage
);


messageInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            sendChatMessage();

        }

    }
);


// ========================================
// الوضع الليلي
// ========================================

const darkModeButton =
    document.getElementById("darkModeButton");

const settingsDarkMode =
    document.getElementById("settingsDarkMode");


function toggleDarkMode() {

    document.body.classList.toggle("dark");


    const dark =
        document.body.classList.contains("dark");


    localStorage.setItem(
        "linkaDarkMode",
        dark ? "true" : "false"
    );

}


darkModeButton.addEventListener(
    "click",
    toggleDarkMode
);


settingsDarkMode.addEventListener(
    "click",
    toggleDarkMode
);


// حفظ الوضع الليلي

if (
    localStorage.getItem("linkaDarkMode")
    === "true"
) {

    document.body.classList.add("dark");

}


// ========================================
// القائمة في الهاتف
// ========================================

const mobileMenu =
    document.getElementById("mobileMenu");

const mobileSidebar =
    document.getElementById("mobileSidebar");


mobileMenu.addEventListener(
    "click",
    function() {

        mobileSidebar.classList.toggle("open");

    }
);


// ========================================
// أزرار إضافة الأصدقاء
// ========================================

document
    .querySelectorAll(".primary-button")
    .forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                if (
                    button.textContent.includes("إضافة")
                ) {

                    button.textContent =
                        "✓ تم إرسال الطلب";

                    button.style.background =
                        "#42b72a";

                }

            }
        );

    });


// ========================================
// حماية النص
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}
