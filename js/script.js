/**
 * BEST DENTAL - Main JavaScript File
 * ERP System, Smooth Scrolling, Interactive Elements
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ========= ERP SYSTEM (for erp.html page) =========
    // Check if we're on the ERP page
    if (document.getElementById('appTable')) {
        initERP();
    }
    
    // ========= SMOOTH SCROLLING =========
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#!') {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // ========= NAVBAR SCROLL EFFECT =========
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                navbar.style.padding = '0.8rem 2rem';
            } else {
                navbar.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
                navbar.style.padding = '1rem 2rem';
            }
        });
    }
    
    // ========= ADD PARALLAX EFFECT TO HERO =========
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
        });
    }
    
    // ========= ANIMATE STATS COUNTER =========
    const statNumbers = document.querySelectorAll('.stat h3');
    if (statNumbers.length > 0) {
        const animateNumbers = () => {
            statNumbers.forEach(stat => {
                const text = stat.innerText;
                const number = parseInt(text.replace(/[^0-9]/g, ''));
                if (!isNaN(number)) {
                    let current = 0;
                    const increment = number / 50;
                    const updateNumber = () => {
                        if (current < number) {
                            current += increment;
                            stat.innerText = Math.floor(current) + '+';
                            requestAnimationFrame(updateNumber);
                        } else {
                            stat.innerText = number + '+';
                        }
                    };
                    updateNumber();
                }
            });
        };
        
        // Trigger when stats come into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateNumbers();
                    observer.disconnect();
                }
            });
        });
        
        const statsContainer = document.querySelector('.hero-stats');
        if (statsContainer) {
            observer.observe(statsContainer);
        }
    }
});

// ========= ERP SYSTEM FUNCTIONS =========
function initERP() {
    // Load appointments from localStorage or use default data
    let appointments = JSON.parse(localStorage.getItem('bestDentalERP')) || getDefaultAppointments();
    
    function getDefaultAppointments() {
        return [
            { name: "James Mwangi", service: "Checkup", datetime: getTomorrowDate("10:30"), status: "Confirmed" },
            { name: "Sarah Wanjiku", service: "Whitening", datetime: getTodayDate("14:00"), status: "Pending" },
            { name: "Dr. Kamau Ref", service: "Root Canal", datetime: getTodayDate("09:15"), status: "Confirmed" }
        ];
    }
    
    function getTodayDate(time) {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T${time}`;
    }
    
    function getTomorrowDate(time) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}T${time}`;
    }
    
    function saveToLocal() {
        localStorage.setItem('bestDentalERP', JSON.stringify(appointments));
    }
    
    function updateDashboard() {
        const totalPatients = appointments.length;
        const today = new Date().toISOString().slice(0, 10);
        const todayApps = appointments.filter(app => app.datetime.startsWith(today)).length;
        const pendingTreatments = appointments.filter(app => app.status === "Pending").length;
        
        const totalEl = document.getElementById('totalPatients');
        const todayEl = document.getElementById('todayApps');
        const pendingEl = document.getElementById('pendingCount');
        
        if (totalEl) totalEl.innerText = totalPatients;
        if (todayEl) todayEl.innerText = todayApps;
        if (pendingEl) pendingEl.innerText = pendingTreatments;
    }
    
    function renderAppointments() {
        const tbody = document.getElementById('appBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        appointments.forEach((app, index) => {
            const row = tbody.insertRow();
            row.insertCell(0).innerText = app.name;
            row.insertCell(1).innerText = app.service;
            row.insertCell(2).innerText = app.datetime.replace('T', ' at ');
            
            const statusClass = app.status === 'Pending' ? 'status-pending' : 'status';
            row.insertCell(3).innerHTML = `<span class="status ${statusClass}">${app.status}</span>`;
            
            const actionCell = row.insertCell(4);
            
            const completeBtn = document.createElement('button');
            completeBtn.innerText = 'Complete';
            completeBtn.className = 'btn-sm';
            completeBtn.onclick = () => {
                if (app.status !== 'Completed') {
                    app.status = 'Completed';
                    saveToLocal();
                    renderAppointments();
                    updateDashboard();
                }
            };
            
            const cancelBtn = document.createElement('button');
            cancelBtn.innerText = 'Cancel';
            cancelBtn.className = 'btn-sm btn-danger';
            cancelBtn.onclick = () => {
                if (confirm(`Cancel appointment for ${app.name}?`)) {
                    appointments.splice(index, 1);
                    saveToLocal();
                    renderAppointments();
                    updateDashboard();
                }
            };
            
            actionCell.appendChild(completeBtn);
            actionCell.appendChild(cancelBtn);
        });
        
        if (appointments.length === 0) {
            const emptyRow = tbody.insertRow();
            emptyRow.insertCell(0).colSpan = 5;
            emptyRow.innerText = 'No appointments scheduled. Add one above.';
            emptyRow.style.textAlign = 'center';
            emptyRow.style.padding = '2rem';
        }
    }
    
    // Add appointment button handler
    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const name = document.getElementById('patName').value.trim();
            const service = document.getElementById('patService').value;
            const datetime = document.getElementById('patDateTime').value;
            
            if (!name || !datetime) {
                alert('Please enter patient name and appointment date/time.');
                return;
            }
            
            const newApp = {
                name: name,
                service: service,
                datetime: datetime,
                status: 'Pending'
            };
            
            appointments.push(newApp);
            saveToLocal();
            
            // Clear form
            document.getElementById('patName').value = '';
            document.getElementById('patDateTime').value = '';
            
            renderAppointments();
            updateDashboard();
            
            alert(`Appointment scheduled for ${name} on ${datetime}`);
        });
    }
    
    // Initialize ERP
    updateDashboard();
    renderAppointments();
}

// ========= ADD HOVER EFFECT TO ALL CARDS =========
// This adds a subtle 3D effect to cards when mouse moves
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.service-card, .testimonial-card, .promo-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });
});
// ========================================
// HAMBURGER MENU - MOBILE SLIDER
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sliderMenu = document.getElementById('sliderMenu');
    const sliderOverlay = document.getElementById('sliderOverlay');
    const closeSliderBtn = document.getElementById('closeSliderBtn');
    
    // Function to open slider
    function openSlider() {
        if (sliderMenu && sliderOverlay) {
            sliderMenu.classList.add('active');
            sliderOverlay.classList.add('active');
            document.body.classList.add('menu-open');
            if (hamburgerBtn) hamburgerBtn.classList.add('active');
        }
    }
    
    // Function to close slider
    function closeSlider() {
        if (sliderMenu && sliderOverlay) {
            sliderMenu.classList.remove('active');
            sliderOverlay.classList.remove('active');
            document.body.classList.remove('menu-open');
            if (hamburgerBtn) hamburgerBtn.classList.remove('active');
        }
    }
    
    // Event listeners
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', openSlider);
    }
    
    if (closeSliderBtn) {
        closeSliderBtn.addEventListener('click', closeSlider);
    }
    
    if (sliderOverlay) {
        sliderOverlay.addEventListener('click', closeSlider);
    }
    
    // Close slider when a navigation link is clicked
    const sliderLinks = document.querySelectorAll('.slider-nav a');
    sliderLinks.forEach(link => {
        link.addEventListener('click', closeSlider);
    });
    
    // Close slider on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sliderMenu && sliderMenu.classList.contains('active')) {
            closeSlider();
        }
    });
}); 
