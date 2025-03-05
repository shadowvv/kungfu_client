from PIL import Image
import os

def split_image_fixed_size(image_path, output_folder, tile_width, tile_height):
    """
    按固定尺寸分割单张图片
    :param image_path: 输入图片路径
    :param output_folder: 输出文件夹路径
    :param tile_width: 小图片宽度
    :param tile_height: 小图片高度
    """
    # 打开图片
    image = Image.open(image_path)
    image_width, image_height = image.size

    # 分割图片
    tile_count = 0
    for upper in range(0, image_height, tile_height):
        for left in range(0, image_width, tile_width):
            # 计算每个小图片的边界
            right = left + tile_width
            lower = upper + tile_height

            # 裁剪图片
            tile = image.crop((left, upper, right, lower))

            # 保存小图片
            tile_name = f"{os.path.splitext(os.path.basename(image_path))[0]}_tile_{tile_count}.png"
            tile_path = os.path.join(output_folder, tile_name)
            tile.save(tile_path)
            print(f"保存: {tile_path}")
            tile_count += 1

def batch_split_images(input_folder, tile_width, tile_height):
    """
    批量处理图片，遍历子文件夹
    :param input_folder: 输入文件夹路径
    :param tile_width: 小图片宽度
    :param tile_height: 小图片高度
    """
    # 遍历输入文件夹及其子文件夹
    for root, dirs, files in os.walk(input_folder):
        for file in files:
            # 检查文件是否为图片（支持PNG、JPG、BMP等格式）
            if file.lower().endswith((".png", ".jpg", ".jpeg", ".bmp")):
                # 构建完整的文件路径
                image_path = os.path.join(root, file)
                # 输出文件夹为原始图片所在的文件夹
                output_folder = root

                # 分割图片
                print(f"正在处理: {image_path}")
                split_image_fixed_size(image_path, output_folder, tile_width, tile_height)

    print("所有图片处理完成！")

# 示例调用
if __name__ == "__main__":
    # 输入文件夹路径
    input_folder = "D:/BaiduNetdiskDownload/taiKouRes/png/2/knife"  # 替换为你的文件夹路径
    # 按 256x256 分割
    batch_split_images(input_folder, tile_width=160, tile_height=160)