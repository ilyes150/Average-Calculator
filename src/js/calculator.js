let semesterData = null;

function generateTable(data, tableId = "semester-table") {
    const table = document.getElementById(tableId);
    table.innerHTML = `
        <tr>
            <th>Unit</th>
            <th>Subject</th>
            <th>Coefficient</th>
            <th>Cridit</th>
            <th>Continuous</th>
            <th>Exam</th>
            <th>Module Avg</th>
            <th>Unity Avg</th>
        </tr>
    `;

    data.units.forEach((unit, uIndex) => {
        let ueRow = null;

        unit.subjects.forEach((sub, sIndex) => {
            const row = document.createElement("tr");

            if(sIndex === 0){
                const unitCell = document.createElement("td");
                unitCell.rowSpan = unit.subjects.length;
                unitCell.innerText = `${unit.code}`;
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
            const contInput = document.createElement("input");
            contInput.type = "number";
            contInput.min = 0;
            contInput.max = 20;
            contInput.id = `cont-${uIndex}-${sIndex}`;
            contCell.appendChild(contInput);
            row.appendChild(contCell);

            const examCell = document.createElement("td");
            const examInput = document.createElement("input");
            examInput.type = "number";
            examInput.min = 0;
            examInput.max = 20;
            examInput.id = `exam-${uIndex}-${sIndex}`;
            examCell.appendChild(examInput);
            row.appendChild(examCell);

            const moduleAvgCell = document.createElement("td");
            moduleAvgCell.id = `moduleAvg-${uIndex}-${sIndex}`;
            row.appendChild(moduleAvgCell);

            if(sIndex === 0){
                const ueAvgCell = document.createElement("td");
                ueAvgCell.id = `ueAvg-${uIndex}`;
                ueAvgCell.rowSpan = unit.subjects.length;
                row.appendChild(ueAvgCell);
            }

            table.appendChild(row);
        });
    });

    window.semesterData = data;
}

function calculateSemester() {
    const data = window.semesterData;
    let totalWeightedUE = 0;
    let totalCredits = 0;

    data.units.forEach((unit, uIndex) => {
        let ueSum = 0;
        let ueCoefSum = 0;

        unit.subjects.forEach((sub, sIndex) => {
            const cont = Number(document.getElementById(`cont-${uIndex}-${sIndex}`).value) || 0;
            const exam = Number(document.getElementById(`exam-${uIndex}-${sIndex}`).value) || 0;

            const finalNote = (sub.continuous || 0) * cont + (sub.exam || 0) * exam;

            document.getElementById(`moduleAvg-${uIndex}-${sIndex}`).innerText = finalNote.toFixed(2);

            ueSum += finalNote * sub.coef;
            ueCoefSum += sub.coef;
        });

        const ueAverage = ueSum / ueCoefSum;

        document.getElementById(`ueAvg-${uIndex}`).innerText = ueAverage.toFixed(2);

        totalWeightedUE += ueAverage * unit.credit;
        totalCredits += unit.credit;
    });

    const semesterAverage = (totalWeightedUE / totalCredits).toFixed(2);
    const status = semesterAverage >= 10 ? "Admis" : "Ajourné";

    document.getElementById("result").innerText =
        `Semester Average: ${semesterAverage}/20 — ${status}`;
}

function loadSemester(jsonFile, tableId = "semester-table") {
    fetch(jsonFile)
        .then(res => res.json())
        .then(data => generateTable(data, tableId));
}