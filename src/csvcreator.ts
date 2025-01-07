import { App, Modal, Plugin } from 'obsidian';

export default class CsvCreateModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    // common api
    onOpen() {
        let {contentEl} = this;
        contentEl.createEl('h2', {text: 'Create CSV Table'});

        let inputEl = contentEl.createEl('input');
        inputEl.value = 'Hello World';

        let buttonEl = contentEl.createEl('button', {text: 'Create'});
        buttonEl.addEventListener('click', () => {
            console.log(inputEl.value);
            this.close();
        });
    }

    onClose() {
        let {contentEl} = this;
        contentEl.empty();
    }
}