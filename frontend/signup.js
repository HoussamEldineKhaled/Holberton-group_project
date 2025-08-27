(() => {
  'use strict';

  const onReady = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  };



  onReady(() => {
    const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || "http://127.0.0.1:5000";
    const SIGNUP_ENDPOINT = `${API_BASE}/sign_up`;
    const REDIRECT_AFTER = 'login.html';

    const form = document.getElementById('signupForm');
    if (!form) return;
    form.setAttribute('novalidate', '');

    const fullNameEl = document.getElementById('fullName');
    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');
    const confirmEl = document.getElementById('confirmPassword');
    const agreeEl = document.getElementById('agreeTerms');

    const fullNameErr = document.getElementById('fullNameError');
    const emailErr = document.getElementById('emailError');
    const passwordErr = document.getElementById('passwordError');
    const confirmErr = document.getElementById('confirmPasswordError');

    const termsContainer = document.querySelector('.terms-checkbox');
    const togglePassBtn = document.getElementById('togglePassword');
    const toggleConfirmBtn = document.getElementById('toggleConfirmPassword');

    const btn = document.getElementById('signupButton');
    const spinner = document.getElementById('loadingSpinner');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');

    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    (function injectStyles() {
      const id = '__signup_validation_patch__';
      if (document.getElementById(id)) return;
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        .error-message{display:block!important;min-height:1em;margin-top:.35rem}
        .input-error{outline:2px solid #b00020;border-color:#b00020!important}
        .terms-checkbox.input-error{outline:2px solid #b00020;border-radius:6px;padding:6px}
        .toast.show{opacity:1;visibility:visible}
        .pw-reqs{font-size:.85rem; margin-top:.35rem; display:none}
        .pw-reqs ul{padding-left:0; margin:0}
        .pw-reqs li{list-style:none; margin:.15rem 0}
        .pw-reqs li.ok{color:#0a7a0a}
        .pw-reqs li.bad{color:#b00020}
        .pw-reqs li.ok::before{content:"✓ "; font-weight:600}
        .pw-reqs li.bad::before{content:"• "; font-weight:600}
      `;
      document.head.appendChild(s);
    })();

    const POLICY = { minLen: 8, upper: true, lower: true, digitOrSym: true };

    function showToast(message, ok = false) {
      if (!toast || !toastMsg) { alert(message); return; }
      toastMsg.textContent = message;
      toast.classList.remove('toast-error', 'toast-success', 'show');
      toast.classList.add(ok ? 'toast-success' : 'toast-error', 'show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function setBusy(busy) {
      if (btn) btn.disabled = busy;
      if (spinner) spinner.style.display = busy ? 'inline-block' : 'none';
      const t = btn && btn.querySelector('.button-text');
      if (t) t.textContent = busy ? 'Creating…' : 'Create Account';
    }

    function setFieldError(input, errSpan, msg) {
      if (errSpan) { errSpan.textContent = msg; errSpan.style.display = 'block'; }
      if (input) input.classList.add('input-error');
    }
    function clearFieldError(input, errSpan) {
      if (errSpan) { errSpan.textContent = ''; errSpan.style.display = ''; }
      if (input) input.classList.remove('input-error');
    }

    function ensureTermsErrorEl() {
      let el = document.getElementById('termsError');
      if (!el && termsContainer) {
        el = document.createElement('span');
        el.id = 'termsError';
        el.className = 'error-message';
        termsContainer.appendChild(el);
      }
      return el;
    }
    function setTermsError(msg) { const el = ensureTermsErrorEl(); if (el) { el.textContent = msg; el.style.display = 'block'; } termsContainer?.classList.add('input-error'); }
    function clearTermsError() { const el = document.getElementById('termsError'); if (el) { el.textContent = ''; el.style.display = ''; } termsContainer?.classList.remove('input-error'); }

    function clearAllErrors() {
      clearFieldError(fullNameEl, fullNameErr);
      clearFieldError(emailEl, emailErr);
      clearFieldError(passwordEl, passwordErr);
      clearFieldError(confirmEl, confirmErr);
      clearTermsError();
    }

    function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

    function score(pw) {
      let s = 0;
      if (pw.length >= POLICY.minLen) s++;
      if (/[A-Z]/.test(pw)) s++;
      if (/[a-z]/.test(pw)) s++;
      if (/\d|[^A-Za-z0-9]/.test(pw)) s++;
      return s;
    }
    function renderStrength(pw) {
      const sc = score(pw);
      const pct = [0, 25, 50, 75, 100][sc];
      if (strengthFill) strengthFill.style.width = `${pct}%`;
      if (strengthText) {
        const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
        strengthText.textContent = `Password strength: ${labels[sc]}`;
      }
    }

    function validatePassword(pw) {
      const missing = [];
      if (pw.length < POLICY.minLen) missing.push(`at least ${POLICY.minLen} characters`);
      if (POLICY.upper && !/[A-Z]/.test(pw)) missing.push('one uppercase letter (A–Z)');
      if (POLICY.lower && !/[a-z]/.test(pw)) missing.push('one lowercase letter (a–z)');
      if (POLICY.digitOrSym && !(/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw))) missing.push('a number or a symbol');
      return {
        ok: missing.length === 0,
        message: missing.length ? `Password must include ${missing.join(', ')}.` : '',
        parts: {
          len: pw.length >= POLICY.minLen,
          upper: /[A-Z]/.test(pw),
          lower: /[a-z]/.test(pw),
          digitOrSym: (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw))
        }
      };
    }

    let pwItems = null, pwReqsBox = null;
    function ensurePwChecklist() {
      if (!passwordEl) return;
      const group = passwordEl.closest('.form-group') || passwordEl.parentElement;
      if (!group) return;

      let existing = document.getElementById('pwReqs');
      if (!existing) {
        existing = document.createElement('div');
        existing.id = 'pwReqs';
        existing.className = 'pw-reqs';
        existing.style.display = 'none'; 
        existing.innerHTML = `
          <ul id="pwReqsList">
            <li data-k="len">At least ${POLICY.minLen} characters</li>
            <li data-k="upper">One uppercase letter (A–Z)</li>
            <li data-k="lower">One lowercase letter (a–z)</li>
            <li data-k="digitOrSym">A number or a symbol</li>
          </ul>`;
        group.appendChild(existing);
      }
      pwReqsBox = existing;
      const list = existing.querySelector('#pwReqsList');
      pwItems = {
        len: list.querySelector('li[data-k="len"]'),
        upper: list.querySelector('li[data-k="upper"]'),
        lower: list.querySelector('li[data-k="lower"]'),
        digitOrSym: list.querySelector('li[data-k="digitOrSym"]')
      };
    }
    ensurePwChecklist();

    function setItemState(li, ok) {
      if (!li) return;
      li.classList.toggle('ok', ok);
      li.classList.toggle('bad', !ok);
    }

    function updatePwChecklist(pw, { silent = false } = {}) {
      const v = validatePassword(pw);
      if (pwReqsBox) pwReqsBox.style.display = pw.length ? 'block' : 'none';
      if (pwItems) {
        setItemState(pwItems.len, v.parts.len);
        setItemState(pwItems.upper, v.parts.upper);
        setItemState(pwItems.lower, v.parts.lower);
        setItemState(pwItems.digitOrSym, v.parts.digitOrSym);
      }
      if (!silent) {
        if (!v.ok) setFieldError(passwordEl, passwordErr, v.message);
        else clearFieldError(passwordEl, passwordErr);
      }
    }

    async function signupRequest(fullName, email, password) {
      const payload = { User_name: fullName, Email: email, Password: password };
      const res = await fetch(SIGNUP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'omit'
      });
      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json().catch(() => ({})) : {};
      if (!res.ok) {
        const reason = data?.message || data?.error || res.statusText || 'Sign up failed';
        const err = new Error(reason);
        err.status = res.status;
        throw err;
      }
      return data;
    }

    passwordEl?.addEventListener('input', (e) => {
      const pw = e.target.value || '';
      renderStrength(pw);
      updatePwChecklist(pw, { silent: true }); 
      if (confirmEl?.value) {
        if (confirmEl.value !== pw) setFieldError(confirmEl, confirmErr, 'Passwords do not match.');
        else clearFieldError(confirmEl, confirmErr);
      }
    });

    confirmEl?.addEventListener('input', (e) => {
      const c = e.target.value || '';
      const pw = passwordEl?.value || '';
      if (c && pw && c !== pw) setFieldError(confirmEl, confirmErr, 'Passwords do not match.');
      else clearFieldError(confirmEl, confirmErr);
    });

    emailEl?.addEventListener('input', () => {
      const v = emailEl.value.trim();
      if (v && !isValidEmail(v)) setFieldError(emailEl, emailErr, 'Please enter a valid email.');
      else clearFieldError(emailEl, emailErr);
    });

    fullNameEl?.addEventListener('input', () => {
      if (fullNameEl.value.trim()) clearFieldError(fullNameEl, fullNameErr);
    });

    agreeEl?.addEventListener('change', () => { if (agreeEl.checked) clearTermsError(); });

    togglePassBtn?.addEventListener('click', () => {
      if (!passwordEl) return;
      const type = passwordEl.type === 'password' ? 'text' : 'password';
      passwordEl.type = type;
      togglePassBtn.classList.toggle('active', type === 'text');
    });
    toggleConfirmBtn?.addEventListener('click', () => {
      if (!confirmEl) return;
      const type = confirmEl.type === 'password' ? 'text' : 'password';
      confirmEl.type = type;
      toggleConfirmBtn.classList.toggle('active', type === 'text');
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAllErrors();

      const fullName = (fullNameEl?.value || '').trim();
      const email = (emailEl?.value || '').trim();
      const pw = passwordEl?.value || '';
      const c = confirmEl?.value || '';
      const agreed = !!agreeEl?.checked;

      const errs = [];

      if (!fullName) errs.push({ el: fullNameEl, err: fullNameErr, msg: 'Full name is required.' });
      if (!email) errs.push({ el: emailEl, err: emailErr, msg: 'Email is required.' });
      else if (!isValidEmail(email)) errs.push({ el: emailEl, err: emailErr, msg: 'Please enter a valid email.' });

      if (!pw) errs.push({ el: passwordEl, err: passwordErr, msg: 'Password is required.' });
      else {
        updatePwChecklist(pw, { silent: false });
        const v = validatePassword(pw);
        if (!v.ok) errs.push({ el: passwordEl, err: passwordErr, msg: v.message });
      }

      if (!c) errs.push({ el: confirmEl, err: confirmErr, msg: 'Please confirm your password.' });
      else if (c !== pw) errs.push({ el: confirmEl, err: confirmErr, msg: 'Passwords do not match.' });

      if (!agreed) {
        setTermsError('You must agree to continue.');
        errs.push({ el: agreeEl, err: document.getElementById('termsError'), msg: 'You must agree to continue.' });
      }

      if (errs.length) {
        errs.forEach(({ el, err, msg }) => el === agreeEl ? setTermsError(msg) : setFieldError(el, err, msg));
        const first = errs[0];
        first?.el?.focus?.();
        first?.el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
        showToast('Please fix the highlighted fields.', false);
        return;
      }

      try {
        setBusy(true);
        await signupRequest(fullName, email, pw);
        try { localStorage.setItem('rememberEmail', email); localStorage.setItem('rememberMe', '1'); } catch { }
        showToast('Account created. Redirecting to sign in…', true);
        setTimeout(() => { window.location.href = REDIRECT_AFTER; }, 800);
      } catch (err) {
        const msg = err?.message || 'Sign up failed.';
        showToast(msg, false);
        if (err?.status === 409 || /exist|unique|taken/i.test(msg)) {
          setFieldError(emailEl, emailErr, 'This email is already registered.');
        } else if (/email/i.test(msg)) {
          setFieldError(emailEl, emailErr, msg);
        } else if (/password/i.test(msg)) {
          setFieldError(passwordEl, passwordErr, msg);
        }
      } finally {
        setBusy(false);
      }
    });

  });
})();
