
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

(function initNavbar() {
  const navbar     = $('#navbar');
  const navToggle  = $('#navToggle');
  const navMobile  = $('#navMobile');
  const mobileLinks = $$('.mobile-link');

  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMobile.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      // Acessibilidade: atualiza aria
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMobile.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();

(function initSmoothScroll() {
  const NAVBAR_HEIGHT = 72; 

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (href === '#') return; 

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;

    window.scrollTo({
      top,
      behavior: 'smooth'
    });
  });
})();

(function initReveal() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,  
      rootMargin: '0px 0px -40px 0px' 
    }
  );

  elements.forEach(el => observer.observe(el));
})();

(function initBarAnimation() {
  const card = $('.visual-card');
  if (!card) return;

  const bars = $$('.vc-bar-fill', card);
  const originalWidths = [];

  bars.forEach(bar => {
    originalWidths.push(bar.style.width);
    bar.style.width = '0%';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        bars.forEach((bar, i) => {
          setTimeout(() => {
            bar.style.width = originalWidths[i];
          }, i * 250 + 300);
        });
        observer.unobserve(card);
      }
    },
    { threshold: 0.3 }
  );

  observer.observe(card);
})();

(function initWhatsappFloat() {
  const btn = $('#whatsappBtn');
  if (!btn) return;

  const toggleVisibility = () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();
})();

(function initPhoneMask() {
  const phoneInput = $('#telefone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, ''); 

    value = value.slice(0, 11);

    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{5})(\d+)$/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d+)$/, '($1) $2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d+)$/, '($1');
    }

    e.target.value = value;
  });
})();

(function initForm() {
  const form       = $('#leadForm');
  const submitBtn  = $('#submitBtn');
  const formSuccess = $('#formSuccess');

  if (!form) return;
  const validateField = (input, validator) => {
    const errorEl = $(`#erro-${input.id}`);
    const message = validator(input.value.trim());

    if (message) {
      input.classList.add('error');
      if (errorEl) errorEl.textContent = message;
      return false;
    } else {
      input.classList.remove('error');
      if (errorEl) errorEl.textContent = '';
      return true;
    }
  };
  const validators = {
    nome: (val) => {
      if (!val) return 'Por favor, informe seu nome.';
      if (val.length < 3) return 'Nome deve ter pelo menos 3 caracteres.';
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(val)) return 'Nome inválido.';
      return '';
    },
    email: (val) => {
      if (!val) return 'Por favor, informe seu e-mail.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'E-mail inválido.';
      return '';
    },
    telefone: (val) => {
      const digits = val.replace(/\D/g, '');
      if (!digits) return 'Por favor, informe seu telefone.';
      if (digits.length < 10) return 'Telefone inválido. Use o formato (XX) XXXXX-XXXX.';
      return '';
    }
  };
  Object.keys(validators).forEach(id => {
    const input = $(`#${id}`);
    if (!input) return;
    input.addEventListener('blur', () => {
      validateField(input, validators[id]);
    });
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        validateField(input, validators[id]);
      }
    });
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nomeInput     = $('#nome');
    const emailInput    = $('#email');
    const telefoneInput = $('#telefone');

    const isNomeValid     = validateField(nomeInput,     validators.nome);
    const isEmailValid    = validateField(emailInput,    validators.email);
    const isTelefoneValid = validateField(telefoneInput, validators.telefone);

    if (!isNomeValid || !isEmailValid || !isTelefoneValid) {
      const firstError = form.querySelector('input.error');
      if (firstError) firstError.focus();
      return;
    }
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const formData = {
      nome:      nomeInput.value.trim(),
      email:     emailInput.value.trim(),
      telefone:  telefoneInput.value.trim(),
      timestamp: new Date().toISOString(),
      origem:    window.location.href
    };

    console.log('📋 Lead capturado:', formData);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showSuccess();

    } catch (error) {
      console.error('Erro ao enviar lead:', error);
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      showFormError('Ocorreu um erro ao enviar. Tente novamente ou entre em contato pelo WhatsApp.');
    }
  });
  function showSuccess() {
    form.style.opacity = '0';
    form.style.transform = 'translateY(-10px)';
    form.style.transition = 'opacity 0.3s, transform 0.3s';

    setTimeout(() => {
      form.style.display = 'none';
      formSuccess.classList.add('visible');
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }

  function showFormError(message) {
    const oldError = $('#form-global-error');
    if (oldError) oldError.remove();

    const errorDiv = document.createElement('p');
    errorDiv.id = 'form-global-error';
    errorDiv.style.cssText = `
      color: #e05555;
      font-size: 0.82rem;
      text-align: center;
      padding: 0.5rem;
      background: rgba(224,85,85,0.06);
      border-radius: 6px;
      margin-bottom: 0.5rem;
    `;
    errorDiv.textContent = message;
    submitBtn.parentNode.insertBefore(errorDiv, submitBtn);
  }
})();

(function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks  = $$('.nav-links a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const OFFSET = 100;

  const setActive = () => {
    const scrollY = window.scrollY;

    sections.forEach(section => {
      const top    = section.offsetTop - OFFSET;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');

      if (scrollY >= top && scrollY < bottom) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${id}`
          );
        });
      }
    });
  };

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
})();
