# app.py
from flask import Flask, render_template, request, jsonify
import math
import re
import time
import random
import string

app = Flask(__name__)

def analyze_password(password):
    """
    Analyze password strength based on combinatorial principles.
    
    Returns a dictionary with analysis results.
    """
    # Calculate password length
    length = len(password)
    
    # Determine character set used
    has_lowercase = bool(re.search(r'[a-z]', password))
    has_uppercase = bool(re.search(r'[A-Z]', password))
    has_numbers = bool(re.search(r'[0-9]', password))
    has_special = bool(re.search(r'[^a-zA-Z0-9]', password))
    
    # Calculate character set size
    charset_size = 0
    if has_lowercase:
        charset_size += 26  # a-z
    if has_uppercase:
        charset_size += 26  # A-Z
    if has_numbers:
        charset_size += 10  # 0-9
    if has_special:
        charset_size += 33  # Special characters (approximation)
    
    # Ensure minimum charset size is 1
    charset_size = max(1, charset_size)
    
    # Calculate password space (S = C^L)
    password_space = charset_size ** length
    
    # Calculate entropy in bits (H = L * log_2(C))
    entropy = length * math.log2(charset_size) if charset_size > 1 else 0
    
    # Determine strength level
    if entropy < 28:
        strength_level = "Very Weak"
        strength_percentage = 20
    elif entropy < 40:
        strength_level = "Weak"
        strength_percentage = 40
    elif entropy < 60:
        strength_level = "Moderate"
        strength_percentage = 60
    elif entropy < 80:
        strength_level = "Strong"
        strength_percentage = 80
    else:
        strength_level = "Very Strong"
        strength_percentage = 100
    
    # Estimate time to crack (assuming 1 billion attempts per second)
    attempts_per_second = 1_000_000_000  # 1 billion
    seconds_to_crack = password_space / attempts_per_second if password_space > 0 else 0
    
    # Common patterns check
    patterns = [
        (r'12345', 'Sequential numbers'),
        (r'qwerty', 'Keyboard pattern'),
        (r'password', 'Common password'),
        (r'[a-zA-Z]+\d{1,4}$', 'Word followed by numbers'),
        (r'^[a-zA-Z]{3,}[0-9]{2,}[^a-zA-Z0-9]{1,}$', 'Predictable pattern')
    ]
    
    detected_patterns = []
    for pattern, description in patterns:
        if re.search(pattern, password, re.IGNORECASE):
            detected_patterns.append(description)
    
    # Generate recommendations
    recommendations = []
    if length < 12:
        recommendations.append("Use a longer password (at least 12 characters)")
    if not has_lowercase:
        recommendations.append("Include lowercase letters")
    if not has_uppercase:
        recommendations.append("Include uppercase letters")
    if not has_numbers:
        recommendations.append("Include numbers")
    if not has_special:
        recommendations.append("Include special characters")
    if entropy < 60:
        recommendations.append("Consider using a passphrase (multiple random words)")
    if detected_patterns:
        recommendations.append(f"Avoid predictable patterns: {', '.join(detected_patterns)}")
    
    if not recommendations:
        recommendations.append("Your password follows good security practices!")
    
    return {
        "length": length,
        "charset_size": charset_size,
        "password_space": password_space,
        "entropy": round(entropy, 2),
        "strength_level": strength_level,
        "strength_percentage": strength_percentage,
        "seconds_to_crack": seconds_to_crack,
        "has_lowercase": has_lowercase,
        "has_uppercase": has_uppercase,
        "has_numbers": has_numbers,
        "has_special": has_special,
        "detected_patterns": detected_patterns,
        "recommendations": recommendations
    }

def format_large_number(num):
    """Format large numbers using scientific notation."""
    if num < 1000:
        return str(num)
    exponent = math.floor(math.log10(num))
    mantissa = num / (10 ** exponent)
    return f"{mantissa:.2f} × 10^{exponent}"

def format_time_to_crack(seconds):
    """Convert seconds to a human-readable time format."""
    if seconds < 0.001:
        return "Instantly"
    elif seconds < 1:
        return f"{seconds * 1000:.2f} milliseconds"
    elif seconds < 60:
        return f"{seconds:.2f} seconds"
    elif seconds < 3600:
        return f"{seconds / 60:.2f} minutes"
    elif seconds < 86400:
        return f"{seconds / 3600:.2f} hours"
    elif seconds < 31536000:  # 1 year
        return f"{seconds / 86400:.2f} days"
    elif seconds < 3153600000:  # 100 years
        return f"{seconds / 31536000:.2f} years"
    else:
        return f"{format_large_number(seconds / 31536000)} years"

