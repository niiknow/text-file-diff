[![Build Status](https://travis-ci.org/niiknow/text-file-diff.svg?branch=master)](https://travis-ci.org/niiknow/text-file-diff)
# text-file-diff
> line by line diff of two large text files

You need a nodejs tool to diff two large text files.  This is also useful with csv files:
- compare products file for changes to import
- compare log files 
- compare database of employee/users 

## NOTE

This script expect input of two `sorted` text files.  If the file is not sorted, the unix `sort` command may be of help: https://en.wikipedia.org/wiki/Sort_(Unix)

## Install

```bash
$ npm install text-file-diff
```

## Usage
```js
  import TextFileDiff from 'text-file-diff';

  m.on('-', line => {
    // when a line is in file1 but not in file2
  });

  m.on('+', line => {
    // when a line is in file2 but not in file1
  });

  // run the diff
  m.diff('tests/file1.txt', 'tests/file2.txt');
```

## Example
```bash
$ ./bin/text-file-diff tests/file1.txt tests/file2.txt | sed 's/^\(.\{1\}\)/\1|/'
```

## Point of Interest

* Alternate shell 'diff' command:
```bash
$ diff -u f1.txt f2.txt | sed -n '1,2d;/^[-+|]/p' | sed 's/^\(.\{1\}\)/\1|/'
```

* https://github.com/paulfitz/daff - multi languages diff framework
* https://github.com/kpdecker/jsdiff - popular nodejs string diff

## MIT
