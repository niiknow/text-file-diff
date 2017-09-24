# large-file-diff
> line by line diff or two large files

## Install

```
$ npm install large-file-diff
```

## Preview
```
./bin/large-file-diff tests/file1.txt tests/file2.txt
```

## Point of Interest

Alternatively, you can accomplish this in shell as:
```
diff -u file1.txt file2.txt | sed -n '1,2d;/^[-+|]/p' | sed 's/^\(.\{1\}\)/\1|/'
```

## MIT
