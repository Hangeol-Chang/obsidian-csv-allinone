import { App, Modal, TFile } from 'obsidian';

/*
    obsidian 탐색기에서 csv 파일이 표시가 안되기 때문에,\
    파일 탐색하고 지우는 용도로 사용.
*/
export const getCsvFileStructure = async (app: App): Promise<Record<string, string[]>> => {
    const csvStructure: Record<string, string[]> = {};
    const files = app.vault.getFiles();

    // Vault 내의 모든 파일 순회
    files.forEach((file: TFile) => {
        if (file.extension === "csv") {
            if(file.parent) {
                const folderPath = file.parent.path;
                if (!csvStructure[folderPath])
                    csvStructure[folderPath] = [];
                
                csvStructure[folderPath].push(file.name);
            }
        }
    });
    return csvStructure;
}

export default class CsvExplorerModal extends Modal {
    csvStructure: Record<string, string[]> = {};

    constructor(app: App, csvStructure: Record<string, string[]>) {
        super(app);
        this.csvStructure = csvStructure;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl("h2", { text: "CSV Explorer" });
        
        Object.keys(this.csvStructure).forEach((folder) => {
            contentEl.createEl("h3", { text: folder });
            this.csvStructure[folder].forEach((file) => {
                contentEl.createEl("p", { text: file });
            });
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
} 