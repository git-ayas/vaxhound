#!/bin/bash

build() {
    echo 'building plugin'
    export INLINE_RUNTIME_CHUNK=false
    export GENERATE_SOURCEMAP=false
    npm run build
}

build