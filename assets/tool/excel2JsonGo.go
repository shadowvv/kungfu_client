package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/xuri/excelize/v2"
)

const (
	inputDirectory  = "./assets/resources/config"
	outputDirectory = "./assets/resources/config"
)

// OrderedMap 结构：保证字段顺序
type OrderedMap struct {
	Keys   []string      // 字段顺序
	Values []interface{} // 存储数据
}

// MarshalJSON 实现自定义 JSON 序列化，保证字段顺序
func (o OrderedMap) MarshalJSON() ([]byte, error) {
	var result strings.Builder
	result.WriteString("{")
	for i, key := range o.Keys {
		if i > 0 {
			result.WriteString(",")
		}
		keyJSON, _ := json.Marshal(key)
		valueJSON, _ := json.Marshal(o.Values[i])
		result.WriteString(fmt.Sprintf("\n    %s: %s", keyJSON, valueJSON))
	}
	result.WriteString("\n}")
	return []byte(result.String()), nil
}

func main() {
	// 确保输出目录存在
	if err := os.MkdirAll(outputDirectory, os.ModePerm); err != nil {
		fmt.Println("创建输出目录失败:", err)
		return
	}

	// 读取目录下的所有 .xlsx 文件
	files, err := os.ReadDir(inputDirectory)
	if err != nil {
		fmt.Println("读取目录失败:", err)
		return
	}

	for _, file := range files {
		if file.IsDir() || strings.HasPrefix(file.Name(), "~") || !strings.HasSuffix(file.Name(), ".xlsx") {
			continue
		}

		filePath := filepath.Join(inputDirectory, file.Name())
		exportJSON(filePath)
	}
}

func exportJSON(filePath string) {
	f, err := excelize.OpenFile(filePath)
	if err != nil {
		fmt.Println("打开文件失败:", err)
		return
	}
	defer f.Close()

	sheetName := f.GetSheetName(0) // 获取第一个 sheet
	rows, err := f.GetRows(sheetName)
	if err != nil {
		fmt.Println("读取表格内容失败:", err)
		return
	}

	if len(rows) < 1 {
		fmt.Println("空表格:", filePath)
		return
	}

	headers := rows[0] // 第一行为表头
	var data []OrderedMap

	// 处理数据
	for _, row := range rows[1:] {
		record := OrderedMap{
			Keys:   headers,
			Values: make([]interface{}, len(headers)),
		}

		for colIndex, header := range headers {
			var value interface{} = ""

			if colIndex < len(row) {
				cellValue := row[colIndex]

				// 如果字段名包含 "Array"，则处理为数组
				if strings.Contains(header, "Array") {
					if strings.TrimSpace(cellValue) == "" {
						value = []string{} // 空单元格设置为空数组
					} else if strings.Contains(cellValue, "\n") {
						value = strings.Split(cellValue, "\n") // 如果值包含换行符，则转换为数组
					} else {
						value = []string{cellValue} // 单个值转换为数组
					}
				} else {
					value = cellValue // 普通字段直接赋值
				}
			} else {
				// 如果单元格为空（即 colIndex >= len(row)），则根据字段类型设置默认值
				if strings.Contains(header, "Array") {
					value = []string{} // 空数组
				} else {
					value = "" // 空字符串
				}
			}

			record.Values[colIndex] = value
		}
		data = append(data, record)
	}

	outputFilePath := filepath.Join(outputDirectory, strings.TrimSuffix(filepath.Base(filePath), ".xlsx")+".json")

	// 序列化为 JSON
	jsonData, err := json.MarshalIndent(data, "", "    ")
	if err != nil {
		fmt.Println("JSON 序列化失败:", err)
		return
	}

	// 写入文件
	if err := os.WriteFile(outputFilePath, jsonData, 0644); err != nil {
		fmt.Println("写入 JSON 文件失败:", err)
		return
	}

	fmt.Println("文件", filePath, "已成功导出为", outputFilePath)
}
