import { default as ava } from 'ava';
import * as mongodb from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, MongoUtils } from '../../src';
import { BaseMongoObject, StringMap } from '../../src/models';

export class ArrayElement {
	public code: string;
	public label: StringMap<string>;
}

export class SampleEntityWithArray extends BaseMongoObject {
	public parameters: {
		items: ArrayElement[];
	};
}

export class SampleEntityWithSimpleArray extends BaseMongoObject {
	public parameters: {
		items: string[];
	};
}

export function generateMongoClient(): MongoClient<SampleEntityWithArray, null> {
	const collectionName = `test-${Math.ceil(Math.random() * 10000)}-${Date.now()}`;
	return new MongoClient(collectionName, SampleEntityWithArray, null, {
		lockFields: {
			arrayWithReferences: {
				'parameters.items': 'code',
			},
		},
		keepHistoric: true,
	});
}

export function init(): void {
	let mongod: MongoMemoryServer;

	ava.before(async () => {
		mongod = new MongoMemoryServer();
		const uri = await mongod.getConnectionString();
		await MongoUtils.connect(uri);
	});

	ava.after(async () => {
		global.log.info(`DROP DB after tests OK`);
		if (global.db) {
			await (global.db as mongodb.Db).dropDatabase();
			await MongoUtils.disconnect();
		}
		await mongod.stop();
	});
}
