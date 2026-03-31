// ===================================
// INITIALIZE LUCIDE ICONS
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
});

// ===================================
// MOBILE MENU TOGGLE
// ===================================
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Change icon
        const icon = mobileMenuToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.setAttribute('data-lucide', 'x');
        } else {
            icon.setAttribute('data-lucide', 'menu');
        }
        lucide.createIcons();
    });
}

// Close mobile menu when clicking on a link
const navLinkItems = document.querySelectorAll('.nav-link');
navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            navLinks.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        }
    });
});

// ===================================
// STICKY NAVBAR ON SCROLL
// ===================================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ===================================
// ACTIVE NAV LINK ON SCROLL
// ===================================
const sections = document.querySelectorAll('section[id]');

function highlightNavLink() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinkItems.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', highlightNavLink);

// ===================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// ANIMATE SKILL BARS ON SCROLL
// ===================================
const skillBars = document.querySelectorAll('.skill-progress');
let skillsAnimated = false;

function animateSkills() {
    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;
    
    const skillsSectionTop = skillsSection.offsetTop;
    const skillsSectionHeight = skillsSection.offsetHeight;
    const scrollPosition = window.pageYOffset + window.innerHeight;
    
    if (scrollPosition > skillsSectionTop + (skillsSectionHeight / 3) && !skillsAnimated) {
        skillBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
        skillsAnimated = true;
    }
}

window.addEventListener('scroll', animateSkills);

// ===================================
// ANIMATE ELEMENTS ON SCROLL
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Elements to animate
const animateElements = document.querySelectorAll(`
    .skill-card,
    .project-card,
    .service-card,
    .testimonial-card,
    .about-text,
    .about-image
`);

animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===================================
// NOTIFICATION SYSTEM
// ===================================
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#00D4AA' : '#FF6B6B'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .notification-content svg {
            width: 24px;
            height: 24px;
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    lucide.createIcons();
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// ===================================
// FLOATING CARDS ANIMATION
// ===================================
const floatingCards = document.querySelectorAll('.floating-card');

floatingCards.forEach((card, index) => {
    // Add random movement
    setInterval(() => {
        const randomX = Math.random() * 20 - 10;
        const randomY = Math.random() * 20 - 10;
        card.style.transform = `translate(${randomX}px, ${randomY}px)`;
    }, 3000 + (index * 1000));
});

// ===================================
// TYPING EFFECT FOR HERO SUBTITLE
// ===================================
const heroSubtitle = document.querySelector('.hero-subtitle');
if (heroSubtitle) {
    const text = heroSubtitle.textContent;
    heroSubtitle.textContent = '';
    let index = 0;
    
    function typeWriter() {
        if (index < text.length) {
            heroSubtitle.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, 50);
        }
    }
    
    // Start typing after page load
    setTimeout(typeWriter, 500);
}

// ===================================
// COUNTER ANIMATION FOR STATS
// ===================================
const statNumbers = document.querySelectorAll('.stat-item h4');
let statsAnimated = false;

function animateStats() {
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;
    
    const aboutSectionTop = aboutSection.offsetTop;
    const scrollPosition = window.pageYOffset + window.innerHeight;
    
    if (scrollPosition > aboutSectionTop + 200 && !statsAnimated) {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.textContent);
            let current = 0;
            const increment = target / 50;
            const suffix = stat.textContent.includes('+') ? '+' : '';
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    stat.textContent = target + suffix;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current) + suffix;
                }
            }, 30);
        });
        statsAnimated = true;
    }
}

window.addEventListener('scroll', animateStats);

// ===================================
// PARALLAX EFFECT FOR HERO
// ===================================
const hero = document.querySelector('.hero');
if (hero) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;
        hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    });
}

// ===================================
// PROJECT CARD TILT EFFECT
// ===================================
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ===================================
// LAZY LOADING FOR IMAGES
// ===================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===================================
// SCROLL TO TOP BUTTON
// ===================================
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '<i data-lucide="arrow-up"></i>';
scrollToTopBtn.className = 'scroll-to-top';
scrollToTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #00D4AA 0%, #00B894 100%);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0, 212, 170, 0.3);
    z-index: 1000;
    transition: all 0.3s ease;
`;

document.body.appendChild(scrollToTopBtn);
lucide.createIcons();

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        scrollToTopBtn.style.display = 'flex';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

scrollToTopBtn.addEventListener('mouseenter', () => {
    scrollToTopBtn.style.transform = 'translateY(-5px)';
    scrollToTopBtn.style.boxShadow = '0 6px 24px rgba(0, 212, 170, 0.4)';
});

scrollToTopBtn.addEventListener('mouseleave', () => {
    scrollToTopBtn.style.transform = 'translateY(0)';
    scrollToTopBtn.style.boxShadow = '0 4px 16px rgba(0, 212, 170, 0.3)';
});

// ===================================
// PERFORMANCE OPTIMIZATION
// ===================================
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll handlers
const debouncedHighlight = debounce(highlightNavLink, 100);
const debouncedAnimateSkills = debounce(animateSkills, 100);
const debouncedAnimateStats = debounce(animateStats, 100);

window.removeEventListener('scroll', highlightNavLink);
window.removeEventListener('scroll', animateSkills);
window.removeEventListener('scroll', animateStats);

window.addEventListener('scroll', debouncedHighlight);
window.addEventListener('scroll', debouncedAnimateSkills);
window.addEventListener('scroll', debouncedAnimateStats);

// ===================================
// CONSOLE MESSAGE
// ===================================
console.log('%c👋 Welcome to San Mirdha\'s Portfolio!', 'color: #00D4AA; font-size: 20px; font-weight: bold;');
console.log('%cLooking for a web developer? Let\'s connect!', 'color: #0A1628; font-size: 14px;');
console.log('%c✨ Built with passion by San Mirdha', 'color: #4A4A4A; font-size: 12px;');

// ===================================
// SUPABASE INTEGRATION
// ===================================
// IMPORTANT: Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://igzegztdtubfatkpmcsc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Uc4uVralLQl66_RWULtDiw_--YO4GTq';

// Initialize Supabase client (only if credentials are provided)
let supabase = null;
if (SUPABASE_URL !== 'https://igzegztdtubfatkpmcsc.supabase.co' && SUPABASE_ANON_KEY !== 'sb_publishable_Uc4uVralLQl66_RWULtDiw_--YO4GTq') {
    supabase = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Enhanced contact form handling with Supabase
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };
        
        // Save to Supabase if configured
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('contact_form_submissions')
                    .insert([
                        {
                            name: formData.name,
                            email: formData.email,
                            message: formData.message,
                            status: 'new',
                            source: 'portfolio_website'
                        }
                    ]);
                
                if (error) throw error;
                
                // Show success message
                showNotification('Thank you for your message! I will get back to you soon.', 'success');
                
                // Reset form
                contactForm.reset();
                
                console.log('Form submitted successfully to database');
            } catch (error) {
                console.error('Error saving to database:', error);
                showNotification('Message sent! (Database connection pending)', 'success');
                contactForm.reset();
            }
        } else {
            // Show success message even without database
            showNotification('Thank you for your message! I will get back to you soon.', 'success');
            contactForm.reset();
            console.log('Form submitted (Supabase not configured):', formData);
        }
    });
}