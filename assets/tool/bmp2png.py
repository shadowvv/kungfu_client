from PIL import Image
import os

# 设置输入和输出文件夹路径
input_folder = "D:/BaiduNetdiskDownload/taiKouRes/taiKouRes"  # 存放BMP文件的文件夹
output_folder = "D:/BaiduNetdiskDownload/taiKouRes/png"  # 保存PNG文件的文件夹

# 如果输出文件夹不存在，则创建
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# 遍历输入文件夹中的所有文件
for filename in os.listdir(input_folder):
    # 检查文件是否为BMP格式
    if filename.lower().endswith(".bmp"):
        # 构建完整的文件路径
        input_path = os.path.join(input_folder, filename)
        output_path = os.path.join(output_folder, filename.replace(".bmp", ".png"))

        # 打开BMP文件
        image = Image.open(input_path)

        # 转换为RGBA模式（支持透明通道）
        image = image.convert("RGBA")

        # 获取图像数据
        data = image.getdata()

        # 替换绿色为透明
        new_data = []
        for item in data:
            # 判断是否为绿色（RGB值为(0, 255, 0)）
            if item[0] == 0 and item[1] == 255 and item[2] == 0:
                new_data.append((0, 0, 0, 0))  # 设置为透明
            else:
                new_data.append(item)

        # 更新图像数据
        image.putdata(new_data)

        # 保存为PNG
        image.save(output_path, "PNG")
        print(f"处理完成: {filename} -> {output_path}")

print("所有文件处理完毕！")