@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    """API endpoint to analyze a password."""
    data = request.get_json()
    password = data.get('password', '')
    
    if not password:
        return jsonify({"error": "No password provided"}), 400
    
    analysis = analyze_password(password)
    
    # Format certain values for display
    analysis['password_space_formatted'] = format_large_number(analysis['password_space'])
    analysis['time_to_crack_formatted'] = format_time_to_crack(analysis['seconds_to_crack'])
    
    return jsonify(analysis)

@app.route('/generate-password', methods=['POST'])
def generate_password():
    """Generate a strong password based on specifications."""
    data = request.get_json()
    length = data.get('length', 16)  # Default to 16 characters
    include_lowercase = data.get('lowercase', True)
    include_uppercase = data.get('uppercase', True)
    include_numbers = data.get('numbers', True)
    include_special = data.get('special', True)
    
    # Create character pool based on selections
    char_pool = ''
    if include_lowercase:
        char_pool += string.ascii_lowercase
    if include_uppercase:
        char_pool += string.ascii_uppercase
    if include_numbers:
        char_pool += string.digits
    if include_special:
        char_pool += string.punctuation
    
    if not char_pool:
        return jsonify({"error": "No character types selected"}), 400
    
    # Generate password
    password = ''.join(random.choice(char_pool) for _ in range(length))
    
    # Analyze the generated password
    analysis = analyze_password(password)
    analysis['password'] = password
    analysis['password_space_formatted'] = format_large_number(analysis['password_space'])
    analysis['time_to_crack_formatted'] = format_time_to_crack(analysis['seconds_to_crack'])
    
    return jsonify(analysis)

@app.route('/simulate-attack', methods=['POST'])
def simulate_attack():
    """Simulate how changes to a password affect cracking time."""
    data = request.get_json()
    base_password = data.get('password', '')
    
    if not base_password:
        return jsonify({"error": "No password provided"}), 400
    
    results = []
    
    # Original password
    original = analyze_password(base_password)
    results.append({
        'type': 'Original',
        'password': base_password,
        'entropy': original['entropy'],
        'time_to_crack': original['seconds_to_crack'],
        'time_formatted': format_time_to_crack(original['seconds_to_crack'])
    })
    
    # Added length
    longer = analyze_password(base_password + 'A1!')
    results.append({
        'type': f'{base_password}A1! (Added 3 chars)',
        'password': base_password + 'A1!',
        'entropy': longer['entropy'],
        'time_to_crack': longer['seconds_to_crack'],
        'time_formatted': format_time_to_crack(longer['seconds_to_crack'])
    })
    
    # Added character types
    more_complex = base_password
    additions = ""
    if not any(c.isupper() for c in base_password):
        more_complex += 'A'
        additions += 'A'
    if not any(c.isdigit() for c in base_password):
        more_complex += '1'
        additions += '1'
    if not any(c in string.punctuation for c in base_password):
        more_complex += '!'
        additions += '!'
    
    if more_complex != base_password:
        complex_analysis = analyze_password(more_complex)
        results.append({
            'type': f'{base_password}{additions} (Added complexity)',
            'password': more_complex,
            'entropy': complex_analysis['entropy'],
            'time_to_crack': complex_analysis['seconds_to_crack'],
            'time_formatted': format_time_to_crack(complex_analysis['seconds_to_crack'])
        })
    
    # Double the length
    doubled = base_password + base_password
    double_analysis = analyze_password(doubled)
    results.append({
        'type': f'{doubled} (Doubled length)',
        'password': doubled,
        'entropy': double_analysis['entropy'],
        'time_to_crack': double_analysis['seconds_to_crack'],
        'time_formatted': format_time_to_crack(double_analysis['seconds_to_crack'])
    })
    
    # Generate a strong alternative
    char_pool = string.ascii_lowercase + string.ascii_uppercase + string.digits + string.punctuation
    strong_password = ''.join(random.choice(char_pool) for _ in range(max(12, len(base_password))))
    strong_analysis = analyze_password(strong_password)
    results.append({
        'type': 'Strong alternative',
        'password': strong_password,
        'entropy': strong_analysis['entropy'],
        'time_to_crack': strong_analysis['seconds_to_crack'],
        'time_formatted': format_time_to_crack(strong_analysis['seconds_to_crack'])
    })
    
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)