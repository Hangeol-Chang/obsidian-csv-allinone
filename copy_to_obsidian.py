import os
import shutil

# 경로 설정
SOURCE_FILES = [
    'manifest.json', 
    'main.js'
]
OBSIDIAN_DIR = os.path.abspath('../obsidian/.obsidian')
TARGET_DIR = os.path.join(OBSIDIAN_DIR, 'plugins', 'csv-allinone')

def copy_files():
    # Obsidian 폴더 확인
    if not os.path.exists(OBSIDIAN_DIR):
        print(f"Error: Obsidian directory not found at {OBSIDIAN_DIR}")
        return

    # csv-allinone 폴더가 없으면 생성
    if not os.path.exists(TARGET_DIR):
        print(f"Creating target directory: {TARGET_DIR}")
        os.makedirs(TARGET_DIR, exist_ok=True)

    # 파일 복사
    for file_name in SOURCE_FILES:
        source_path = os.path.abspath(file_name)
        target_path = os.path.join(TARGET_DIR, file_name)

        if os.path.exists(source_path):
            shutil.copy2(source_path, target_path)
            print(f"Copied {file_name} to {target_path}")
        else:
            print(f"Warning: Source file {source_path} not found.")

    print("All files copied successfully!")

if __name__ == "__main__":
    copy_files()
