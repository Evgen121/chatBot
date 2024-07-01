import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIApi, Configuration, CreateChatCompletionRequest } from 'openai';
import { ErrorMessages } from '@utils/errors/errors';
import axios from 'axios';
import { createWithSubjectContentDto } from '../../content/dto/createWithSubjectContentDto';
import { UploadService } from './upload.service';

@Injectable()
export class OpenAiService {
	openAi: OpenAIApi;
	private apiKeys: string[];

	private readonly aistaToken: string;
	private readonly key: string;

	constructor(
		private readonly configService: ConfigService,
		private readonly uploadService: UploadService
	) {
		this.apiKeys = JSON.parse(this.configService.get('openAi.api_keys'));
		this.aistaToken = this.configService.get('aista.aista_token');
		this.key = this.configService.get('openAi.api_keys');
	}

	async setNewKey(iterator: number): Promise<void> {
		const config = new Configuration({
			apiKey: this.apiKeys[iterator],
		});
		this.openAi = new OpenAIApi(config);
	}

	async getCompletion(
		prompt: string,
		config?: Partial<CreateChatCompletionRequest>,
		iterator = 0
	): Promise<string> {
		try {
			await this.setNewKey(iterator);
			const response = await this.openAi.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: [{ role: 'user', content: prompt }],
				stream: false,
				...config,
			});
			return response.data.choices[0].message.content;
		} catch (e) {
			if (iterator === this.apiKeys.length - 1) {
				throw new InternalServerErrorException(
					ErrorMessages.content.CONTENT_GENERATION_ERROR,
					e.message
				);
			} else {
				return await this.getCompletion(prompt, config, iterator + 1);
			}
		}
	}

	async getCompletionWithDialog(
		prompt: string,
		dialog: any,
		config?: Partial<CreateChatCompletionRequest>,
		iterator = 0
	): Promise<string> {
		try {
			await this.setNewKey(iterator);
			const messages = [
				{ role: 'user', content: prompt },
				...dialog.map((entry: { answer: any }) => ({
					role: 'user',
					content: entry.answer,
				})),
			];

			const response = await this.openAi.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: messages,
				stream: false,
				...config,
			});
			return response.data.choices[0].message.content;
		} catch (e) {
			if (iterator === this.apiKeys.length - 1) {
				throw new InternalServerErrorException(
					ErrorMessages.content.CONTENT_GENERATION_ERROR,
					e.message
				);
			} else {
				return await this.getCompletionWithDialog(
					prompt,
					dialog,
					config,
					iterator + 1
				);
			}
		}
	}

	async generateImage(
		text: string,
		dto: createWithSubjectContentDto
	): Promise<{ urls: string[] }> {
		try {
			const requestBody = {
				prompt: `Generate an image for the topic:  ${text} , caption language on image use English language`,
				model: 'dall-e-2',
				n: dto.quantityImage || 1,
				size: '1024x1024',
				response_format: 'url',
			};

			const response = await axios.post(
				'https://api.openai.com/v1/images/generations',
				requestBody,
				{
					headers: {
						Authorization: 'Bearer ' + process.env.OPEN_AI_IMAGES_KEY,
						'Content-Type': 'application/json',
					},
				}
			);
			const imageUrls = await this.saveImages(response.data.data);
			return { urls: imageUrls };
		} catch (error) {
			console.error(error);
			throw new Error('Failed to generate image with DALL·E');
		}
	}
	async saveImages(data: any): Promise<string[]> {
		const imageUrls: string[] = [];

		try {
			for (const item of data) {
				const imageUrl = await this.uploadService.saveImageFromUrl(item.url);
				imageUrls.push(imageUrl);
			}

			return imageUrls;
		} catch (error) {
			console.error('Error saving images:', error);
			throw new Error('Failed to save images');
		}
	}

	async getDialog(
		prompt: string,
		dialog: any,
		config?: Partial<CreateChatCompletionRequest>,
		iterator = 0
	): Promise<string> {
		try {
			await this.setNewKey(iterator);
			const response = await this.openAi.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: [dialog],
				stream: false,
			});

			return response.data.choices[0].message.content;
		} catch (e) {
			if (iterator === this.apiKeys.length - 1) {
				throw new InternalServerErrorException(
					ErrorMessages.content.CONTENT_GENERATION_ERROR,
					e.message
				);
			} else {
				return await this.getDialog(prompt, dialog, config, iterator + 1);
			}
		}
	}
}
