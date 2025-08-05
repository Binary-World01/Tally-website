
document.addEventListener("DOMContentLoaded", () => {
    // --- Initialize all features ---
    initDarkMode();
    initMobileNav();
    initModals();
    initForms();
    initInteractiveRatings();
    initPlanComparison();
    initPlanToggles();
    initScrollAnimationsAndNav();
    initChatbot();

    // --- Final setup ---
    if (history.scrollRestoration) {
        history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
});


// =============================================================================
//  FEATURE INITIALIZATION FUNCTIONS
// =============================================================================

/**
 * Handles the dark mode toggle and persists the theme in localStorage.
 */
function initDarkMode() {
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const isDarkMode = document.documentElement.classList.toggle("dark-mode");
            localStorage.setItem("theme", isDarkMode ? "dark" : "light");
        });
    }
}

/**
 * Handles the slide-out navigation for tablet viewports.
 */
function initMobileNav() {
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.getElementById('overlay');

    if (!menuToggle || !navMenu || !overlay || !menuClose) return;
    
    const toggleMenu = (open) => {
        navMenu.classList.toggle('active', open);
        overlay.classList.toggle('active', open);
        document.body.classList.toggle('menu-open', open);
        menuToggle.setAttribute('aria-expanded', open);
    };

    menuToggle.addEventListener('click', () => toggleMenu(true));
    menuClose.addEventListener('click', () => toggleMenu(false));
    overlay.addEventListener('click', () => toggleMenu(false));
}

/**
 * Sets up all modal interactions, including opening, closing, and focus trapping.
 */
function initModals() {
    const modals = document.querySelectorAll('.modal');
    if (modals.length === 0) return;
    
    let lastFocusedElement;

    const openModal = (modal) => {
        if (!modal) return;
        lastFocusedElement = document.activeElement;
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        trapFocus(modal);
    };

    const closeModal = (modal) => {
        if (!modal) return;
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');

        // --- Start of Modal Reset Logic ---
        // Find and reset any form within the modal
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            // Restore visibility of the form and its container in case it was hidden
            form.style.display = 'block';
            const mainContent = modal.querySelector('#modal-main-content');
            if(mainContent) mainContent.style.display = 'block';
        }

        // Find and hide any success message
        const successMessage = modal.querySelector('[id$="success-message"]');
        if (successMessage) {
            successMessage.style.display = 'none';
        }

        // Specific reset for rating form which has unique visibility logic
        const ratingForm = document.getElementById('rating-form');
        if (modal.contains(ratingForm)) {
             ratingForm.style.display = 'none'; // Hide form
             // Reset stars visual state
             const stars = modal.querySelectorAll('.star-rating i');
             stars.forEach(s => {
                 s.classList.remove('fa-solid');
                 s.classList.add('fa-regular');
             });
        }
        // --- End of Modal Reset Logic ---

        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    };
    
    // Generic modal openers based on data attributes
    document.body.addEventListener('click', (e) => {
        const target = e.target;
        const purchaseBtn = target.closest(".purchase-btn");
        const readMoreLink = target.closest(".read-more");
        
        if (purchaseBtn) {
            e.preventDefault();
            const modalId = purchaseBtn.id === 'inquiry-btn' ? 'inquiry-modal' :
                            purchaseBtn.id === 'credflow-inquiry-btn' ? 'credflow-modal' :
                            purchaseBtn.id === 'aws-inquiry-btn' ? 'aws-modal' : 'payment-modal';
            const modal = document.getElementById(modalId);
            if (modalId === 'payment-modal') {
                setupPaymentModal(purchaseBtn);
            }
            openModal(modal);
        } else if (readMoreLink) {
            e.preventDefault();
            const modalId = readMoreLink.getAttribute('data-modal');
            openModal(document.getElementById(modalId));
        } else if(target.id === 'query-link'){
             e.preventDefault();
             openModal(document.getElementById('query-modal'));
        } else if(target.id === 'callback-btn') {
            e.preventDefault();
            openModal(document.getElementById('callback-modal'));
        }
    });

    // Generic modal closers
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target.matches('.close-button') || e.target === modal) {
                closeModal(modal);
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && modal.style.display === 'block') {
                closeModal(modal);
            }
        });
    });
}

