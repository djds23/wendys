#!/bin/bash
set -e

# install parcel-bundler
npm install parcel-bundler

# Replace base URL
cd ./src
sed -i  's/http:\/\/localhost:8000/https:\/\/objective-boyd-c6f13f.netlify.app/g' Environment.ts 

cd ..
# build static site
parcel build src/index.html --out-dir dist
