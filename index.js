#!/usr/bin/env node

const fs = require('fs');
const nReadlines = require('n-readlines');
const err0regex = /\[([A-Z][A-Z0-9]*-[0-9]+)\]/;

if (process.argv.length < 4) {
    console.log('Usage:');
    console.log('err0-import token.json log1 [log2 .. logN]');
} else {
    const token = JSON.parse(fs.readFileSync(process.argv[2]));
    process.argv.slice(3).forEach((file, i) => {
        const reader = new nReadlines(file);
        let line;
        while (line = reader.next()) {
            const str = line.toString('utf-8');
            const match = err0regex.exec(str);
            if (match != null) {
                console.log(str);
            }
        }
    });
}
