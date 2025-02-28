import { App, Modal, TFile } from 'obsidian';

/*
    obsidian 탐색기에서 CSV 파일이 표시가 안되기 때문에,\
    파일 탐색하고 지우는 용도로 사용.
*/
export const getCSVFileStructure = async (app: App): Promise<Record<string, string[]>> => {
    const CSVStructure: Record<string, string[]> = {};
    const files = app.vault.getFiles();

    // Vault 내의 모든 파일 순회
    files.forEach((file: TFile) => {
        if (file.extension === "CSV") {
            if(file.parent) {
                const folderPath = file.parent.path;
                if (!CSVStructure[folderPath])
                    CSVStructure[folderPath] = [];
                
                CSVStructure[folderPath].push(file.name);
            }
        }
    });
    return CSVStructure;
}

export default class CSVExplorerModal extends Modal {
    CSVStructure: Record<string, string[]> = {};

    constructor(app: App, CSVStructure: Record<string, string[]>) {
        super(app);
        this.CSVStructure = CSVStructure;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl("h2", { text: "CSV Explorer" });
        
        Object.keys(this.CSVStructure).forEach((folder) => {
            contentEl.createEl("h3", { text: folder });
            this.CSVStructure[folder].forEach((file) => {
                contentEl.createEl("p", { text: file });
            });
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
} 