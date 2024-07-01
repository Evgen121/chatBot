export enum ContentConfigsEnum {
	CREATIVE,
	BALANCE,
	DIRECTLY,
}
export const ContentConfigsEnumData = {
	[ContentConfigsEnum.CREATIVE]: {
		presence_penalty: -1.2,
		frequency_penalty: 0.6,
		temperature: 1.1,
	},
	[ContentConfigsEnum.BALANCE]: {
		presence_penalty: -0.5,
		frequency_penalty: 0,
		temperature: 1,
	},
	[ContentConfigsEnum.DIRECTLY]: {
		presence_penalty: -1,
		frequency_penalty: 0,
		temperature: 0.9,
	},
};
