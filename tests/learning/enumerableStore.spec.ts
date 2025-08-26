import {test, expect} from '@playwright/test';
import {store, type Model} from 'hybrids';

interface Item {
    id: string;
    value: string;
}

const ItemModel: Model<Item> = {
    id: true,
    value: '',
};

test.describe('hybrids.js enumerable store CRUD', () => {
    test.beforeEach(async () => {
        // Delete all enumerable instances individually using set
        const all = store.get([ItemModel]);
        for (const item of all) {
            await store.set(item, null);
        }
    });

    test('create and list items', async () => {
        // Create items
        const a = await store.set(ItemModel, {value: 'A'});
        const b = await store.set(ItemModel, {value: 'B'});

        // List all
        const all = store.get([ItemModel]);
        expect(Array.isArray(all)).toBe(true);
        expect(all.length).toBe(2);
        expect(all.some(i => i.value === 'A')).toBe(true);
        expect(all.some(i => i.value === 'B')).toBe(true);

        // Each has an id
        expect(typeof a.id).toBe('string');
        expect(typeof b.id).toBe('string');
        expect(a.id).not.toBe(b.id);
    });

    test('read by id', async () => {
        const created = await store.set(ItemModel, {value: 'ReadMe'});
        const fetched = store.get(ItemModel, created.id);
        expect(fetched.value).toBe('ReadMe');
        expect(fetched.id).toBe(created.id);
    });

    test('update by id', async () => {
        const created = await store.set(ItemModel, {value: 'Old'});
        // Update by passing the model instance, not the definition
        const updated = await store.set(created, {value: 'New'});
        expect(updated.value).toBe('New');
        expect(updated.id).toBe(created.id);

        const fetched = store.get(ItemModel, created.id);
        expect(fetched.value).toBe('New');
    });

    test('delete by id', async () => {
        const created = await store.set(ItemModel, {value: 'ToDelete'});
        // Delete by passing the model instance, not the definition
        await store.set(created, null);
        // Should not be in the list
        const all = store.get([ItemModel]);
        expect(all.some(i => i.id === created.id)).toBe(false);
        // Should return placeholder for get
        const fetched = store.get(ItemModel, created.id);
        expect(fetched.id).toBe(created.id);
        // Not ready, should be error
        expect(store.ready(fetched)).toBe(false);
        expect(store.error(fetched)).toBeTruthy();
    });

    test('clear all', async () => {
        await store.set(ItemModel, {value: 'A'});
        await store.set(ItemModel, {value: 'B'});
        await store.set(ItemModel, {value: 'C'});
        // Delete all enumerable instances individually using set
        const all = store.get([ItemModel]);
        for (const item of all) {
            await store.set(item, null);
        }
        await new Promise(r => setTimeout(r, 0));
        const after = store.get([ItemModel]);
        expect(Array.isArray(after)).toBe(true);
        expect(after.length).toBe(0);
    });

    test('listing is always up to date', async () => {
        await store.set(ItemModel, {value: 'A'});
        await store.set(ItemModel, {value: 'B'});
        await store.set(ItemModel, {value: 'C'});
        let all = store.get([ItemModel]);
        expect(all.length).toBe(3);

        // Delete two by passing the model instance
        const items = all.slice();
        await store.set(items[0], null);
        await store.set(items[1], null);
        // Wait for microtasks to flush
        await new Promise(r => setTimeout(r, 0));
        all = store.get([ItemModel]);
        expect(all.length).toBe(1);
        expect(all[0].id).toBe(items[2].id);
    });

    test('store.get(ItemModel) returns placeholder, not a list', async () => {
        // For an enumerable model, store.get(ItemModel) returns a placeholder (not a list)
        expect(() => store.get(ItemModel)).toThrow(
            /requires non-empty id/
        );
    });

    test('store.get(ItemModel) throws if called without id after values exist', async () => {
        await store.set(ItemModel, {value: 'A'});
        await store.set(ItemModel, {value: 'B'});
        // Now calling store.get(ItemModel) should throw, because id is required for enumerables
        expect(() => store.get(ItemModel)).toThrow(
            /requires non-empty id/
        );
    });

    test('fetch the latest addition to an enumerable (by timestamp property)', async () => {
        // To use a timestamp, extend the model definition for this test
        interface ItemWithTs extends Item {
            ts: number;
        }

        const ItemWithTsModel: Model<ItemWithTs> = {
            id: true,
            value: '',
            ts: 0,
        };

        const a = await store.set(ItemWithTsModel, {value: 'A', ts: Date.now()});
        await new Promise(r => setTimeout(r, 1));
        const b = await store.set(ItemWithTsModel, {value: 'B', ts: Date.now()});
        await new Promise(r => setTimeout(r, 1));
        const c = await store.set(ItemWithTsModel, {value: 'C', ts: Date.now()});

        const allWithTs = store.get([ItemWithTsModel]);
        const latest = allWithTs.reduce((acc, item) =>
            acc && acc.ts > item.ts ? acc : item
        );
        expect(latest.value).toBe('C');
    });
});
