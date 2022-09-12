#!/usr/bin/env node

const fs = require('fs');
const nReadlines = require('n-readlines');
const err0regex = /\[([A-Z][A-Z0-9]*-[0-9]+)\]/;

let buffer = [];

const flush = async function() {
    if (buffer.length > 0) {
        const lines = buffer;
        buffer = [];
        console.log('sending batch to err0', lines);
        await new Promise((resolve, reject) => { resolve(); })
    }
    return null;
}

const push = async function(log) {
    buffer.push(log);
    if (buffer.length >= 100) {
        await flush();
    }
}

if (process.argv.length < 4) {
    console.log('Usage:');
    console.log('err0-import token.json log1 [log2 .. logN]');
    return;
}
const token = JSON.parse(fs.readFileSync(process.argv[2]));
for (const file of process.argv.slice(3)) {
    const reader = new nReadlines(file);
    let line;
    while (line = reader.next()) {
        const str = line.toString('utf-8');
        const match = err0regex.exec(str);
        if (match != null) {
            await push(str);
        }
    }
}

