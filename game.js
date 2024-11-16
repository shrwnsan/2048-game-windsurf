class Game2048 {
    constructor(size = 4) {
        this.size = size;
        this.grid = Array(size).fill().map(() => Array(size).fill(null));
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.isGameOver = false;
        this.isDragging = false;

        this.initializeLoading();

        // Initialize DOM elements
        this.initializeElements();
        
        // Set up game
        this.setupModals();
        this.setupEventListeners();
        this.initializeGrid();
        this.addRandomTile();
        this.addRandomTile();
        this.renderGrid();

        // Show game after initialization
        // this.showGame();
    }

    initializeLoading() {
        const loadingSteps = [
            { message: "Initializing game...", progress: 10 },
            { message: "Setting up game board...", progress: 30 },
            { message: "Loading animations...", progress: 50 },
            { message: "Preparing touch controls...", progress: 70 },
            { message: "Almost ready...", progress: 90 }
        ];

        const loadingStatus = document.querySelector('.loading-status');
        const progressBar = document.querySelector('#loadingProgressBar');
        let currentStep = 0;

        const updateLoading = () => {
            if (currentStep >= loadingSteps.length) {
                this.finishLoading();
                return;
            }

            const step = loadingSteps[currentStep];
            loadingStatus.textContent = step.message;
            progressBar.style.width = `${step.progress}%`;
            currentStep++;

            setTimeout(updateLoading, 500);
        };

        updateLoading();
    }

    finishLoading() {
        const loadingStatus = document.querySelector('.loading-status');
        const progressBar = document.querySelector('#loadingProgressBar');
        
        loadingStatus.textContent = "Ready!";
        progressBar.style.width = "100%";

        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            const gameContainer = document.getElementById('gameContainer');
            
            loadingScreen.style.opacity = '0';
            gameContainer.style.opacity = '1';
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 200);
    }

    initializeElements() {
        // Get DOM elements
        this.gridElement = document.getElementById('grid');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('bestScore');
        this.messageElement = document.querySelector('.game-message');
        this.retryButton = document.querySelector('.retry-button');
        this.settingsButton = document.getElementById('settingsButton');
        this.settingsModal = document.querySelector('.settings-modal');
        this.settingsClose = document.querySelector('.settings-close');
        this.darkModeToggle = document.getElementById('darkModeToggle');

        // Initialize dark mode
        this.initializeDarkMode();
        
        // Loading screen and game container
        this.loadingScreen = document.getElementById('loadingScreen');
        this.gameContainer = document.getElementById('gameContainer');
        
        // Modal elements
        this.modalOverlay = document.querySelector('.modal-overlay');
        this.modal = document.querySelector('.modal');
        this.modalTitle = document.querySelector('.modal-title');
        this.modalMessage = document.querySelector('.modal-message');
        this.modalButton = document.querySelector('.modal-button');
        
        // Test buttons
        this.testConfettiButton = document.getElementById('testConfetti');
        this.testSuccessButton = document.getElementById('testSuccess');
        this.testGameOverButton = document.getElementById('testGameOver');

        // Validate critical elements
        if (!this.gridElement || !this.loadingScreen || !this.gameContainer) {
            throw new Error('Critical game elements not found');
        }
    }

    initializeDarkMode() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        this.darkModeToggle.checked = savedTheme === 'dark';

        // Add event listener for theme toggle
        this.darkModeToggle.addEventListener('change', () => {
            const theme = this.darkModeToggle.checked ? 'dark' : 'light';
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        });
    }

    setupModals() {
        // Game modal
        this.modalButton.addEventListener('click', () => {
            this.hideModal();
            this.resetGame();
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.hideModal();
            }
            if (e.target === this.settingsModal) {
                this.hideSettingsModal();
            }
        });

        // Close settings modal with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                this.hideSettingsModal();
            }
        });
    }

    showModal(title, message, buttonText = 'OK', callback = null) {
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        this.modalButton.textContent = buttonText;

        // Add modal-open class to body to prevent scrolling
        document.body.classList.add('modal-open');
        
        this.modalOverlay.classList.add('active');
        this.modalOverlay.style.display = 'flex';

        this.modalButton.onclick = () => {
            this.hideModal();
            if (callback) callback();
        };

        // Prevent touch events from propagating through the modal
        this.modal.addEventListener('touchmove', (e) => {
            e.stopPropagation();
        }, { passive: true });
    }

    hideModal() {
        if (this.modalOverlay) {
            this.modalOverlay.style.display = 'none';
        }
        if (this.modal) {
            this.modal.style.display = 'none';
        }
        
        // Remove modal-open class from body to restore scrolling
        document.body.classList.remove('modal-open');

        // Reset game if it was a game over modal
        if (this.modalTitle?.textContent === 'Game Over!') {
            this.resetGame();
        }
    }

    setupEventListeners() {
        // Settings modal
        this.settingsButton?.addEventListener('click', () => this.showSettingsModal());
        this.settingsClose?.addEventListener('click', () => this.hideSettingsModal());

        // Test buttons
        this.testConfettiButton?.addEventListener('click', () => this.createConfetti());
        this.testSuccessButton?.addEventListener('click', () => {
            this.hideSettingsModal();
            setTimeout(() => this.showWinModal(), 300); // Add delay for smooth transition
        });
        this.testGameOverButton?.addEventListener('click', () => {
            this.hideSettingsModal();
            setTimeout(() => this.handleGameOver(), 300); // Add delay for smooth transition
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.hideModal();
            }
            if (e.target === this.settingsModal) {
                this.hideSettingsModal();
            }
        });

        // Close modal with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                this.hideSettingsModal();
            }
        });

        // Touch event listeners for mobile gameplay
        let touchStartX = 0;
        let touchStartY = 0;

        const getEventPoint = (e) => {
            if (e.type.startsWith('touch')) {
                return e.type === 'touchend' || e.type === 'touchcancel' ? 
                    (e.changedTouches?.[0] ?? null) : 
                    (e.touches?.[0] ?? null);
            }
            return e;
        };

        const handleStart = (e) => {
            const cell = e.target.closest('.grid-cell');
            if (cell && cell.querySelector('span')) {
                e.preventDefault();
                const point = getEventPoint(e);
                if (!point) return;
                
                touchStartX = point.clientX;
                touchStartY = point.clientY;
                this.isDragging = true;
                
                cell.classList.add('tile-dragging');
                this.gridElement.classList.add('dragging');
            }
        };

        const handleMove = (e) => {
            if (!this.isDragging) return;
            e.preventDefault();

            const point = getEventPoint(e);
            if (!point) {
                handleCancel();
                return;
            }

            const diffX = point.clientX - touchStartX;
            const diffY = point.clientY - touchStartY;
            
            const minDist = 30;

            // Clear previous highlights and direction hints
            const cells = this.gridElement.querySelectorAll('.grid-cell');
            cells.forEach(cell => {
                cell.classList.remove('potential-drop', 'potential-path', 'direction-hint', 'tile-dragging');
            });
            this.gridElement.parentElement.classList.remove('dragging-up', 'dragging-down', 'dragging-left', 'dragging-right');

            if (Math.abs(diffX) > minDist || Math.abs(diffY) > minDist) {
                const cell = e.target.closest('.grid-cell');
                if (!cell) return;

                const currentRow = parseInt(cell.dataset.row);
                const currentCol = parseInt(cell.dataset.col);

                if (isNaN(currentRow) || isNaN(currentCol) || 
                    currentRow < 0 || currentRow >= this.size || 
                    currentCol < 0 || currentCol >= this.size) {
                    return;
                }

                let direction;
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    direction = diffX > 0 ? 'right' : 'left';
                } else {
                    direction = diffY > 0 ? 'down' : 'up';
                }

                this.gridElement.parentElement.classList.add(`dragging-${direction}`);

                // Add direction hints to non-empty cells
                cells.forEach(cell => {
                    if (cell.querySelector('span')) {
                        cell.classList.add('direction-hint');
                    }
                });

                // Find and highlight all tiles that will move
                for (let i = 0; i < this.size; i++) {
                    for (let j = 0; j < this.size; j++) {
                        if (!this.grid[i]?.[j]) continue;

                        const farthest = this.findFarthestPosition(i, j, direction);
                        if (!farthest) continue;

                        const next = this.getNextPosition(farthest.row, farthest.col, direction);
                        if (!next) continue;

                        const currentValue = this.grid[i]?.[j];
                        const nextValue = this.grid[next.row]?.[next.col];
                        
                        if (farthest.row !== i || farthest.col !== j || 
                            (next && nextValue === currentValue)) {
                            // This tile will move - highlight its path
                            const pathCell = this.gridElement.querySelector(
                                `.grid-cell[data-row="${farthest.row}"][data-col="${farthest.col}"]`
                            );
                            if (pathCell) {
                                pathCell.classList.add('potential-path');
                            }
                            
                            // If there's a merge possibility, highlight the merge cell
                            if (next && nextValue === currentValue) {
                                const mergeCell = this.gridElement.querySelector(
                                    `.grid-cell[data-row="${next.row}"][data-col="${next.col}"]`
                                );
                                if (mergeCell) {
                                    mergeCell.classList.add('potential-drop');
                                }
                            }
                        }
                    }
                }
            }
        };

        const handleEnd = (e) => {
            if (!this.isDragging) return;
            e.preventDefault();

            const point = getEventPoint(e);
            if (!point) {
                handleCancel();
                return;
            }

            const diffX = point.clientX - touchStartX;
            const diffY = point.clientY - touchStartY;
            
            const minDist = 30;

            if (Math.abs(diffX) > minDist || Math.abs(diffY) > minDist) {
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    this.move(diffX > 0 ? 'right' : 'left');
                } else {
                    this.move(diffY > 0 ? 'down' : 'up');
                }
            }

            // Clean up
            const cells = this.gridElement.querySelectorAll('.grid-cell');
            cells.forEach(cell => {
                cell.classList.remove('potential-drop', 'potential-path', 'direction-hint', 'tile-dragging');
            });
            this.gridElement.classList.remove('dragging');
            this.gridElement.parentElement.classList.remove('dragging-up', 'dragging-down', 'dragging-left', 'dragging-right');
            
            this.isDragging = false;
        };

        const handleCancel = () => {
            if (this.isDragging) {
                const cells = this.gridElement.querySelectorAll('.grid-cell');
                cells.forEach(cell => cell.classList.remove('potential-drop', 'potential-path', 'direction-hint', 'tile-dragging'));
                this.gridElement.classList.remove('dragging');
                this.gridElement.parentElement.classList.remove('dragging-up', 'dragging-down', 'dragging-left', 'dragging-right');
                
                this.isDragging = false;
            }
        };

        // Mouse events
        this.gridElement.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('mouseleave', handleCancel);

        // Touch events
        this.gridElement.addEventListener('touchstart', handleStart, { passive: false });
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd, { passive: false });
        document.addEventListener('touchcancel', handleCancel);
    }

    initializeGrid() {
        // Clear the grid element first
        this.gridElement.innerHTML = '';
        
        // Create grid container
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-container';
        
        // Initialize empty grid
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.gridElement.appendChild(cell);
            }
        }
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === null) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }

        if (emptyCells.length > 0) {
            const {row, col} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.grid[row][col] = value;
            this.updateCell(row, col, value, true);
        }
    }

    updateCell(row, col, value, isNew = false) {
        const cell = this.gridElement.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            // Remove all previous classes except 'grid-cell'
            cell.className = 'grid-cell';
            if (value !== null) {
                cell.classList.add(`tile-${value}`);
                cell.innerHTML = `<span>${value}</span>`;
                if (isNew) {
                    cell.classList.add('new-tile-animation');
                }
            } else {
                cell.innerHTML = '';
            }
        }
    }

    move(direction) {
        // Don't allow moves if waiting for user response after game over
        if (this.isGameOver) return;

        let moved = false;
        const newGrid = Array(this.size).fill().map(() => Array(this.size).fill(null));
        
        switch(direction) {
            case 'up':
                for (let col = 0; col < this.size; col++) {
                    let writePos = 0;
                    let lastValue = null;
                    
                    for (let row = 0; row < this.size; row++) {
                        if (this.grid[row][col] !== null) {
                            if (lastValue === null) {
                                lastValue = this.grid[row][col];
                            } else if (lastValue === this.grid[row][col]) {
                                newGrid[writePos][col] = lastValue * 2;
                                this.score += lastValue * 2;
                                if (lastValue * 2 === 2048) {
                                    this.handleWin();
                                }
                                lastValue = null;
                                writePos++;
                                moved = true;
                            } else {
                                newGrid[writePos][col] = lastValue;
                                lastValue = this.grid[row][col];
                                writePos++;
                            }
                        }
                    }
                    if (lastValue !== null) {
                        newGrid[writePos][col] = lastValue;
                    }
                }
                break;

            case 'down':
                for (let col = 0; col < this.size; col++) {
                    let writePos = this.size - 1;
                    let lastValue = null;
                    
                    for (let row = this.size - 1; row >= 0; row--) {
                        if (this.grid[row][col] !== null) {
                            if (lastValue === null) {
                                lastValue = this.grid[row][col];
                            } else if (lastValue === this.grid[row][col]) {
                                newGrid[writePos][col] = lastValue * 2;
                                this.score += lastValue * 2;
                                if (lastValue * 2 === 2048) {
                                    this.handleWin();
                                }
                                lastValue = null;
                                writePos--;
                                moved = true;
                            } else {
                                newGrid[writePos][col] = lastValue;
                                lastValue = this.grid[row][col];
                                writePos--;
                            }
                        }
                    }
                    if (lastValue !== null) {
                        newGrid[writePos][col] = lastValue;
                    }
                }
                break;

            case 'left':
                for (let row = 0; row < this.size; row++) {
                    let writePos = 0;
                    let lastValue = null;
                    
                    for (let col = 0; col < this.size; col++) {
                        if (this.grid[row][col] !== null) {
                            if (lastValue === null) {
                                lastValue = this.grid[row][col];
                            } else if (lastValue === this.grid[row][col]) {
                                newGrid[row][writePos] = lastValue * 2;
                                this.score += lastValue * 2;
                                if (lastValue * 2 === 2048) {
                                    this.handleWin();
                                }
                                lastValue = null;
                                writePos++;
                                moved = true;
                            } else {
                                newGrid[row][writePos] = lastValue;
                                lastValue = this.grid[row][col];
                                writePos++;
                            }
                        }
                    }
                    if (lastValue !== null) {
                        newGrid[row][writePos] = lastValue;
                    }
                }
                break;

            case 'right':
                for (let row = 0; row < this.size; row++) {
                    let writePos = this.size - 1;
                    let lastValue = null;
                    
                    for (let col = this.size - 1; col >= 0; col--) {
                        if (this.grid[row][col] !== null) {
                            if (lastValue === null) {
                                lastValue = this.grid[row][col];
                            } else if (lastValue === this.grid[row][col]) {
                                newGrid[row][writePos] = lastValue * 2;
                                this.score += lastValue * 2;
                                if (lastValue * 2 === 2048) {
                                    this.handleWin();
                                }
                                lastValue = null;
                                writePos--;
                                moved = true;
                            } else {
                                newGrid[row][writePos] = lastValue;
                                lastValue = this.grid[row][col];
                                writePos--;
                            }
                        }
                    }
                    if (lastValue !== null) {
                        newGrid[row][writePos] = lastValue;
                    }
                }
                break;
        }

        if (moved || JSON.stringify(this.grid) !== JSON.stringify(newGrid)) {
            this.grid = newGrid;
            this.addRandomTile();
            this.renderGrid();
            this.scoreElement.textContent = this.score;
            
            if (this.checkGameOver()) {
                this.isGameOver = true;
                setTimeout(() => {
                    this.handleGameOver();
                }, 300); // Small delay to show the last move
            }
        }
    }

    handleWin() {
        this.createConfetti();
    }

    checkGameOver() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === null) {
                    return false;
                }
            }
        }

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                
                if (j < this.size - 1 && current === this.grid[i][j + 1]) {
                    return false;
                }
                
                if (i < this.size - 1 && current === this.grid[i + 1][j]) {
                    return false;
                }
            }
        }

        return true;
    }

    renderGrid() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.updateCell(i, j, this.grid[i][j]);
            }
        }
    }

    findFarthestPosition(row, col, direction) {
        if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
            return null;
        }

        let farthest = { row, col };
        let next = { row, col };

        // Calculate the next position based on direction
        const getNextPosition = (pos) => {
            if (!pos) return null;
            switch(direction) {
                case 'up': return { row: pos.row - 1, col: pos.col };
                case 'down': return { row: pos.row + 1, col: pos.col };
                case 'left': return { row: pos.row, col: pos.col - 1 };
                case 'right': return { row: pos.row, col: pos.col + 1 };
                default: return null;
            }
        };

        // Keep moving in the direction until we hit a boundary or a non-null cell
        do {
            farthest = next;
            next = getNextPosition(farthest);
        } while (
            next &&
            next.row >= 0 && next.row < this.size &&
            next.col >= 0 && next.col < this.size &&
            this.grid[next.row]?.[next.col] === null
        );

        return farthest;
    }

    getNextPosition(row, col, direction) {
        if (!direction || row < 0 || row >= this.size || col < 0 || col >= this.size) {
            return null;
        }

        let next;
        switch(direction) {
            case 'up': next = { row: row - 1, col: col }; break;
            case 'down': next = { row: row + 1, col: col }; break;
            case 'left': next = { row: row, col: col - 1 }; break;
            case 'right': next = { row: row, col: col + 1 }; break;
            default: return null;
        }

        if (next.row < 0 || next.row >= this.size || next.col < 0 || next.col >= this.size) {
            return null;
        }

        return next;
    }

    createConfetti() {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            spread: 360,
            ticks: 100,
            gravity: 0,
            decay: 0.94,
            startVelocity: 30,
            shapes: ['star'],
            colors: ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#9b5de5', '#f15bb5']
        };

        function fire(particleRatio, opts) {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio)
            }));
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        fire(0.2, {
            spread: 60,
        });

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }

    showWinModal() {
        if (this.modalTitle && this.modalMessage && this.modalButton) {
            this.modalTitle.textContent = 'Congratulations!';
            this.modalMessage.textContent = 'You\'ve reached 2048! Keep playing to achieve an even higher score!';
            this.modalButton.textContent = 'Keep Playing';
            this.modalOverlay.style.display = 'flex';
            this.modal.style.display = 'block';
            document.body.classList.add('modal-open');
            this.createConfetti();
        }
    }

    handleGameOver() {
        if (this.modalTitle && this.modalMessage && this.modalButton) {
            this.modalTitle.textContent = 'Game Over!';
            this.modalMessage.textContent = `Your final score is ${this.score}. Try again?`;
            this.modalButton.textContent = 'Try Again';
            this.modalOverlay.style.display = 'flex';
            this.modal.style.display = 'block';
            document.body.classList.add('modal-open');
        }
    }

    showSettingsModal() {
        if (this.settingsModal) {
            this.settingsModal.style.display = 'flex';
            document.body.classList.add('modal-open');
        }
    }

    hideSettingsModal() {
        if (this.settingsModal) {
            this.settingsModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }

    resetGame() {
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(null));
        this.renderGrid();
        this.addRandomTile();
        this.addRandomTile();
    }

    showGame() {
        // Wait for DOM to be ready
        if (!this.loadingScreen || !this.gameContainer) {
            console.warn('Loading screen or game container not found');
            return;
        }

        // Ensure all game elements are ready
        requestAnimationFrame(() => {
            // Show game container first
            this.gameContainer.style.opacity = '1';
            
            // Then fade out loading screen
            setTimeout(() => {
                this.loadingScreen.style.opacity = '0';
                
                // Remove loading screen after fade
                setTimeout(() => {
                    this.loadingScreen.style.display = 'none';
                }, 500);
            }, 1000); // Give more time to see the loading screen
        });
    }
}

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Show loading screen immediately
        const loadingScreen = document.getElementById('loadingScreen');
        const gameContainer = document.getElementById('gameContainer');
        
        if (loadingScreen && gameContainer) {
            loadingScreen.style.display = 'flex';
            loadingScreen.style.opacity = '1';
            gameContainer.style.opacity = '0';
            
            // Initialize game with a slight delay
            setTimeout(() => {
                new Game2048();
            }, 500);
        } else {
            console.error('Required game elements not found');
        }
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});
