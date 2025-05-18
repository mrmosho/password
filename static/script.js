// static/script.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements - Analyzer tab
    const passwordInput = document.getElementById('password');
    const toggleVisibility = document.getElementById('toggleVisibility');
    const resultDiv = document.getElementById('result');
    const lengthValue = document.getElementById('lengthValue');
    const charsetValue = document.getElementById('charsetValue');
    const spaceValue = document.getElementById('spaceValue');
    const entropyValue = document.getElementById('entropyValue');
    const strengthMeter = document.getElementById('strengthMeter');
    const strengthLabel = document.getElementById('strengthLabel');
    const crackTime = document.getElementById('crackTime');
    const recommendationsList = document.getElementById('recommendationsList');
    const patternsSection = document.getElementById('patternsSection');
    const patternsList = document.getElementById('patternsList');
    
    // DOM elements - Generator tab
    const passwordLengthSlider = document.getElementById('passwordLength');
    const passwordLengthValue = document.getElementById('lengthValue');
    const includeLowercase = document.getElementById('includeLowercase');
    const includeUppercase = document.getElementById('includeUppercase');
    const includeNumbers = document.getElementById('includeNumbers');
    const includeSpecial = document.getElementById('includeSpecial');
    const generatePasswordBtn = document.getElementById('generatePassword');
    const regeneratePasswordBtn = document.getElementById('regeneratePassword');
    const copyPasswordBtn = document.getElementById('copyPassword');
    const generatedPasswordContainer = document.getElementById('generatedPasswordContainer');
    const generatedPassword = document.getElementById('generatedPassword');
    const generatedStrengthMeter = document.getElementById('generatedStrengthMeter');
    const generatedStrengthLabel = document.getElementById('generatedStrengthLabel');
    const generatedEntropyValue = document.getElementById('generatedEntropyValue');
    const generatedCrackTime = document.getElementById('generatedCrackTime');
    
    // DOM elements - Simulator tab
    const simulatorPassword = document.getElementById('simulatorPassword');
    const simulateAttackBtn = document.getElementById('simulateAttack');
    const simulationResults = document.getElementById('simulationResults');
    const resultsContainer = document.getElementById('resultsContainer');
    
    // Charts and visualization
    let simulationChart;
    
    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => content.style.display = 'none');
            
            // Show the selected tab content
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).style.display = 'block';
        });
    });
    
    // Password visibility toggle
    toggleVisibility.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleVisibility.textContent = 'Hide';
        } else {
            passwordInput.type = 'password';
            toggleVisibility.textContent = 'Show';
        }
    });
    
    // Real-time password analysis
    passwordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        if (password) {
            analyzePassword(password);
        } else {
            resultDiv.style.display = 'none';
        }
    });
    
    // Password length slider
    if (passwordLengthSlider) {
        passwordLengthSlider.addEventListener('input', function() {
            passwordLengthValue.textContent = this.value;
        });
    }
    
    // Password generator
    if (generatePasswordBtn) {
        generatePasswordBtn.addEventListener('click', generateNewPassword);
    }
    
    if (regeneratePasswordBtn) {
        regeneratePasswordBtn.addEventListener('click', generateNewPassword);
    }
    
    if (copyPasswordBtn) {
        copyPasswordBtn.addEventListener('click', function() {
            const textToCopy = generatedPassword.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyPasswordBtn.textContent = '✓';
                setTimeout(() => {
                    copyPasswordBtn.textContent = '📋';
                }, 2000);
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        });
    }
    
    // Attack simulator
    if (simulateAttackBtn) {
        simulateAttackBtn.addEventListener('click', function() {
            const password = simulatorPassword.value;
            if (!password) {
                alert('Please enter a password to simulate');
                return;
            }
            
            simulateAttack(password);
        });
    }
    
    // Function to analyze password
    function analyzePassword(password) {
        fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: password }),
        })
        .then(response => response.json())
        .then(data => {
            displayResults(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during analysis');
        });
    }
    
    // Function to display analysis results
    function displayResults(analysis) {
        // Update metrics
        lengthValue.textContent = analysis.length;
        charsetValue.textContent = analysis.charset_size;
        spaceValue.textContent = analysis.password_space_formatted;
        entropyValue.textContent = analysis.entropy;
        
        // Update strength meter
        strengthMeter.style.width = `${analysis.strength_percentage}%`;
        strengthMeter.className = 'strength-meter-fill';
        
        // Add strength class
        if (analysis.strength_level === 'Very Weak') {
            strengthMeter.classList.add('very-weak');
        } else if (analysis.strength_level === 'Weak') {
            strengthMeter.classList.add('weak');
        } else if (analysis.strength_level === 'Moderate') {
            strengthMeter.classList.add('moderate');
        } else if (analysis.strength_level === 'Strong') {
            strengthMeter.classList.add('strong');
        } else {
            strengthMeter.classList.add('very-strong');
        }
        
        // Update strength label
        strengthLabel.textContent = analysis.strength_level;
        
        // Update crack time
        crackTime.innerHTML = `Estimated time to crack: <strong>${analysis.time_to_crack_formatted}</strong>`;
        
        // Update patterns if any
        if (analysis.detected_patterns && analysis.detected_patterns.length > 0) {
            patternsSection.style.display = 'block';
            patternsList.innerHTML = '';
            analysis.detected_patterns.forEach(pattern => {
                const li = document.createElement('li');
                li.textContent = pattern;
                patternsList.appendChild(li);
            });
        } else {
            patternsSection.style.display = 'none';
        }
        
        // Update recommendations
        recommendationsList.innerHTML = '';
        analysis.recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recommendationsList.appendChild(li);
        });
        
        // Show results
        resultDiv.style.display = 'block';
    }
    
    // Function to generate a new password
    function generateNewPassword() {
        const length = parseInt(passwordLengthSlider.value);
        const lowercase = includeLowercase.checked;
        const uppercase = includeUppercase.checked;
        const numbers = includeNumbers.checked;
        const special = includeSpecial.checked;
        
        if (!lowercase && !uppercase && !numbers && !special) {
            alert('Please select at least one character type');
            return;
        }
        
        fetch('/generate-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                length: length,
                lowercase: lowercase,
                uppercase: uppercase,
                numbers: numbers,
                special: special
            }),
        })
        .then(response => response.json())
        .then(data => {
            displayGeneratedPassword(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while generating the password');
        });
    }
    
    // Function to display generated password
    function displayGeneratedPassword(data) {
        generatedPassword.textContent = data.password;
        
        // Update strength meter
        generatedStrengthMeter.style.width = `${data.strength_percentage}%`;
        generatedStrengthMeter.className = 'strength-meter-fill';
        
        // Add strength class
        if (data.strength_level === 'Very Weak') {
            generatedStrengthMeter.classList.add('very-weak');
        } else if (data.strength_level === 'Weak') {
            generatedStrengthMeter.classList.add('weak');
        } else if (data.strength_level === 'Moderate') {
            generatedStrengthMeter.classList.add('moderate');
        } else if (data.strength_level === 'Strong') {
            generatedStrengthMeter.classList.add('strong');
        } else {
            generatedStrengthMeter.classList.add('very-strong');
        }
        
        // Update strength label
        generatedStrengthLabel.textContent = data.strength_level;
        
        // Update metrics
        generatedEntropyValue.textContent = `${data.entropy} bits`;
        generatedCrackTime.textContent = data.time_to_crack_formatted;
        
        // Show container
        generatedPasswordContainer.style.display = 'block';
    }
    
    // Function to simulate attack
    function simulateAttack(password) {
        fetch('/simulate-attack', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: password }),
        })
        .then(response => response.json())
        .then(data => {
            displaySimulationResults(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during simulation');
        });
    }
    
    // Function to display simulation results
    function displaySimulationResults(data) {
        // Clear previous results
        resultsContainer.innerHTML = '';
        
        // Add result cards
        data.forEach(result => {
            const resultCard = document.createElement('div');
            resultCard.className = 'result-card';
            
            resultCard.innerHTML = `
                <div class="result-title">${result.type}</div>
                <div class="result-password">${result.password}</div>
                <div class="result-metrics">
                    <div><strong>Entropy:</strong> ${result.entropy} bits</div>
                    <div><strong>Time to Crack:</strong> ${result.time_formatted}</div>
                </div>
            `;
            
            resultsContainer.appendChild(resultCard);
        });
        
        // Prepare chart data
        const labels = data.map(item => item.type);
        const entropyData = data.map(item => item.entropy);
        const timeData = data.map(item => Math.log10(Math.max(item.time_to_crack, 0.001)));
        
        // Create or update chart
        const ctx = document.getElementById('simulationChart').getContext('2d');
        
        if (simulationChart) {
            simulationChart.destroy();
        }
        
        simulationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Entropy (bits)',
                        data: entropyData,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Log₁₀(Time to Crack in seconds)',
                        data: timeData,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Show results
        simulationResults.style.display = 'block';
    }
});