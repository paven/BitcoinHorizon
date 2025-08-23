import {test, expect} from '@playwright/test';

test('hello world test', () => {
    const message = 'Hello World';
    expect(message).toBe('Hello World');
});