/**
 * Module de gestion du chat fonctionnel
 */

class ChatManager {
    constructor() {
        this.messages = [];
        this.conversations = new Map();
        this.currentUser = null;
        this.currentConversation = null;
        this.isOpen = false;
        this.unreadCount = 0;
        this.init();
    }

    init() {
        this.loadMessages();
        
        const user = localStorage.getItem('user');
        if (user) {
            this.currentUser = JSON.parse(user);
        }

        this.initDemoMessages();
        this.organizeConversations();
        this.updateChatInterface();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Écouter les soumissions de formulaire de chat
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'chat-form') {
                e.preventDefault();
                const input = document.getElementById('chat-input');
                if (input && input.value.trim()) {
                    this.sendMessage(input.value.trim());
                    input.value = '';
                }
            }
        });

        // Écouter les clics sur les boutons de chat
        document.addEventListener('click', (e) => {
            if (e.target.closest('.chat-toggle')) {
                this.toggleChat();
            }
        });
    }

    loadMessages() {
        const saved = localStorage.getItem('manohpressing_chat_messages');
        if (saved) {
            this.messages = JSON.parse(saved);
        }
    }

    saveMessages() {
        localStorage.setItem('manohpressing_chat_messages', JSON.stringify(this.messages));
    }

    initDemoMessages() {
        if (this.messages.length === 0 && this.currentUser) {
            const now = Date.now();

            if (this.currentUser.role === 'client') {
                this.messages = [
                    {
                        id: 1,
                        senderId: 2,
                        senderName: 'Jean Dupont (Gérant)',
                        receiverId: this.currentUser.id,
                        message: `Bonjour ${this.currentUser.firstName} ! Votre commande est prête à être récupérée.`,
                        timestamp: new Date(now - 3600000).toISOString(),
                        isRead: false
                    },
                    {
                        id: 2,
                        senderId: 2,
                        senderName: 'Jean Dupont (Gérant)',
                        receiverId: this.currentUser.id,
                        message: 'Vous pouvez passer la récupérer quand vous voulez. Nous sommes ouverts jusqu\'à 18h30.',
                        timestamp: new Date(now - 3500000).toISOString(),
                        isRead: false
                    }
                ];
            } else if (this.currentUser.role === 'manager') {
                this.messages = [
                    {
                        id: 1,
                        senderId: 3,
                        senderName: 'Marie Martin',
                        receiverId: this.currentUser.id,
                        message: 'Bonjour, j\'aimerais savoir où en est ma commande ?',
                        timestamp: new Date(now - 7200000).toISOString(),
                        isRead: false
                    },
                    {
                        id: 2,
                        senderId: 4,
                        senderName: 'Pierre Durand',
                        receiverId: this.currentUser.id,
                        message: 'Bonsoir, mon manteau est-il prêt ?',
                        timestamp: new Date(now - 5400000).toISOString(),
                        isRead: false
                    }
                ];
            }
            this.saveMessages();
        }
    }

    organizeConversations() {
        this.conversations.clear();
        
        this.messages.forEach(msg => {
            const otherUserId = msg.senderId === this.currentUser.id ? msg.receiverId : msg.senderId;
            const otherUserName = msg.senderId === this.currentUser.id ? 
                this.getReceiverName(msg.receiverId) : msg.senderName;
            
            if (!this.conversations.has(otherUserId)) {
                this.conversations.set(otherUserId, {
                    userId: otherUserId,
                    userName: otherUserName,
                    messages: [],
                    lastMessage: null,
                    unreadCount: 0
                });
            }
            
            const conversation = this.conversations.get(otherUserId);
            conversation.messages.push(msg);
            conversation.lastMessage = msg;
            
            if (msg.receiverId === this.currentUser.id && !msg.isRead) {
                conversation.unreadCount++;
            }
        });
    }

    getReceiverName(receiverId) {
        const userNames = {
            1: 'Admin System',
            2: 'Jean Dupont (Gérant)',
            3: 'Marie Gérant',
            4: 'Pierre Martin',
            5: 'Sophie Dubois',
            6: 'Marie Leroy'
        };
        return userNames[receiverId] || `Utilisateur ${receiverId}`;
    }

    sendMessage(message, receiverId = null) {
        if (!message.trim() || !this.currentUser) return false;

        if (!receiverId) {
            if (this.currentConversation) {
                receiverId = this.currentConversation;
            } else {
                receiverId = this.currentUser.role === 'client' ? 2 : 4;
            }
        }

        const newMessage = {
            id: Date.now(),
            senderId: this.currentUser.id,
            senderName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
            receiverId: receiverId,
            message: message.trim(),
            timestamp: new Date().toISOString(),
            isRead: false
        };

        this.messages.push(newMessage);
        this.saveMessages();
        this.organizeConversations();
        this.updateChatInterface();

        // Simuler une réponse après 2-5 secondes
        setTimeout(() => {
            this.simulateResponse(newMessage);
        }, Math.random() * 3000 + 2000);

        // Afficher une notification de succès
        if (window.showToast) {
            showToast('Message envoyé', 'success');
        }

        return true;
    }

    simulateResponse(originalMessage) {
        const responses = {
            client: [
                'Merci pour votre message. Je vais vérifier l\'état de votre commande.',
                'Votre commande est en cours de traitement. Elle sera prête demain.',
                'Je vous confirme que tout est en ordre. Merci de votre patience.',
                'N\'hésitez pas si vous avez d\'autres questions !',
                'Je vais m\'occuper de cela immédiatement.'
            ],
            manager: [
                'Merci pour l\'information. J\'ai bien noté.',
                'Parfait, merci de m\'avoir tenu au courant.',
                'C\'est noté, je vous remercie.',
                'Très bien, à bientôt !',
                'Merci beaucoup pour votre réactivité.'
            ]
        };

        const responseList = responses[this.currentUser.role === 'client' ? 'manager' : 'client'];
        const randomResponse = responseList[Math.floor(Math.random() * responseList.length)];

        const responseMessage = {
            id: Date.now(),
            senderId: originalMessage.receiverId,
            senderName: this.getReceiverName(originalMessage.receiverId),
            receiverId: originalMessage.senderId,
            message: randomResponse,
            timestamp: new Date().toISOString(),
            isRead: false
        };

        this.messages.push(responseMessage);
        this.saveMessages();
        this.organizeConversations();
        this.updateChatInterface();
        this.updateUnreadCount();
        
        if (window.showToast) {
            showToast('Nouveau message reçu', 'info');
        }
    }

    selectConversation(userId) {
        this.currentConversation = userId;

        // Marquer les messages comme lus
        this.messages.forEach(msg => {
            if (msg.senderId === userId && msg.receiverId === this.currentUser.id && !msg.isRead) {
                msg.isRead = true;
            }
        });

        this.saveMessages();
        this.organizeConversations();
        this.updateChatInterface();
        this.updateUnreadCount();

        // Mettre à jour le titre de la conversation
        const conversationTitle = document.getElementById('chat-conversation-title');
        const inputContainer = document.getElementById('chat-input-container');

        if (conversationTitle && inputContainer) {
            const conversation = this.conversations.get(userId);
            if (conversation) {
                conversationTitle.textContent = conversation.userName;
                inputContainer.style.display = 'block';
            }
        }
    }

    getMessages(conversationUserId = null) {
        const userId = conversationUserId || this.currentConversation;
        if (!userId) return [];
        
        return this.messages.filter(msg => 
            (msg.senderId === this.currentUser.id && msg.receiverId === userId) ||
            (msg.senderId === userId && msg.receiverId === this.currentUser.id)
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    updateUnreadCount() {
        this.unreadCount = this.messages.filter(msg => 
            msg.receiverId === this.currentUser.id && !msg.isRead
        ).length;

        const badges = document.querySelectorAll('#nav-chat-count, .chat-badge');
        badges.forEach(badge => {
            badge.textContent = this.unreadCount;
            badge.style.display = this.unreadCount > 0 ? 'inline' : 'none';
        });
    }

    updateChatInterface() {
        this.updateConversationsList();
        this.updateMessagesView();
        this.updateUnreadCount();
    }

    updateConversationsList() {
        const conversationsList = document.getElementById('conversations-list');
        if (!conversationsList) return;

        if (this.conversations.size === 0) {
            conversationsList.innerHTML = `
                <div class="no-conversations">
                    <i class="fas fa-comments"></i>
                    <p>Aucune conversation</p>
                </div>
            `;
            return;
        }

        conversationsList.innerHTML = Array.from(this.conversations.values()).map(conv => `
            <div class="conversation-item ${conv.userId === this.currentConversation ? 'active' : ''}" 
                 onclick="chatManager.selectConversation(${conv.userId})">
                <div class="conversation-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="conversation-info">
                    <div class="conversation-name">${conv.userName}</div>
                    <div class="conversation-last-message">
                        ${conv.lastMessage ? conv.lastMessage.message.substring(0, 50) + '...' : 'Aucun message'}
                    </div>
                    <div class="conversation-time">
                        ${conv.lastMessage ? this.formatTime(conv.lastMessage.timestamp) : ''}
                    </div>
                </div>
                ${conv.unreadCount > 0 ? `<div class="conversation-unread">${conv.unreadCount}</div>` : ''}
            </div>
        `).join('');
    }

    updateMessagesView() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        if (!this.currentConversation) {
            chatMessages.innerHTML = `
                <div class="no-conversation-selected">
                    <i class="fas fa-comments"></i>
                    <p>Sélectionnez une conversation</p>
                </div>
            `;
            return;
        }

        const messages = this.getMessages();
        let html = '';
        let lastSenderId = null;
        let lastDate = null;

        messages.forEach((msg, index) => {
            const msgDate = new Date(msg.timestamp).toDateString();
            const isSent = msg.senderId === this.currentUser.id;
            const showAvatar = !isSent && (lastSenderId !== msg.senderId || index === 0);
            const isConsecutive = lastSenderId === msg.senderId && lastDate === msgDate;

            // Afficher la date si c'est un nouveau jour
            if (lastDate !== msgDate) {
                html += `
                    <div class="message-date-separator">
                        <span>${this.formatDate(msg.timestamp)}</span>
                    </div>
                `;
            }

            html += `
                <div class="message-wrapper ${isSent ? 'sent' : 'received'} ${isConsecutive ? 'consecutive' : ''}">
                    ${showAvatar ? `
                        <div class="message-avatar">
                            <div class="avatar-circle">
                                ${msg.senderName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    ` : '<div class="message-avatar-spacer"></div>'}

                    <div class="message-bubble-container">
                        <div class="message-bubble ${isSent ? 'sent' : 'received'}">
                            <div class="message-text">${msg.message}</div>
                        </div>
                        <div class="message-time">${this.formatTime(msg.timestamp)}</div>
                    </div>
                </div>
            `;

            lastSenderId = msg.senderId;
            lastDate = msgDate;
        });

        chatMessages.innerHTML = html;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const minutes = Math.floor((now - date) / (1000 * 60));
            return minutes === 0 ? 'À l\'instant' : `${minutes} min`;
        } else if (diffInHours < 24) {
            return date.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diffInDays = (today - messageDate) / (1000 * 60 * 60 * 24);

        if (diffInDays === 0) {
            return 'Aujourd\'hui';
        } else if (diffInDays === 1) {
            return 'Hier';
        } else if (diffInDays < 7) {
            return date.toLocaleDateString('fr-FR', { weekday: 'long' });
        } else {
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        }
    }

    toggleChat() {
        const chatPanel = document.getElementById('chat-panel');
        if (!chatPanel) return;

        this.isOpen = !this.isOpen;
        chatPanel.classList.toggle('open', this.isOpen);

        if (this.isOpen) {
            this.updateChatInterface();
            
            if (!this.currentConversation && this.conversations.size > 0) {
                const firstConversation = this.conversations.keys().next().value;
                this.selectConversation(firstConversation);
            }
            
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                setTimeout(() => chatInput.focus(), 100);
            }
        }
    }

    sendQuickMessage(message) {
        if (this.sendMessage(message)) {
            this.toggleChat();
        }
    }
}

// Initialiser le gestionnaire de chat global
const chatManager = new ChatManager();
window.chatManager = chatManager;
