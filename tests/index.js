const test = require('ava');
const TextFileDiff = require('../dist/index.js').default;

test('test with header', async t => {
  const m = new TextFileDiff();
  const expected = '+Additional\n+Another\n+Lines\n-Some\n-Simple\n+With\n';

  let actual = '';
  m.on('-', line => {
    actual += '-' + line + '\n';
  });

  m.on('+', line => {
    actual += '+' + line + '\n';
  });
  await m.diff('tests/file1.txt', 'tests/file2.txt');
  t.is(actual, expected);
});

test('test skip header', async t => {
  const expected = '+Another\n+File\n+Lines\n-Some\n-Simple\n+With\n';

  const m = new TextFileDiff({
    skipHeader: true
  });
  let actual = '';
  m.on('-', line => {
    actual += '-' + line + '\n';
  });

  m.on('+', line => {
    actual += '+' + line + '\n';
  });
  await m.diff('tests/file1.txt', 'tests/file2.txt');
  t.is(actual, expected);
});

test('test await listener', async t => {
  const m = new TextFileDiff();
  const expected = 'compared+compared+comparedcompared+compared-compared-comparedcompared+';

  let actual = '';

  const getListenerFor = event => async () => new Promise(resolve => {
    setTimeout(() => {
      actual += event;
      resolve();
    }, 200);
  });

  m.on('-', getListenerFor('-'));
  m.on('+', getListenerFor('+'));

  m.on('compared', getListenerFor('compared'));

  await m.diff('tests/file1.txt', 'tests/file2.txt');

  t.is(actual, expected);
});

test('test against null or empty file', async t => {
  let expected = '-some,csv,data\n';

  const m = new TextFileDiff({
    skipHeader: false
  });
  let actual = '';
  m.on('-', line => {
    actual += '-' + line + '\n';
  });

  m.on('+', line => {
    actual += '+' + line + '\n';
  });
  await m.diff('tests/lowercase.txt', 'tests/empty.txt');
  t.is(actual, expected, 'faile test empty');

  actual = '';
  expected = '+null\n-some,csv,data\n';
  await m.diff('tests/lowercase.txt', 'tests/null.txt');
  t.is(actual, expected, 'fail test null');
});
