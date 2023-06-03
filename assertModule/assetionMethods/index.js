const assert = require('node:assert')

const promiseRejected = () => new Promise((resolve, reject) => {
    setTimeout(() => reject(), 3000)
})

const promiseReslved = () => new Promise((resolve) => {
    setTimeout(() => resolve(), 3000)
})

assert.deepStrictEqual({a:'a'}, {a:'a'}) //tests the strict equality of each property;
assert.strictEqual('a', 'a') //tests strict equality;
assert.notStrictEqual(1, '1') //tests strict inequality;
assert.notDeepStrictEqual({a: 'a'}, {a: 1}) //tests the strict inequality of each property;
assert.match('123', /[^a-zA-Z]/g) //tests if the provided string matches the regular expression;
assert.doesNotMatch('123', /[a-zA-Z]/g) //tests if the provided string doesn't match the regular expression;
assert.throws(() => {throw new Error('test')}) //tests if the provided function will throw;
assert.doesNotThrow(() => null) //tests if the provided function doesn't throw;
assert.rejects(promiseRejected) //tests if the provided asyncFn will be rejected;
assert.doesNotReject(promiseReslved) //tests if the provided asyncFn will be resolved;
assert.ok('a') //tests if the provided value if TRUTHY;
assert.ifError(null) //tests if the provided value is null or undefined, useful for testing the 'err' value from callbacks;
assert.fail('This is a proposital AssertionError') //throws an assertion error with the provided message;
