#!/bin/bash

# npm build 실행
echo "Building the project..."
npm run build

# 빌드 성공 여부 확인
if [ $? -ne 0 ]; then
    echo "Build failed. Exiting."
    exit 1
fi

# Python 스크립트 실행
echo "Running Python script to copy files..."
python3 copy_to_obsidian.py

# Python 스크립트 성공 여부 확인
if [ $? -ne 0 ]; then
    echo "Python script execution failed. Exiting."
    exit 1
fi

echo "Build and copy process completed successfully!"
