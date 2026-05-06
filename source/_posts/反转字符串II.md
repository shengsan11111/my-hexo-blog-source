---

title: 反转字符串II
date: 2026-04-14
tags:

- 算法
- 字符串
- 双指针

---

## 题目链接

[反转字符串II](https://leetcode.cn/problems/reverse-string-ii/)

## 题目描述

给定一个字符串 `s` 和一个整数 `k`，从字符串开头算起，**每计数至 2k 个字符**，就反转这 2k 字符中的**前 k 个字符**，再重新计数。

> **特殊情况处理：**
>
> - 如果剩余字符少于 k 个，则将**剩余字符全部反转**
> - 如果剩余字符小于 2k 但大于或等于 k 个，则**反转前 k 个字符**，其余字符保持原样

### 示例

**示例 1：**

- **输入：** `s = "abcdefg"`, `k = 2`
- **输出：** `"bacdfeg"`

**示例 2：**

- **输入：** `s = "abcd"`, `k = 2`
- **输出：** `"bacd"`

### 约束条件

- `1 <= s.length <= 10⁴`
- `s` 仅由小写英文组成
- `1 <= k <= 10⁴`

***

## 解题思路

### 采用原地修改+双指针的方法解决

遍历字符串，以步幅`2k` 前进，每次处理一个 `2k` 字符块。对每个块，反转前 `k` 个字符，若剩余字符不足 `k` 个则全部反转。反转时使用双指针交换字符。

## 步骤

1. 获取字符串长度 `len`，初始化当前处理块的起始位置 `i` = `0`。
2. 遍历字符串，以步幅`2k` 前进，每次处理一个 `2k` 字符块
   - 每次处理一个 `2k` 字符块，设置需要反转的起始位置 `left` = `i`。
   - 计算反转的结束位置 `right`：若 `i + k - 1 < len`，则 `right` = `i + k - 1`；否则 `right` = `len - 1`（剩余字符不足 `k` 个时需要反转全部剩余字符）。
   - 当 `left < right` 时，交换 `s[left]` 和 `s[right]`
   - 左指针 `left` 右移，右指针 `right` 左移
3. 循环结束，字符串反转完成(`s`就是反转后的字符串)

***

## 代码实现

```c
char* reverseStr(char* s, int k) {
    int len = strlen(s);
    for (int i = 0; i < len; i += 2 * k) {
        int left = i;
        int right = i + k - 1 < len;
        if(right) 
            right = i + k - 1;
        else 
            right = len - 1;
        while (left < right) {
            char temp = s[left];
            s[left] = s[right];
            s[right] = temp;
            left++;
            right--;
        }
    }
    return s;
}
```

***

### 时间复杂度

`O(n)` 其中 `n` 是字符串的长度。

### 空间复杂度

`O(1)` 只需要常数空间。
