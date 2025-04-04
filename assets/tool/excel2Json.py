import os
import pandas as pd

# 目录路径
input_directory = "./assets/resources/config"
output_directory = "./assets/resources/config"

# 确保输出目录存在
os.makedirs(output_directory, exist_ok=True)

# 遍历目录中的所有 .xlsx 文件
for filename in os.listdir(input_directory):
    if not filename.startswith("~") and filename.endswith(".xlsx"):
        file_path = os.path.join(input_directory, filename)
        
        # 读取 Excel 文件
        df = pd.read_excel(file_path)

        # 遍历 DataFrame 的每一列，检查是否有换行符
        for col in df.columns:
            # 如果字段中包含换行符，则将其拆分为数组
            df[col] = df[col].apply(lambda x: x.split("\n") if isinstance(x, str) and "\n" in x else x)

        # 导出为 JSON 文件，输出文件名与 Excel 文件名对应
        output_file_path = os.path.join(output_directory, f"{os.path.splitext(filename)[0]}.json")
        df.to_json(output_file_path, orient="records", force_ascii=False, indent=4)
        print(f"文件 {filename} 已成功导出为 {output_file_path}")