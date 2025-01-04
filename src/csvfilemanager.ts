import { CSVTable } from './types'
import { App, TFile } from 'obsidian';

export const readCSV_ = async (app: App, fileName: string): Promise<CSVTable | null> => {
	if(fileName.endsWith(".csv")) {	// 확장자 검사.
		const content = await loadFile(app, fileName);	// 파일 로드.
		return await new CSVTable(content)	// CSV 파싱.
	} else {
		console.error(`file extension is not csv : ${fileName} (read)`);
	}
	return null;
}
export const saveCSV_ = async (app: App, fileName: string, table: CSVTable): Promise<void> => {
	if(fileName.endsWith(".csv")) {
		const content = table.toCSV();
		await saveFile(app, fileName, content);
	} else {
		console.error(`file extension is not csv : ${fileName} (save)`);
	}
	return;
}

// save, load
const saveFile = async (app: App, fileName: string, content: string): Promise<void> => {
	const vault = app.vault;
 
	const existingFile = vault.getAbstractFileByPath(fileName);
	if (existingFile instanceof TFile) {
		// 파일이 존재하면 덮어쓰기
		// console.log(`file exists, modify : ${fileName}`);
		await vault.modify(existingFile, content);
	} else {
		// 파일이 존재하지 않으면 새로 생성
		// console.log(`file not exists, create : ${fileName}`);
		await vault.create(fileName, content);
	}
}
const loadFile = async (app: App, fileName: string): Promise<string> => {
	const vault = app.vault;
	const file = vault.getAbstractFileByPath(fileName);
	if (file instanceof TFile) {
		return await vault.read(file);
	} else {
		throw new Error('file not found');
	}
}

const parseCSV = (content: string): CSVTable => {
	const lines = content.split("\n").map(line => line.trim());
	const headers = lines.shift()?.split(",") ?? [];
	const rows = lines.map(line => line.split(",").map(cell => cell.trim()));

	return new CSVTable(headers, rows);
}