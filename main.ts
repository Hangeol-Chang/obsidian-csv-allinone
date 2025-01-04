import { readCSV_, saveCSV_} from 'src/csvfilemanager';
import { createInputModal } from './src/csvdisplay';
import { CSVTable } from './src/types'

import { 
	App, Modal, Plugin, PluginSettingTab, Setting,
	TFile,
} from 'obsidian';
import { createInflate } from 'zlib';

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
		createInputModal(app, headers, fileName);
	}

	async onload() {
		await this.loadSettings();
		// window에서 독립적으로 실행할 함수들.
		(window as any).CSVTable = CSVTable;
		
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new CsvSettingTab(this.app, this));
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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