/**
 * Configures the payment modal with plan-specific details.
 * @param {HTMLElement} purchaseButton - The button that triggered the modal.
 */
function setupPaymentModal(purchaseButton) {
    const paymentModal = document.getElementById("payment-modal");
    const modalTitle = paymentModal.querySelector("#modal-title");
    const planNameInput = paymentModal.querySelector("#form-plan-name");
    const qrCodeImage = paymentModal.querySelector("#qr-code-image");
    const qrAmount = paymentModal.querySelector("#qr-amount");
    const modalFeaturesContainer = paymentModal.querySelector("#modal-features");
    const payForm = document.getElementById("payment-form");

    const plan = purchaseButton.dataset.plan;
    const amount = purchaseButton.dataset.amount;
    const qrImg = purchaseButton.dataset.qr;
    const fields = purchaseButton.dataset.fields;
    
    modalTitle.textContent = "Purchase: " + plan;
    planNameInput.value = plan;
    qrCodeImage.src = qrImg;
    qrAmount.textContent = amount;

    const planCard = purchaseButton.closest(".plan-card");
    const featureListElement = planCard.querySelector(".feature-list");
    if (featureListElement) {
        modalFeaturesContainer.innerHTML = `<h4 class="features-title">Your Plan Includes:</h4>${featureListElement.outerHTML}`;
    } else {
        modalFeaturesContainer.innerHTML = "";
    }

    // Reset form state
    paymentModal.querySelector("#success-message").style.display = "none";
    paymentModal.querySelector("#modal-main-content").style.display = "block";
    payForm.reset();
    
    // Configure dynamic fields
    const gstinContainer = document.getElementById("gstin-container");
    const auditorContainer = document.getElementById("auditor-container");
    [gstinContainer, auditorContainer].forEach(container => {
        container.style.display = 'none';
        container.querySelectorAll('input').forEach(input => input.required = false);
    });

    if (fields === "gstin") {
        gstinContainer.style.display = "block";
        gstinContainer.querySelector("input").required = true;
    } else if (fields === "auditor") {
        auditorContainer.style.display = "block";
        auditorContainer.querySelectorAll("input").forEach(input => input.required = true);
    }
}


/**
 * Sets up all form submission logic.
 */
function initForms() {
    // Generic handler for Web3Forms submissions
    const handleWeb3FormSubmit = (form, successMessageElement, mainContentElement) => {
        if (!form || !successMessageElement) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitButton = form.querySelector('button[type="submit"]');
            const formData = new FormData(form);
            const customerName = formData.get("name") || formData.get("fullName");
            const planName = formData.get("plan");

            let subject = form.querySelector('input[name="subject"]')?.value || "New Website Submission";
            if(planName && customerName) subject = `New Order: ${planName} from ${customerName}`;
            else if(customerName) subject = `New Query from ${customerName}`;
            formData.set('subject', subject);
            
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";

            fetch("https://api.web3forms.com/submit", { method: "POST", body: formData })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        if (mainContentElement) mainContentElement.style.display = 'none';
                        else form.style.display = 'none';
                        successMessageElement.style.display = 'block';
                    } else {
                        console.error("Submission Error:", data);
                        alert("Submission failed. Please try again.");
                    }
                })
                .catch(() => alert("A network error occurred."))
                .finally(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = submitButton.dataset.originalText || "Submit";
                });
        });
        const submitBtn = form.querySelector('button[type="submit"]');
        if(submitBtn) {
            submitBtn.dataset.originalText = submitBtn.textContent;
        }
    };

    // Special handler for the WhatsApp callback form
    const initCallbackForm = () => {
        const callbackForm = document.getElementById('callback-form');
        if (!callbackForm) return;

        callbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const successMessage = document.getElementById('callback-success-message');
            const formContent = callbackForm;

            const name = callbackForm.querySelector('#callback-name').value;
            const phone = callbackForm.querySelector('#callback-phone').value;
            const reason = callbackForm.querySelector('#callback-reason').value;

            const text = `New Callback Request:\nName: ${name}\nPhone: ${phone}\nReason: ${reason}`;
            const whatsappUrl = `https://wa.me/919405055551?text=${encodeURIComponent(text)}`;

            if (formContent) formContent.style.display = 'none';
            if (successMessage) successMessage.style.display = 'block';

            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
            }, 1200);
        });
    };

    // Initialize all forms
    handleWeb3FormSubmit(
        document.getElementById('payment-form'),
        document.getElementById('payment-modal').querySelector('#success-message'),
        document.getElementById('payment-modal').querySelector('#modal-main-content')
    );
    handleWeb3FormSubmit(
        document.getElementById('query-form'),
        document.getElementById('query-modal').querySelector('#query-success-message')
    );
    handleWeb3FormSubmit(
        document.getElementById('rating-form'),
        document.getElementById('rating-success-message')
    );
    initCallbackForm(); // Use the special handler for the callback form
}

