import {test, expect} from '@playwright/test';
import {store} from 'hybrids';
import type {Model} from 'hybrids';

//this test is not for implementation but for learning about hybrids.js
test.describe('hybrids store.connect error scenarios', () => {
    // A mock getter function that we can redefine for each test.
    let mockGet: (id: string) => any;

    // A simple enumerable model with an external store connection.
    interface ITestModel {
        id: string;
        value: string;
    }

    const TestModel: Model<ITestModel> = {
        id: true,
        value: '',
        [store.connect]: {
            get: (id) => mockGet(id as string),
            // We are not testing `set`, so it's omitted (read-only model).
        },
    };

    // Before each test, reset the mock and clear any cached store data.
    test.beforeEach(() => {
        mockGet = () => {
            throw new Error('mockGet not implemented for this test');
        };
        store.clear(TestModel, true);
    });

    test.afterEach(() => {
        // Ensure a clean state after each test.
        store.clear(TestModel, true);
    });

    test('should result in an error state when get() returns null', async () => {
        const modelId = 'test-id-1';
        mockGet = (id) => {
            expect(id).toBe(modelId);
            return null; // Simulate API not finding the resource.
        };

        // `store.resolve` returns a promise that rejects on error.
        // When get() returns null, hybrids store treats it as "Not found".
        await expect(store.resolve(TestModel, modelId)).rejects.toThrow("does not exist");

        // After rejection, `store.get` should return a placeholder in an error state.
        const modelInstance = store.get(TestModel, modelId);

        expect(store.ready(modelInstance)).toBe(false);
        expect(store.pending(modelInstance)).toBe(false);
        const error = store.error(modelInstance);
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("does not exist");
    });

    test('should result in an error state when get() throws an error', async () => {
        const modelId = 'test-id-2';
        const errorMessage = 'Internal Server Error';
        mockGet = (id) => {
            expect(id).toBe(modelId);
            throw new Error(errorMessage); // Simulate an API error.
        };

        await expect(store.resolve(TestModel, modelId)).rejects.toThrow(errorMessage);

        const modelInstance = store.get(TestModel, modelId);
        expect(store.ready(modelInstance)).toBe(false);
        expect(store.pending(modelInstance)).toBe(false);
        const error = store.error(modelInstance);
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(errorMessage);
    });

    test('should retain old data on error if get() returns null after a success', async () => {
        const modelId = 'test-id-3';
        const initialData = {value: 'initial value'};
        let callCount = 0;

        mockGet = (id) => {
            expect(id).toBe(modelId);
            callCount++;
            if (callCount === 1) {
                return initialData; // First call is successful.
            }
            return null; // Second call returns null.
        };

        // 1. First call succeeds.
        const modelInstance1 = await store.resolve(TestModel, modelId);
        expect(callCount).toBe(1);
        expect(store.ready(modelInstance1)).toBe(true);
        expect(store.error(modelInstance1)).toBe(false);
        expect(modelInstance1.value).toBe(initialData.value);

        // 2. Invalidate cache to trigger a new fetch. `clearValue: false` keeps the old data.
        store.clear(modelInstance1, false);

        // 3. Second call fails (returns null).
        await expect(store.resolve(TestModel, modelId)).rejects.toThrow("does not exist");

        // 4. Check the state. It should have the old data but also be in an error state.
        const modelInstance2 = store.get(TestModel, modelId);
        expect(callCount).toBe(2);
        expect(store.ready(modelInstance2)).toBe(true); // Ready because it has previous data.
        expect(modelInstance2.value).toBe(initialData.value); // Old data is preserved.

        const error = store.error(modelInstance2);
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("does not exist");
    });

    test('should retain old data on error if get() throws after a success', async () => {
        const modelId = 'test-id-4';
        const initialData = {value: 'initial value'};
        const errorMessage = 'API is down';
        let callCount = 0;

        mockGet = (id) => {
            expect(id).toBe(modelId);
            callCount++;
            if (callCount === 1) {
                return initialData; // First call is successful.
            }
            throw new Error(errorMessage); // Second call throws.
        };

        // 1. First call succeeds.
        const modelInstance1 = await store.resolve(TestModel, modelId);
        expect(callCount).toBe(1);
        expect(store.ready(modelInstance1)).toBe(true);
        expect(store.error(modelInstance1)).toBe(false);
        expect(modelInstance1.value).toBe(initialData.value);

        // 2. Invalidate cache.
        store.clear(modelInstance1, false);

        // 3. Second call fails.
        await expect(store.resolve(TestModel, modelId)).rejects.toThrow(errorMessage);

        // 4. Check the state.
        const modelInstance2 = store.get(TestModel, modelId);
        expect(callCount).toBe(2);
        expect(store.ready(modelInstance2)).toBe(true);
        expect(modelInstance2.value).toBe(initialData.value);

        const error = store.error(modelInstance2);
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(errorMessage);
    });
});