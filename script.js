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

  // Payment Modal
  if (paymentModal) {
    const body = document.body;
    const payCloseBtn = paymentModal.querySelector(".close-button");
    const payForm = document.getElementById("payment-form");

    body.addEventListener("click", (e) => {
      const purchaseButton = e.target.closest(".purchase-btn");
      if (purchaseButton && purchaseButton.id !== "inquiry-btn") {
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

    const closePaymentModal = () => {
      paymentModal.style.display = "none";
    };
    payCloseBtn.addEventListener("click", closePaymentModal);
    window.addEventListener("click", (event) => {
      if (event.target == paymentModal) closePaymentModal();
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
    const inqCloseBtn = inquiryModal.querySelector(".close-button");

    inquiryBtn.addEventListener("click", (e) => {
      e.preventDefault();
      inquiryModal.style.display = "block";
    });

    const closeInquiryModal = () => {
      inquiryModal.style.display = "none";
    };
    inqCloseBtn.addEventListener("click", closeInquiryModal);
    window.addEventListener("click", (event) => {
      if (event.target == inquiryModal) closeInquiryModal();
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
        purchaseButton.dataset.plan = basePlanName + planSuffix;
        purchaseButton.dataset.amount = newAmount;
        if (newQrPath) {
          purchaseButton.dataset.qr = newQrPath;
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

  // --- Part 4: Animations, Nav Observers, Chatbot etc. ---
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