/**
 * Initializes the interactive star rating component.
 */
function initInteractiveRatings() {
    const starRating = document.querySelector('.star-rating');
    if (!starRating) return;

    const stars = starRating.querySelectorAll('i');
    const ratingForm = document.getElementById('rating-form');
    const starValueInput = document.getElementById('star-value');
    let ratingSelected = false;

    const setStars = (value) => {
        stars.forEach((s, index) => {
            s.classList.toggle('fa-solid', index < value);
            s.classList.toggle('fa-regular', index >= value);
        });
    };

    starRating.addEventListener('click', (e) => {
        const star = e.target.closest('[data-value]');
        if (star) {
            const val = star.dataset.value;
            starValueInput.value = val;
            setStars(val);
            ratingSelected = true;
            ratingForm.style.display = 'block';
        }
    });

    starRating.addEventListener('mouseover', (e) => {
        const star = e.target.closest('[data-value]');
        if (star && !ratingSelected) {
            setStars(star.dataset.value);
        }
    });

    starRating.addEventListener('mouseout', () => {
        if (!ratingSelected) {
            setStars(0);
        }
    });
}

/**
 * Sets up the logic for the plan comparison feature.
 */
function initPlanComparison() {
    const comparisonModal = document.getElementById('comparison-modal');
    if (!comparisonModal) return;

    const checkboxes = document.querySelectorAll('.plan-selector input[type="checkbox"]');
    const compareBtn = document.getElementById('compare-btn');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const checked = document.querySelectorAll('.plan-selector input[type="checkbox"]:checked');
            if (checked.length > 2) {
                checkbox.checked = false;
            }
            compareBtn.disabled = document.querySelectorAll('.plan-selector input[type="checkbox"]:checked').length !== 2;
        });
    });

    compareBtn.addEventListener('click', () => {
        const checked = Array.from(document.querySelectorAll('.plan-selector input[type="checkbox"]:checked'));
        if (checked.length === 2) {
            const plan1 = checked[0].dataset.plan;
            const plan2 = checked[1].dataset.plan;
            buildComparisonTable(plan1, plan2);
            comparisonModal.style.display = 'block';
            comparisonModal.setAttribute('aria-hidden', 'false');
            trapFocus(comparisonModal);
        }
    });
}

/**
 * Sets up the dynamic toggles for plan durations and pricing.
 */
