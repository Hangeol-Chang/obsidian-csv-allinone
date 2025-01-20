export type stringDate = string;   // 날짜를 string 형식 (YYYY-MM-DD)로 저장하기 위한 클래스
function isStringDate(date: string): date is stringDate {
  const regex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD 형식 확인
  return regex.test(date);
}
export type select = string;

export type CSVCell = string | number | stringDate | select | Date /*사용 여부 미정*/ | null;
export type CSVRow = CSVCell[];

export type Header = {
    [key: string]: {
        type: string;
        default: CSVCell;
        options?: string[];  // select type일 때만 필요
    }
}

export class CSVTable {
    private headers: Header;  // Header는 이제 객체로 변경
    private rows: CSVRow[];

    // string으로 넣거나, 분리된 headers/rows로 생성자 호출 가능.
    constructor(headers: Header, rows: CSVRow[] = []) {
        this.headers = headers;
        this.rows = rows;
    }

    getHeaders(): Header {
        return this.headers;
    }

    getRows(): CSVRow[] {
        return this.rows;
    }

    // 가급적이면 CSVRow로 넣어주는 것을 권장.
    append(row: CSVRow | { [key: string]: string }): void {
        if (Array.isArray(row)) {
            if (row.length !== Object.keys(this.headers).length) {
                throw new Error(`Row length (${row.length}) must match headers length.`);
            }
            this.rows.push(row);
        } else {
            // key-value로 들어올 때
            const newRow: CSVRow = [];
            for (const key in this.headers) {
                if (row[key] === undefined) {
                    throw new Error(`Missing value for column '${key}'.`);
                }
                newRow.push(row[key]);
            }
            this.rows.push(newRow);
        }
    }

    delete(rowIndex: number): void {
        if (rowIndex < 0 || rowIndex >= this.rows.length) {
            throw new Error(`Invalid row index: ${rowIndex}`);
        }
        this.rows.splice(rowIndex, 1);
    }

    updateCell(rowIndex: number, columnName: string, value: CSVCell): void {
        // Column name은 headers에서 찾고, 그에 맞는 인덱스를 찾아서 업데이트
        const header = this.headers[columnName];
        if (!header) {
            throw new Error(`Column '${columnName}' does not exist.`);
        }
        if (rowIndex < 0 || rowIndex >= this.rows.length) {
            throw new Error(`Invalid row index: ${rowIndex}`);
        }

        const columnIndex = Object.keys(this.headers).indexOf(columnName);
        this.rows[rowIndex][columnIndex] = value;
    }

    toCSV(): string {
        const csvContent = [Object.keys(this.headers).join(",")];
        for (const row of this.rows) {
            csvContent.push(row.map(cell => (cell === null ? "" : cell.toString())).join(","));
        }
        return csvContent.join("\n");
    }

    addColumn(columnName: string, columnType: string, value: CSVCell = 0): void {
        this.headers[columnName] = { type: columnType, default: value };
        for (let i = 0; i < this.rows.length; i++) {
            this.rows[i].push(value);
        }
    }

    deleteColumn(columnName: string): void {
        const header = this.headers[columnName];
        if (!header) {
            throw new Error(`Column '${columnName}' does not exist.`);
        }
        delete this.headers[columnName];
        for (let i = 0; i < this.rows.length; i++) {
            const columnIndex = Object.keys(this.headers).indexOf(columnName);
            this.rows[i].splice(columnIndex, 1);
        }
    }
}

export interface CSVFile {
    name: string;
    path: string;
    content: CSVTable;
}
// export const columnTypes: string[] = [
//     'string',
//     'number',
//     'boolean',
// ];