
// State Variables
let semesterCount = 0;
let courseCount = 0;
let chartInstance = null;
const gradeOptions = ['S', 'A', 'B', 'C', 'D', 'E', 'P', 'U', 'W'];

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeChart();
    
    // Theme initialization
    if (localStorage.getItem('theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggleIcon').innerHTML = '☀️';
    } else {
        document.getElementById('themeToggleIcon').innerHTML = '🌙';
    }

    // Default View
    showCalculator('sgpa');
    
    // Add event listeners for direct inputs to save data
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', saveData);
    });
});

// --- Theme Toggle ---
function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        document.getElementById('themeToggleIcon').innerHTML = '🌙';
    } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        document.getElementById('themeToggleIcon').innerHTML = '☀️';
    }
    updateChart(); // Update chart colors
}

// --- Navigation ---
function showCalculator(type) {
    const cgpaSection = document.getElementById('cgpaCalculator');
    const sgpaSection = document.getElementById('sgpaCalculator');
    const cgpaBtn = document.getElementById('cgpaTabBtn');
    const sgpaBtn = document.getElementById('sgpaTabBtn');

    if (type === 'cgpa') {
        cgpaSection.classList.add('active');
        sgpaSection.classList.remove('active');
        cgpaBtn.classList.add('bg-blue-600', 'text-white');
        cgpaBtn.classList.remove('bg-blue-100', 'text-blue-600');
        sgpaBtn.classList.add('bg-purple-100', 'text-purple-600');
        sgpaBtn.classList.remove('bg-purple-600', 'text-white');
        
        if (semesterCount === 0 && document.getElementById('prevCgpa').value === '') {
            addSemester();
        }
    } else {
        sgpaSection.classList.add('active');
        cgpaSection.classList.remove('active');
        sgpaBtn.classList.add('bg-purple-600', 'text-white');
        sgpaBtn.classList.remove('bg-purple-100', 'text-purple-600');
        cgpaBtn.classList.add('bg-blue-100', 'text-blue-600');
        cgpaBtn.classList.remove('bg-blue-600', 'text-white');
        
        if (courseCount === 0) addCourse();
    }
}

// --- Data Persistence ---
function saveData() {
    const data = {
        studentName: document.getElementById('studentName').value,
        regNo: document.getElementById('regNo').value,
        prevCgpa: document.getElementById('prevCgpa').value,
        prevCredits: document.getElementById('prevCredits').value,
        semesters: [],
        courses: []
    };

    // Save Semesters
    document.querySelectorAll('#semesters > div').forEach(semDiv => {
        data.semesters.push({
            credits: semDiv.querySelector('.credits').value,
            sgpa: semDiv.querySelector('.sgpa').value
        });
    });

    // Save Courses
    document.querySelectorAll('#courses > div').forEach(courseDiv => {
        data.courses.push({
            credits: courseDiv.querySelector('.credits').value,
            grade: courseDiv.querySelector('.grade').value
        });
    });

    localStorage.setItem('calculatorData', JSON.stringify(data));
    updateChart();
}

function loadData() {
    const saved = localStorage.getItem('calculatorData');
    if (!saved) return;

    const data = JSON.parse(saved);
    
    if(data.studentName) document.getElementById('studentName').value = data.studentName;
    if(data.regNo) document.getElementById('regNo').value = data.regNo;
    if(data.prevCgpa) document.getElementById('prevCgpa').value = data.prevCgpa;
    if(data.prevCredits) document.getElementById('prevCredits').value = data.prevCredits;

    // Load Semesters
    document.getElementById('semesters').innerHTML = '';
    semesterCount = 0;
    if (data.semesters && data.semesters.length > 0) {
        data.semesters.forEach(sem => {
            addSemester(sem.credits, sem.sgpa);
        });
    }

    // Load Courses
    document.getElementById('courses').innerHTML = '';
    courseCount = 0;
    if (data.courses && data.courses.length > 0) {
        data.courses.forEach(course => {
            addCourse(true, course.credits, course.grade);
        });
    }

    calculateCGPA();
    calculateSGPA();
}

function clearData() {
    if(confirm("Are you sure you want to clear all data?")) {
        localStorage.removeItem('calculatorData');
        location.reload();
    }
}

