# 2048 Game v1.0

A modern implementation of the classic 2048 puzzle game with smooth animations, touch support, and enhanced visual feedback.

## Features

- 🎮 Classic 2048 gameplay mechanics
- ✨ Smooth animations for tile movements and merges
- 📱 Responsive design - works on both desktop and mobile
- 🎯 Touch and swipe support for mobile devices
- 🎨 Beautiful color scheme matching the original game
- 📊 Score tracking with best score persistence
- 🎉 Celebration effects on reaching 2048
- ⚙️ Customizable settings:
  - Animation speed control
  - Confetti effect toggle
- 🔄 Game state management:
  - "Game Over" detection
  - "You Win" celebration
  - Continue playing after winning
- 💫 Enhanced visual feedback:
  - Tile movement preview
  - Merge possibility indicators
  - Direction hints while dragging
- 🖼️ Custom favicon

## How to Play

1. Use arrow keys (↑ ↓ ← →) or swipe gestures to move tiles
2. Click and drag tiles to preview movements
3. Tiles with the same number merge when they collide
4. After each move, a new tile appears (2 or 4)
5. Combine tiles to reach 2048!

## Getting Started

Simply clone the repository and open `index.html` in your web browser:

```bash
git clone https://github.com/yourusername/2048-game.git
cd 2048-game
```

No build process or dependencies required - it's pure HTML, CSS, and JavaScript!

## Project Structure

```
2048-game/
├── index.html      # Game HTML structure
├── styles.css      # Game styling and animations
├── game.js         # Game logic and mechanics
├── favicon.png     # Game icon
├── README.md       # Project documentation
├── CHANGELOG.md    # Version history
└── LICENSE.md      # MIT License
```

## Technical Features

- Pure HTML5, CSS3, and vanilla JavaScript implementation
- No external dependencies (except canvas-confetti for celebrations)
- Responsive design using CSS Grid and Flexbox
- CSS transitions for smooth animations
- LocalStorage for score persistence
- Event delegation for efficient DOM handling
- Touch event handling for mobile support
- Modular JavaScript architecture
- Comprehensive error handling

## Development Metrics

This project includes detailed development metrics tracking in `session_metrics.csv`. The file tracks various aspects of the development process, particularly focusing on the AI-assisted development workflow.

### Metrics Structure

The CSV file contains the following columns:

- `Timestamp`: UTC timestamp of when the prompt was sent
- `Prompt_Number`: Sequential number of prompts in the project
- `Tokens_Input`: Number of tokens in the user's prompt
- `Tokens_Output`: Number of tokens in the AI's response
- `Lines_Changed`: Number of code lines modified/added/deleted
- `Files_Modified`: Number of files affected by the changes
- `Commit_Hash`: Associated Git commit hash for the changes
- `Description`: Brief description of the changes or purpose of the prompt

### Using the Metrics

You can analyze this data to:
- Track development progress over time
- Measure coding efficiency and AI interaction patterns
- Identify complex changes (high token count/lines changed)
- Correlate commits with specific development steps

The data can be visualized using tools like Excel, Google Sheets, or any data visualization library.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Original 2048 game by Gabriele Cirulli
- Built with pure HTML, CSS, and JavaScript
- Created using Windsurf IDE
- Uses canvas-confetti for celebration effects