function initPlanToggles() {
    document.querySelectorAll(".duration-grid").forEach((grid) => {
        grid.addEventListener("click", (e) => {
            const clickedButton = e.target.closest(".duration-btn");
            if (!clickedButton || clickedButton.classList.contains("active")) return;
            
            grid.querySelectorAll(".duration-btn").forEach(btn => btn.classList.remove("active"));
            clickedButton.classList.add("active");
            
            const planCard = clickedButton.closest(".plan-card");
            const priceElement = planCard.querySelector(".price");
            const featureList = planCard.querySelector(".feature-list");
            const purchaseButton = planCard.querySelector(".purchase-btn");
            const basePlanName = planCard.querySelector("h3").dataset.basePlanName;
            const features = clickedButton.dataset.features.split("|");

            priceElement.style.opacity = "0";
            featureList.style.opacity = "0";
            
            setTimeout(() => {
                priceElement.textContent = clickedButton.dataset.price;
                if (purchaseButton) {
                    purchaseButton.dataset.plan = basePlanName + clickedButton.dataset.planSuffix;
                    purchaseButton.dataset.amount = clickedButton.dataset.amount;
                    if (clickedButton.dataset.qr) {
                        purchaseButton.dataset.qr = clickedButton.dataset.qr;
                    }
                }
                featureList.innerHTML = features.map(featureText => `<li><i class="fa-solid fa-check"></i>${featureText}</li>`).join('');
                priceElement.style.opacity = "1";
                featureList.style.opacity = "1";
            }, 150);
        });
    });
}

/**
 * Initializes IntersectionObservers for scroll-based animations and nav link highlighting.
 */
function initScrollAnimationsAndNav() {
    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll('a.nav-link[href^="#"]');

    const fadeInObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(".fade-in").forEach(el => fadeInObserver.observe(el));

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove("active");
                    link.removeAttribute('aria-current');
                    if (link.getAttribute("href") === `#${currentId}`) {
                        link.classList.add("active");
                        link.setAttribute('aria-current', 'page');
                    }
                });
            }
        });
    }, { rootMargin: "-40% 0px -60% 0px" });

    sections.forEach(section => navObserver.observe(section));
}

/**
 * Sets up the simple, predefined chatbot functionality.
 */
function initChatbot() {
    const chatbot = document.querySelector(".chatbot");
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    if (!chatbot || !chatbotToggler) return;

    const chatbotCloseBtn = chatbot.querySelector(".chatbot-close-btn");
    const chatWindow = chatbot.querySelector(".chat-window");
    const chatbotInputContainer = chatbot.querySelector(".chatbot-input");
    
    let lastFocusedElement;

    const predefinedResponses = {
        what_we_do: "We are an authorised Tally partner in Pune providing sales, implementation, support, corporate training, and customization for Tally Prime.",
        why_tss: "TSS (Tally Software Services) is crucial. It gives you all the latest product updates, including new tax and GST compliance rules. It also unlocks powerful features like secure remote access to your business data from anywhere, on any device, and lets you access integrated e-waybill and e-invoicing services directly from Tally.",
        plans: "We offer perpetual (lifetime) licenses and rentals for TallyPrime Silver & Gold, alongside dedicated plans for TallyPrime Server and various TSS renewal options.",
        contact: "You can call us at +91 94050 55551 or email tallysolutionspune@gmail.com for a detailed consultation.",
    };

    const initialQuestions = [
        { text: "What services do you offer?", key: "what_we_do" },
        { text: "Why is TSS renewal important?", key: "why_tss" },
        { text: "Can you describe your plans?", key: "plans" },
        { text: "How can I contact your team?", key: "contact" },
    ];

    const toggleChatbot = (open) => {
        if(open) {
            lastFocusedElement = document.activeElement;
            chatbot.classList.add('active');
            chatbot.setAttribute('aria-hidden', 'false');
            trapFocus(chatbot);
             if (chatbotInputContainer.innerHTML.trim() === "") {
                showInitialQuestions();
            }
        } else {
            chatbot.classList.remove('active');
            chatbot.setAttribute('aria-hidden', 'true');
            if(lastFocusedElement) lastFocusedElement.focus();
        }
    };

    const addMessage = (message, sender) => {
        const li = document.createElement("li");
        li.classList.add("chat-message", sender);
        li.textContent = message;
        chatWindow.appendChild(li);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    };

    const showInitialQuestions = () => {
        chatbotInputContainer.innerHTML = "";
        initialQuestions.forEach(q => {
            const btn = document.createElement("button");
            btn.classList.add("question-btn");
            btn.textContent = q.text;
            btn.dataset.key = q.key;
            chatbotInputContainer.appendChild(btn);
        });
    };

    const handleQuestionSelect = (target) => {
        addMessage(target.textContent, "user");
        chatbotInputContainer.innerHTML = "";
        setTimeout(() => {
            const typingLi = document.createElement("li");
            typingLi.classList.add("chat-message", "bot", "typing");
            typingLi.textContent = "Typing...";
            chatWindow.appendChild(typingLi);
            chatWindow.scrollTop = chatWindow.scrollHeight;
            setTimeout(() => {
                typingLi.remove();
                addMessage(predefinedResponses[target.dataset.key], "bot");
                const restartBtn = document.createElement("button");
                restartBtn.textContent = "Ask Another Question";
                restartBtn.classList.add("question-btn", "restart-btn");
                restartBtn.dataset.action = "restart";
                chatbotInputContainer.appendChild(restartBtn);
            }, 1200);
        }, 500);
    };

    chatbotInputContainer.addEventListener("click", (e) => {
        const target = e.target;
        if (target.dataset.action === "restart") {
            showInitialQuestions();
        } else if (target.classList.contains("question-btn")) {
            handleQuestionSelect(target);
        }
    });
    
    chatbotToggler.addEventListener("click", () => toggleChatbot(!chatbot.classList.contains('active')));
    chatbotCloseBtn.addEventListener("click", () => toggleChatbot(false));
    document.addEventListener('keydown', e => {
        if(e.key === 'Escape' && chatbot.classList.contains('active')) {
            toggleChatbot(false);
        }
    });
}

