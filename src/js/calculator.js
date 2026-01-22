let semesterData = null;

function generateTable(data, tableId = "semester-table") {
    const table = document.getElementById(tableId);

    table.innerHTML = `
        <tr>
            <th>Unit</th>
            <th>Subject</th>
            <th>Coefficient</th>
            <th>Credit</th>
            <th>Continuous</th>
            <th>Exam</th>
            <th>Module Avg</th>
            <th>UE Avg</th>
            <th>UE Credit</th>
        </tr>
    `;

    data.units.forEach((unit, uIndex) => {
        unit.subjects.forEach((sub, sIndex) => {
            const row = document.createElement("tr");

            if (sIndex === 0) {
                const unitCell = document.createElement("td");
                unitCell.rowSpan = unit.subjects.length;
                unitCell.innerText = unit.code;
                row.appendChild(unitCell);
            }

            const nameCell = document.createElement("td");
            nameCell.innerText = sub.name;
            row.appendChild(nameCell);

            const coefCell = document.createElement("td");
            coefCell.innerText = sub.coef;
            row.appendChild(coefCell);

            const creditCell = document.createElement("td");
            creditCell.innerText = sub.credit;
            row.appendChild(creditCell);

            const contCell = document.createElement("td");
            if (sub.continuous && sub.continuous > 0) {
                const contInput = document.createElement("input");
                contInput.type = "number";
                contInput.min = 0;
                contInput.max = 20;
                contInput.id = `cont-${uIndex}-${sIndex}`;
                contInput.addEventListener("input", (e) => {
                    if (e.target.value > 20) e.target.value = 20;
                    if (e.target.value < 0) e.target.value = 0;
                    calculateSemester();
                });
                contCell.appendChild(contInput);
            } else {
                contCell.innerText = "/";
            }
            row.appendChild(contCell);

            const examCell = document.createElement("td");
            if (sub.exam && sub.exam > 0) {
                const examInput = document.createElement("input");
                examInput.type = "number";
                examInput.min = 0;
                examInput.max = 20;
                examInput.id = `exam-${uIndex}-${sIndex}`;
                examInput.addEventListener("input", (e) => {
                    if (e.target.value > 20) e.target.value = 20;
                    if (e.target.value < 0) e.target.value = 0;
                    calculateSemester();
                });
                examCell.appendChild(examInput);
            } else {
                examCell.innerText = "/";
            }
            row.appendChild(examCell);

            const moduleAvgCell = document.createElement("td");
            moduleAvgCell.id = `moduleAvg-${uIndex}-${sIndex}`;
            row.appendChild(moduleAvgCell);

            if (sIndex === 0) {
                const ueAvgCell = document.createElement("td");
                ueAvgCell.id = `ueAvg-${uIndex}`;
                ueAvgCell.rowSpan = unit.subjects.length;
                row.appendChild(ueAvgCell);

                const ueCreditCell = document.createElement("td");
                ueCreditCell.id = `ueCredit-${uIndex}`;
                ueCreditCell.rowSpan = unit.subjects.length;
                row.appendChild(ueCreditCell);
            }

            table.appendChild(row);
        });
    });

    window.semesterData = data;

    calculateSemester();
}

function calculateSemester() {
    if (!window.semesterData) return;

    let semesterWeightedSum = 0;
    let totalSemesterCredits = 0;

    window.semesterData.units.forEach((unit, uIndex) => {
        let ueSum = 0;
        let ueCoefSum = 0;

        unit.subjects.forEach((sub, sIndex) => {
            const cont = Number(document.getElementById(`cont-${uIndex}-${sIndex}`)?.value) || 0;
            const exam = Number(document.getElementById(`exam-${uIndex}-${sIndex}`)?.value) || 0;

            const finalNote = (sub.continuous ?? 0) * cont + (sub.exam ?? 0) * exam;

            document.getElementById(`moduleAvg-${uIndex}-${sIndex}`).innerText =
                finalNote ? finalNote.toFixed(2) : "";

            ueSum += finalNote * sub.coef;
            ueCoefSum += sub.coef;
        });

        const ueAverage = ueCoefSum ? ueSum / ueCoefSum : 0;
        document.getElementById(`ueAvg-${uIndex}`).innerText =
            ueAverage ? ueAverage.toFixed(2) : "";

        const ueCredit = ueAverage >= 10 ? unit.credit : 0;
        document.getElementById(`ueCredit-${uIndex}`).innerText = ueCredit;

        if (ueAverage >= 10) {
            semesterWeightedSum += ueAverage * unit.credit;
            totalSemesterCredits += unit.credit;
        }
    });

    const semesterAverage = totalSemesterCredits
        ? semesterWeightedSum / totalSemesterCredits
        : 0;

    document.getElementById("Averege").innerText =
        `Semester Average: ${semesterAverage.toFixed(2)}/20`;
    document.getElementById("Credit").innerText =
        `Semester Credit: ${totalSemesterCredits}`;
}

function loadSemester(jsonFile, tableId = "semester-table") {
    fetch(jsonFile)
        .then(res => res.json())
        .then(data => generateTable(data, tableId));
}
