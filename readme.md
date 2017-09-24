# text-file-diff
> line by line diff of two large text files

## Install

```
$ npm install text-file-diff
```

## Preview
```
./bin/text-file-diff tests/file1.txt tests/file2.txt | sed 's/^\(.\{1\}\)/\1|/'
```

## Point of Interest

Alternatively, with regular shell 'diff' command:
```
diff -u file1.txt file2.txt | sed -n '1,2d;/^[-+|]/p' | sed 's/^\(.\{1\}\)/\1|/'
```

## MIT
