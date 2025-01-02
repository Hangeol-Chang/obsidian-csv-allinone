import { 
	App, Plugin, PluginSettingTab, Setting,
	TFile,
} from 'obsidian';

interface CsvPluginSettings {
	mySetting: string;
}
const DEFAULT_SETTINGS: CsvPluginSettings = {
	mySetting: 'default'
}
type CSVCell = string | number | null;
type CSVRow = CSVCell[];
class CSVTable {
	private headers: string[];
    private rows: CSVRow[];

    constructor(headers: string[], rows: CSVRow[] = []) {
        this.headers = headers;
        this.rows = rows;
    }

    getHeaders(): string[] {
        return this.headers;
    }
    getRows(): CSVRow[] {
        return this.rows;
    }

    append(row: CSVRow): void {
        if (row.length !== this.headers.length) {
            throw new Error(`Row length (${row.length}) must match headers length (${this.headers.length}).`);
        }
        this.rows.push(row);
    }
    delete(rowIndex: number): void {
        if (rowIndex < 0 || rowIndex >= this.rows.length) {
            throw new Error(`Invalid row index: ${rowIndex}`);
        }
        this.rows.splice(rowIndex, 1);
    }
    updateCell(rowIndex: number, columnName: string, value: CSVCell): void {
        const columnIndex = this.headers.indexOf(columnName);
        if (columnIndex === -1) {
            throw new Error(`Column '${columnName}' does not exist.`);
        }
        if (rowIndex < 0 || rowIndex >= this.rows.length) {
            throw new Error(`Invalid row index: ${rowIndex}`);
        }
        this.rows[rowIndex][columnIndex] = value;
    }

    toCSV(): string {
        const csvContent = [this.headers.join(",")];
        for (const row of this.rows) {
            csvContent.push(row.map(cell => (cell === null ? "" : cell.toString())).join(","));
        }
        return csvContent.join("\n");
    }
}
interface CSVFile {
	name: string;
	path: string;
	content: CSVTable;
}

export default class CsvPlugin extends Plugin {
	settings: CsvPluginSettings;



	// CsvPlugin.function() 형태로 호출될 함수들.

	private async readCSV(app: App, fileName: string): Promise<CSVTable | null> {
		if(fileName.endsWith(".csv")) {	// 확장자 검사.
			const content = await this.loadFile(app, fileName);	// 파일 로드.
			return await this.parseCSV(content);	// CSV 파싱.
		}
		return null;
	}

	// save, load
	private async saveFile(app: App, fileName: string, content: string): Promise<void> {
		const vault = app.vault;
		await vault.create(fileName, content);

		const existingFile = vault.getAbstractFileByPath(fileName);
		if (existingFile instanceof TFile) {
			// 파일이 존재하면 덮어쓰기
			await vault.modify(existingFile, content);
		} else {
			// 파일이 존재하지 않으면 새로 생성
			await vault.create(fileName, content);
		}
	}
	private async loadFile(app: App, fileName: string): Promise<string> {
		const vault = app.vault;
		const file = vault.getAbstractFileByPath(fileName);
		if (file instanceof TFile) {
			return await vault.read(file);
		} else {
			throw new Error('file not found');
		}
	}

	parseCSV(content: string): CSVTable {
        const lines = content.split("\n").map(line => line.trim());
        const headers = lines.shift()?.split(",") ?? [];
        const rows = lines.map(line => line.split(",").map(cell => cell.trim()));

        return new CSVTable(headers, rows);
    }

	async onload() {
		await this.loadSettings();

		// window에서 독립적으로 실행할 함수들.
		// app을 사용해야 하는 것들은 여기로 들어와있어야 함.
		(window as any).CSVTable = CSVTable;
		(window as any).loadCSV = async (fileName: string) => {
			if(!this.app || !this.app.vault) { 
				console.error('app or vault is not ready'); return;
			}
			try {
				return await this.readCSV(this.app, fileName);
			} catch (error) {
				console.error(error);
				return null;
			}
		}

		(window as any).saveFile = async (fileName: string, content: string) => {
			if(!this.app || !this.app.vault) {
				console.error('app or vault is not ready');
				return;
			}
			try {
				await this.saveFile(this.app, fileName, content);
			} catch (error) {
				console.error(error);
			}
        };
		
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new CsvSettingTab(this.app, this));
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		// delete (window as any).testFunction;
		delete (window as any).saveFile;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class CsvSettingTab extends PluginSettingTab {
	plugin: CsvPlugin;

	constructor(app: App, plugin: CsvPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