// --- SGPA Logic ---
function getGradePoint(grade) {
    const map = { 'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'P': 4, 'U': 0, 'W': 0 };
    return map[grade] || 0;
}

function addCourse(isManual = true, savedCredits = '', savedGrade = 'S') {
    if (isManual) courseCount++;
    const container = document.createElement('div');
    container.className = "glass-panel p-4 mb-3 rounded-xl relative course-card fade-in";
    container.id = `course-${Date.now()}-${Math.random()}`;
    
    container.innerHTML = `
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium mb-1 text-dynamic">Credits</label>
                <input type="number" class="credits input-field" value="${savedCredits}" placeholder="e.g. 4" min="0.5" step="0.5" oninput="calculateSGPA(); saveData()">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1 text-dynamic">Grade</label>
                <select class="grade input-field" onchange="calculateSGPA(); saveData()">
                    ${gradeOptions.map(g => `<option value="${g}" ${g === savedGrade ? 'selected' : ''}>${g}</option>`).join('')}
                </select>
            </div>
        </div>
        <button onclick="this.closest('.course-card').remove(); calculateSGPA(); saveData()" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L10 8.586 5.707 4.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
        </button>
    `;
    document.getElementById('courses').appendChild(container);
    if(isManual) calculateSGPA();
}

function calculateSGPA() {
    const credits = document.querySelectorAll('#sgpaCalculator .credits');
    const grades = document.querySelectorAll('#sgpaCalculator .grade');
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    for(let i=0; i<credits.length; i++) {
        const c = parseFloat(credits[i].value);
        if(!isNaN(c) && c > 0) {
            totalPoints += c * getGradePoint(grades[i].value);
            totalCredits += c;
        }
    }
    
    const result = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    updateResult('sgpaResult', result);
}

// --- CGPA Logic ---
function addSemester(savedCredits = '', savedSgpa = '') {
    semesterCount++;
    const container = document.createElement('div');
    container.className = "glass-panel p-4 mb-3 rounded-xl relative course-card fade-in";
    container.innerHTML = `
        <h3 class="text-sm font-bold mb-2 text-dynamic-sec">Semester ${semesterCount}</h3>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium mb-1 text-dynamic">Credits</label>
                <input type="number" class="credits input-field" value="${savedCredits}" placeholder="22" oninput="calculateCGPA(); saveData()">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1 text-dynamic">SGPA</label>
                <input type="number" class="sgpa input-field" value="${savedSgpa}" placeholder="8.5" step="0.01" oninput="calculateCGPA(); saveData()">
            </div>
        </div>
        <button onclick="this.closest('.glass-panel').remove(); calculateCGPA(); saveData()" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L10 8.586 5.707 4.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
        </button>
    `;
    document.getElementById('semesters').appendChild(container);
    calculateCGPA();
}

function calculateCGPA() {
    let totalPoints = 0;
    let totalCredits = 0;
    
    const prevCgpa = parseFloat(document.getElementById('prevCgpa').value);
    const prevCredits = parseFloat(document.getElementById('prevCredits').value);
    
    if(!isNaN(prevCgpa) && !isNaN(prevCredits)) {
        totalPoints += prevCgpa * prevCredits;
        totalCredits += prevCredits;
    }
    
    const semCredits = document.querySelectorAll('#cgpaCalculator .credits');
    const semSgpas = document.querySelectorAll('#cgpaCalculator .sgpa');
    
    for(let i=0; i<semCredits.length; i++) {
        const c = parseFloat(semCredits[i].value);
        const s = parseFloat(semSgpas[i].value);
        
        if(!isNaN(c) && !isNaN(s)) {
            totalPoints += c * s;
            totalCredits += c;
        }
    }
    
    const result = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    updateResult('cgpaResult', result);
    updateChart();
}

function updateResult(elementId, value) {
    const el = document.getElementById(elementId);
    el.innerText = value;
    el.classList.add('scale-110', 'text-green-600');
    setTimeout(() => el.classList.remove('scale-110', 'text-green-600'), 200);
}

// --- Chart.js Integration ---
function initializeChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'SGPA Trend',
                data: [],
                borderColor: '#2563eb',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(37, 99, 235, 0.1)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: false, min: 0, max: 10 }
            }
        }
    });
}

function updateChart() {
    if(!chartInstance) return;
    
    const labels = [];
    const data = [];
    
    // Add previous data point if exists
    const prevCgpa = parseFloat(document.getElementById('prevCgpa').value);
    if(!isNaN(prevCgpa)) {
        labels.push('Previous');
        data.push(prevCgpa);
    }
    
    // Add semester data points
    const semSgpas = document.querySelectorAll('#cgpaCalculator .sgpa');
    semSgpas.forEach((input, index) => {
        const val = parseFloat(input.value);
        if(!isNaN(val)) {
            labels.push(`Sem ${index + 1}`);
            data.push(val);
        }
    });
    
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.update();
}

// --- PDF Generation ---
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const name = document.getElementById('studentName').value || 'Student';
    const regNo = document.getElementById('regNo').value || 'N/A';
    const cgpa = document.getElementById('cgpaResult').innerText;
    
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text("KARE Grade Report", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0,0,0);
    doc.text(`Name: ${name}`, 20, 30);
    doc.text(`Register No: ${regNo}`, 20, 36);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42);
    
    doc.setDrawColor(200);
    doc.line(20, 48, 190, 48);
    
    doc.setFontSize(16);
    doc.text(`Cumulative GPA: ${cgpa}`, 20, 60);
    
    let y = 80;
    doc.setFontSize(14);
    doc.text("Semester Wise Performance:", 20, 70);
    
    const semSgpas = document.querySelectorAll('#cgpaCalculator .sgpa');
    const semCredits = document.querySelectorAll('#cgpaCalculator .credits');
    
    semSgpas.forEach((sgpaInput, index) => {
        const sgpa = sgpaInput.value;
        const cred = semCredits[index].value;
        if(sgpa && cred) {
            doc.setFontSize(11);
            doc.text(`Semester ${index+1}: SGPA ${sgpa} (Credits: ${cred})`, 25, y);
            y += 10;
        }
    });
    
    doc.save(`${name}_Grade_Report.pdf`);
}
