import { App, Modal, Notice, Plugin } from 'obsidian';
import './styles/csvCreator.css';
import { columnTypes } from './types';

// dataviewjs 등으로 자동적으로 파일을 생성하게 할 때 사용할 수 있는 api
export const createCsvFile_ = (app: App, filename: string, filePath: string, columnData: { name:string, type: string }[]) => {
    // .csv 내용 생성 (헤더만 추가)
    const csvContent = columnData.map((col) => col.name).join(',') + '\n';

    // .csv.meta 내용 생성
    const metaContent = JSON.stringify(
        columnData.reduce((acc, col) => {
            acc[col.name] = col.type;
            return acc;
        }, {} as Record<string, string>),
        null,
        2
    );

    // 파일 저장
    const vault = app.vault;
    const fullPathCsv = `${filePath}/${filename}.csv`;
    const fullPathMeta = `${filePath}/${filename}.csv.meta`;

    // .csv 파일 저장
    vault.adapter.write(fullPathCsv, csvContent).then(() => {
        new Notice(`${fullPathCsv} file has been created.`);
    }).catch((err) => {
        new Notice(`Error occurred while creating .csv file: ${err}`);
    });

    // .csv.meta 파일 저장
    vault.adapter.write(fullPathMeta, metaContent).then(() => {
        new Notice(`${fullPathMeta} file has been created.`);
    }).catch((err) => {
        new Notice(`.csv.meta 파일 생성 중 오류 발생: ${err}`);
        new Notice(`Error occurred while creating .csv.meta file: ${err}`);
    });
}

export default class CsvCreateModal extends Modal {

    columnsWrapper: HTMLElement;

    constructor(app: App) {
        super(app);
    }

    addColumn() {
        let inputWarpper = this.columnsWrapper.createEl('tr');
        let columnTd = inputWarpper.createEl('td');
        let columnInput = columnTd.createEl('input');
        columnInput.classList.add('colname-input');
        columnInput.placeholder = 'name';

        let typeTd = inputWarpper.createEl('td');
        let typeSelect = typeTd.createEl('select');
        typeSelect.classList.add('coltype-select');
        for (let type of columnTypes) {
            let option = typeSelect.createEl('option');
            option.value = type;
            option.text = type;
        };
    }

    createCsvFile() {
        // .csv 파일 생성
        const { contentEl } = this;

        // 파일 이름과 경로 가져오기
        const filenameInput = contentEl.querySelector('.filename-input') as HTMLInputElement;
        const filePathInput = contentEl.querySelector('.filepath-input') as HTMLInputElement;
    
        let filename = filenameInput.value.trim();
        let filePath = filePathInput.value.trim() || '/';
    
        // validation
        if (!filename) {
            new Notice('Please enter a file name.');
            return;
        }
        if(filename.endsWith('.csv')) {
            filename = filename.slice(0, -4);
        }
        if(filePath.length > 1 && filePath.endsWith('/')) {
            filePath = filePath.slice(0, -1);
        }

        // 컬럼 정보 수집
        const columnData: { name: string; type: string }[] = [];
        this.columnsWrapper.querySelectorAll('tr').forEach((columnEl) => {
            const inputEl = columnEl.querySelector('input') as HTMLInputElement;
            const selectEl = columnEl.querySelector('select') as HTMLSelectElement;
    
            const columnName = inputEl?.value.trim();
            const columnType = selectEl?.value;
    
            if (columnName && columnType) {
                columnData.push({ name: columnName, type: columnType });
            }
        });
    
        if (columnData.length === 0) {
            new Notice('add at least one column');
            return;
        }
        
        createCsvFile_(this.app, filename, filePath, columnData);
    }

    // common api
    onOpen() {
        let {contentEl} = this;
        contentEl.createEl('h2', {text: 'Create CSV Table'});
        contentEl.createEl('hr');

        // file setting
        let filenameContainer = contentEl.createEl('div');
        filenameContainer.classList.add('filename-container');

        let filenameEl = filenameContainer.createEl('input');
        filenameEl.placeholder = 'Title';
        filenameEl.classList.add('filename-input');
        
        let filePathEl = filenameContainer.createEl('input');
        filePathEl.placeholder = 'file path(default: root)';
        filePathEl.classList.add('filepath-input');

        // add column button
        let addColumnButton = contentEl.createEl('button', {text: 'Add Column'});
        addColumnButton.addEventListener('click', () => { this.addColumn(); });

        // column making table
        let columnsTable = contentEl.createEl('table');
        columnsTable.classList.add('columns-table');
        let tHead = columnsTable.createEl('thead');
        let tHeadRow = tHead.createEl('tr');
        tHeadRow.classList.add('columns-table-header');

        tHeadRow.createEl('th', {text: 'Column Name'});
        tHeadRow.createEl('th', {text: 'Type'});
            
        columnsTable.createEl('hr');
        this.columnsWrapper = columnsTable.createEl('tbody');
        this.columnsWrapper.classList.add('columns-wrapper');

        // submit button
        contentEl.createEl('hr');
        let buttonEl = contentEl.createEl('button', {text: 'Create'});
        buttonEl.addEventListener('click', () => { 
            this.createCsvFile(); 
            this.close();
        });
    }

    onClose() {
        let {contentEl} = this;
        contentEl.empty();
    }
}