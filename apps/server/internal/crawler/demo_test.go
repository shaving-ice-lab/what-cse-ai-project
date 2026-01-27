package crawler

import (
	"fmt"
	"strings"
	"testing"
)

// TestFenbiShortURLDemo 演示完整的短链接解析和内容获取流程
func TestFenbiShortURLDemo(t *testing.T) {
	shortURL := "https://t.fenbi.com/s/00Bjas"

	fmt.Println("========================================")
	fmt.Println("粉笔短链接获取测试")
	fmt.Println("========================================")
	fmt.Printf("输入短链接: %s\n\n", shortURL)

	// Step 1: 解析短链接获取最终URL
	fmt.Println("[Step 1] 解析短链接...")
	tlsClient, err := NewTLSClientWithRedirects()
	if err != nil {
		t.Fatalf("创建TLS客户端失败: %v", err)
	}

	req, err := CreateChromeRequest("GET", shortURL, nil)
	if err != nil {
		t.Fatalf("创建请求失败: %v", err)
	}

	resp, err := tlsClient.Do(req)
	if err != nil {
		t.Fatalf("请求失败: %v", err)
	}
	resp.Body.Close()

	finalURL := NormalizeURL(resp.Request.URL.String())
	fmt.Printf("解析结果: %s\n\n", finalURL)

	// Step 2: 获取页面内容
	fmt.Println("[Step 2] 获取页面内容...")
	tlsClient2, err := NewTLSClientWithRedirects()
	if err != nil {
		t.Fatalf("创建TLS客户端失败: %v", err)
	}

	req2, err := CreateChromeRequest("GET", finalURL, nil)
	if err != nil {
		t.Fatalf("创建请求失败: %v", err)
	}

	resp2, err := tlsClient2.Do(req2)
	if err != nil {
		t.Fatalf("获取内容失败: %v", err)
	}
	defer resp2.Body.Close()

	fmt.Printf("HTTP状态码: %d\n", resp2.StatusCode)

	if resp2.StatusCode != 200 {
		t.Fatalf("期望状态码200，实际: %d", resp2.StatusCode)
	}

	// 读取部分内容
	buf := make([]byte, 2000)
	n, _ := resp2.Body.Read(buf)
	content := string(buf[:n])

	fmt.Printf("内容长度: 约 %d+ 字节\n\n", n)

	// 检查是否包含预期内容
	fmt.Println("[Step 3] 验证内容...")
	if strings.Contains(content, "柞水县") {
		fmt.Println("✓ 包含关键词: 柞水县")
	}
	if strings.Contains(content, "选调") {
		fmt.Println("✓ 包含关键词: 选调")
	}
	if strings.Contains(content, "陕西人才网") {
		fmt.Println("✓ 包含关键词: 陕西人才网")
	}

	fmt.Println("\n========================================")
	fmt.Println("测试结果: 成功 ✓")
	fmt.Println("短链接可以正确解析并获取页面内容")
	fmt.Println("========================================")
}
