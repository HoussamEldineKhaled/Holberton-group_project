const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || "http://127.0.0.1:5000";
const ENDPOINT = `${API_BASE}/uploadUserPost`;

const form = document.getElementById("postForm");
const submitBtn = document.getElementById("submitBtn");
const clearBtn = document.getElementById("clearBtn");

const userIdEl = document.getElementById("userId");
const titleEl = document.getElementById("title");
const descEl = document.getElementById("description");
const filesEl = document.getElementById("attachments");
const fileListEl = document.getElementById("fileList");

const titleErr = document.getElementById("titleError");

const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toastMessage");

function showToast(message, ok = false) {
  if (!toast || !toastMsg) return;
  toastMsg.textContent = message;
  toast.classList.remove("error", "show");
  if (!ok) toast.classList.add("error");
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function setFieldError(input, errSpan, msg) {
  if (errSpan) {
    errSpan.textContent = msg || "";
    errSpan.classList.add("show");
  }
  if (input) input.classList.add("invalid");
}
function clearFieldError(input, errSpan) {
  if (errSpan) {
    errSpan.textContent = "";
    errSpan.classList.remove("show");
  }
  if (input) input.classList.remove("invalid");
}

let user = null;
try { user = JSON.parse(localStorage.getItem("userId")); } catch {}
if (!user) {
  const ret = encodeURIComponent("upload-post.html");
  window.location.href = `login.html?return=${ret}`;
} else {
  if (userIdEl) userIdEl.value = user;
}

filesEl.addEventListener("change", () => {
  fileListEl.innerHTML = "";
  const files = Array.from(filesEl.files || []);
  if (!files.length) return;
  files.forEach((f) => {
    const li = document.createElement("li");
    const left = document.createElement("div");
    const right = document.createElement("div");
    left.textContent = `${f.name} (${f.type || "unknown"})`;
    right.textContent = `${f.size.toLocaleString()} bytes`;
    li.appendChild(left);
    li.appendChild(right);
    fileListEl.appendChild(li);
  });
});

function validate() {
  clearFieldError(titleEl, titleErr);

  const errs = [];

  const authUser = (() => {
    try { return JSON.parse(localStorage.getItem("userId")); } catch { return null; }
  })();
  if (!authUser) {
    errs.push({ type: "auth", message: "Session expired. Please sign in again." });
  }

  const title = (titleEl?.value || "").trim();
  if (!title) {
    errs.push({ el: titleEl, err: titleErr, message: "Title is required." });
  } else if (title.length > 200) {
    errs.push({ el: titleEl, err: titleErr, message: "Title must be 200 characters or fewer." });
  }

  return { ok: errs.length === 0, errs };
}

function setBusy(busy) {
  if (!submitBtn) return;
  submitBtn.disabled = busy;
  submitBtn.classList.toggle("loading", busy);
}

function buildFormData() {
  const fd = new FormData();
  const authUser = JSON.parse(localStorage.getItem("userId"));

  fd.append("title", (titleEl?.value || "").trim());
  fd.append("description", (descEl?.value || "").trim());
  fd.append("U_id", String(authUser));

  const files = Array.from(filesEl.files || []);
  files.forEach((f) => fd.append("attachments", f, f.name));

  return fd;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const { ok, errs } = validate();
  if (!ok) {
    errs.forEach((x) => {
      if (x.el) setFieldError(x.el, x.err, x.message);
    });
    const authErr = errs.find((x) => x.type === "auth");
    if (authErr) {
      showToast(authErr.message, false);
      const ret = encodeURIComponent("upload-post.html");
      setTimeout(() => (window.location.href = `login.html?return=${ret}`), 500);
    } else {
      showToast("Please fix the highlighted fields.", false);
    }
    return;
  }

  const fd = buildFormData();

  setBusy(true);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      body: fd, 
    });

    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json().catch(() => ({})) : {};

    if (!res.ok) {
      const msg = data?.Error || data?.message || `${res.status} ${res.statusText}`;
      showToast(`Error: ${msg}`, false);
      return;
    }

    showToast(data?.Message || "Post uploaded successfully.", true);

    form.reset();
    if (user) userIdEl.value = user;
    fileListEl.innerHTML = "";
    clearFieldError(titleEl, titleErr);

  } catch (err) {
    showToast(`Network or server error: ${err?.message || err}`, false);
  } finally {
    setBusy(false);
  }
});

clearBtn.addEventListener("click", () => {
  form.reset();
  if (user) userIdEl.value = user;
  fileListEl.innerHTML = "";
  clearFieldError(titleEl, titleErr);
  showToast("Form cleared.", true);
});
