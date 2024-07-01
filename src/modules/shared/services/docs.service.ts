import { Injectable } from '@nestjs/common';
import xlsx from 'node-xlsx';
import { ConfigService } from '@nestjs/config/dist';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import { parse as csvParse } from 'csv-parse/sync';
import * as xlsxs from 'xlsx';
import * as Papa from 'papaparse';

@Injectable()
export class DocsService {
	private readonly staticFiles: string;
	private readonly staticLink: string;
	constructor(private readonly configService: ConfigService) {
		this.staticFiles = this.configService.get('static.static_files');
		this.staticLink = this.configService.get('static.static_path');
	}
	private createHash(type: string): string {
		return crypto.randomBytes(16).toString('hex') + type;
	}

	private getFileDirectory(hash: string): string {
		return path.join(this.staticFiles, hash);
	}

	private saveFile(file: Express.Multer.File) {
		const path = this.createHash(file.originalname);
		const fileDirectory = this.getFileDirectory(path);
		fs.writeFileSync(fileDirectory, file.buffer);
		return fileDirectory;
	}

	private writeFile(data: any, originalName: string): string {
		const hash = crypto.randomBytes(16).toString('hex');
		const fileName = hash + originalName;
		const filePath = path.join(this.staticFiles, fileName);
		fs.writeFileSync(filePath, data);
		return this.staticLink + fileName;
	}

	private readFile(filePath: string) {
		return fs.readFileSync(filePath, 'utf8');
	}

	async parseXLSX(file: Express.Multer.File): Promise<any[]> {
		const filePath = this.saveFile(file);
		const xlsxData = xlsxs.readFile(filePath);

		const firstSheetName = xlsxData.SheetNames[0];
		const sheetData = xlsxs.utils.sheet_to_json(
			xlsxData.Sheets[firstSheetName]
		);

		return sheetData;
	}

	private restoreFromCamelCase(text: string): string {
		text = text.replace(/([A-Z])/g, ' $1');
		text = text.charAt(0).toUpperCase() + text.slice(1);
		return text;
	}

	private reformatToCamelCase(text: string): string {
		text = text.trim();
		text = text.replace(/'/g, '');
		text = text.replace(/[\s\-_]+(\w)/g, (_, char) => char.toUpperCase());
		text = text.charAt(0).toLowerCase() + text.slice(1);
		return text;
	}

	async parseCSV(file: Express.Multer.File) {
		const filePath = this.saveFile(file);
		const data = this.readFile(filePath);
		return csvParse(data, {
			skip_records_with_error: true,
			columns: true,
			delimiter: ';',
		});
	}
	async parseCSVWithComa(file: Express.Multer.File) {
		const filePath = this.saveFile(file);
		const data = this.readFile(filePath);

		const parsedData = Papa.parse(data, {
			skipEmptyLines: true,
			header: false,
			delimiter: ',',
			dynamicTyping: true,
		});

		if (parsedData.data.length < 2) {
			return [];
		}

		const headers = parsedData.data[0];

		const result = parsedData.data.map((row) => {
			const obj = {};
			for (let i = 0; i < headers.length; i++) {
				obj[headers[i]] = row[i];
			}
			return obj;
		});

		return result;
	}

	private parseLeadsToArr(data: any[]): any[] {
		const keys = Object.keys(data[0]);
		const result = [];

		result.push(keys.map((key) => this.restoreFromCamelCase(key)));
		for (const item of data) {
			const temp = [];
			keys.forEach((key) => {
				temp.push(item[key]);
			});
			result.push(temp);
		}
		return result;
	}

	async buildXLSX(data: any[]): Promise<string> {
		data = this.parseLeadsToArr(data);
		const buffer = xlsx.build([
			{ name: 'Chatbot Generator Leads', data, options: {} },
		]);
		return this.writeFile(buffer, '.xlsx');
	}

	async buildCSV(data: any[]): Promise<string> {
		data = this.parseLeadsToArr(data);
		const csvRows = data.map((item) => item.join(';'));
		return this.writeFile(csvRows.join('\n'), '.csv');
	}

	async saveFromCSVorXLSX(records: string[]): Promise<any[]> {
		try {
			const tempKeys = Object.keys(records[0]);
			const queries = [];

			for (const record of records) {
				const entity = {};

				tempKeys.forEach((key) => {
					entity[this.reformatToCamelCase(key)] = record[key];
				});

				delete entity['id'];
				queries.push(entity);
			}

			return queries;
		} catch (e) {
			throw e;
		}
	}

	async saveFromXLSX(records: string[][]): Promise<any[]> {
		const tempKeys = records[0];
		const queries = [];

		for (let i = 1; i < records.length; i++) {
			const record = records[i];
			const entity = {};

			for (let j = 0; j < tempKeys.length; j++) {
				entity[this.reformatToCamelCase(tempKeys[j])] = record[j] || null;
			}

			queries.push(entity);
		}

		return queries;
	}

	async generatePDFFromHTML(html: string): Promise<string> {
		const browser = await puppeteer.launch({
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
			headless: true,
		});
		const page = await browser.newPage();
		await page.setContent(html);

		const fileName = this.createHash('.pdf');

		await page.pdf({ path: this.getFileDirectory(fileName), format: 'A4' });

		await browser.close();
		return this.staticLink + fileName;
	}
}
