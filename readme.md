[![Build Status](https://travis-ci.org/niiknow/text-file-diff.svg?branch=master)](https://travis-ci.org/niiknow/text-file-diff)
# text-file-diff
> line by line diff of two large (sorted) text files

This is especially useful with csv/tsv/psv files:
- compare products file for changes to import
- compare log files 
- compare database export of large organization employee/users 

## NOTE
The benefits of this script is that it allow user full control of their file diffs.  It work great on large file because it does not require you to load the entire file into memory or string.

This script expect input of two `sorted` text files.  If the files are not sorted, the unix `sort` command may be of help: https://en.wikipedia.org/wiki/Sort_(Unix)

```
ForEach line in File1, compare to line in File2 
   equal: incr both files to next line
   line1 > line2: new line detected, incr File2 to next line
   line1 < line2: deleted line, incr File1 to next line
```

Since the list will be `sorted`, the performance of this script is expected to be approximately `O(|A| log |A| + |B| log |B|)`, where A is File1 and B is File2.

This library also has no dependency.

## Install

```bash
$ npm install text-file-diff
```

## Usage
```js
import TextFileDiff from 'text-file-diff';
const m = new TextFileDiff();
m.on('compared', (line1, line2, compareResult, lineReader1, lineReader2) => {
    // event triggered immediately after line comparison
    // but before +- event
  });

m.on('-', line => {
    // when a line is in file1 but not in file2
  });

m.on('+', line => {
    // when a line is in file2 but not in file1
  });

// run the diff
m.diff('tests/file1.txt', 'tests/file2.txt');

// or run m.diffStream(stream1, stream2)
```

**TextFileDiff** constructor also accept optional options object.  Valid options are:
1. `skipHeader` - boolean indicating if first line should be skipped
2. `compareFn` - line comparer function that take in two line (line1 and line2), and `return line1 > line2 ? 1 : (line1 < line2 ? -1 : 0)` allowing you to define how you want to perform line compare.

> NOTE: use diffStream if you need control over encoding

## Example
```bash
$ ./bin/text-file-diff tests/file1.txt tests/file2.txt
```

## Point of Interest

* Alternate shell 'diff' command:
```bash
$ diff -u f1.txt f2.txt | sed -n '1,2d;/^[-+|]/p' | sed 's/^\(.\{1\}\)/\1|/'
```

* https://github.com/paulfitz/daff - multi languages diff framework
* https://github.com/kpdecker/jsdiff - popular nodejs string diff

## MIT
