import { App, Modal, TFile } from 'obsidian';
import './styles/CSVExplorer.css';

/*
    obsidian 탐색기에서 CSV 파일이 표시가 안되기 때문에,\
    파일 탐색하고 지우는 용도로 사용.
*/
export const getCSVFileStructure = async (app: App): Promise<Record<string, string[]>> => {
    const CSVStructure: Record<string, string[]> = {};
    const files = app.vault.getFiles();

    // Vault 내의 모든 파일 순회
    files.forEach((file: TFile) => {
        if (file.extension === "csv") {
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

        contentEl.createEl("h2", { text: "CSV explorer" });
        
        Object.keys(this.CSVStructure).forEach((folder) => {
            contentEl.createEl("h3", { text: folder });
            this.CSVStructure[folder].forEach((file) => {
                const fileRow = contentEl.createEl("div", { cls: "file-row"});

                // file name
                fileRow.createEl("p", { text: file });

                // file delete button
                const bt = fileRow.createEl("button", { text: "Delete" });
                bt.addEventListener("click", async () => {
                    const fileToDelete = this.CSVStructure[folder].find(f => f === file);
                    if (fileToDelete) {
                        const filePath = `${folder}/${fileToDelete}`;
                        const fileObj = this.app.vault.getAbstractFileByPath(filePath);
                        if (fileObj && fileObj instanceof TFile) {
                            await this.app.vault.delete(fileObj);
                            // Update the structure after deletion
                            this.CSVStructure[folder] = this.CSVStructure[folder].filter(f => f !== fileToDelete);
                            this.onOpen(); // Refresh the modal content
                        }
                    }
                });
            });
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
} 