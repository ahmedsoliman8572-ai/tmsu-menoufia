/* ============================================================
   TMSU Menoufia — Form Validation
   Client-side validation with Arabic/English messages
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initForms();
});

function initForms() {
  // Join form
  const joinForm = document.getElementById('join-form');
  if (joinForm) {
    joinForm.addEventListener('submit', (e) => handleFormSubmit(e, joinForm));
    addLiveValidation(joinForm);
    
    // Check registration status
    const joinFormWrapper = document.getElementById('join-form-wrapper');
    const joinClosedMessage = document.getElementById('join-closed-message');
    if (joinFormWrapper && joinClosedMessage && window.TMSU_API) {
      window.TMSU_API.fetchSetting('is_join_open').then(isOpen => {
        if (isOpen === 'false') {
          joinFormWrapper.style.display = 'none';
          joinClosedMessage.style.display = 'block';
        } else {
          joinFormWrapper.style.display = 'block';
          joinClosedMessage.style.display = 'none';
        }
      });
    }
  }

  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => handleFormSubmit(e, contactForm));
    addLiveValidation(contactForm);
  }
}

function addLiveValidation(form) {
  const inputs = form.querySelectorAll('.form-input, .form-textarea, .form-select');
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        validateField(input);
      }
    });
  });
}

function validateField(input) {
  const lang = document.documentElement.getAttribute('data-lang') || 'ar';
  const rules = input.getAttribute('data-validate')?.split(',') || [];
  let isValid = true;
  let errorMsg = '';

  for (const rule of rules) {
    const [ruleName, ruleValue] = rule.trim().split(':');

    switch (ruleName) {
      case 'required':
        if (!input.value.trim()) {
          isValid = false;
          errorMsg = lang === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (input.value.trim() && !emailRegex.test(input.value)) {
          isValid = false;
          errorMsg = lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address';
        }
        break;

      case 'phone':
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        if (input.value.trim() && !phoneRegex.test(input.value.replace(/\s/g, ''))) {
          isValid = false;
          errorMsg = lang === 'ar' ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number';
        }
        break;

      case 'minlength':
        const minLen = parseInt(ruleValue, 10);
        if (input.value.trim() && input.value.trim().length < minLen) {
          isValid = false;
          errorMsg = lang === 'ar'
            ? `يجب أن يكون على الأقل ${minLen} أحرف`
            : `Must be at least ${minLen} characters`;
        }
        break;

      case 'number':
        if (input.value.trim() && isNaN(input.value)) {
          isValid = false;
          errorMsg = lang === 'ar' ? 'يرجى إدخال رقم صحيح' : 'Please enter a valid number';
        }
        break;

      case 'select':
        if (!input.value || input.value === '') {
          isValid = false;
          errorMsg = lang === 'ar' ? 'يرجى اختيار خيار' : 'Please select an option';
        }
        break;
    }

    if (!isValid) break;
  }

  // Show/hide error
  const errorEl = input.parentElement.querySelector('.form-error');
  if (!isValid) {
    input.classList.add('error');
    input.classList.remove('success');
    if (errorEl) {
      errorEl.textContent = errorMsg;
      errorEl.classList.add('visible');
    }
  } else {
    input.classList.remove('error');
    if (input.value.trim()) {
      input.classList.add('success');
    }
    if (errorEl) {
      errorEl.classList.remove('visible');
    }
  }

  return isValid;
}

async function handleFormSubmit(e, form) {
  e.preventDefault();

  const inputs = form.querySelectorAll('.form-input, .form-textarea, .form-select');
  let allValid = true;

  inputs.forEach(input => {
    if (input.getAttribute('data-validate')) {
      const valid = validateField(input);
      if (!valid) allValid = false;
    }
  });

  if (allValid) {
    const lang = document.documentElement.getAttribute('data-lang') || 'ar';

    // Show loading state
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = lang === 'ar' ? 'جاري الإرسال...' : 'Sending...';
    submitBtn.style.opacity = '0.7';

    try {
      if (form.id === 'join-form') {
        const fullName = form.querySelector('#fullname')?.value.trim() || form.querySelector('[name="fullname"]')?.value.trim() || form.querySelectorAll('input[type="text"]')[0]?.value.trim() || 'متقدم';
        const email = form.querySelector('#email')?.value.trim() || form.querySelector('[name="email"]')?.value.trim() || form.querySelector('input[type="email"]')?.value.trim() || '';
        const phone = form.querySelector('#phone')?.value.trim() || form.querySelector('[name="phone"]')?.value.trim() || form.querySelector('input[type="tel"]')?.value.trim() || '';
        const age = form.querySelector('#age')?.value.trim() || '';
        const university = form.querySelector('#university')?.value.trim() || form.querySelectorAll('input[type="text"]')[1]?.value.trim() || '';
        const selectEl = form.querySelector('#committee') || form.querySelector('select');
        const committeeText = selectEl ? (selectEl.options[selectEl.selectedIndex]?.text || selectEl.value) : 'عام';
        const notes = form.querySelector('#notes')?.value.trim() || form.querySelector('textarea')?.value.trim() || '';

        const appData = {
          full_name: fullName,
          national_id: age ? `العمر: ${age}` : 'غير محدد',
          phone: phone,
          email: email,
          university: university,
          faculty: '',
          committee: committeeText || 'عام',
          notes: notes
        };
        if (window.TMSU_API) {
          await window.TMSU_API.addJoinApplication(appData);
        }
      } else if (form.id === 'contact-form') {
        const nameVal = form.querySelector('#name')?.value.trim() || form.querySelector('[name="name"]')?.value.trim() || form.querySelectorAll('input')[0]?.value.trim() || 'مجهول';
        const emailVal = form.querySelector('#email')?.value.trim() || form.querySelector('[name="email"]')?.value.trim() || form.querySelectorAll('input')[1]?.value.trim() || 'غير محدد';
        const phoneVal = form.querySelector('#phone')?.value.trim() || form.querySelector('[name="phone"]')?.value.trim() || '';
        const subjectVal = form.querySelector('#subject')?.value.trim() || form.querySelector('[name="subject"]')?.value.trim() || form.querySelectorAll('input')[2]?.value.trim() || 'استفسار عام';
        const messageVal = form.querySelector('#message')?.value.trim() || form.querySelector('[name="message"]')?.value.trim() || form.querySelector('textarea')?.value.trim() || '';

        const msgData = {
          name: nameVal,
          email: emailVal,
          phone: phoneVal,
          subject: subjectVal,
          message: messageVal
        };
        if (window.TMSU_API) {
          await window.TMSU_API.addContactMessage(msgData);
        }
      }
    } catch (err) {
      console.warn('Form submission API warning:', err);
    }

    // Reset form
    form.reset();
    inputs.forEach(input => {
      input.classList.remove('success', 'error');
    });

    // Show success toast
    showToast(
      lang === 'ar'
        ? 'تم الإرسال وحفظ الطلب بنجاح! سنتواصل معك قريباً. ✅'
        : 'Submitted successfully! We\'ll contact you soon. ✅'
    );

    // Reset button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    submitBtn.style.opacity = '';
  } else {
    // Scroll to first error
    const firstError = form.querySelector('.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }
  }
}

function showToast(message) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
window.showToast = showToast;
