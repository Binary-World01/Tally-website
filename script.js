
document.addEventListener("DOMContentLoaded", () => {
  // --- Part 1: Dark Mode Toggle ---
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark-mode");
      const currentTheme = document.documentElement.classList.contains(
        "dark-mode"
      )
        ? "dark"
        : "light";
      localStorage.setItem("theme", currentTheme);
    });
  }

  // --- Part 2: Modal Logic ---
  const paymentModal = document.getElementById("payment-modal");
  const inquiryModal = document.getElementById("inquiry-modal");
  const credflowModal = document.getElementById("credflow-modal");
  const queryModal = document.getElementById("query-modal");
  const callbackModal = document.getElementById("callback-modal");
  const comparisonModal = document.getElementById("comparison-modal");
  const blogModals = [
      document.getElementById('blog-modal-1'),
      document.getElementById('blog-modal-2'),
      document.getElementById('blog-modal-3')
  ].filter(Boolean); // Filter out nulls if a modal doesn't exist


  // Generic Modal Opener for Read More links
    document.querySelectorAll('.read-more').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = link.getAttribute('data-modal');
            const modalToOpen = document.getElementById(modalId);
            if(modalToOpen) {
                modalToOpen.style.display = 'block';
            }
        });
    });

  // Generic closer for ALL modals
    document.querySelectorAll('.modal').forEach(modal => {
        const closeBtn = modal.querySelector('.close-button');
        if(closeBtn){
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                 modal.style.display = 'none';
            }
        });
    });


  // Payment Modal
  if (paymentModal) {
    const body = document.body;
    const payForm = document.getElementById("payment-form");

    body.addEventListener("click", (e) => {
      const purchaseButton = e.target.closest(".purchase-btn");
      if (purchaseButton && purchaseButton.id !== "inquiry-btn" && purchaseButton.id !== "credflow-inquiry-btn") {
        e.preventDefault();
        const modalTitle = paymentModal.querySelector("#modal-title");
        const planNameInput = paymentModal.querySelector("#form-plan-name");
        const qrCodeImage = paymentModal.querySelector("#qr-code-image");
        const qrAmount = paymentModal.querySelector("#qr-amount");
        const modalFeaturesContainer =
          paymentModal.querySelector("#modal-features");
        const plan = purchaseButton.dataset.plan;
        const amount = purchaseButton.dataset.amount;
        const qrImg = purchaseButton.dataset.qr;
        const fields = purchaseButton.dataset.fields;

        modalTitle.textContent = "Purchase: " + plan;
        planNameInput.value = plan;
        qrCodeImage.src = qrImg;
        qrAmount.textContent = amount;
        setupDynamicFields(fields);

        const planCard = purchaseButton.closest(".plan-card");
        const featureListElement = planCard.querySelector(".feature-list");
        if (featureListElement) {
          modalFeaturesContainer.innerHTML = `<h4 class="features-title">Your Plan Includes:</h4>${featureListElement.outerHTML}`;
        } else {
          modalFeaturesContainer.innerHTML = "";
        }

        paymentModal.querySelector("#success-message").style.display = "none";
        paymentModal.querySelector("#modal-main-content").style.display =
          "block";
        payForm.reset();
        paymentModal.style.display = "block";
      }
    });

    payForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const submitButton = payForm.querySelector('button[type="submit"]');
      const formData = new FormData(payForm);
      const customerName = formData.get("fullName");
      const planName = formData.get("plan");
      if (customerName && planName) {
        formData.set("subject", `New Order: ${planName} from ${customerName}`);
      }
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            paymentModal.querySelector("#modal-main-content").style.display =
              "none";
            paymentModal.querySelector("#success-message").style.display =
              "block";
          } else {
            console.error("Submission Error:", data);
            alert("Submission failed.");
          }
        })
        .catch(() => alert("A network error occurred."))
        .finally(() => {
          submitButton.disabled = false;
          submitButton.textContent = "Submit & Verify Payment";
        });
    });

    function setupDynamicFields(fieldsToShow) {
      const gstinContainer = document.getElementById("gstin-container");
      const auditorContainer = document.getElementById("auditor-container");
      gstinContainer.style.display = "none";
      gstinContainer
        .querySelectorAll("input")
        .forEach((input) => (input.required = false));
      auditorContainer.style.display = "none";
      auditorContainer
        .querySelectorAll("input")
        .forEach((input) => (input.required = false));
      if (fieldsToShow === "gstin") {
        gstinContainer.style.display = "block";
        gstinContainer.querySelector("input").required = true;
      } else if (fieldsToShow === "auditor") {
        auditorContainer.style.display = "block";
        auditorContainer
          .querySelectorAll("input")
          .forEach((input) => (input.required = true));
      }
    }
  }

  // Inquiry Modal
  if (inquiryModal) {
    const inquiryBtn = document.getElementById("inquiry-btn");
    inquiryBtn.addEventListener("click", (e) => {
      e.preventDefault();
      inquiryModal.style.display = "block";
    });
  }

  // Credflow Inquiry Modal
  if (credflowModal) {
    const credflowInquiryBtn = document.getElementById("credflow-inquiry-btn");
    if (credflowInquiryBtn) {
        credflowInquiryBtn.addEventListener("click", (e) => {
          e.preventDefault();
          credflowModal.style.display = "block";
        });
    }
  }

  // Query Modal
  if (queryModal) {
    const queryLink = document.getElementById("query-link");
    const queryForm = document.getElementById("query-form");
    const querySuccessMessage = queryModal.querySelector("#query-success-message");

    if (queryLink) {
        queryLink.addEventListener("click", (e) => {
            e.preventDefault();
            queryForm.style.display = "block";
            querySuccessMessage.style.display = "none";
            queryForm.reset();
            queryModal.style.display = "block";
        });
    }

    queryForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const submitButton = queryForm.querySelector('button[type="submit"]');
        const formData = new FormData(queryForm);
        const customerName = formData.get("name");
        formData.set("subject", `New Query from ${customerName}`);
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
        fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData,
            })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    queryForm.style.display = "none";
                    querySuccessMessage.style.display = "block";
                } else {
                    console.error("Submission Error:", data);
                    alert("Submission failed.");
                }
            })
            .catch(() => alert("A network error occurred."))
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = "Submit Query";
            });
    });
  }
  
  // Callback Modal
  if (callbackModal) {
      const callbackBtn = document.getElementById("callback-btn");
      const callbackForm = document.getElementById("callback-form");
      
      callbackBtn.addEventListener("click", (e) => {
          e.preventDefault();
          callbackModal.querySelector("#callback-success-message").style.display = 'none';
          callbackModal.querySelector('#callback-form').style.display = 'block';
          callbackForm.reset();
          callbackModal.style.display = "block";
      });

       callbackForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const submitButton = callbackForm.querySelector('button[type="submit"]');
        const formData = new FormData(callbackForm);
        
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData,
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    callbackModal.querySelector('#callback-form').style.display = 'none';
                    callbackModal.querySelector("#callback-success-message").style.display = "block";
                } else {
                    alert("Submission failed. Please try again.");
                }
            })
            .catch(() => alert("A network error occurred."))
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = "Request Call";
            });
      });
  }

  // --- Interactive Star Rating ---
  const starRating = document.querySelector('.star-rating');
  if(starRating) {
      const stars = starRating.querySelectorAll('i');
      const ratingForm = document.getElementById('rating-form');
      const starValueInput = document.getElementById('star-value');

      const handleStarClick = function() {
          const val = this.dataset.value;
          starValueInput.value = val;
          ratingForm.style.display = 'block';

          stars.forEach((s, index) => {
              if (index < val) {
                  s.classList.replace('fa-regular', 'fa-solid');
              } else {
                  s.classList.replace('fa-solid', 'fa-regular');
              }
              s.removeEventListener('mouseover', handleStarMouseover);
              s.removeEventListener('mouseout', handleStarMouseout);
          });
      };

      const handleStarMouseover = function() {
          const val = this.dataset.value;
          stars.forEach((s, index) => {
              if (index < val) {
                  s.classList.replace('fa-regular', 'fa-solid');
              }
          });
      };

      const handleStarMouseout = function() {
          stars.forEach(s => s.classList.replace('fa-solid', 'fa-regular'));
      };

      stars.forEach(star => {
          star.addEventListener('mouseover', handleStarMouseover);
          star.addEventListener('mouseout', handleStarMouseout);
          star.addEventListener('click', handleStarClick);
      });
      
      ratingForm.addEventListener('submit', (e) => {
           e.preventDefault();
           if (!starValueInput.value) {
               alert("Please select a star rating first.");
               return;
           }
           const submitButton = ratingForm.querySelector('button[type="submit"]');
           submitButton.disabled = true;
           submitButton.textContent = "Submitting...";
           const formData = new FormData(ratingForm);
           fetch("https://api.web3forms.com/submit", {
               method: 'POST',
               body: formData
           })
           .then(res => res.json())
           .then(data => {
               if(data.success){
                   ratingForm.style.display = 'none';
                   document.getElementById('rating-success-message').style.display = 'block';
               } else {
                   alert('There was an error submitting your feedback.');
               }
           })
           .catch(() => alert('A network error occurred.'))
           .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = "Submit Feedback";
           });
      });
  }
  
   // --- Plan Comparison Logic ---
    if(comparisonModal) {
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
             const checked = document.querySelectorAll('.plan-selector input[type="checkbox"]:checked');
             if(checked.length === 2) {
                 const plan1 = checked[0].dataset.plan;
                 const plan2 = checked[1].dataset.plan;
                 buildComparisonTable(plan1, plan2);
                 comparisonModal.style.display = 'block';
             }
        });
    }

  // --- Part 3: Dynamic Plan Duration Toggles ---
  document.querySelectorAll(".duration-grid").forEach((grid) => {
    grid.addEventListener("click", (e) => {
      const clickedButton = e.target.closest(".duration-btn");
      if (!clickedButton || clickedButton.classList.contains("active")) return;
      const groupButtons = grid.querySelectorAll(".duration-btn");
      groupButtons.forEach((btn) => btn.classList.remove("active"));
      clickedButton.classList.add("active");
      const planCard = clickedButton.closest(".plan-card");
      const priceElement = planCard.querySelector(".price");
      const featureList = planCard.querySelector(".feature-list");
      const purchaseButton = planCard.querySelector(".purchase-btn");
      const basePlanName = planCard.querySelector("h3").dataset.basePlanName;
      const newPriceText = clickedButton.dataset.price;
      const newAmount = clickedButton.dataset.amount;
      const planSuffix = clickedButton.dataset.planSuffix;
      const newQrPath = clickedButton.dataset.qr;
      const features = clickedButton.dataset.features.split("|");
      priceElement.style.opacity = "0";
      featureList.style.opacity = "0";
      setTimeout(() => {
        priceElement.textContent = newPriceText;
        if(purchaseButton) {
          purchaseButton.dataset.plan = basePlanName + planSuffix;
          purchaseButton.dataset.amount = newAmount;
          if (newQrPath) {
            purchaseButton.dataset.qr = newQrPath;
          }
        }
        featureList.innerHTML = "";
        features.forEach((featureText) => {
          const li = document.createElement("li");
          li.innerHTML = `<i class="fa-solid fa-check"></i>${featureText}`;
          featureList.appendChild(li);
        });
        priceElement.style.opacity = "1";
        featureList.style.opacity = "1";
      }, 150);
    });
  });

  // --- Part 4: UI Interactions & Observers ---

  // Mobile Navigation Logic
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const navMenu = document.getElementById('nav-menu');
  const overlay = document.getElementById('overlay');
  const navLinksInMenu = navMenu.querySelectorAll('a.nav-link');

  if (menuToggle && navMenu && menuClose && overlay) {
    const openMenu = () => {
      navMenu.classList.add('active');
      overlay.classList.add('active');
    };

    const closeMenu = () => {
      navMenu.classList.remove('active');
      overlay.classList.remove('active');
    };

    menuToggle.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    
    navLinksInMenu.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // Intersection Observers
  const sections = document.querySelectorAll("main section[id]");
  const navLinksForScroll = document.querySelectorAll('a.nav-link[href^="#"]');
  const fadeInObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document
    .querySelectorAll(".fade-in")
    .forEach((el) => fadeInObserver.observe(el));
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = entry.target.id;
          navLinksForScroll.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentId}`) {
              link.classList.add("active");
            }
          });
        }
      });
    },
    { rootMargin: "-40% 0px -60% 0px" }
  );
  sections.forEach((section) => navObserver.observe(section));
  const chatbot = document.querySelector(".chatbot");
  const chatbotToggler = document.querySelector(".chatbot-toggler");
  if (chatbot && chatbotToggler) {
    const chatbotCloseBtn = chatbot.querySelector(".chatbot-close-btn");
    const chatWindow = chatbot.querySelector(".chat-window");
    const chatbotInputContainer = chatbot.querySelector(".chatbot-input");
    const predefinedResponses = {
      what_we_do:
        "We are an authorised Tally partner in Pune providing sales, implementation, support, corporate training, and customization for Tally Prime.",
      why_tss:
        "TSS (Tally Software Services) is crucial. It gives you all the latest product updates, including new tax and GST compliance rules. It also unlocks powerful features like secure remote access to your business data from anywhere, on any device, and lets you access integrated e-waybill and e-invoicing services directly from Tally.",
      plans:
        "We offer perpetual (lifetime) licenses and rentals for TallyPrime Silver & Gold, alongside dedicated plans for TallyPrime Server and various TSS renewal options.",
      contact:
        "You can call us at +91 94050 55551 or email tallysolutionspune@gmail.com for a detailed consultation.",
    };
    const initialQuestions = [
      { text: "What services do you offer?", key: "what_we_do" },
      { text: "Why is TSS renewal important?", key: "why_tss" },
      { text: "Can you describe your plans?", key: "plans" },
      { text: "How can I contact your team?", key: "contact" },
    ];
    const addMessage = (message, sender) => {
      const li = document.createElement("li");
      li.classList.add("chat-message", sender);
      li.textContent = message;
      chatWindow.appendChild(li);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    };
    const showInitialQuestions = () => {
      chatbotInputContainer.innerHTML = "";
      initialQuestions.forEach((q) => {
        const btn = document.createElement("button");
        btn.classList.add("question-btn");
        btn.textContent = q.text;
        btn.dataset.key = q.key;
        chatbotInputContainer.appendChild(btn);
      });
    };
    const handleQuestionSelect = (target) => {
      const key = target.dataset.key;
      const userMessage = target.textContent;
      addMessage(userMessage, "user");
      chatbotInputContainer.innerHTML = "";
      setTimeout(() => {
        const typingLi = document.createElement("li");
        typingLi.classList.add("chat-message", "bot", "typing");
        typingLi.textContent = "Typing...";
        chatWindow.appendChild(typingLi);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        setTimeout(() => {
          typingLi.remove();
          addMessage(predefinedResponses[key], "bot");
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
    chatbotToggler.addEventListener("click", () => {
      chatbot.classList.toggle("active");
      if (
        chatbot.classList.contains("active") &&
        chatbotInputContainer.innerHTML.trim() === ""
      ) {
        showInitialQuestions();
      }
    });
    chatbotCloseBtn.addEventListener("click", () =>
      chatbot.classList.remove("active")
    );
  }
  if (history.scrollRestoration) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);
});

function buildComparisonTable(planKey1, planKey2) {
    const tableHead = document.querySelector('.comparison-table thead');
    const tableBody = document.querySelector('.comparison-table tbody');
    
    const check = `<i class="fa-solid fa-check"></i>`;
    const cross = `<i class="fa-solid fa-times"></i>`;
    const plus = `<i class="fa-solid fa-circle-plus" style="color:#36b37e;"></i>`;

    const planData = {
        silver: { name: 'TallyPrime Silver' },
        gold: { name: 'TallyPrime Gold' },
        server: { name: 'TallyPrime Server'}
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

    let headHTML = `<tr><th>Feature</th><th>${planData[planKey1].name}</th><th>${planData[planKey2].name}</th></tr>`;
    let bodyHTML = '';
    
    features.forEach(f => {
        bodyHTML += `<tr><td>${f.feature}</td><td>${f[planKey1]}</td><td>${f[planKey2]}</td></tr>`;
    });
    
    tableHead.innerHTML = headHTML;
    tableBody.innerHTML = bodyHTML;
}
