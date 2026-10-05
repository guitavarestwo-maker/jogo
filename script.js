const TILE_SIZE = 32;
const COLS = 20;
const ROWS = 16;

// Tipos de Bloco no Grid
const TILE = {
    EMPTY: 0,
    WALL: 1,
    ICE: 2
};

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.level = 1;
        this.score = 0;
        this.lives = 3;
        this.isGameOver = false;

        this.grid = [];
        this.items = [];
        this.monsters = [];
        
        this.player = {
            x: 1,
            y: 1,
            dirX: 0,
            dirY: 1,
            color: '#00f2fe'
        };

        this.mathTarget = 0;
        this.targetDescription = "";
        this.collectedValues = [];

        this.initControls();
        this.loadLevel(this.level);
        this.gameLoop();
    }

    initControls() {
        window.addEventListener('keydown', (e) => {
            if (this.isGameOver) return;

            let nx = this.player.x;
            let ny = this.player.y;

            if (e.key === 'ArrowUp') { ny--; this.player.dirX = 0; this.player.dirY = -1; }
            else if (e.key === 'ArrowDown') { ny++; this.player.dirX = 0; this.player.dirY = 1; }
            else if (e.key === 'ArrowLeft') { nx--; this.player.dirX = -1; this.player.dirY = 0; }
