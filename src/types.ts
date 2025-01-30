export type stringDate = string;   // 날짜를 string 형식 (YYYY-MM-DD)로 저장하기 위한 클래스
function isStringDate(date: string): date is stringDate {
  const regex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD 형식 확인
  return regex.test(date);
}
export type select = string;

export type CSVCell = string | number | stringDate | select;
export const CSVCellTypeString = ["string", "number", "stringDate", "select"] as const;
export type CSVCellType = (typeof CSVCellTypeString)[number]; // 문자열 리터럴 타입 생성
export type CSVRow = CSVCell[];

export type HeaderContent = {
    type: CSVCellType;
    default: CSVCell;
    options?: string[]; // select type일 때만 필요
};
export type Header = {
    [key: string]: HeaderContent;
}

export function Header(metaData: string): Header {
    const parsedData = JSON.parse(metaData) as Header;  // 타입을 명시적으로 지정
    try {
        const headers: Header = Object.entries(parsedData).reduce((acc, [name, config]) => {
            acc[name] = {
                type: config.type as CSVCellType, // type이 정확히 무엇인지 명시
                default: config.default,
                ...(config.options && { options: config.options })  // select일 때만 options 포함
            };
            return acc;
        }, {} as Header);

        return headers;
    }
    catch (e) {
        throw new Error("Invalid meta data.");
        return {};
    }
}
export function isHeaderSame(header1: Header, header2: Header): boolean {
    if (Object.keys(header1).length !== Object.keys(header2).length) {
        return false;
    }
    for (const key in header1) {
        if (!header1.hasOwnProperty(key)) continue; // ✅ 상속된 속성 방지
    
        // header2에 key가 없거나, type이 다르면 false
        if (!header2[key]?.type || header1[key].type !== header2[key].type) {
            return false;
        }
    
        // select type일 때, options 비교
        if (header1[key].type === "select") {
            const opt1 = [...(header1[key].options ?? [])].sort();
            const opt2 = [...(header2[key].options ?? [])].sort();
            if (opt1.length !== opt2.length || !opt1.every((v, i) => v === opt2[i])) {
                return false;
            }
        }
    }

    // 두 
    return true;
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

    addColumn(columnName: string, columnType: CSVCellType, value: CSVCell = 0): void {
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