import os
import shutil
import re
import datetime

def find_trae_db():
    # 常见的路径
    appdata = os.environ.get('APPDATA')
    if not appdata:
        print("无法找到 APPDATA 环境变量。")
        return None
        
    # Trae 的特定路径
    db_path = os.path.join(appdata, "Trae", "ModularData", "ai-agent", "database.db")
    
    if os.path.exists(db_path):
        return db_path
    else:
        print(f"在默认路径未找到数据库: {db_path}")
        return None

def extract_strings(file_path, min_length=4):
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
        
        # 简单的正则匹配可打印字符
        # 这只是一个粗略的提取，结果可能包含非聊天内容的字符串
        pattern = re.compile(b'[ -~]{' + str(min_length).encode() + b',}')
        
        found = []
        for match in pattern.finditer(content):
            try:
                s = match.group().decode('utf-8')
                # 过滤掉显然是垃圾的字符串
                if len(s.strip()) > 0:
                    found.append(s)
            except:
                pass
                
        return found
    except Exception as e:
        print(f"提取字符串时出错: {e}")
        return []

def main():
    print("正在寻找 Trae 聊天记录数据库...")
    db_path = find_trae_db()
    
    if not db_path:
        print("未找到 Trae 聊天记录文件。")
        return

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # 获取桌面路径
    desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")
    if not os.path.exists(desktop_path):
        # 如果获取不到标准的桌面路径，尝试构建一个
        desktop_path = os.path.join(os.environ.get('USERPROFILE'), 'Desktop')
        
    print(f"导出目标路径: {desktop_path}")
    
    backup_filename = os.path.join(desktop_path, f"Trae_Chat_Backup_{timestamp}.db")
    text_filename = os.path.join(desktop_path, f"Trae_Chat_Strings_{timestamp}.txt")
    
    # 1. 备份数据库文件
    try:
        shutil.copy2(db_path, backup_filename)
        print(f"成功备份数据库到: {os.path.abspath(backup_filename)}")
        print("注意: 该文件是加密或二进制格式，无法直接用文本编辑器打开。")
    except Exception as e:
        print(f"备份失败: {e}")
        return

    # 2. 尝试提取文本
    print("\n正在尝试提取可读文本字符串...")
    strings = extract_strings(db_path, min_length=8) # 使用8作为最小长度以减少噪音
    
    if strings:
        try:
            with open(text_filename, 'w', encoding='utf-8') as f:
                f.write(f"--- Extracted Strings from Trae Database ({timestamp}) ---\n")
                f.write("注意: 以下内容是从二进制文件中提取的原始字符串，可能包含乱码且顺序混乱。\n")
                f.write("它不代表完整的聊天记录，仅供参考。\n\n")
                for s in strings:
                    f.write(s + "\n")
            print(f"已提取 {len(strings)} 个字符串到: {os.path.abspath(text_filename)}")
        except Exception as e:
            print(f"写入文本文件失败: {e}")
    else:
        print("未提取到有效字符串，文件可能被加密。")

if __name__ == "__main__":
    main()
