class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.size = 4;
        this.gridElement = document.getElementById('grid');
        this.scoreElement = document.getElementById('score');
        this.initializeGrid();
        this.setupEventListeners();
        this.addRandomTile();
        this.addRandomTile();
    }

    initializeGrid() {
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.gridElement.appendChild(cell);
                this.grid[i][j] = null;
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
        const cell = this.gridElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = value ? value : '';
        cell.className = 'grid-cell';
        if (value) {
            cell.classList.add(`tile-${value}`);
            if (isNew) {
                cell.classList.add('new-tile-animation');
            }
        }
    }

    move(direction) {
        let moved = false;
        const rotatedGrid = this.rotateGrid(direction);
        
        for (let i = 0; i < this.size; i++) {
            const row = rotatedGrid[i];
            const newRow = this.mergeTiles(row);
            rotatedGrid[i] = newRow;
            
            if (JSON.stringify(row) !== JSON.stringify(newRow)) {
                moved = true;
            }
        }

        const finalGrid = this.unrotateGrid(rotatedGrid, direction);
        
        if (moved) {
            this.grid = finalGrid;
            this.addRandomTile();
            this.renderGrid();
        }
    }

    mergeTiles(row) {
        const filteredRow = row.filter(val => val !== null);
        const mergedRow = [];

        for (let i = 0; i < filteredRow.length; i++) {
            if (i < filteredRow.length - 1 && filteredRow[i] === filteredRow[i + 1]) {
                const mergedValue = filteredRow[i] * 2;
                mergedRow.push(mergedValue);
                this.score += mergedValue;
                i++;
            } else {
                mergedRow.push(filteredRow[i]);
            }
        }

        while (mergedRow.length < this.size) {
            mergedRow.push(null);
        }

        this.scoreElement.textContent = this.score;
        return mergedRow;
    }

    rotateGrid(direction) {
        const rotated = [];
        for (let i = 0; i < this.size; i++) {
            rotated[i] = [];
            for (let j = 0; j < this.size; j++) {
                switch(direction) {
                    case 'left': rotated[i][j] = this.grid[j][this.size - 1 - i]; break;
                    case 'right': rotated[i][j] = this.grid[this.size - 1 - j][i]; break;
                    case 'up': rotated[i][j] = this.grid[i][j]; break;
                    case 'down': rotated[i][j] = this.grid[this.size - 1 - i][this.size - 1 - j]; break;
                }
            }
        }
        return rotated;
    }

    unrotateGrid(rotatedGrid, direction) {
        const unrotated = [];
        for (let i = 0; i < this.size; i++) {
            unrotated[i] = [];
            for (let j = 0; j < this.size; j++) {
                switch(direction) {
                    case 'left': unrotated[this.size - 1 - j][i] = rotatedGrid[i][j]; break;
                    case 'right': unrotated[j][this.size - 1 - i] = rotatedGrid[i][j]; break;
                    case 'up': unrotated[i][j] = rotatedGrid[i][j]; break;
                    case 'down': unrotated[this.size - 1 - i][this.size - 1 - j] = rotatedGrid[i][j]; break;
                }
            }
        }
        return unrotated;
    }

    renderGrid() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.updateCell(i, j, this.grid[i][j]);
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft': this.move('left'); break;
                case 'ArrowRight': this.move('right'); break;
                case 'ArrowUp': this.move('up'); break;
                case 'ArrowDown': this.move('down'); break;
            }
        });

        // Touch/swipe support (basic implementation)
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                diffX > 0 ? this.move('right') : this.move('left');
            } else {
                // Vertical swipe
                diffY > 0 ? this.move('down') : this.move('up');
            }
        });
    }

    checkGameOver() {
        // Check if no more moves are possible
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === null) return false;
                
                // Check adjacent cells for possible merges
                const directions = [
                    {dx: 1, dy: 0}, {dx: -1, dy: 0}, 
                    {dx: 0, dy: 1}, {dx: 0, dy: -1}
                ];

                for (let {dx, dy} of directions) {
                    const newX = i + dx;
                    const newY = j + dy;
                    
                    if (newX >= 0 && newX < this.size && 
                        newY >= 0 && newY < this.size && 
                        this.grid[i][j] === this.grid[newX][newY]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game2048();
});
