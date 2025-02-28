import { App, Modal } from "obsidian";
import { CSVCellType, CSVRow, CSVTable, Header, HeaderContent } from "./types";
import { readCSV_, saveCSV_ } from "./CSVFilemanager";
import './styles/CSVPlugin.css';

export const createCSVInputModal_ = async (app: App, headers: Header, fileName: string, defaultValues: {[key: string]: string}) => {
    const form = generateForm(fileName, headers, defaultValues);
    
    const modal = new Modal(app);
    modal.contentEl.empty();
    modal.contentEl.appendChild(form);
    modal.open();

    // 파일을 새로 읽어서, 추가된 라인을 포함 저장.
    const formElement = modal.contentEl.querySelector('#CSV-input-form') as HTMLFormElement;
    formElement.addEventListener('submit', async (event) => {
        event.preventDefault(); // 기본 제출 동작 방지
        // 입력 값 처리 가져오기.
        const formData = new FormData(formElement);
        
        const newRow: CSVRow = [];
        for(const key of Object.keys(headers)) {
            newRow.push(formData.get(key) as CSVCellType);
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

const generateForm = (fileName: string, headers: Header, defaultValues: {[key: string]: string}): HTMLFormElement => {
    const form = document.createElement("form");
    form.id = "CSV-input-form";

    const fileNameArray = fileName.split('/');
    const fileNameShort = fileNameArray[fileNameArray.length - 1];

    const titleTinkle = document.createElement("h6");
    titleTinkle.textContent = "Add new row to";
    const title = document.createElement("h2");
    title.textContent = fileNameShort;

    form.appendChild(titleTinkle);
    form.appendChild(title);

    // 수평선 삽입.
    form.appendChild(document.createElement("hr"));

    // 폼 요소 생성
    // 입력 필드 생성 및 추가
    for(const [key, value] of Object.entries(headers)) {
        const field = createHeaderInputField(key, value, defaultValues[key] || "");
        form.appendChild(field);
    };

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

const createHeaderInputField = (key: string, headerContent: HeaderContent, defaultValue: string): HTMLDivElement => {
    // 입력 필드 래퍼 생성
    const formGroup = document.createElement("div");
    formGroup.className = "form-group";

    // 라벨 생성
    const label = document.createElement("label");
    label.className = "input-key";
    label.htmlFor = key;
    label.textContent = key;

    formGroup.appendChild(label);

    // 입력 필드 생성
    // select일 때와 아닐 때로 나눠야 함.


    
    if(headerContent.type === "select") {
        const input = document.createElement("select");
        input.className = "input-value";
        input.id = key;
        input.name = key;

        if(!(headerContent.options === undefined)) {
            // console.log(headerContent.options);
            for(const option of headerContent.options) {
                const optionElement = document.createElement("option");
                optionElement.value = option;
                optionElement.textContent = option;
                input.appendChild(optionElement);
            }
        }
        input.value = defaultValue;
        
        formGroup.appendChild(input);
    }
    else {
        const input = document.createElement("input");
        input.className = "input-value";
        input.type = "text";
        input.id = key;
        input.name = key;
        input.placeholder = headerContent.default.toString();
        input.value = defaultValue;

        formGroup.appendChild(input);
    }

    // 요소 추가

    return formGroup;
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

export const createCSVTableView_ = (CSVTable: CSVTable): HTMLElement => {
    const headers = CSVTable.getHeaders();
    const rows = CSVTable.getRows();

    // 테이블 래퍼 생성
    const tableWrapper = document.createElement("div");
    tableWrapper.className = "table-wrapper";

    // 테이블 생성
    const table = document.createElement("table");

    // 테이블 헤더 생성
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    for(const key of Object.keys(headers)) {
        const th = document.createElement("th");
        th.textContent = key;
        headerRow.appendChild(th);
    }
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