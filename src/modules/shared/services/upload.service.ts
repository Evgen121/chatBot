import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class UploadService {
	private readonly staticFiles: string;
	private readonly staticLink: string;
	constructor(private readonly configService: ConfigService) {
		this.staticFiles = this.configService.get('static.static_files');
		this.staticLink = this.configService.get('static.static_path');
	}

	async saveImage(file: any): Promise<string> {
		const folderExists = await fs.pathExists(this.staticFiles);

		if (!folderExists) {
			await fs.mkdirSync(this.staticFiles);
		}

		const fileHash = crypto.randomBytes(16).toString('hex');
		const filename = `${fileHash}${path.extname(file.originalname)}`;

		const filePath = path.join(this.staticFiles, filename);
		await fs.writeFile(filePath, file.buffer);

		return this.staticLink + filename;
	}

	async saveImageFromBase64(base64: string): Promise<string> {
		const folderExists = await fs.pathExists(this.staticFiles);

		if (!folderExists) {
			await fs.mkdirSync(this.staticFiles);
		}

		const fileHash = crypto.randomBytes(16).toString('hex');
		const filename = `${fileHash}.png`;

		const filePath = path.join(this.staticFiles, filename);
		base64 = base64.replace(/^data:image\/png;base64,/, '');
		base64 = base64.replace(/^data:image\/jpg;base64,/, '');
		await fs.writeFile(filePath, base64, 'base64');

		return this.staticLink + filename;
	}
	async saveImageFromUrl(url: string): Promise<string> {
		const response = await axios.get(url, { responseType: 'arraybuffer' });
		const base64 = Buffer.from(response.data, 'binary').toString('base64');

		const folderExists = await fs.pathExists(this.staticFiles);

		if (!folderExists) {
			await fs.mkdirSync(this.staticFiles);
		}

		const fileHash = crypto.randomBytes(16).toString('hex');
		const filename = `${fileHash}.png`;

		const filePath = path.join(this.staticFiles, filename);
		await fs.writeFile(filePath, base64, 'base64');

		return this.staticLink + filename;
	}
}
