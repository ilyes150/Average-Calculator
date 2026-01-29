// GPA Calculator - Main Logic

let semesterData = null;

function generateTable(data) {
    const table = document.getElementById('calculator-table');
    if (!table) return;

    // Clear table
    table.innerHTML = `
        <thead>
            <tr>
                <th>Unité</th>
                <th>Matière</th>
                <th>Coefficient</th>
                <th>Crédit</th>
                <th>Contrôle Continu</th>
                <th>Examen</th>
                <th>Moyenne Module</th>
                <th>Crédit Module</th>
                <th>Moyenne UE</th>
                <th>Crédit UE</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    data.units.forEach((unit, uIndex) => {
        unit.subjects.forEach((sub, sIndex) => {
            const row = document.createElement('tr');

            // Unit cell (rowspan for first subject only)
            if (sIndex === 0) {
                const unitCell = document.createElement('td');
                unitCell.rowSpan = unit.subjects.length;
                unitCell.className = 'unit-cell';
                unitCell.innerHTML = `
                    <div class="unit-code">${unit.code}</div>
                    <div class="unit-credit">${unit.credit} crédits</div>
                `;
                row.appendChild(unitCell);
            }

            // Subject name
            const nameCell = document.createElement('td');
            nameCell.className = 'subject-cell';
            nameCell.textContent = sub.name;
            row.appendChild(nameCell);

            // Coefficient
            const coefCell = document.createElement('td');
            coefCell.className = 'number-cell';
            coefCell.textContent = sub.coef;
            row.appendChild(coefCell);

            // Credit
            const creditCell = document.createElement('td');
            creditCell.className = 'number-cell';
            creditCell.textContent = sub.credit;
            row.appendChild(creditCell);

            // Continuous assessment input
            const contCell = document.createElement('td');
            contCell.className = 'input-cell';
            if (sub.continuous && sub.continuous > 0) {
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'grade-input';
                input.min = 0;
                input.max = 20;
                input.step = 0.01;
                input.placeholder = '0-20';
                input.id = `cont-${uIndex}-${sIndex}`;
                input.addEventListener('input', (e) => {
                    if (e.target.value > 20) e.target.value = 20;
                    if (e.target.value < 0) e.target.value = 0;
                    calculateSemester();
                });
                contCell.appendChild(input);
            } else {
                contCell.innerHTML = '<span class="na">—</span>';
            }
            row.appendChild(contCell);

            // Exam input
            const examCell = document.createElement('td');
            examCell.className = 'input-cell';
            if (sub.exam && sub.exam > 0) {
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'grade-input';
                input.min = 0;
                input.max = 20;
                input.step = 0.01;
                input.placeholder = '0-20';
                input.id = `exam-${uIndex}-${sIndex}`;
                input.addEventListener('input', (e) => {
                    if (e.target.value > 20) e.target.value = 20;
                    if (e.target.value < 0) e.target.value = 0;
                    calculateSemester();
                });
                examCell.appendChild(input);
            } else {
                examCell.innerHTML = '<span class="na">—</span>';
            }
            row.appendChild(examCell);

            // Module average (calculated)
            const moduleAvgCell = document.createElement('td');
            moduleAvgCell.className = 'result-cell';
            moduleAvgCell.id = `moduleAvg-${uIndex}-${sIndex}`;
            moduleAvgCell.innerHTML = '<span class="na">—</span>';
            row.appendChild(moduleAvgCell);

            // Module credit (calculated)
            const moduleCreditCell = document.createElement('td');
            moduleCreditCell.className = 'result-cell';
            moduleCreditCell.id = `moduleCredit-${uIndex}-${sIndex}`;
            moduleCreditCell.innerHTML = '<span class="na">—</span>';
            row.appendChild(moduleCreditCell);

            // UE average and credit (rowspan for first subject only)
            if (sIndex === 0) {
                const ueAvgCell = document.createElement('td');
                ueAvgCell.className = 'ue-result-cell';
                ueAvgCell.id = `ueAvg-${uIndex}`;
                ueAvgCell.rowSpan = unit.subjects.length;
                ueAvgCell.innerHTML = '<span class="na">—</span>';
                row.appendChild(ueAvgCell);

                const ueCreditCell = document.createElement('td');
                ueCreditCell.className = 'ue-result-cell';
                ueCreditCell.id = `ueCredit-${uIndex}`;
                ueCreditCell.rowSpan = unit.subjects.length;
                ueCreditCell.innerHTML = '<span class="na">—</span>';
                row.appendChild(ueCreditCell);
            }

            tbody.appendChild(row);
        });
    });

    // Store data globally
    window.semesterData = data;
    calculateSemester();
}

function calculateSemester() {
    if (!window.semesterData) return;

    let semesterWeightedSum = 0;
    let semesterCoefSum = 0;
    let totalSemesterCredits = 0;

    window.semesterData.units.forEach((unit, uIndex) => {
        let ueSum = 0;
        let ueCoefSum = 0;
        let ueCreditSum = 0;

        unit.subjects.forEach((sub, sIndex) => {
            const cont = Number(document.getElementById(`cont-${uIndex}-${sIndex}`)?.value) || 0;
            const exam = Number(document.getElementById(`exam-${uIndex}-${sIndex}`)?.value) || 0;

            const wCont = sub.continuous ?? 0;
            const wExam = sub.exam ?? 0;

            // Calculate final note
            const finalNote = wCont * cont + wExam * exam;

            // Display module average
            const moduleAvgCell = document.getElementById(`moduleAvg-${uIndex}-${sIndex}`);
            if (moduleAvgCell) {
                if (finalNote > 0) {
                    moduleAvgCell.innerHTML = `<span class="${finalNote >= 10 ? 'pass' : 'fail'}">${finalNote.toFixed(2)}</span>`;
                } else {
                    moduleAvgCell.innerHTML = '<span class="na">—</span>';
                }
            }

            // Display module credit
            const moduleCreditCell = document.getElementById(`moduleCredit-${uIndex}-${sIndex}`);
            if (moduleCreditCell) {
                if (finalNote >= 10) {
                    moduleCreditCell.innerHTML = `<span class="pass">${sub.credit}</span>`;
                    ueCreditSum += sub.credit;
                } else if (finalNote > 0) {
                    moduleCreditCell.innerHTML = '<span class="fail">0</span>';
                } else {
                    moduleCreditCell.innerHTML = '<span class="na">—</span>';
                }
            }

            // Add to UE calculations
            semesterWeightedSum += finalNote * sub.coef;
            ueSum += finalNote * sub.coef;
            ueCoefSum += sub.coef;
        });

        semesterCoefSum += ueCoefSum;

        // Calculate UE average
        const ueAverage = ueCoefSum ? ueSum / ueCoefSum : 0;
        const ueAvgCell = document.getElementById(`ueAvg-${uIndex}`);
        if (ueAvgCell) {
            if (ueAverage > 0) {
                ueAvgCell.innerHTML = `<span class="${ueAverage >= 10 ? 'pass' : 'fail'}">${ueAverage.toFixed(2)}</span>`;
            } else {
                ueAvgCell.innerHTML = '<span class="na">—</span>';
            }
        }

        // Calculate UE credit
        const ueCredit = ueAverage >= 10 ? unit.credit : ueCreditSum;
        const ueCreditCell = document.getElementById(`ueCredit-${uIndex}`);
        if (ueCreditCell) {
            if (ueAverage > 0) {
                ueCreditCell.innerHTML = `<span class="${ueAverage >= 10 ? 'pass' : 'fail'}">${ueCredit}</span>`;
            } else {
                ueCreditCell.innerHTML = '<span class="na">—</span>';
            }
        }

        // Add to semester totals
        if (ueAverage >= 10) {
            totalSemesterCredits += unit.credit;
        } else {
            totalSemesterCredits += ueCreditSum;
        }
    });

    // Calculate semester average
    const semesterAverage = semesterCoefSum ? semesterWeightedSum / semesterCoefSum : 0;

    // Display semester results
    const avgValue = document.getElementById('semester-avg-value');
    const creditValue = document.getElementById('semester-credit-value');

    if (avgValue) {
        if (semesterAverage > 0) {
            avgValue.textContent = semesterAverage.toFixed(2) + '/20';
            avgValue.className = `result-value ${semesterAverage >= 10 ? 'pass' : 'fail'}`;
        } else {
            avgValue.textContent = '—';
            avgValue.className = 'result-value na';
        }
    }

    if (creditValue) {
        const maxCredits = window.semesterData.units.reduce((sum, unit) => sum + unit.credit, 0);
        if (semesterAverage >= 10) {
            creditValue.textContent = `${maxCredits}/${maxCredits}`;
            creditValue.className = `result-value pass`;
        }else if (semesterAverage > 0) {
            creditValue.textContent = `${totalSemesterCredits}/${maxCredits}`;
            creditValue.className = `result-value ${totalSemesterCredits === maxCredits ? 'pass' : 'fail'}`;
        } else {
            creditValue.textContent = `0/${maxCredits}`;
            creditValue.className = 'result-value na';
        }
    }
}

function loadSemester(semester) {
    const messageDiv = document.getElementById('message');
    
    if (messageDiv) {
        messageDiv.innerHTML = '<div class="message loading">⏳ Chargement du semestre...</div>';
    }

    fetch(`/data/${semester}.json`)
        .then(res => {
            if (!res.ok) throw new Error('Fichier introuvable');
            return res.json();
        })
        .then(data => {
            if (messageDiv) messageDiv.innerHTML = '';
            generateTable(data);
            
            // Update hero subtitle
            const subtitle = document.querySelector('.hero-subtitle');
            if (subtitle) {
                subtitle.textContent = `Semestre ${data.semester} - Année ${data.year}`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (messageDiv) {
                messageDiv.innerHTML = `<div class="message error">❌ Erreur: ${error.message}</div>`;
            }
        });
}

function resetCalculator() {
    if (!window.semesterData) return;

    window.semesterData.units.forEach((unit, uIndex) => {
        unit.subjects.forEach((sub, sIndex) => {
            const contInput = document.getElementById(`cont-${uIndex}-${sIndex}`);
            const examInput = document.getElementById(`exam-${uIndex}-${sIndex}`);
            if (contInput) contInput.value = '';
            if (examInput) examInput.value = '';
        });
    });

    calculateSemester();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load semester 1 by default
    loadSemester('semester1');

    // Set up semester selector buttons
    document.querySelectorAll('.semester-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.semester-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Load selected semester
            const semester = btn.dataset.semester;
            loadSemester(semester);
        });
    });
});
