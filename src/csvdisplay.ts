import { App, Modal } from "obsidian";
import { CSVRow, CSVTable } from "./types";
import { readCSV_, saveCSV_ } from "./csvfilemanager";
import './styles/csvdisplay.css';

export const createCsvInputModal_ = async (app: App, headers: string[], fileName: string) => {
    const form = generateForm(headers);
    
    const modal = new Modal(app);
    modal.contentEl.empty();
    modal.contentEl.appendChild(form);
    modal.open();

    // 파일을 새로 읽어서, 추가된 라인을 포함 저장.
    const formElement = modal.contentEl.querySelector('#csv-input-form') as HTMLFormElement;
    formElement.addEventListener('submit', async (event) => {
        event.preventDefault(); // 기본 제출 동작 방지
        // 입력 값 처리 가져오기.
        const formData = new FormData(formElement);
        
        const newRow: CSVRow = [];
        for(const header of headers) {
            newRow.push(formData.get(header) as string);
        }

        // 파일 읽기
        const table = await readCSV_(app, fileName);
        if(table === null) {
            console.error("file not found");
            return;
        }
        // 파일 저장
        table?.append(newRow);
        // console.log(table);
        saveCSV_(app, fileName, table);
        modal.close();
    });
}

const generateForm = (headers: string[]): HTMLFormElement => {
    // 폼 요소 생성
    const form = document.createElement("form");
    form.id = "csv-input-form";

    // 입력 필드 생성 및 추가
    headers.forEach(header => {
        const field = createInputField(header);
        form.appendChild(field);
    });

    // 버튼 그룹 생성 및 추가
    const buttonGroup = document.createElement("div");
    buttonGroup.className = "button-group";

    const submitButton = document.createElement("button");
    submitButton.className = "submit-button";
    submitButton.type = "submit";
    submitButton.textContent = "Submit";

    buttonGroup.appendChild(submitButton);
    form.appendChild(buttonGroup);

    return form;
}

const createInputField = (key: string): HTMLDivElement => {
    // 입력 필드 래퍼 생성
    const formGroup = document.createElement("div");
    formGroup.className = "form-group";

    // 라벨 생성
    const label = document.createElement("label");
    label.className = "input-key";
    label.htmlFor = key;
    label.textContent = key;

    // 입력 필드 생성
    const input = document.createElement("input");
    input.className = "input-value";
    input.type = "text";
    input.id = key;
    input.name = key;

    // 요소 추가
    formGroup.appendChild(label);
    formGroup.appendChild(input);

    return formGroup;
}

export const createCsvTableView_ = (csvTable: CSVTable): HTMLElement => {
    const headers = csvTable.getHeaders();
    const rows = csvTable.getRows();

    // 테이블 래퍼 생성
    const tableWrapper = document.createElement("div");
    tableWrapper.className = "table-wrapper";

    // 테이블 생성
    const table = document.createElement("table");

    // 테이블 헤더 생성
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 테이블 바디 생성
    const tbody = document.createElement("tbody");
    rows.forEach(row => {
        const tableRow = document.createElement("tr");
        row.forEach(cell => {
            const td = document.createElement("td");
            td.textContent = cell?.toString() ?? "";
            tableRow.appendChild(td);
        });
        tbody.appendChild(tableRow);
    });
    table.appendChild(tbody);

    tableWrapper.appendChild(table);

    return tableWrapper;
}