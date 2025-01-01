import { 
	App, Editor, MarkdownView, 
	Modal, Notice, Plugin, PluginSettingTab, Setting,
	TFile,
} from 'obsidian';

// Remember to rename these classes and interfaces!

interface CsvPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: CsvPluginSettings = {
	mySetting: 'default'
}

export default class CsvPlugin extends Plugin {
	settings: CsvPluginSettings;

	// testFunction(arg: string): string {
	// 	return `Test function called with argument: ${arg}`;
	// }

	// 등록하는 이름 말고 정의한 함수 이름으로 호출됨.
	async saveFile(app: App, fileName: string, content: string): Promise<void> {
		const vault = app.vault;
		await vault.create(fileName, content);

		// 파일이 이미 존재하는지 확인
		// const existingFile = vault.getAbstractFileByPath(fileName);
		// if (existingFile instanceof TFile) {
		// 	// 파일이 존재하면 덮어쓰기
		// 	await vault.modify(existingFile, content);
			
		// } else {
		// 	// 파일이 존재하지 않으면 새로 생성
		// 	await vault.create(fileName, content);
		// }
	}

	async onload() {
		await this.loadSettings();

		// custom 함수 추가.
		// (window as any).testFunction = this.testFunction;
		// (window as any).saveFileFromDataview = async (fileName: string, content: string) => {
		// 	if(!this.app || !this.app.vault) {
		// 		console.error('app or vault is not ready');
		// 		return;
		// 	}
		// 	try {
		// 		await this.saveFile(this.app, fileName, content);
		// 	} catch (error) {
		// 		console.error(error);
		// 	}
        // };
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new CsvSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		// delete (window as any).testFunction;
		delete (window as any).saveFileFromDataview;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
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
