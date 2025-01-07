import { App, Modal, Plugin } from 'obsidian';
import './styles/csvcreator.css';

export default class CsvCreateModal extends Modal {
    columnTypes: string[] = [
        'string',
        'number',
        'boolean',
    ];

    columnsWrapper: HTMLElement;

    constructor(app: App) {
        super(app);
    }

    addColumn() {
        let inputWarpper = this.columnsWrapper.createEl('div');
        let columnInput = inputWarpper.createEl('input');
        columnInput.placeholder = 'Column Name';

        let typeSelect = inputWarpper.createEl('select');
        for (let type of this.columnTypes) {
            let option = typeSelect.createEl('option');
            option.value = type;
            option.text = type;
        };


    }

    // common api
    onOpen() {
        let {contentEl} = this;
        contentEl.createEl('h2', {text: 'Create CSV Table'});
        contentEl.createEl('hr');

        let filenameEl = contentEl.createEl('input');
        filenameEl.placeholder = 'Title';
        filenameEl.classList.add('filename-input');

        let addColumnButton = contentEl.createEl('button', {text: 'Add Column'});
        addColumnButton.addEventListener('click', () => { this.addColumn(); });

        this.columnsWrapper = contentEl.createEl('div');
        this.columnsWrapper.classList.add('column-warpper');

        let buttonEl = contentEl.createEl('button', {text: 'Create'});
        buttonEl.addEventListener('click', () => { this.close(); });
    }

    onClose() {
        let {contentEl} = this;
        contentEl.empty();
    }
}