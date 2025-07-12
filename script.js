
document.addEventListener('DOMContentLoaded', () => {

    // --- Part 1: Dark Mode Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark-mode');
            const currentTheme = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
        });
    }

    // --- Part 2: Modal Interactivity with Dynamic Fields ---
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
        const plansSection = document.getElementById('plans');
        const closeBtn = paymentModal.querySelector('.close-button');
        const form = document.getElementById('payment-form');
        const modalTitle = document.getElementById('modal-title');
        const planNameInput = document.getElementById('form-plan-name');
        const formSubjectInput = document.getElementById('form-subject');
        const qrCodeImage = document.getElementById('qr-code-image');
        const qrAmount = document.getElementById('qr-amount');
        const modalFeaturesContainer = document.getElementById('modal-features');
        const gstinContainer = document.getElementById('gstin-container');
        const auditorContainer = document.getElementById('auditor-container');
        const successMessage = document.getElementById('success-message');
        const modalMainContent = document.getElementById('modal-main-content');

        const setupDynamicFields = (fieldsToShow) => {
            const gstinInputs = gstinContainer.querySelectorAll('input');
            const auditorInputs = auditorContainer.querySelectorAll('input, select');
            gstinContainer.style.display = 'none';
            gstinInputs.forEach(input => input.removeAttribute('required'));
            auditorContainer.style.display = 'none';
            auditorInputs.forEach(input => input.removeAttribute('required'));
            if (fieldsToShow === 'gstin') {
                gstinContainer.style.display = 'block';
                gstinInputs.forEach(input => input.setAttribute('required', 'true'));
            } else if (fieldsToShow === 'auditor') {
                auditorContainer.style.display = 'block';
                auditorInputs.forEach(input => input.setAttribute('required', 'true'));
            }
        };
        
        plansSection.addEventListener('click', (e) => {
            const purchaseButton = e.target.closest('.purchase-btn');
            if (!purchaseButton) return;

            const plan = purchaseButton.dataset.plan;
            const amount = purchaseButton.dataset.amount;
            const qrImg = purchaseButton.dataset.qr;
            const fields = purchaseButton.dataset.fields;
            
            modalTitle.textContent = 'Purchase: ' + plan;
            planNameInput.value = plan;
            qrCodeImage.src = qrImg;
            qrAmount.textContent = amount;
            setupDynamicFields(fields);
            
            const planCard = purchaseButton.closest('.plan-card');
            const featureListElement = planCard.querySelector('.feature-list');
            if (featureListElement && modalFeaturesContainer) {
                modalFeaturesContainer.innerHTML = `<h4 class="features-title">Your Plan Includes:</h4>${featureListElement.outerHTML}`;
            } else {
                 modalFeaturesContainer.innerHTML = '';
            }

            successMessage.style.display = 'none';
            modalMainContent.style.display = 'block';
            form.reset(); 
            paymentModal.style.display = 'block';
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitButton = form.querySelector('button[type="submit"]');
            const customerName = form.querySelector('[name="fullName"]').value;
            const planName = planNameInput.value;
            if (customerName && planName) {
                formSubjectInput.value = `New Order: ${planName} from ${customerName}`;
            }
            const formData = new FormData(form);
            submitButton.disabled = true; submitButton.textContent = 'Submitting...';
            fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
            .then(response => response.json()).then(data => {
                if (data.success) {
                    modalMainContent.style.display = 'none';
                    successMessage.style.display = 'block';
                } else { console.error('Submission Error:', data); alert('Submission failed.'); }
            }).catch(error => { console.error('Network Error:', error); alert('A network error occurred.');
            }).finally(() => { submitButton.disabled = false; submitButton.textContent = 'Submit & Verify Payment'; });
        });

        const closeModal = () => { paymentModal.style.display = 'none'; };
        closeBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (event) => { if (event.target == paymentModal) closeModal(); });
    }

    // --- Part 3: Dynamic Plan Duration Toggles ---
    const durationGrids = document.querySelectorAll('.duration-grid');
    durationGrids.forEach(grid => {
        grid.addEventListener('click', (e) => {
            const clickedButton = e.target.closest('.duration-btn');
            if (!clickedButton || clickedButton.classList.contains('active')) return;

            const groupButtons = grid.querySelectorAll('.duration-btn');
            groupButtons.forEach(btn => btn.classList.remove('active'));
            clickedButton.classList.add('active');

            const planCard = clickedButton.closest('.plan-card');
            const priceElement = planCard.querySelector('.price');
            const featureList = planCard.querySelector('.feature-list');
            const purchaseButton = planCard.querySelector('.purchase-btn');
            const basePlanName = planCard.querySelector('h3').dataset.basePlanName;

            const newPriceText = clickedButton.dataset.price;
            const newAmount = clickedButton.dataset.amount;
            const planSuffix = clickedButton.dataset.planSuffix;
            const features = clickedButton.dataset.features.split('|');

            priceElement.style.opacity = '0';
            featureList.style.opacity = '0';

            setTimeout(() => {
                priceElement.textContent = newPriceText;
                purchaseButton.dataset.plan = basePlanName + planSuffix;
                purchaseButton.dataset.amount = newAmount;
                featureList.innerHTML = '';
                features.forEach(featureText => {
                    const li = document.createElement('li');
                    li.innerHTML = `<i class="fa-solid fa-check"></i>${featureText}`;
                    featureList.appendChild(li);
                });
                priceElement.style.opacity = '1';
                featureList.style.opacity = '1';
            }, 150);
        });
    });

    // --- Part 4: Mobile Navigation Sidebar ---
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.getElementById('overlay');
    const navLinks = document.querySelectorAll('#nav-menu .nav-link');
    
    if (menuToggle && navMenu && menuClose && overlay) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.add('active');
            overlay.classList.add('active');
        });

        const closeMenu = () => {
            navMenu.classList.remove('active');
            overlay.classList.remove('active');
        };

        menuClose.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = e.target.getAttribute('href');
                // Only prevent default and scroll smoothly for internal anchor links
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    closeMenu();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }

    // --- Part 5: Fade-In Animation on Scroll ---
    const fadeElems = document.querySelectorAll('.fade-in');
    const fadeInObserver = new IntersectionObserver((entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); }, { threshold: 0.1 });
    fadeElems.forEach(el => fadeInObserver.observe(el));

    // --- Part 6: Active Navigation Link on Scroll ---
    const sections = document.querySelectorAll('main section[id]');
    const desktopNavLinks = document.querySelectorAll('header nav ul > li a.nav-link[href^="#"]');
    
    // Set up smooth scroll for desktop nav links
    desktopNavLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.id;
                document.querySelectorAll('a.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if(link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: '-40% 0px -60% 0px' });
    sections.forEach(section => navObserver.observe(section));

    // --- Part 7: Chatbot Logic ---
    const chatbot = document.querySelector('.chatbot');
    const chatbotToggler = document.querySelector('.chatbot-toggler');
    if(chatbot && chatbotToggler) {
        const chatbotCloseBtn = chatbot.querySelector('.chatbot-close-btn');
        const chatWindow = chatbot.querySelector('.chat-window');
        const chatbotInputContainer = chatbot.querySelector('.chatbot-input');

        const predefinedResponses = {
            "what_we_do": "We are an authorised Tally partner in Pune providing sales, implementation, support, corporate training, and customization for Tally Prime.",
            "why_tss": "TSS (Tally Software Services) is crucial. It gives you all the latest product updates, including new tax and GST compliance rules. It also unlocks powerful features like secure remote access to your business data from anywhere, on any device, and lets you access integrated e-waybill and e-invoicing services directly from Tally.",
            "plans": "We offer perpetual (lifetime) licenses and rentals for TallyPrime Silver & Gold, alongside dedicated plans for TallyPrime Server and various TSS renewal options.",
            "contact": "You can call us at +91 98765 43210 or email sales@tirupatitally.com for a detailed consultation."
        };
        const initialQuestions = [
            { text: "What services do you offer?", key: "what_we_do" },
            { text: "Why is TSS renewal important?", key: "why_tss" },
            { text: "Can you describe your plans?", key: "plans" },
            { text: "How can I contact your team?", key: "contact" }
        ];

        const addMessage = (message, sender) => { const li = document.createElement('li'); li.classList.add('chat-message', sender); li.textContent = message; chatWindow.appendChild(li); chatWindow.scrollTop = chatWindow.scrollHeight; };
        const showInitialQuestions = () => { chatbotInputContainer.innerHTML = ''; initialQuestions.forEach(q => { const btn = document.createElement('button'); btn.classList.add('question-btn'); btn.textContent = q.text; btn.dataset.key = q.key; chatbotInputContainer.appendChild(btn); }); };
        const handleQuestionSelect = (target) => { const key = target.dataset.key; const userMessage = target.textContent; addMessage(userMessage, 'user'); chatbotInputContainer.innerHTML = ''; setTimeout(() => { const typingLi = document.createElement('li'); typingLi.classList.add('chat-message', 'bot', 'typing'); typingLi.textContent = 'Typing...'; chatWindow.appendChild(typingLi); chatWindow.scrollTop = chatWindow.scrollHeight; setTimeout(() => { typingLi.remove(); addMessage(predefinedResponses[key], 'bot'); const restartBtn = document.createElement('button'); restartBtn.textContent = 'Ask Another Question'; restartBtn.classList.add('question-btn', 'restart-btn'); restartBtn.dataset.action = 'restart'; chatbotInputContainer.appendChild(restartBtn); }, 1200); }, 500); };
        chatbotInputContainer.addEventListener('click', (e) => { const target = e.target; if (target.dataset.action === 'restart') { showInitialQuestions(); } else if (target.classList.contains('question-btn')) { handleQuestionSelect(target); } });
        chatbotToggler.addEventListener('click', () => { chatbot.classList.toggle('active'); if (chatbot.classList.contains('active') && chatbotInputContainer.innerHTML.trim() === '') { showInitialQuestions(); } });
        chatbotCloseBtn.addEventListener('click', () => chatbot.classList.remove('active'));
    }

    // Force page to load at the very top
    history.scrollRestoration = 'manual';
    window.scrollTo(0,0);
});
document.addEventListener('DOMContentLoaded', () => {

    // --- Part 1: Dark Mode Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark-mode');
            const currentTheme = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
        });
    }

    // --- Part 2: Modal Interactivity with Dynamic Fields ---
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
        const plansSection = document.getElementById('plans');
        const closeBtn = paymentModal.querySelector('.close-button');
        const form = document.getElementById('payment-form');
        const modalTitle = document.getElementById('modal-title');
        const planNameInput = document.getElementById('form-plan-name');
        const formSubjectInput = document.getElementById('form-subject');
        const qrCodeImage = document.getElementById('qr-code-image');
        const qrAmount = document.getElementById('qr-amount');
        const modalFeaturesContainer = document.getElementById('modal-features');
        const gstinContainer = document.getElementById('gstin-container');
        const auditorContainer = document.getElementById('auditor-container');
        const successMessage = document.getElementById('success-message');
        const modalMainContent = document.getElementById('modal-main-content');

        const setupDynamicFields = (fieldsToShow) => {
            const gstinInputs = gstinContainer.querySelectorAll('input');
            const auditorInputs = auditorContainer.querySelectorAll('input, select');
            gstinContainer.style.display = 'none';
            gstinInputs.forEach(input => input.removeAttribute('required'));
            auditorContainer.style.display = 'none';
            auditorInputs.forEach(input => input.removeAttribute('required'));
            if (fieldsToShow === 'gstin') {
                gstinContainer.style.display = 'block';
                gstinInputs.forEach(input => input.setAttribute('required', 'true'));
            } else if (fieldsToShow === 'auditor') {
                auditorContainer.style.display = 'block';
                auditorInputs.forEach(input => input.setAttribute('required', 'true'));
            }
        };
        
        plansSection.addEventListener('click', (e) => {
            const purchaseButton = e.target.closest('.purchase-btn');
            if (!purchaseButton) return;

            const plan = purchaseButton.dataset.plan;
            const amount = purchaseButton.dataset.amount;
            const qrImg = purchaseButton.dataset.qr;
            const fields = purchaseButton.dataset.fields;
            
            modalTitle.textContent = 'Purchase: ' + plan;
            planNameInput.value = plan;
            qrCodeImage.src = qrImg;
            qrAmount.textContent = amount;
            setupDynamicFields(fields);
            
            const planCard = purchaseButton.closest('.plan-card');
            const featureListElement = planCard.querySelector('.feature-list');
            if (featureListElement && modalFeaturesContainer) {
                modalFeaturesContainer.innerHTML = `<h4 class="features-title">Your Plan Includes:</h4>${featureListElement.outerHTML}`;
            } else {
                 modalFeaturesContainer.innerHTML = '';
            }

            successMessage.style.display = 'none';
            modalMainContent.style.display = 'block';
            form.reset(); 
            paymentModal.style.display = 'block';
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitButton = form.querySelector('button[type="submit"]');
            const customerName = form.querySelector('[name="fullName"]').value;
            const planName = planNameInput.value;
            if (customerName && planName) {
                formSubjectInput.value = `New Order: ${planName} from ${customerName}`;
            }
            const formData = new FormData(form);
            submitButton.disabled = true; submitButton.textContent = 'Submitting...';
            fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
            .then(response => response.json()).then(data => {
                if (data.success) {
                    modalMainContent.style.display = 'none';
                    successMessage.style.display = 'block';
                } else { console.error('Submission Error:', data); alert('Submission failed.'); }
            }).catch(error => { console.error('Network Error:', error); alert('A network error occurred.');
            }).finally(() => { submitButton.disabled = false; submitButton.textContent = 'Submit & Verify Payment'; });
        });

        const closeModal = () => { paymentModal.style.display = 'none'; };
        closeBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (event) => { if (event.target == paymentModal) closeModal(); });
    }

    // --- Part 3: Dynamic Plan Duration Toggles ---
    const durationGrids = document.querySelectorAll('.duration-grid');
    durationGrids.forEach(grid => {
        grid.addEventListener('click', (e) => {
            const clickedButton = e.target.closest('.duration-btn');
            if (!clickedButton || clickedButton.classList.contains('active')) return;

            const groupButtons = grid.querySelectorAll('.duration-btn');
            groupButtons.forEach(btn => btn.classList.remove('active'));
            clickedButton.classList.add('active');

            const planCard = clickedButton.closest('.plan-card');
            const priceElement = planCard.querySelector('.price');
            const featureList = planCard.querySelector('.feature-list');
            const purchaseButton = planCard.querySelector('.purchase-btn');
            const basePlanName = planCard.querySelector('h3').dataset.basePlanName;

            const newPriceText = clickedButton.dataset.price;
            const newAmount = clickedButton.dataset.amount;
            const planSuffix = clickedButton.dataset.planSuffix;
            const features = clickedButton.dataset.features.split('|');

            priceElement.style.opacity = '0';
            featureList.style.opacity = '0';

            setTimeout(() => {
                priceElement.textContent = newPriceText;
                purchaseButton.dataset.plan = basePlanName + planSuffix;
                purchaseButton.dataset.amount = newAmount;
                featureList.innerHTML = '';
                features.forEach(featureText => {
                    const li = document.createElement('li');
                    li.innerHTML = `<i class="fa-solid fa-check"></i>${featureText}`;
                    featureList.appendChild(li);
                });
                priceElement.style.opacity = '1';
                featureList.style.opacity = '1';
            }, 150);
        });
    });

    // --- Part 4: Mobile Navigation Sidebar ---
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.getElementById('overlay');
    const navLinks = document.querySelectorAll('#nav-menu .nav-link');
    
    if (menuToggle && navMenu && menuClose && overlay) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.add('active');
            overlay.classList.add('active');
        });

        const closeMenu = () => {
            navMenu.classList.remove('active');
            overlay.classList.remove('active');
        };

        menuClose.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = e.target.getAttribute('href');
                // Only prevent default and scroll smoothly for internal anchor links
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    closeMenu();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }

    // --- Part 5: Fade-In Animation on Scroll ---
    const fadeElems = document.querySelectorAll('.fade-in');
    const fadeInObserver = new IntersectionObserver((entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); }, { threshold: 0.1 });
    fadeElems.forEach(el => fadeInObserver.observe(el));

    // --- Part 6: Active Navigation Link on Scroll ---
    const sections = document.querySelectorAll('main section[id]');
    const desktopNavLinks = document.querySelectorAll('header nav ul > li a.nav-link[href^="#"]');
    
    // Set up smooth scroll for desktop nav links
    desktopNavLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.id;
                document.querySelectorAll('a.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if(link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: '-40% 0px -60% 0px' });
    sections.forEach(section => navObserver.observe(section));

    // --- Part 7: Chatbot Logic ---
    const chatbot = document.querySelector('.chatbot');
    const chatbotToggler = document.querySelector('.chatbot-toggler');
    if(chatbot && chatbotToggler) {
        const chatbotCloseBtn = chatbot.querySelector('.chatbot-close-btn');
        const chatWindow = chatbot.querySelector('.chat-window');
        const chatbotInputContainer = chatbot.querySelector('.chatbot-input');

        const predefinedResponses = {
            "what_we_do": "We are an authorised Tally partner in Pune providing sales, implementation, support, corporate training, and customization for Tally Prime.",
            "why_tss": "TSS (Tally Software Services) is crucial. It gives you all the latest product updates, including new tax and GST compliance rules. It also unlocks powerful features like secure remote access to your business data from anywhere, on any device, and lets you access integrated e-waybill and e-invoicing services directly from Tally.",
            "plans": "We offer perpetual (lifetime) licenses and rentals for TallyPrime Silver & Gold, alongside dedicated plans for TallyPrime Server and various TSS renewal options.",
            "contact": "You can call us at +91 98765 43210 or email sales@tirupatitally.com for a detailed consultation."
        };
        const initialQuestions = [
            { text: "What services do you offer?", key: "what_we_do" },
            { text: "Why is TSS renewal important?", key: "why_tss" },
            { text: "Can you describe your plans?", key: "plans" },
            { text: "How can I contact your team?", key: "contact" }
        ];

        const addMessage = (message, sender) => { const li = document.createElement('li'); li.classList.add('chat-message', sender); li.textContent = message; chatWindow.appendChild(li); chatWindow.scrollTop = chatWindow.scrollHeight; };
        const showInitialQuestions = () => { chatbotInputContainer.innerHTML = ''; initialQuestions.forEach(q => { const btn = document.createElement('button'); btn.classList.add('question-btn'); btn.textContent = q.text; btn.dataset.key = q.key; chatbotInputContainer.appendChild(btn); }); };
        const handleQuestionSelect = (target) => { const key = target.dataset.key; const userMessage = target.textContent; addMessage(userMessage, 'user'); chatbotInputContainer.innerHTML = ''; setTimeout(() => { const typingLi = document.createElement('li'); typingLi.classList.add('chat-message', 'bot', 'typing'); typingLi.textContent = 'Typing...'; chatWindow.appendChild(typingLi); chatWindow.scrollTop = chatWindow.scrollHeight; setTimeout(() => { typingLi.remove(); addMessage(predefinedResponses[key], 'bot'); const restartBtn = document.createElement('button'); restartBtn.textContent = 'Ask Another Question'; restartBtn.classList.add('question-btn', 'restart-btn'); restartBtn.dataset.action = 'restart'; chatbotInputContainer.appendChild(restartBtn); }, 1200); }, 500); };
        chatbotInputContainer.addEventListener('click', (e) => { const target = e.target; if (target.dataset.action === 'restart') { showInitialQuestions(); } else if (target.classList.contains('question-btn')) { handleQuestionSelect(target); } });
        chatbotToggler.addEventListener('click', () => { chatbot.classList.toggle('active'); if (chatbot.classList.contains('active') && chatbotInputContainer.innerHTML.trim() === '') { showInitialQuestions(); } });
        chatbotCloseBtn.addEventListener('click', () => chatbot.classList.remove('active'));
    }

    // Force page to load at the very top
    history.scrollRestoration = 'manual';
    window.scrollTo(0,0);
});
