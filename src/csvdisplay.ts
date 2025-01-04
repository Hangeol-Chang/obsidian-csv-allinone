import { App, Modal } from "obsidian";
import { CSVRow, CSVTable } from "./types";
import { readCSV_, saveCSV_ } from "./csvfilemanager";
import './styles/modal.css';

export const createCsvInputModal_ = async (app: App, headers: string[], fileName: string) => {
    const form = generateForm(headers);
    
    const modal = new Modal(app);
    modal.contentEl.innerHTML = form;
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

const generateForm = (headers: string[]): string => {
    // 입력 필드를 HTML로 생성
    const fields = headers.map(header => createInputField(header));
    // 폼 래퍼에 입력 필드를 삽입
    return `
        <form id="csv-input-form">
            ${fields.join("\n")}
            <div class="button-group">
                <div></div>
                <button class="submit-button" type="submit">Submit</button>
            </div>
        </form>
    `;
}
const createInputField = (key: string): string => {
    return `
        <div class="form-group">
            <label class="input-key" for="${key}">${key}</label>
            <input class="input-value" type="text" id="${key}" name="${key}"/>
        </div>
    `;
}

export const createCsvTableView_ = (csvTable: CSVTable): string => {
    const headers = csvTable.getHeaders();
    const rows = csvTable.getRows();

    const table = rows.map(row => {
        return `
            <tr>
                ${row.map(cell => `<td>${cell}</td>`).join("")}
            </tr>
        `;
    }).join("");

    return `
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        ${headers.map(header => `<th>${header}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${table}
                </tbody>
            </table>
        </div>
    `;
}