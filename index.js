#!/usr/bin/env node

const fs = require('fs');
const nReadlines = require('n-readlines');
const err0regex = /\[([A-Z][A-Z0-9]*-[0-9]+)\]/;
const axios = require("axios");

let token = null;
let buffer = [];

const flush = async function() {
    if (buffer.length > 0) {
        const lines = buffer;
        buffer = [];
        await axios.post(token.url + '~/api/bulk-log', { logs: lines }, {
            headers: {
                'Authorization': 'Bearer ' + token.token_value
            }
        });
    }
    return null;
}

const push = async function(log) {
    buffer.push(log);
    if (buffer.length >= 1000) {
        await flush();
    }
}

async function main() {
    if (process.argv.length < 4) {
        console.log('Usage:');
        console.log('err0-import token.json log1 [log2 .. logN]');
        return;
    }
    token = JSON.parse(fs.readFileSync(process.argv[2]));
    for (const file of process.argv.slice(3)) {
        console.log(file);
        const reader = new nReadlines(file);
        let line;
        while (line = reader.next()) {
            const str = line.toString('utf-8');
            const match = err0regex.exec(str);
            if (match != null) {
                await push({
                    error_code: match[1],
                    ts: (new Date().getTime()),
                    msg: str,
                    metadata: {
                        batch: {
                            file: file
                        }
                    }
                });
            }
        }
    }
    await flush();
}

main()
    .then(() => {
        process.exit(0)
    })
    .catch(err => {
        console.error(err.message || err);
        if (err.stack) console.error(err.stack);
        process.exit(1);
    });
