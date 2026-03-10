document.addEventListener('DOMContentLoaded', () => {
    const ideaForm = document.getElementById('ideaForm');
    const ideaBoard = document.getElementById('ideaBoard');
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    const editIdInput = document.getElementById('editId');
    const submitBtn = document.getElementById('submitBtn');

    let ideas = JSON.parse(localStorage.getItem('ideas')) || [];
    let ideaToDelete = null;

    // Load initial ideas
    renderIdeas();

    // Form Submission (Add or Edit)
    ideaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const userName = document.getElementById('userName').value;
        const ideaText = document.getElementById('ideaText').value;
        const editId = editIdInput.value;
        const now = new Date().toLocaleString();

        if (editId) {
            // Edit existing idea
            ideas = ideas.map(idea => {
                if (idea.id === parseInt(editId)) {
                    return {
                        ...idea,
                        name: userName,
                        text: ideaText,
                        updatedAt: now,
                        isEdited: true
                    };
                }
                return idea;
            });
            editIdInput.value = '';
            submitBtn.textContent = 'Post Idea';
        } else {
            // Add new idea
            const newIdea = {
                id: Date.now(),
                name: userName,
                text: ideaText,
                createdAt: now,
                updatedAt: null,
                isEdited: false,
                hasReacted: false // Track if the user has reacted
            };
            ideas.unshift(newIdea);
        }

        saveAndRender();
        ideaForm.reset();
    });

    function renderIdeas() {
        ideaBoard.innerHTML = '';
        ideas.forEach(idea => {
            const card = document.createElement('div');
            card.className = 'idea-card';
            
            const timestampLabel = idea.isEdited ? 'Edited at' : 'Created at';
            const timestampValue = idea.isEdited ? idea.updatedAt : idea.createdAt;

            card.innerHTML = `
                <h3>${escapeHtml(idea.name)}</h3>
                <p class="content">${escapeHtml(idea.text)}</p>
                <div class="timestamp">${timestampLabel}: ${timestampValue}</div>
                <div class="card-footer">
                    <div class="react-section ${idea.hasReacted ? 'reacted' : ''}" onclick="toggleReaction(${idea.id})">
                        <i class="fa-solid fa-heart"></i>
                        <span>${idea.hasReacted ? 'Liked' : 'React'}</span>
                    </div>
                    <div class="card-actions">
                        <i class="fa-solid fa-pen-to-square" onclick="editIdea(${idea.id})" title="Edit"></i>
                        <i class="fa-solid fa-trash" onclick="showDeleteModal(${idea.id})" title="Delete"></i>
                    </div>
                </div>
            `;
            ideaBoard.appendChild(card);
        });
    }

    window.editIdea = (id) => {
        const idea = ideas.find(i => i.id === id);
        if (idea) {
            document.getElementById('userName').value = idea.name;
            document.getElementById('ideaText').value = idea.text;
            editIdInput.value = idea.id;
            submitBtn.textContent = 'Update Idea';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    window.showDeleteModal = (id) => {
        ideaToDelete = id;
        deleteModal.style.display = 'flex';
    };

    confirmDeleteBtn.addEventListener('click', () => {
        if (ideaToDelete) {
            ideas = ideas.filter(idea => idea.id !== ideaToDelete);
            saveAndRender();
            closeModal();
        }
    });

    cancelDeleteBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeModal();
    });

    function closeModal() {
        deleteModal.style.display = 'none';
        ideaToDelete = null;
    }

    // New Toggle Logic: clicking again removes the reaction
    window.toggleReaction = (id) => {
        ideas = ideas.map(idea => {
            if (idea.id === id) {
                return { ...idea, hasReacted: !idea.hasReacted };
            }
            return idea;
        });
        saveAndRender();
    };

    function saveAndRender() {
        localStorage.setItem('ideas', JSON.stringify(ideas));
        renderIdeas();
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
