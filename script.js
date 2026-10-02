// زر نشر المنشور

const publishBtn = document.getElementById("publishBtn");
const postInput = document.getElementById("postInput");
const posts = document.getElementById("posts");

publishBtn.addEventListener("click", function () {

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
                <span>الآن</span>
            </div>

        </div>

        <p>${escapeHTML(text)}</p>

        <div class="post-footer">

            <button class="like-btn">
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

    setupLikeButton(post.querySelector(".like-btn"));
});


// الإعجاب

function setupLikeButton(button) {

    button.addEventListener("click", function () {

        const counter = button.querySelector("span");

        let likes = Number(counter.textContent);

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


// تفعيل أزرار الإعجاب الموجودة مسبقًا

document.querySelectorAll(".like-btn").forEach(function (button) {
    setupLikeButton(button);
});


// البحث

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function () {

    const value = searchInput.value.toLowerCase();

    document.querySelectorAll(".post").forEach(function (post) {

        const text = post.textContent.toLowerCase();

        if (text.includes(value)) {
            post.style.display = "";
        } else {
            post.style.display = "none";
        }

    });

});


// الأزرار العلوية

document.getElementById("homeBtn").addEventListener("click", function () {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

document.getElementById("messagesBtn").addEventListener("click", function () {
    alert("Messenger سيكون في المرحلة القادمة 💬");
});

document.getElementById("notificationsBtn").addEventListener("click", function () {
    alert("لا توجد إشعارات جديدة 🔔");
});

document.getElementById("profileBtn").addEventListener("click", function () {
    alert("صفحة الملف الشخصي ستكون في المرحلة القادمة 👤");
});


// حماية النص الذي يكتبه المستخدم

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}
