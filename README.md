# Password Analyzer

A Flask-based web application that analyzes password strength using combinatorial principles and provides comprehensive security insights.

## Features

### 🔐 Password Analysis
- **Entropy Calculation**: Measures password strength using information theory (bits of entropy)
- **Character Set Detection**: Identifies lowercase, uppercase, numbers, and special characters
- **Password Space Calculation**: Computes total possible password combinations (C^L)
- **Crack Time Estimation**: Estimates time to crack assuming 1 billion attempts per second
- **Pattern Detection**: Identifies common weak patterns like "12345", "qwerty", etc.

### 🛡️ Security Recommendations
- Personalized suggestions based on password analysis
- Length recommendations (minimum 12 characters)
- Character diversity suggestions
- Pattern avoidance advice

### 🎲 Password Generation
- Customizable character sets (lowercase, uppercase, numbers, special characters)
- Adjustable password length
- Instant analysis of generated passwords

### 📊 Attack Simulation
- Shows how password modifications affect security
- Compares original password with improved variations
- Demonstrates the impact of length vs. complexity

## Installation

### Prerequisites
- Python 3.7 or higher
- pip package manager

### Setup
1. Clone or download the application files
2. Install Flask:
   ```bash
   pip install flask
   ```
3. Run the application:
   ```bash
   python app.py
   ```
4. Open your browser and navigate to `http://localhost:5000`

## API Endpoints

### `POST /analyze`
Analyzes a given password and returns detailed security metrics.

**Request Body:**
```json
{
    "password": "your_password_here"
}
```

**Response:**
```json
{
    "length": 12,
    "charset_size": 95,
    "password_space": 5.40e23,
    "entropy": 78.8,
    "strength_level": "Strong",
    "strength_percentage": 80,
    "seconds_to_crack": 5.40e14,
    "time_to_crack_formatted": "17.13 million years",
    "has_lowercase": true,
    "has_uppercase": true,
    "has_numbers": true,
    "has_special": true,
    "detected_patterns": [],
    "recommendations": ["Your password follows good security practices!"]
}
```

### `POST /generate-password`
Generates a strong password based on specified criteria.

**Request Body:**
```json
{
    "length": 16,
    "lowercase": true,
    "uppercase": true,
    "numbers": true,
    "special": true
}
```

### `POST /simulate-attack`
Simulates various password modifications and their security impact.

**Request Body:**
```json
{
    "password": "example123"
}
```

## Password Strength Levels

| Entropy (bits) | Strength Level | Description |
|----------------|----------------|-------------|
| < 28           | Very Weak      | Easily crackable |
| 28-40          | Weak           | Vulnerable to attacks |
| 40-60          | Moderate       | Acceptable for low-risk accounts |
| 60-80          | Strong         | Good for most purposes |
| 80+            | Very Strong    | Excellent security |

## Security Calculations

### Character Set Sizes
- **Lowercase letters**: 26 characters (a-z)
- **Uppercase letters**: 26 characters (A-Z)
- **Numbers**: 10 characters (0-9)
- **Special characters**: ~33 characters (punctuation and symbols)

### Formulas Used
- **Password Space**: S = C^L (where C = character set size, L = length)
- **Entropy**: H = L × log₂(C) bits
- **Crack Time**: T = S / (2 × attempts_per_second) seconds (average case)

## Pattern Detection

The application detects common weak patterns:
- Sequential numbers (12345)
- Keyboard patterns (qwerty)
- Common passwords (password)
- Word + numbers pattern (password123)
- Other predictable patterns

## File Structure

```
password-analyzer/
├── app.py              # Main Flask application
├── templates/
│   └── index.html      # Frontend interface (not included)
├── static/
│   ├── css/           # Stylesheets (not included)
│   └── js/            # JavaScript files (not included)
└── README.md          # This file
```

## Usage Examples

### Basic Password Analysis
```python
from app import analyze_password

result = analyze_password("MySecureP@ssw0rd!")
print(f"Entropy: {result['entropy']} bits")
print(f"Strength: {result['strength_level']}")
```

### Generate Strong Password
```python
import requests

response = requests.post('http://localhost:5000/generate-password', json={
    'length': 20,
    'lowercase': True,
    'uppercase': True,
    'numbers': True,
    'special': True
})
password_data = response.json()
print(f"Generated: {password_data['password']}")
```

## Security Considerations

⚠️ **Important Security Notes:**
- This tool is for educational and analysis purposes
- Never transmit real passwords over unencrypted connections
- The crack time estimates assume no advanced attack techniques
- Always use unique passwords for different accounts
- Consider using a reputable password manager

## Contributing

To contribute to this project:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Flask](https://flask.palletsprojects.com/)
- Password strength calculations based on NIST guidelines
- Entropy calculations follow information theory principles

---

**Disclaimer**: This tool provides estimates based on mathematical models. Real-world password security depends on many factors including the specific attack methods, hardware capabilities, and implementation details of the target system.
