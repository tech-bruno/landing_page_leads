/**
 * ================================================================
 * LEGADO CONSTRUÍDO — Landing Page
 * script.js
 *
 * Funcionalidades:
 *  1. Navbar — efeito de scroll e menu mobile
 *  2. Scroll suave para âncoras
 *  3. Animações de entrada (Intersection Observer)
 *  4. Validação e envio do formulário de leads
 *  5. Máscara de telefone
 *  6. Botão flutuante WhatsApp
 *  7. Animação das barras do card visual
 * ================================================================
 */

/* ----------------------------------------------------------------
   Utilitários
---------------------------------------------------------------- */

/**
 * Seleciona um elemento pelo seletor CSS.
 * @param {string} sel
 * @param {Document|Element} ctx
 * @returns {Element|null}
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/**
 * Seleciona todos os elementos pelo seletor CSS.
 * @param {string} sel
 * @param {Document|Element} ctx
 * @returns {NodeList}
 */
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);


/* ================================================================
   1. NAVBAR — Efeito de scroll + menu mobile
================================================================ */
(function initNavbar() {
  const navbar     = $('#navbar');
  const navToggle  = $('#navToggle');
  const navMobile  = $('#navMobile');
  const mobileLinks = $$('.mobile-link');

  if (!navbar) return;

  // Adiciona classe 'scrolled' quando o usuário rola a página
  const handleScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Executa na carga caso a página já esteja rolada

  // Toggle do menu mobile
  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMobile.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      // Acessibilidade: atualiza aria
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Fecha o menu ao clicar em um link mobile
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMobile.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();


/* ================================================================
   2. SCROLL SUAVE para links âncora
   (Complementa o scroll-behavior: smooth do CSS, garante
    compatibilidade com browsers mais antigos e compensa o
    header fixo)
================================================================ */
(function initSmoothScroll() {
  const NAVBAR_HEIGHT = 72; // altura do navbar em px

  document.addEventListener('click', (e) => {
    // Verifica se o clique foi em um link com âncora
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (href === '#') return; // ignora links "#" vazios

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


/* ================================================================
   3. ANIMAÇÕES DE ENTRADA — Intersection Observer
   Elementos com classe .reveal são animados quando entram
   na viewport
================================================================ */
(function initReveal() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Para de observar após a animação (performance)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,        // aciona quando 12% do elemento fica visível
      rootMargin: '0px 0px -40px 0px' // margem para antecipar levemente
    }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ================================================================
   4. ANIMAÇÃO DAS BARRAS DO CARD VISUAL
   Espera o card entrar na viewport para animar as barras
================================================================ */
(function initBarAnimation() {
  const card = $('.visual-card');
  if (!card) return;

  // Salva as larguras originais e reseta para 0
  const bars = $$('.vc-bar-fill', card);
  const originalWidths = [];

  bars.forEach(bar => {
    originalWidths.push(bar.style.width);
    bar.style.width = '0%';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        // Anima as barras com delay escalonado
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


/* ================================================================
   5. BOTÃO FLUTUANTE WHATSAPP — aparece após rolar 400px
================================================================ */
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


/* ================================================================
   6. MÁSCARA DE TELEFONE
   Formata automaticamente enquanto o usuário digita:
   (XX) XXXXX-XXXX
================================================================ */
(function initPhoneMask() {
  const phoneInput = $('#telefone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, ''); // remove tudo que não é dígito

    // Limita a 11 dígitos
    value = value.slice(0, 11);

    // Aplica a máscara progressivamente
    if (value.length > 10) {
      // Celular: (XX) XXXXX-XXXX
      value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (value.length > 6) {
      // Parcial: (XX) XXXXX-...
      value = value.replace(/^(\d{2})(\d{5})(\d+)$/, '($1) $2-$3');
    } else if (value.length > 2) {
      // Parcial: (XX) ...
      value = value.replace(/^(\d{2})(\d+)$/, '($1) $2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d+)$/, '($1');
    }

    e.target.value = value;
  });
})();


/* ================================================================
   7. VALIDAÇÃO E ENVIO DO FORMULÁRIO
================================================================ */
(function initForm() {
  const form       = $('#leadForm');
  const submitBtn  = $('#submitBtn');
  const formSuccess = $('#formSuccess');

  if (!form) return;

  /* ------ Funções auxiliares de validação ------ */

  /**
   * Valida um campo individual e exibe/esconde a mensagem de erro.
   * @param {HTMLInputElement} input - O elemento input
   * @param {Function} validator - Função que retorna string de erro ou ''
   * @returns {boolean} true se válido
   */
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

  // Regras de validação para cada campo
  const validators = {
    nome: (val) => {
      if (!val) return 'Por favor, informe seu nome.';
      if (val.length < 3) return 'Nome deve ter pelo menos 3 caracteres.';
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(val)) return 'Nome inválido.';
      return '';
    },
    email: (val) => {
      if (!val) return 'Por favor, informe seu e-mail.';
      // Regex simples mas eficaz para e-mail
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

  /* ------ Validação em tempo real (blur) ------ */
  Object.keys(validators).forEach(id => {
    const input = $(`#${id}`);
    if (!input) return;

    // Valida ao perder o foco
    input.addEventListener('blur', () => {
      validateField(input, validators[id]);
    });

    // Remove o erro enquanto digita (após já ter sido mostrado)
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        validateField(input, validators[id]);
      }
    });
  });

  /* ------ Envio do formulário ------ */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Valida todos os campos ao submeter
    const nomeInput     = $('#nome');
    const emailInput    = $('#email');
    const telefoneInput = $('#telefone');

    const isNomeValid     = validateField(nomeInput,     validators.nome);
    const isEmailValid    = validateField(emailInput,    validators.email);
    const isTelefoneValid = validateField(telefoneInput, validators.telefone);

    // Para se houver erros
    if (!isNomeValid || !isEmailValid || !isTelefoneValid) {
      // Foca no primeiro campo inválido
      const firstError = form.querySelector('input.error');
      if (firstError) firstError.focus();
      return;
    }

    // ---- Estado de loading ----
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Coleta os dados do formulário
    const formData = {
      nome:      nomeInput.value.trim(),
      email:     emailInput.value.trim(),
      telefone:  telefoneInput.value.trim(),
      timestamp: new Date().toISOString(),
      origem:    window.location.href
    };

    // Log dos dados (em produção, substitua por envio real para API/CRM)
    console.log('📋 Lead capturado:', formData);

    try {
      /*
       * =========================================================
       * INTEGRAÇÃO COM BACKEND / CRM
       * =========================================================
       * Substitua o bloco abaixo pela integração real.
       *
       * Exemplos de uso:
       *
       * 1. API própria:
       *    await fetch('/api/leads', {
       *      method: 'POST',
       *      headers: { 'Content-Type': 'application/json' },
       *      body: JSON.stringify(formData)
       *    });
       *
       * 2. Google Sheets (via Apps Script):
       *    await fetch('SUA_URL_DO_APPS_SCRIPT', {
       *      method: 'POST',
       *      body: JSON.stringify(formData)
       *    });
       *
       * 3. ActiveCampaign / HubSpot / RD Station:
       *    Consulte a documentação do seu CRM para o endpoint correto.
       * =========================================================
       */

      // Simulação de requisição assíncrona (1.5 segundos)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // ---- Exibe mensagem de sucesso ----
      showSuccess();

    } catch (error) {
      // Trata erros de envio
      console.error('Erro ao enviar lead:', error);
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      // Exibe mensagem de erro genérica
      showFormError('Ocorreu um erro ao enviar. Tente novamente ou entre em contato pelo WhatsApp.');
    }
  });

  /**
   * Exibe a mensagem de sucesso e esconde o formulário.
   */
  function showSuccess() {
    // Esconde o formulário com animação
    form.style.opacity = '0';
    form.style.transform = 'translateY(-10px)';
    form.style.transition = 'opacity 0.3s, transform 0.3s';

    setTimeout(() => {
      form.style.display = 'none';

      // Exibe o card de sucesso
      formSuccess.classList.add('visible');
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }

  /**
   * Exibe uma mensagem de erro geral no formulário.
   * @param {string} message
   */
  function showFormError(message) {
    // Remove erro anterior se existir
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

    // Insere antes do botão
    submitBtn.parentNode.insertBefore(errorDiv, submitBtn);
  }
})();


/* ================================================================
   8. HIGHLIGHT DE LINK ATIVO NA NAVBAR conforme scroll
================================================================ */
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