// =============================================================================
//  HELPER & UTILITY FUNCTIONS
// =============================================================================

/**
 * Traps focus within a given element (e.g., a modal).
 * @param {HTMLElement} element - The element to trap focus in.
 */
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    if (firstFocusableElement) {
        firstFocusableElement.focus();
    }

    element.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    });
}

/**
 * Dynamically builds and injects the plan comparison table HTML.
 * @param {string} planKey1 - The key for the first plan (e.g., 'silver').
 * @param {string} planKey2 - The key for the second plan (e.g., 'gold').
 */
function buildComparisonTable(planKey1, planKey2) {
    const tableHead = document.querySelector('.comparison-table thead');
    const tableBody = document.querySelector('.comparison-table tbody');
    
    const check = `<i class="fa-solid fa-check"></i>`;
    const cross = `<i class="fa-solid fa-times"></i>`;
    const plus = `<i class="fa-solid fa-circle-plus" style="color:#36b37e;"></i>`;

    const planData = {
        silver: { name: 'TallyPrime Silver' },
        gold: { name: 'TallyPrime Gold' },
        server: { name: 'TallyPrime Server' }
    };
    
    const features = [
        { feature: 'Core Accounting & GST', silver: check, gold: check, server: check },
        { feature: 'User Access (Concurrency)', silver: '1 User at a time', gold: 'Up to 10 Users', server: 'Many Concurrent Users' },
        { feature: 'License Type', silver: 'Single PC', gold: 'Multi-PC (in LAN)', server: 'Server-based' },
        { feature: 'Remote Access (via TSS)', silver: check, gold: check, server: check },
        { feature: 'Performance under Heavy Load', silver: 'Standard', gold: 'Standard', server: `${plus} High Speed, No Lag` },
        { feature: 'Security Control', silver: 'Standard', gold: 'Standard', server: `${plus} Admin with User Monitoring` },
        { feature: 'Ideal Business Type', silver: 'Solopreneur / Startup', gold: 'Growing SME / Multi-Department', server: 'Enterprise / Large Corporation' },
        { feature: 'Primary Use Case', silver: 'Individual Management', gold: 'Team Collaboration', server: 'High-Volume Data Integrity' }
    ];

    tableHead.innerHTML = `<tr><th>Feature</th><th>${planData[planKey1].name}</th><th>${planData[planKey2].name}</th></tr>`;
    tableBody.innerHTML = features.map(f => `<tr><td>${f.feature}</td><td>${f[planKey1]}</td><td>${f[planKey2]}</td></tr>`).join('');
}
