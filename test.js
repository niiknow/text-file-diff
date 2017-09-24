import test from 'ava';
import TextFileDiff from '.';

test('test with headers', t => {
  const m = new TextFileDiff();
  const expected = '+Additional\n+Another\n+Lines\n-Some\n-Simple\n+With\n';

  let actual = '';
  m.on('-', line => {
    actual += '-' + line + '\n';
  });

  m.on('+', line => {
    actual += '+' + line + '\n';
  });
  m.diff('tests/file1.txt', 'tests/file2.txt');
  t.is(actual, expected);
});

test('test skip header', t => {
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
  m.diff('tests/file1.txt', 'tests/file2.txt');
  t.is(actual, expected);
});
