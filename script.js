document.addEventListener('DOMContentLoaded', () => {

    // --- Part 1: Modal Interactivity ---
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
        const purchaseButtons = document.querySelectorAll('.purchase-btn');
        const closeBtn = paymentModal.querySelector('.close-button');
        const form = document.getElementById('payment-form');
        const modalTitle = document.getElementById('modal-title');
        const planNameInput = document.getElementById('form-plan-name');
        const formSubjectInput = document.getElementById('form-subject');
        const qrCodeImage = document.getElementById('qr-code-image');
        const qrAmount = document.getElementById('qr-amount');
        const successMessage = document.getElementById('success-message');
        const modalMainContent = document.getElementById('modal-main-content');

        purchaseButtons.forEach(button => {
            button.addEventListener('click', () => {
                const plan = button.dataset.plan;
                const amount = button.dataset.amount;
                const qrImg = button.dataset.qr;
                
                modalTitle.textContent = 'Purchase: ' + plan;
                planNameInput.value = plan;
                qrCodeImage.src = qrImg;
                qrAmount.textContent = amount;

                // Handle 'Contact Us' case
                if (amount === 'Contact') {
                    qrCodeImage.style.display = 'none';
                    qrAmount.parentElement.innerHTML = '<strong>Please contact us for pricing.</strong>';
                } else {
                    qrCodeImage.style.display = 'block';
                }

                successMessage.style.display = 'none';
                modalMainContent.style.display = 'block';
                form.reset(); 
                
                paymentModal.style.display = 'block';
            });
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
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';

            fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    modalMainContent.style.display = 'none';
                    successMessage.style.display = 'block';
                } else {
                    console.error('Submission Error:', data);
                    alert('Submission failed. Please check the developer console.');
                }
            })
            .catch(error => {
                console.error('Network Error:', error);
                alert('A network error occurred. Please try again.');
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit & Verify Payment';
            });
        });

        const closeModal = () => { paymentModal.style.display = 'none'; };
        closeBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (event) => { if (event.target == paymentModal) closeModal(); });
    }

    // --- Part 2: Fade-In Animation on Scroll ---
    const fadeElems = document.querySelectorAll('.fade-in');
    const fadeInObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    fadeElems.forEach(el => fadeInObserver.observe(el));

    // --- Part 3: Active Navigation Link on Scroll ---
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if(link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: '-40% 0px -60% 0px' });
    sections.forEach(section => navObserver.observe(section));

    // --- Part 4: Chatbot Logic ---
    const chatbot = document.querySelector('.chatbot');
    const chatbotToggler = document.querySelector('.chatbot-toggler');
    if(chatbot && chatbotToggler) {
        const chatbotCloseBtn = chatbot.querySelector('.chatbot-close-btn');
        const chatWindow = chatbot.querySelector('.chat-window');
        const chatbotInputContainer = chatbot.querySelector('.chatbot-input');

        const predefinedResponses = {
            "what_we_do": "We are an authorised Tally partner in Pune providing sales, implementation, support, corporate training, and customization for Tally Prime.",
            "why_tally": "Tally Prime is a powerful and simple accounting software that manages everything from billing and inventory to GST/TDS compliance and payroll.",
            "plans": "We offer lifetime licenses for TallyPrime Silver & Gold, TallyPrime Server, and Shoper 9, plus annual renewals for Tally Software Services (TSS).",
            "contact": "You can call us at +91 98765 43210 or email sales@tirupatitally.com for a detailed consultation."
        };
        const initialQuestions = [
            { text: "What services do you offer?", key: "what_we_do" },
            { text: "Why should I use Tally?", key: "why_tally" },
            { text: "Can you describe your plans?", key: "plans" },
            { text: "How can I contact your team?", key: "contact" }
        ];

        const addMessage = (message, sender) => {
            const li = document.createElement('li');
            li.classList.add('chat-message', sender);
            li.textContent = message;
            chatWindow.appendChild(li);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        };
        
        const showInitialQuestions = () => {
            chatbotInputContainer.innerHTML = '';
            initialQuestions.forEach(q => {
                const btn = document.createElement('button');
                btn.classList.add('question-btn');
                btn.textContent = q.text;
                btn.dataset.key = q.key;
                chatbotInputContainer.appendChild(btn);
            });
        };

        const handleQuestionSelect = (target) => {
            const key = target.dataset.key;
            const userMessage = target.textContent;
            
            addMessage(userMessage, 'user');
            chatbotInputContainer.innerHTML = '';

            setTimeout(() => {
                const typingLi = document.createElement('li');
                typingLi.classList.add('chat-message', 'bot', 'typing');
                typingLi.textContent = 'Typing...';
                chatWindow.appendChild(typingLi);
                chatWindow.scrollTop = chatWindow.scrollHeight;

                setTimeout(() => {
                    typingLi.remove();
                    addMessage(predefinedResponses[key], 'bot');
                    const restartBtn = document.createElement('button');
                    restartBtn.textContent = 'Ask Another Question';
                    restartBtn.classList.add('question-btn', 'restart-btn');
                    restartBtn.dataset.action = 'restart';
                    chatbotInputContainer.appendChild(restartBtn);
                }, 1200);
            }, 500);
        };
        
        chatbotInputContainer.addEventListener('click', (e) => {
            const target = e.target;
            if (target.dataset.action === 'restart') {
                showInitialQuestions();
            } else if (target.classList.contains('question-btn')) {
                handleQuestionSelect(target);
            }
        });

        chatbotToggler.addEventListener('click', () => { 
            chatbot.classList.toggle('active'); 
            if (chatbot.classList.contains('active') && chatbotInputContainer.innerHTML.trim() === '') {
                showInitialQuestions();
            }
        });
        chatbotCloseBtn.addEventListener('click', () => chatbot.classList.remove('active'));
    }
});