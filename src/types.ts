export type CSVCell = string | number | null;
export type CSVRow = CSVCell[];
export class CSVTable {
    private headers: string[];
    private rows: CSVRow[];

    // string으로 넣거나, 분리된 headers/rows로 생성자 호출 가능.
    constructor(contentOrHeaders: string | string[], rows: CSVRow[] = []) {
        if (typeof contentOrHeaders === 'string') {
            // content가 문자열일 때
            const lines = contentOrHeaders.split("\n").map(line => line.trim());
            this.headers = lines.shift()?.split(",") ?? [];
            this.rows = lines.map(line => line.split(",").map(cell => cell.trim()));
        } else {
            // headers가 배열일 때
            this.headers = contentOrHeaders;
            this.rows = rows;
        }
    }

    getHeaders(): string[] {
        return this.headers;
    }
    getRows(): CSVRow[] {
        return this.rows;
    }

    // 가급적이면 CSVRow로 넣어주는 것을 권장.
    append(row: CSVRow | {[key: string]: string}): void {
        if (row.length !== this.headers.length) {
            throw new Error(`Row length (${row.length}) must match headers length (${this.headers.length}).`);
        } else {
            if(Array.isArray(row)) {
                this.rows.push(row);
            }
            else {
                const newRow: CSVRow = [];
                for(const header of this.headers) { newRow.push(row[header]); }
                this.rows.push(newRow);
            }
        }
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
export interface CSVFile {
    name: string;
    path: string;
    content: CSVTable;
}