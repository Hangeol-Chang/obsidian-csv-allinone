import { CSVTable, Header } from './types'
import { App, TFile } from 'obsidian';

// meta file을 수정하는 로직이 포함되어야 함.

// public api
export const readCSV_ = async (app: App, fileName: string): Promise<CSVTable | null> => {
	if(fileName.endsWith(".csv")) {	// 확장자 검사.
		// read .csv file,
		const csvContent = await loadFile(app, fileName);	// 파일 로드.

		const lines = csvContent.split("\n").map(line => line.trim());
		const headersString = lines.shift()?.split(",") ?? [];
		const rows = lines.map(line => line.split(",").map(cell => cell.trim()));

		// read .csv.meta file,
		// meta file 존재 여부 확인해서 없으면 생성.
		if(await app.vault.adapter.exists(`${fileName}.meta`) == false) {
			const headers: { name: string, type: string }[] = 
				headersString.map((header) => ({ name: header, type: "string" }));

			const metaContent = JSON.stringify(
				headers.reduce((acc, col) => {
					acc[col.name] = col.type;
					return acc;
				}, {} as Record<string, string>),
				null,
				2
			);
			// const metaContent = JSON.stringify(headers, null, 2);
			await saveFile(app, `${fileName}.meta`, metaContent);
		}
		

		// meta file 로드.
		const metaData = await loadFile(app, `${fileName}.meta`);	// 메타 파일 로드.
		const headers: Header[] = Object.entries(JSON.parse(metaData));

		return await new CSVTable(headers, rows)	// CSV 파싱.
	} else {
		console.error(`file extension is not csv : ${fileName} (read)`);
	}
	return null;
}
export const saveCSV_ = async (app: App, fileName: string, table: CSVTable): Promise<void> => {
	if(fileName.endsWith(".csv")) {
		// contents, meta로 분리 필요.
		const content = table.toCSV();
		await saveFile(app, fileName, content);
		// const meta = table.getMeta();
		// await saveMetaFile(app, `${fileName}.meta`, meta);
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
const saveMetaFile = async (app: App, fileName: string, content: Header[]): Promise<void> => {

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

// api 재설계 필요. -> 애초에 사용할 일 있는지 모르겠음.
// const parseCSV = (content: string): CSVTable => {
	// const lines = content.split("\n").map(line => line.trim());
	// const headers = lines.shift()?.split(",") ?? [];
	// const rows = lines.map(line => line.split(",").map(cell => cell.trim()));

	// return new CSVTable(headers, rows);
// }