/**
 * Module Sidebar
 * Gère le toggle et la navigation de la sidebar
 */

class Sidebar {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.overlay = document.querySelector('.sidebar-overlay');
        this.toggleButton = document.querySelector('[data-action="toggle-sidebar"]');
        this.closeButton = document.querySelector('[data-action="close-sidebar"]');
        this.userMenuButton = document.querySelector('[data-action="toggle-user-menu"]');
        this.userDropdown = document.querySelector('.sidebar-user-dropdown');
        this.isOpen = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkScreenSize();
        window.addEventListener('resize', () => this.checkScreenSize());
    }

    bindEvents() {
        // Toggle sidebar
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
        }

        // Close sidebar
        if (this.closeButton) {
            this.closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.close();
            });
        }

        // Close on overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                e.preventDefault();
                this.close();
            });
        }

        // User menu toggle
        if (this.userMenuButton) {
            this.userMenuButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleUserMenu();
            });
        }

        // Close user menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.userDropdown && !this.userDropdown.contains(e.target) && 
                !this.userMenuButton.contains(e.target)) {
                this.closeUserMenu();
            }
        });

        // Handle navigation links
        const navLinks = document.querySelectorAll('.sidebar-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('is-active'));
                // Add active class to clicked link
                link.classList.add('is-active');
                
                // Close sidebar on mobile after navigation
                if (window.innerWidth <= 1024) {
                    this.close();
                }
            });
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.sidebar) {
            this.sidebar.classList.add('is-open');
        }
        if (this.overlay) {
            this.overlay.classList.add('is-open');
        }
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (this.sidebar) {
            this.sidebar.classList.remove('is-open');
        }
        if (this.overlay) {
            this.overlay.classList.remove('is-open');
        }
        this.isOpen = false;
        document.body.style.overflow = '';
    }

    toggleUserMenu() {
        if (this.userDropdown) {
            this.userDropdown.classList.toggle('is-open');
        }
    }

    closeUserMenu() {
        if (this.userDropdown) {
            this.userDropdown.classList.remove('is-open');
        }
    }

    checkScreenSize() {
        const isDesktop = window.innerWidth > 1024;
        
        if (isDesktop) {
            // On desktop, sidebar is always visible
            if (this.sidebar) {
                this.sidebar.classList.remove('is-open');
            }
            if (this.overlay) {
                this.overlay.classList.remove('is-open');
            }
            this.isOpen = false;
            document.body.style.overflow = '';
        } else {
            // On mobile, sidebar is hidden by default
            if (this.sidebar) {
                this.sidebar.classList.remove('is-open');
            }
            if (this.overlay) {
                this.overlay.classList.remove('is-open');
            }
            this.isOpen = false;
        }
    }

    // Method to set active navigation item
    setActiveItem(path) {
        const navLinks = document.querySelectorAll('.sidebar-nav-link');
        navLinks.forEach(link => {
            link.classList.remove('is-active');
            if (link.getAttribute('href') === path) {
                link.classList.add('is-active');
            }
        });
    }
}

// Export the class
export default Sidebar; 