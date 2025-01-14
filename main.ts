import { 
	App, Plugin, PluginSettingTab, Setting,
} from 'obsidian';

import { createCsvInputModal_, createCsvTableView_ } from './src/csvPlugin';
import { readCSV_, saveCSV_} from 'src/csvFilemanager';
import { CSVTable } from './src/types'
import CsvExplorerModal, { getCsvFileStructure } from 'src/csvExplorer';
import CsvCreateModal, { createCsvFile_ } from 'src/csvCreator';

interface CsvPluginSettings {
	mySetting: string;
}
const DEFAULT_SETTINGS: CsvPluginSettings = {
	mySetting: 'default'
}

export default class CsvPlugin extends Plugin {
	settings: CsvPluginSettings;

	// CsvPlugin.function() 형태로 호출될 함수들.
	//// filemanager.ts
	readCSV = async (app: App, fileName: string): Promise<CSVTable | null> => {
		return readCSV_(app, fileName);
	}
	saveCSV = async (app: App, fileName: string, table: CSVTable): Promise<void> => {
		return saveCSV_(app, fileName, table);
	}

	//// csvdisplay.ts
	openCsvInputModal = async (app: App, headers: string[], fileName: string) => {
		createCsvInputModal_(app, headers, fileName);
	}
	createCsvTableView = (csvTable: CSVTable): HTMLElement => {
		return createCsvTableView_(csvTable);
	}
	createCsvFile = (filename: string, filePath: string, columnData: { name:string, type: string }[]) => {
		createCsvFile_(this.app, filename, filePath, columnData);
	}

	async onload() {
		await this.loadSettings();
		// window에서 독립적으로 실행할 함수들.
		(window as any).CSVTable = CSVTable;
		
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new CsvSettingTab(this.app, this));

		// commands
		this.addCommand({
			id: "create-csv-table",
			name: "Create CSV Table",
			callback: () => {
				new CsvCreateModal(this.app).open();
			},
		});

		this.addCommand({
			id: "open-csv-explorer",
			name: "Open CSV Explorer",
			callback: async () => {
				const csvStructure = await getCsvFileStructure(this.app);
				new CsvExplorerModal(this.app, csvStructure).open();
			}
		})
	}
	onunload() {}

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
