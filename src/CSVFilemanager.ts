import { read } from 'fs';
import { CSVTable, Header, isHeaderSame } from './types'
import { App, Notice, TFile } from 'obsidian';

// meta file을 수정하는 로직이 포함되어야 함.

// public api
export const readCSV_ = async (app: App, fileName: string): Promise<CSVTable | null> => {
	if(fileName.endsWith(".csv")) {	// 확장자 검사.
		// read .csv file,
		const CSVContent = await loadFile(app, fileName);	// 파일 로드.

		const lines = CSVContent.split("\n").map(line => line.trim());
		const headersString: string[] = lines.shift()?.split(",") ?? [];
		const rows = lines.map(line => line.split(",").map(cell => cell.trim()));

		// read .csv.meta file,
		// meta file 존재 여부 확인해서 없으면 생성.
		if(await app.vault.adapter.exists(`${fileName}.meta`) == false) {
			const metaContent: string = (
				JSON.stringify(headersString.reduce((meta, header: string) => {
					meta[header] = {
						type: "string",
						default: "" 
					};
					return meta;
				}, {} as Header), null, 2)
			);

			await saveFile(app, `${fileName}.meta`, metaContent);
			new Notice(`meta file created : ${fileName}.meta`);
		}
		
		// meta file 로드.
		const metaData = await loadFile(app, `${fileName}.meta`);	// 메타 파일 로드.
		const headers: Header = Header(metaData);					// 메타 파일 파싱.

		return await new CSVTable(headers, rows)	// CSV 파싱.
	} else {
		console.error(`file extension is not CSV : ${fileName} (read)`);
	}
	return null;
}
export const saveCSV_ = async (app: App, fileName: string, table: CSVTable): Promise<void> => {
	if(fileName.endsWith(".csv")) {
		// contents, meta로 분리 필요.
		const content = table.toCSV();
		await saveFile(app, fileName, content);

		const header = table.getHeaders();
		await saveMetaFile(app, `${fileName}.meta`, header);
	} else {
		console.error(`file extension is not CSV : ${fileName} (save)`);
	}
	return;
}

export const readCSVs_ = async (app: App, filePath: string, filter: string): Promise<{ key: string; value: CSVTable }[] | null> => {
	// filter의 정규식에 맞는 파일들을 읽어와서 return;
	const vault = app.vault;
	const files = vault.getFiles();
	const csvFiles: { key: string; value: CSVTable }[] = [];

	for(const file of files) {
		if(file.path.startsWith(filePath) && file.path.endsWith('.csv') && file.name.match(filter)) {
			const table = await readCSV_(app, file.path);
			if(table) csvFiles.push({ key: file.name, value: table });
		}
	}

	if(csvFiles.length > 0) {
		return csvFiles;
	} else {
		return null;
	}
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
const saveMetaFile = async (app: App, fileName: string, header1: Header): Promise<void> => {
	const metaData = await loadFile(app, fileName);	// 메타 파일 로드.
	const header2: Header = Header(metaData);		// 메타 파일 파싱.

	if(!isHeaderSame(header1, header2)) {
		const metaContent: string = JSON.stringify(header1, null, 2);
		await saveFile(app, fileName, metaContent);
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

// api 재설계 필요. -> 애초에 사용할 일 있는지 모르겠음.
// const parseCSV = (content: string): CSVTable => {
	// const lines = content.split("\n").map(line => line.trim());
	// const headers = lines.shift()?.split(",") ?? [];
	// const rows = lines.map(line => line.split(",").map(cell => cell.trim()));

	// return new CSVTable(headers, rows);
// }