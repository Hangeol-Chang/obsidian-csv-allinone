import { App, Modal, Notice, Plugin } from 'obsidian';
import './styles/CSVCreator.css';
import { CSVCellType, CSVCellTypeString, Header } from './types';

// dataviewjs 등으로 자동적으로 파일을 생성하게 할 때 사용할 수 있는 api
export const createCSVFile_ = (app: App, filename: string, columnData: Header) : boolean => {
    // 수정해야함.
    // .csv 내용 생성 (헤더만 추가)
    let CSVContent = '';
    for(const key of Object.keys(columnData)) {
        CSVContent += key + ',';
    }
    CSVContent = CSVContent.slice(0, -1) + '\n';

    // .csv.meta 내용 생성
    const metaContent = JSON.stringify(columnData, null, 2);

    // 파일 저장
    const vault = app.vault;

    // .csv 파일 저장
    vault.adapter.write(`${filename}.csv`, CSVContent).then(() => {
        new Notice(`${filename}.csv file has been created.`);
    }).catch((err) => {
        new Notice(`Error occurred while creating .csv file:\n${err}`);
        return false;
    });

    // .csv.meta 파일 저장
    vault.adapter.write(`${filename}.csv.meta`, metaContent).then(() => {
        new Notice(`${filename}.csv.meta file has been created.`);
    }).catch((err) => {
        new Notice(`Error occurred while creating .csv.meta file:\n${err}`);
        return false;
    });
    return true;
}

export default class CSVCreateModal extends Modal {

    columnsWrapper: HTMLElement;

    constructor(app: App) { super(app); }

    // column 추가
    addColumn() {
        let inputWarpper = this.columnsWrapper.createEl('tr');

        let columnTd = inputWarpper.createEl('td');
        let columnInput = columnTd.createEl('input');
        columnInput.classList.add('colname-input');
        columnInput.id = 'colname';
        columnInput.placeholder = 'name';

        let typeTd = inputWarpper.createEl('td');
        let typeSelect = typeTd.createEl('select');
        typeSelect.classList.add('coltype-select');
        typeSelect.id = 'coltype';
        for (let type of CSVCellTypeString) {
            let option = typeSelect.createEl('option');
            option.value = type;
            option.text = type;
        };

        let defaultTd = inputWarpper.createEl('td');
        let defaultInput = defaultTd.createEl('input');
        defaultInput.classList.add('coldefault-input');
        defaultInput.id = 'coldefault';
        defaultInput.placeholder = 'default value';

        // select type일 때만 options 추가
        let optionsInput = defaultTd.createEl('input');
        optionsInput.classList.add('coloptions-input');
        optionsInput.classList.add('colinput-none');
        optionsInput.id = 'coloptions';
        optionsInput.placeholder = 'options (separated by comma)';
        // type가 select일 때만 css로 쿼리해서 보이게 할 것.

        typeTd.addEventListener('change', () => {
            if(typeSelect.value === 'select') {
                optionsInput.classList.remove('colinput-none');
                optionsInput.classList.add('colinput-block');

                defaultInput.classList.add('colinput-none');
                defaultInput.classList.remove('colinput-block');
            }
            else {
                optionsInput.classList.add('colinput-none');
                optionsInput.classList.remove('colinput-block');

                defaultInput.classList.remove('colinput-none');
                defaultInput.classList.add('colinput-block');
            }
        });
    }

    createCSVFile() {
        // .csv 파일 생성
        const { contentEl } = this;

        // 파일 이름과 경로 가져오기
        const filenameInput = contentEl.querySelector('.filename-input') as HTMLInputElement;
        const filePathInput = contentEl.querySelector('.filepath-input') as HTMLInputElement;
    
        let filename = filenameInput.value.trim();
        let filePath = filePathInput.value.trim() || '';
    
        // validation
        if (!filename) {
            new Notice('Please enter a file name.');
            return false;
        }
        if(filename.endsWith('.csv')) {
            filename = filename.slice(0, -4);
        }
        if(filePath.length > 1 && filePath.endsWith('/')) {
            filePath = filePath.slice(0, -1);
        }
        let fullFilePath = `${filePath}/${filename}`;

        const columnData: Header = {};
        this.columnsWrapper.querySelectorAll('tr').forEach((columnEl) => {
            const inputEl = columnEl.querySelector('#colname') as HTMLInputElement;
            const selectEl = columnEl.querySelector('#coltype') as HTMLSelectElement;
            const defaultEl = columnEl.querySelector('#coldefault') as HTMLInputElement;
            const optionsEl = columnEl.querySelector('#coloptions') as HTMLInputElement;
    
            const columnName = inputEl?.value.trim();
            const columnType = selectEl?.value;
            let columnDefault : string | number = defaultEl?.value.trim();
    
            if(columnDefault == '') {
                switch(columnType) {
                case 'number':
                    columnDefault = 0;
                    break;
                case 'stringDate':
                    columnDefault = '1970-01-01';
                    break;

                case 'string':
                case 'select':
                case 'null':
                default:
                    columnDefault = '';
                    break;
                }
            }

            if (columnName && columnType) {
                columnData[columnName] = { 
                    type: columnType as CSVCellType, 
                    default: columnDefault,
                    options: 
                        columnType === 'select' 
                        ? optionsEl.value.split(',').map((option) => option.trim()) 
                        : undefined
                };
            }
        });

        if(Object.keys(columnData).length === 0) {
            new Notice('add at least one column');
            return false;
        }
        return createCSVFile_(this.app, fullFilePath, columnData);
    }

    // common api
    onOpen() {
        let {contentEl} = this;
        contentEl.createEl('h2', {text: 'Create CSV table'});
        let hr1 = contentEl.createEl('hr');
        hr1.classList.add('horizon-line');

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
        let addColumnButton = contentEl.createEl('button', {text: 'Add column'});
        addColumnButton.addEventListener('click', () => { this.addColumn(); });

        // column making table
        let columnsTable = contentEl.createEl('table');
        columnsTable.classList.add('columns-table');

        let colgroup = columnsTable.createEl('colgroup');
        let nameCol = colgroup.createEl('col');
        nameCol.classList.add('colgroup-name');
        let typeCol = colgroup.createEl('col');
        typeCol.classList.add('colgroup-type');
        let defaultCol = colgroup.createEl('col');
        defaultCol.classList.add('colgroup-value');

        let tHead = columnsTable.createEl('thead');
        let tHeadRow = tHead.createEl('tr');
        tHeadRow.classList.add('columns-table-header');

        tHeadRow.createEl('th', {text: 'Column name'});
        tHeadRow.createEl('th', {text: 'Type'});
        tHeadRow.createEl('th', {text: 'Default value'});
            
        this.columnsWrapper = columnsTable.createEl('tbody');
        this.columnsWrapper.classList.add('columns-wrapper');

        // submit button
        let hr2 = contentEl.createEl('hr');
        hr2.classList.add('horizon-line');
        let buttonEl = contentEl.createEl('button', {text: 'Create'});
        buttonEl.addEventListener('click', () => { 
            event?.preventDefault();
            const result = this.createCSVFile(); 
            if(result) {
                this.close();
            }
            else {
                new Notice('Error occurred while creating .csv file');
            }
        });
    }

    onClose() {
        let {contentEl} = this;
        contentEl.empty();
    }
}