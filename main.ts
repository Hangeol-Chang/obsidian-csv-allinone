import { 
	App, Plugin, PluginSettingTab, Setting,
} from 'obsidian';

import { createCSVInputModal_, createCSVTableView_ } from './src/CSVPlugin';
import { readCSV_, saveCSV_} from 'src/CSVFilemanager';
import { CSVTable, Header } from './src/types'
import CSVExplorerModal, { getCSVFileStructure } from 'src/CSVExplorer';
import CSVCreateModal, { createCSVFile_ } from 'src/CSVCreator';

interface CSVPluginSettings {
	mySetting: string;
}
const DEFAULT_SETTINGS: CSVPluginSettings = {
	mySetting: 'default'
}

export default class CSVPlugin extends Plugin {
	settings: CSVPluginSettings;

	// CSVPlugin.function() 형태로 호출될 함수들.
	//// filemanager.ts
	readCSV = async (app: App, fileName: string): Promise<CSVTable | null> => {
		return readCSV_(app, fileName);
	}
	saveCSV = async (app: App, fileName: string, table: CSVTable): Promise<void> => {
		return saveCSV_(app, fileName, table);
	}

	//// CSVdisplay.ts
	openCSVInputModal = async (app: App, headers: Header, fileName: string, defaultValues: {[key: string] : string} = {} ) => {
		createCSVInputModal_(app, headers, fileName, defaultValues);
	}
	createCSVTableView = (CSVTable: CSVTable): HTMLElement => {
		return createCSVTableView_(CSVTable);
	}
	createCSVFile = (filename: string, columnData: Header) => {
		createCSVFile_(this.app, filename, columnData);
	}

	async onload() {
		await this.loadSettings();
		// window에서 독립적으로 실행할 함수들.
		(window as any).csvTable = CSVTable;
		
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new CSVSettingTab(this.app, this));

		// commands
		this.addCommand({
			id: "create-CSV-table",
			name: "Create CSV Table",
			callback: () => {
				new CSVCreateModal(this.app).open();
			},
		});

		this.addCommand({
			id: "open-CSV-explorer",
			name: "Open CSV Explorer",
			callback: async () => {
				const CSVStructure = await getCSVFileStructure(this.app);
				new CSVExplorerModal(this.app, CSVStructure).open();
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

class CSVSettingTab extends PluginSettingTab {
	plugin: CSVPlugin;

	constructor(app: App, plugin: CSVPlugin) {
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
