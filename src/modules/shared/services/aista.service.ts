import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AskChatOpenAiDto } from '@modules/chatBot/dto/AskChatOpenAiDto';
import { AistaCreateBotDto } from '@modules/chatBot/dto/AistaCreateBotDto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ErrorMessages } from '@utils/errors/errors';
import { UpdateBotDTO } from '../dto/aista.dto';

@Injectable()
export class AistaService {
	private readonly aistaToken: string;
	private createBotPath: string;
	private updateBotPath: string;
	private aistaUrl: string;
	private urlOpenAI: string;
	private importPage: string;
	constructor(private readonly configService: ConfigService) {
		this.aistaToken = this.configService.get('aista.aista_token');
		this.aistaUrl = this.configService.get('aista.aista_host');
		this.createBotPath = 'openai/create-bot';
		this.updateBotPath = 'magic/ml_types';
		this.importPage = 'openai/import-url';
		this.urlOpenAI = 'openai/chat';
	}

	async request(url: string, data: any, method = 'POST') {
		try {
			const response = await axios({
				method,
				url: this.aistaUrl + url,
				data,
				headers: {
					Authorization: 'Bearer ' + this.aistaToken,
				},
			});
			return response.data;
		} catch (e) {
			console.log('request', e);
			throw new InternalServerErrorException(
				ErrorMessages.chatbot.ASSET_NOT_CREATED
			);
		}
	}

	async createAsset(
		aistaCreateBotDto: AistaCreateBotDto
	): Promise<{ result: string }> {
		try {
			return await this.request(this.createBotPath, aistaCreateBotDto);
		} catch (e) {
			console.log('asset create', e);
			throw new InternalServerErrorException(
				ErrorMessages.chatbot.ASSET_NOT_CREATED
			);
		}
	}

	async askAistaOpenAI(
		chatOpenAiDTO: AskChatOpenAiDto
	): Promise<{ result: string }> {
		try {
			return await this.request(
				this.urlOpenAI +
					`?prompt=${chatOpenAiDTO.prompt}` +
					`&type=${chatOpenAiDTO.type}` +
					`&references=${chatOpenAiDTO.references}`,
				null,
				'GET'
			);
		} catch {
			throw new InternalServerErrorException(
				ErrorMessages.chatbot.ANSWER_NOT_CREATED
			);
		}
	}

	async importNewPage(importPageDto: any): Promise<{ result: string }> {
		try {
			return await this.request(this.importPage, importPageDto, 'POST');
		} catch {
			throw new InternalServerErrorException(
				ErrorMessages.chatbot.ASSET_NOT_CREATED
			);
		}
	}

	updateAsset(body: Partial<UpdateBotDTO>): Promise<void> {
		return this.request(this.updateBotPath, body, 'PUT');
	}

	async deleteAsset(name: string) {
		try {
			await this.request(
				this.updateBotPath + '?type=' + encodeURI(name),
				{},
				'DELETE'
			);
		} catch (e) {
			throw new InternalServerErrorException(
				ErrorMessages.chatbot.ASSET_NOT_DELETED
			);
		}
	}

	async setOpenKey(key: string) {
		try {
			await axios(this.aistaUrl + 'openai/key', {
				headers: {
					Authorization: 'Bearer ' + this.aistaToken,
				},
				data: { key },
				method: 'POST',
			});
		} catch (error) {
			throw new InternalServerErrorException(
				ErrorMessages.chatbot.OPEN_KEY_NOT_ADDED
			);
		}
	}
	async setSecretKey(key: string, secret: string) {
		try {
			await axios(this.aistaUrl + 'auth/recaptcha-secret-key', {
				headers: {
					Authorization: 'Bearer ' + this.aistaToken,
				},
				data: { key, secret },
				method: 'POST',
			});
		} catch {
			throw new InternalServerErrorException(
				ErrorMessages.chatbot.SECRET_KEY_NOT_ADDED
			);
		}
	}
}
