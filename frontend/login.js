(() => {
  const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || "http://127.0.0.1:5000";
  const LOGIN_ENDPOINT = `${API_BASE}/login`;

  const form = document.getElementById("loginForm");
  const emailEl = document.getElementById("email");
  const passwordEl = document.getElementById("password");
  const emailErr = document.getElementById("emailError");
  const passwordErr = document.getElementById("passwordError");
  const rememberMeEl = document.getElementById("rememberMe");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const loginBtn = document.getElementById("loginButton");
  const spinner = document.getElementById("loadingSpinner");
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMessage");

  function setBusy(busy) {
    if (!loginBtn) return;
    loginBtn.disabled = busy;
    if (spinner) spinner.style.display = busy ? "inline-block" : "none";
    const text = loginBtn.querySelector(".button-text");
    if (text) text.textContent = busy ? "Signing in…" : "Sign In";
  }

  function showToast(message, ok = false) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.remove("toast-error", "toast-success", "show");
    toast.classList.add(ok ? "toast-success" : "toast-error", "show");
    setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function clearFieldErrors() {
    if (emailErr) emailErr.textContent = "";
    if (passwordErr) passwordErr.textContent = "";
    emailEl?.classList.remove("input-error");
    passwordEl?.classList.remove("input-error");
  }

  function setFieldError(el, errEl, msg) {
    if (errEl) errEl.textContent = msg;
    el?.classList.add("input-error");
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  async function loginRequest(email, password) {
    const payload = { Email: email, Password: password };
    const res = await fetch(LOGIN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "omit"
    });

    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json().catch(() => ({})) : {};

    if (!res.ok) {
      const reason = data?.message || data?.error || res.statusText || "Login failed";
      throw new Error(reason);
    }
    return data;
  }

  function persistRememberMe(checked, email) {
    try {
      if (checked) {
        localStorage.setItem("rememberEmail", email);
        localStorage.setItem("rememberMe", "1");
      } else {
        localStorage.removeItem("rememberEmail");
        localStorage.setItem("rememberMe", "0");
      }
    } catch { }
  }

  function restoreRememberMe() {
    try {
      const remembered = localStorage.getItem("rememberMe") === "1";
      const email = localStorage.getItem("rememberEmail") || "";
      if (remembered && emailEl) emailEl.value = email;
      if (rememberMeEl) rememberMeEl.checked = remembered;
    } catch { }
  }

  restoreRememberMe();

  if (togglePasswordBtn && passwordEl) {
    togglePasswordBtn.addEventListener("click", () => {
      const type = passwordEl.getAttribute("type") === "password" ? "text" : "password";
      passwordEl.setAttribute("type", type);
      togglePasswordBtn.classList.toggle("active", type === "text");
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFieldErrors();

      const email = (emailEl?.value || "").trim();
      const password = passwordEl?.value || "";
      const remember = !!rememberMeEl?.checked;

      let valid = true;
      if (!email) {
        setFieldError(emailEl, emailErr, "Email is required.");
        valid = false;
      } else if (!isValidEmail(email)) {
        setFieldError(emailEl, emailErr, "Please enter a valid email.");
        valid = false;
      }
      if (!password) {
        setFieldError(passwordEl, passwordErr, "Password is required.");
        valid = false;
      }
      if (!valid) return;

      try {
        setBusy(true);
        const data = await loginRequest(email, password);
        if (data) {

          if (data.id) localStorage.setItem("userId", data.id);

          persistRememberMe(remember, email);
          localStorage.setItem("currentUserEmail", email);

          showToast("Logged in successfully.", true);

          setTimeout(() => {
            window.location.href = "posts.html";
          }, 600);
        }
      } catch (err) {
        const msg = (err && err.message) ? err.message : "Login failed.";
        showToast(msg, false);

        if (/password/i.test(msg)) {
          setFieldError(passwordEl, passwordErr, msg);
        } else if (/email/i.test(msg) || /user/i.test(msg)) {
          setFieldError(emailEl, emailErr, msg);
        }
      } finally {
        setBusy(false);
      }
    });
  }
})();


