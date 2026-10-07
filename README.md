# MathBox v5

每個工具都是獨立 HTML 頁面，適合 GitHub Pages。

## 頁面
- index.html：首頁
- calculator.html：科學計算機
- quadratic.html：二次方程式
- graph.html：函數繪圖
- analysis.html：函數分析
- statistics.html：統計
- matrix.html：矩陣
- combinatorics.html：排列組合
- probability.html：機率
- geometry.html：幾何
- sequence.html：數列
- units.html：單位換算
- chemistry.html：化學配平＋可點擊元素週期表
- history.html：共用計算紀錄

## 化學配平
可以直接輸入：
`C6H12O6 + O2 -> CO2 + H2O`
會得到：
`C6H12O6 + 6O2 → 6CO2 + 6H2O`

注意：單獨 `C6H12O6 → CO2 + H2O` 缺少氧氣 O2，因此元素守恆無法成立；這不是程式錯誤。

也可以在 chemistry.html 點週期表，一個元素一個元素建立分子，再把分子加入反應物或生成物。

## GitHub Pages
把整個資料夾內的檔案放到 repository 根目錄，Pages 設定選 `main` / `/(root)` 即可。

週期表元素名稱與原子序依 IUPAC 公開週期表資料整理。


## v6 新增
- 左側可展開功能選單
- AI 數學助手（完全本機規則式，不需要 API Key）
